export type AuthTokenPersistence = 'memory' | 'session' | 'local';

const legacyCookieName = 'authToken';
const primaryStorageKey = 'authToken';
const legacyStorageKeys = ['token', primaryStorageKey];

type PersistedAuthToken = {
  token: string | null;
  persistence: AuthTokenPersistence;
};

const readPersistedAuthToken = (): PersistedAuthToken => {
  if (typeof window === 'undefined') {
    return { token: null, persistence: 'memory' };
  }

  for (const key of legacyStorageKeys) {
    const sessionToken = window.sessionStorage.getItem(key);

    if (sessionToken) {
      return { token: sessionToken, persistence: 'session' };
    }

    const localToken = window.localStorage.getItem(key);

    if (localToken) {
      return { token: localToken, persistence: 'local' };
    }
  }

  return { token: null, persistence: 'memory' };
};

const initialAuthToken = readPersistedAuthToken();

let memoryToken: string | null = initialAuthToken.token;
let memoryPersistence: AuthTokenPersistence = initialAuthToken.persistence;

export const getAuthToken = (): string | null => memoryToken;

export const getAuthTokenPersistence = (): AuthTokenPersistence => memoryPersistence;

export const saveAuthToken = (
  token: string | null | undefined,
  persistence: AuthTokenPersistence = 'session',
): void => {
  memoryToken = token || null;
  memoryPersistence = memoryToken ? persistence : 'memory';

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
  memoryPersistence = 'memory';
  clearPersistedAuthToken();
};

export const clearAuthTokenIfCurrent = (expectedToken: string | null): boolean => {
  if (memoryToken !== expectedToken) {
    return false;
  }

  clearAuthToken();

  return true;
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

export const getAuthorizationHeaderForToken = (token: string | null): Record<string, string> => {
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getJsonAuthHeaders = (): Record<string, string> => ({
  Accept: 'application/json',
  ...getAuthorizationHeader(),
});

const hasAuthorizationHeader = (headers: any): boolean => {
  if (!headers) {
    return false;
  }

  if (typeof headers.has === 'function' && (headers.has('Authorization') || headers.has('authorization'))) {
    return true;
  }

  return Boolean(headers.Authorization || headers.authorization);
};

export const attachAuthorizationHeader = <T extends { headers?: any; skipAuth?: boolean }>(config: T): T => {
  if (config.skipAuth) {
    return config;
  }

  if (memoryToken) {
    config.headers = config.headers || {};

    if (hasAuthorizationHeader(config.headers)) {
      return config;
    }

    if (typeof config.headers.set === 'function') {
      config.headers.set('Authorization', `Bearer ${memoryToken}`);
    } else {
      config.headers.Authorization = `Bearer ${memoryToken}`;
    }
  }

  return config;
};
