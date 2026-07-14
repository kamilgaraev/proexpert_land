import { describe, expect, it } from 'vitest';

import { resolveReverbAppKey } from './echo';

describe('resolveReverbAppKey', () => {
  it('returns null when Reverb key is missing or placeholder', () => {
    expect(resolveReverbAppKey(undefined)).toBeNull();
    expect(resolveReverbAppKey('')).toBeNull();
    expect(resolveReverbAppKey('   ')).toBeNull();
    expect(resolveReverbAppKey('1234567890abcdef1234567890abcdef')).toBeNull();
  });

  it('trims configured Reverb key', () => {
    expect(resolveReverbAppKey(' test-key ')).toBe('test-key');
  });
});
