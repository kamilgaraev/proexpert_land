import { describe, expect, it, vi } from 'vitest';
import {
  buildCacheBustedUrl,
  installPreloadErrorRecovery,
  shouldRetryPreloadReload,
} from './preloadRecovery';

type PreloadRecoveryWindow = Pick<
  Window,
  'addEventListener' | 'removeEventListener' | 'location' | 'sessionStorage'
>;

const createRecoveryWindow = (previousReloadAt: string | null = null) => {
  const listeners = new Map<string, EventListener>();
  const storage = new Map<string, string>();

  if (previousReloadAt) {
    storage.set('prohelper:preload-reload-at', previousReloadAt);
  }

  const win = {
    location: {
      href: 'https://lk.prohelper.pro/dashboard?tab=projects#content',
      replace: vi.fn(),
    },
    sessionStorage: {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => storage.set(key, value)),
    },
    addEventListener: vi.fn((type: string, listener: EventListener) => {
      listeners.set(type, listener);
    }),
    removeEventListener: vi.fn((type: string, listener: EventListener) => {
      if (listeners.get(type) === listener) {
        listeners.delete(type);
      }
    }),
  } as unknown as PreloadRecoveryWindow;

  return { listeners, win };
};

describe('preloadRecovery', () => {
  it('adds cache-busting parameter without losing query and hash', () => {
    expect(buildCacheBustedUrl('https://lk.prohelper.pro/dashboard?tab=projects#content', 42))
      .toBe('https://lk.prohelper.pro/dashboard?tab=projects&app_reload=42#content');
  });

  it('allows one preload recovery reload per cooldown window', () => {
    expect(shouldRetryPreloadReload(null, 1_000)).toBe(true);
    expect(shouldRetryPreloadReload('1000', 20_000)).toBe(false);
    expect(shouldRetryPreloadReload('1000', 32_000)).toBe(true);
    expect(shouldRetryPreloadReload('bad-value', 32_000)).toBe(true);
  });

  it('reloads with cache busting on first preload error', () => {
    const { listeners, win } = createRecoveryWindow();
    installPreloadErrorRecovery(win, () => 42);

    const event = new Event('vite:preloadError', { cancelable: true });
    listeners.get('vite:preloadError')?.(event);

    expect(event.defaultPrevented).toBe(true);
    expect(win.sessionStorage.setItem).toHaveBeenCalledWith('prohelper:preload-reload-at', '42');
    expect(win.location.replace).toHaveBeenCalledWith(
      'https://lk.prohelper.pro/dashboard?tab=projects&app_reload=42#content',
    );
  });

  it('lets the error boundary handle repeated preload errors during cooldown', () => {
    const { listeners, win } = createRecoveryWindow('40');
    installPreloadErrorRecovery(win, () => 42);

    const event = new Event('vite:preloadError', { cancelable: true });
    listeners.get('vite:preloadError')?.(event);

    expect(event.defaultPrevented).toBe(false);
    expect(win.location.replace).not.toHaveBeenCalled();
  });
});
