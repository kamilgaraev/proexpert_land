export type AuthTokenPersistence = 'memory';

type AuthSessionSignal = {
  type: 'logout';
};

type AuthSessionListener = () => void;

const AUTH_SESSION_CHANNEL = 'most-lk-auth';

let memoryToken: string | null = null;
let memoryCsrfToken: string | null = null;
let authChannel: BroadcastChannel | null = null;
const sessionListeners = new Set<AuthSessionListener>();

const notifySessionInvalidated = (): void => {
  sessionListeners.forEach((listener) => listener());
};

const getAuthChannel = (): BroadcastChannel | null => {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }

  if (authChannel) {
    return authChannel;
  }

  authChannel = new BroadcastChannel(AUTH_SESSION_CHANNEL);
  authChannel.addEventListener('message', (event: MessageEvent<AuthSessionSignal>) => {
    if (event.data?.type === 'logout') {
      clearAuthToken();
      clearCsrfToken();
      notifySessionInvalidated();
    }
  });

  return authChannel;
};

export const getAuthToken = (): string | null => memoryToken;

export const getAuthTokenPersistence = (): AuthTokenPersistence => 'memory';

export const synchronizeAuthToken = (token: string | null): void => {
  memoryToken = token;
};

export const saveAuthToken = (
  token: string | null | undefined,
  _persistence: AuthTokenPersistence = 'memory',
): void => {
  memoryToken = token || null;
};

export const getCsrfToken = (): string | null => memoryCsrfToken;

export const saveCsrfToken = (token: string | null | undefined): void => {
  memoryCsrfToken = token || null;
};

export const clearCsrfToken = (): void => {
  memoryCsrfToken = null;
};

export const clearAuthToken = (): void => {
  memoryToken = null;
};

export const clearAuthTokenIfCurrent = (expectedToken: string | null): boolean => {
  if (memoryToken !== expectedToken) {
    return false;
  }

  clearAuthToken();

  return true;
};

export const subscribeAuthSessionInvalidation = (
  listener: AuthSessionListener,
): (() => void) => {
  sessionListeners.add(listener);
  getAuthChannel();

  return () => sessionListeners.delete(listener);
};

export const invalidateAuthSession = (broadcast = false): void => {
  clearAuthToken();
  clearCsrfToken();
  notifySessionInvalidated();

  if (broadcast) {
    getAuthChannel()?.postMessage({ type: 'logout' } satisfies AuthSessionSignal);
  }
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
  if (config.skipAuth || !memoryToken) {
    return config;
  }

  config.headers = config.headers || {};

  if (hasAuthorizationHeader(config.headers)) {
    return config;
  }

  if (typeof config.headers.set === 'function') {
    config.headers.set('Authorization', `Bearer ${memoryToken}`);
  } else {
    config.headers.Authorization = `Bearer ${memoryToken}`;
  }

  return config;
};
