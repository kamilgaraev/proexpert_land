let memoryToken: string | null = null;

const legacyCookieName = 'authToken';
const legacyStorageKeys = ['token', 'authToken'];

export const getAuthToken = (): string | null => memoryToken;

export const saveAuthToken = (token: string | null | undefined): void => {
  memoryToken = token || null;
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
