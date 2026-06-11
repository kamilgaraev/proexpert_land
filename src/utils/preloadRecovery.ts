const PRELOAD_RELOAD_STORAGE_KEY = 'prohelper:preload-reload-at';
const PRELOAD_RELOAD_COOLDOWN_MS = 30_000;

let lastPreloadReloadAt = 0;

export const buildCacheBustedUrl = (href: string, timestamp = Date.now()): string => {
  const url = new URL(href);
  url.searchParams.set('app_reload', String(timestamp));

  return url.toString();
};

export const shouldRetryPreloadReload = (
  previousReloadAt: string | null,
  now = Date.now(),
): boolean => {
  const parsedReloadAt = Number(previousReloadAt);

  if (!Number.isFinite(parsedReloadAt) || parsedReloadAt <= 0) {
    return true;
  }

  return now - parsedReloadAt > PRELOAD_RELOAD_COOLDOWN_MS;
};

export const reloadWithCacheBust = (
  win: Pick<Window, 'location'> = window,
  timestamp = Date.now(),
): void => {
  win.location.replace(buildCacheBustedUrl(win.location.href, timestamp));
};

const readPreviousReloadAt = (storage: Storage): string | null => {
  try {
    return storage.getItem(PRELOAD_RELOAD_STORAGE_KEY) ?? (lastPreloadReloadAt ? String(lastPreloadReloadAt) : null);
  } catch {
    return lastPreloadReloadAt ? String(lastPreloadReloadAt) : null;
  }
};

const saveReloadAttempt = (storage: Storage, timestamp: number): void => {
  lastPreloadReloadAt = timestamp;

  try {
    storage.setItem(PRELOAD_RELOAD_STORAGE_KEY, String(timestamp));
  } catch {
    return;
  }
};

export const installPreloadErrorRecovery = (
  win: Pick<Window, 'addEventListener' | 'removeEventListener' | 'location' | 'sessionStorage'> = window,
  getNow: () => number = () => Date.now(),
): (() => void) => {
  const handlePreloadError = (event: Event) => {
    const now = getNow();
    const previousReloadAt = readPreviousReloadAt(win.sessionStorage);

    if (!shouldRetryPreloadReload(previousReloadAt, now)) {
      return;
    }

    event.preventDefault();
    saveReloadAttempt(win.sessionStorage, now);
    win.location.replace(buildCacheBustedUrl(win.location.href, now));
  };

  win.addEventListener('vite:preloadError', handlePreloadError);

  return () => win.removeEventListener('vite:preloadError', handlePreloadError);
};
