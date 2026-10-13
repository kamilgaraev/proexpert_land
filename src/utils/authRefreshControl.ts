type AuthErrorResponse = { status?: number; data?: { code?: unknown } };

const authErrorResponse = (error: unknown): AuthErrorResponse | undefined =>
  typeof error === 'object' && error !== null && 'response' in error
    ? (error as { response?: AuthErrorResponse }).response
    : undefined;

export const isTerminalAuthError = (error: unknown): boolean => {
  const response = authErrorResponse(error);
  return response?.status === 401 || ['organization_membership_inactive', 'web_auth_session_changed'].includes(String(response?.data?.code));
};

export class AuthSessionChangedError extends Error {
  readonly response = { status: 409, data: { code: 'web_auth_session_changed' } };
  constructor() { super('Сессия изменилась. Войдите снова.'); }
}

export const isCsrfRefreshError = (error: unknown): boolean => {
  const response = authErrorResponse(error);
  return response?.status === 403 && ['web_csrf_missing', 'web_csrf_mismatch', 'http_403'].includes(String(response.data?.code));
};

export const withAuthCookieLock = <T>(operation: () => Promise<T>): Promise<T> =>
  typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request('most-lk-auth-cookie', operation)
    : operation();
