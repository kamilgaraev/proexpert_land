export type AuthTokenPersistence = 'memory';

type AuthSessionSignal = {
  type: 'logout';
  sessionId: string | null;
};

type AuthSessionListener = () => void;

const AUTH_SESSION_CHANNEL = 'most-lk-auth';

let memoryToken: string | null = null;
let memoryCsrfToken: string | null = null;
let sessionVersion = 0;
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
    if (event.data?.type === 'logout' && typeof event.data.sessionId === 'string' && event.data.sessionId === getAuthSessionId()) {
      clearAuthToken();
      clearCsrfToken();
      notifySessionInvalidated();
    }
  });

  return authChannel;
};

export const getAuthToken = (): string | null => memoryToken;

export const getAuthSessionVersion = (): number => sessionVersion;

export const getAuthSessionId = (token: string | null = memoryToken): string | null => {
  try {
    const payload = token?.split('.')[1];
    if (!payload) return null;
    const claims = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) as { session_uuid?: unknown };
    return typeof claims.session_uuid === 'string' ? claims.session_uuid : null;
  } catch {
    return null;
  }
};

export const getAuthTokenPersistence = (): AuthTokenPersistence => 'memory';

export const synchronizeAuthToken = (token: string | null): void => {
  memoryToken = token;
  sessionVersion += 1;
};

export const saveAuthToken = (
  token: string | null | undefined,
  _persistence: AuthTokenPersistence = 'memory',
): void => {
  memoryToken = token || null;
  sessionVersion += 1;
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
  sessionVersion += 1;
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
  const sessionId = getAuthSessionId();
  clearAuthToken();
  clearCsrfToken();
  notifySessionInvalidated();

  if (broadcast) {
    getAuthChannel()?.postMessage({ type: 'logout', sessionId } satisfies AuthSessionSignal);
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
