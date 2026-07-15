import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { clearAuthToken, saveAuthToken } from '../utils/authTokenStorage';

const instances: Array<{ disconnect: ReturnType<typeof vi.fn> }> = [];
let bindingError: Error | null = null;

vi.mock('laravel-echo', () => ({
  default: class MockEcho {
    connector = {
      pusher: {
        connection: {
          bind: vi.fn(() => {
            if (bindingError) {
              throw bindingError;
            }
          }),
        },
      },
    };

    disconnect = vi.fn();

    constructor() {
      instances.push(this);
    }
  },
}));

let disconnectEcho: typeof import('./echo').disconnectEcho;
let getEcho: typeof import('./echo').default;
let resolveReverbAppKey: typeof import('./echo').resolveReverbAppKey;

beforeAll(async () => {
  const module = await import('./echo');
  disconnectEcho = module.disconnectEcho;
  getEcho = module.default;
  resolveReverbAppKey = module.resolveReverbAppKey;
});

beforeEach(() => {
  try {
    disconnectEcho?.();
  } catch {
  }
  clearAuthToken();
  instances.length = 0;
  bindingError = null;
  vi.clearAllMocks();
  vi.stubEnv('VITE_REVERB_APP_KEY', 'test-key');
});

describe('Echo lifecycle', () => {
  it('returns null when Reverb key is missing or placeholder', () => {
    expect(resolveReverbAppKey(undefined)).toBeNull();
    expect(resolveReverbAppKey('')).toBeNull();
    expect(resolveReverbAppKey('   ')).toBeNull();
    expect(resolveReverbAppKey('1234567890abcdef1234567890abcdef')).toBeNull();
  });

  it('trims configured Reverb key', () => {
    expect(resolveReverbAppKey(' test-key ')).toBe('test-key');
  });

  it('reuses only the same token and user identity', () => {
    saveAuthToken('token-one');
    const first = getEcho('7');
    const same = getEcho('7');
    const nextUser = getEcho('8');

    expect(same).toBe(first);
    expect(nextUser).not.toBe(first);
    expect(instances).toHaveLength(2);
    expect(instances[0].disconnect).toHaveBeenCalledOnce();
  });

  it('recreates Echo when the token changes for the same user', () => {
    saveAuthToken('token-one');
    const first = getEcho('7');
    saveAuthToken('token-two');
    const second = getEcho('7');

    expect(second).not.toBe(first);
    expect(instances).toHaveLength(2);
    expect(instances[0].disconnect).toHaveBeenCalledOnce();
  });

  it('clears singleton identity even when disconnect throws', () => {
    saveAuthToken('token-one');
    getEcho('7');
    instances[0].disconnect.mockImplementationOnce(() => { throw new Error('disconnect failed'); });

    expect(() => disconnectEcho()).toThrow('disconnect failed');
    expect(window.Echo).toBeUndefined();

    getEcho('7');
    expect(instances).toHaveLength(2);
  });

  it('disconnects a partially initialized Echo instance when binding fails', () => {
    saveAuthToken('token-one');
    bindingError = new Error('binding failed');

    expect(getEcho('7')).toBeNull();
    expect(instances[0].disconnect).toHaveBeenCalledOnce();
    expect(window.Echo).toBeUndefined();

    bindingError = null;
    expect(getEcho('7')).not.toBeNull();
    expect(instances).toHaveLength(2);
  });
});
