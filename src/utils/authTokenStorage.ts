export type AuthTokenPersistence = 'memory' | 'session' | 'local';

const legacyCookieName = 'authToken';
const primaryStorageKey = 'authToken';
const legacyStorageKeys = ['token', primaryStorageKey];

const readPersistedAuthToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  for (const key of legacyStorageKeys) {
    const sessionToken = window.sessionStorage.getItem(key);

    if (sessionToken) {
      return sessionToken;
    }

    const localToken = window.localStorage.getItem(key);

    if (localToken) {
      return localToken;
    }
  }

  return null;
};

let memoryToken: string | null = readPersistedAuthToken();

export const getAuthToken = (): string | null => memoryToken;

export const saveAuthToken = (
  token: string | null | undefined,
  persistence: AuthTokenPersistence = 'session',
): void => {
  memoryToken = token || null;

  if (typeof window === 'undefined') {
    return;
  }

  for (const key of legacyStorageKeys) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }

  if (!memoryToken || persistence === 'memory') {
    return;
  }

  const storage = persistence === 'local' ? window.localStorage : window.sessionStorage;
  storage.setItem(primaryStorageKey, memoryToken);
};

export const clearAuthToken = (): void => {
  memoryToken = null;
  clearPersistedAuthToken();
};

export const clearPersistedAuthToken = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  for (const key of legacyStorageKeys) {
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  }

  document.cookie = `${legacyCookieName}=; path=/; max-age=0`;
};

export const getAuthorizationHeader = (): Record<string, string> => {
  return memoryToken ? { Authorization: `Bearer ${memoryToken}` } : {};
};

export const getJsonAuthHeaders = (): Record<string, string> => ({
  Accept: 'application/json',
  ...getAuthorizationHeader(),
});

export const attachAuthorizationHeader = <T extends { headers?: any }>(config: T): T => {
  if (memoryToken) {
    config.headers = config.headers || {};

    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${memoryToken}`);
    } else {
      config.headers.Authorization = `Bearer ${memoryToken}`;
    }
  }

  return config;
};
