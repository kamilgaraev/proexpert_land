import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { authService, type LandingUser } from '@utils/api';
import {
  clearAuthToken,
  clearCsrfToken,
  getAuthToken,
  invalidateAuthSession,
  saveAuthToken,
  saveCsrfToken,
  subscribeAuthSessionInvalidation,
} from '@utils/authTokenStorage';
import { disconnectEcho } from '../services/echo';

export interface User extends Omit<LandingUser, 'email_verified_at'> {
  email_verified_at: string | null;
  avatar_url: string | null;
  phone?: string | null;
  position?: string | null;
  is_active?: boolean;
  user_type?: string;
  last_login_at?: string | null;
  current_organization_id?: number;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (formData: FormData, idempotencyKey: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  fetchUser: async () => {},
});

const disconnectEchoSafely = (): void => {
  try {
    disconnectEcho();
  } catch {
    return;
  }
};

const extractUser = (response: Awaited<ReturnType<typeof authService.getCurrentUser>>): User => {
  const nextUser = response.data?.user || response.data?.data?.user;

  if (!nextUser) {
    throw new Error('Данные пользователя не получены от сервера.');
  }

  return nextUser as unknown as User;
};

const extractToken = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const response = payload as {
    token?: unknown;
    data?: { token?: unknown };
  };

  return typeof response.token === 'string'
    ? response.token
    : typeof response.data?.token === 'string'
      ? response.data.token
      : null;
};

const extractCsrfToken = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const response = payload as {
    csrf_token?: unknown;
    data?: { csrf_token?: unknown };
  };

  return typeof response.csrf_token === 'string'
    ? response.csrf_token
    : typeof response.data?.csrf_token === 'string'
      ? response.data.csrf_token
      : null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(true);
  const lifecycleEpochRef = useRef(0);
  const logoutPromiseRef = useRef<Promise<void> | null>(null);

  const clearLocalState = useCallback((): void => {
    disconnectEchoSafely();
    clearAuthToken();
    clearCsrfToken();
    setToken(null);
    setUser(null);
    setIsLoading(false);
  }, []);

  const loadUser = useCallback(async (epoch: number): Promise<void> => {
    const response = await authService.getCurrentUser();

    if (lifecycleEpochRef.current !== epoch) {
      return;
    }

    setUser(extractUser(response));
  }, []);

  const fetchUser = useCallback(async (): Promise<void> => {
    await loadUser(lifecycleEpochRef.current);
  }, [loadUser]);

  useEffect(() => {
    const handleSessionInvalidation = (): void => {
      lifecycleEpochRef.current += 1;
      disconnectEchoSafely();
      setToken(null);
      setUser(null);
      setIsLoading(false);
      window.dispatchEvent(new CustomEvent('user-logout'));
    };

    const unsubscribe = subscribeAuthSessionInvalidation(handleSessionInvalidation);
    const epoch = lifecycleEpochRef.current + 1;
    lifecycleEpochRef.current = epoch;

    const bootstrapSession = async (): Promise<void> => {
      if (window.location.pathname.includes('/login') || window.location.pathname.includes('/register')) {
        if (lifecycleEpochRef.current === epoch) {
          setIsLoading(false);
        }
        return;
      }

      try {
        const refreshedSession = await authService.refreshToken();

        if (lifecycleEpochRef.current !== epoch) {
          return;
        }

        saveAuthToken(refreshedSession.token);
        saveCsrfToken(refreshedSession.csrfToken);
        setToken(refreshedSession.token);
        setUser(null);
        await loadUser(epoch);

        if (lifecycleEpochRef.current === epoch) {
          window.dispatchEvent(new CustomEvent('user-login'));
        }
      } catch {
        if (lifecycleEpochRef.current === epoch) {
          invalidateAuthSession(true);
        }
      } finally {
        if (lifecycleEpochRef.current === epoch) {
          setIsLoading(false);
        }
      }
    };

    void bootstrapSession();

    return () => {
      lifecycleEpochRef.current += 1;
      unsubscribe();
    };
  }, [loadUser]);

  const login = async (email: string, password: string, rememberMe = false): Promise<void> => {
    const epoch = lifecycleEpochRef.current + 1;
    lifecycleEpochRef.current = epoch;
    setIsLoading(true);
    disconnectEchoSafely();

    try {
      const response = await authService.login({ email, password, remember_me: rememberMe });

      if (lifecycleEpochRef.current !== epoch) {
        return;
      }

      const apiToken = extractToken(response.data);
      const csrfToken = extractCsrfToken(response.data);
      const nextUser = response.data?.user || response.data?.data?.user;

      if (!apiToken || !csrfToken) {
        throw new Error('Сервер не вернул сессию.');
      }

      saveAuthToken(apiToken);
      saveCsrfToken(csrfToken);
      setToken(apiToken);
      setUser(nextUser ? nextUser as unknown as User : null);

      if (!nextUser) {
        await loadUser(epoch);
      }

      if (lifecycleEpochRef.current === epoch) {
        window.dispatchEvent(new CustomEvent('user-login'));
      }
    } catch (error) {
      if (lifecycleEpochRef.current === epoch) {
        clearLocalState();
      }
      throw error;
    } finally {
      if (lifecycleEpochRef.current === epoch) {
        setIsLoading(false);
      }
    }
  };

  const register = async (formData: FormData, idempotencyKey: string): Promise<void> => {
    const epoch = lifecycleEpochRef.current + 1;
    lifecycleEpochRef.current = epoch;
    setIsLoading(true);
    disconnectEchoSafely();

    try {
      const response = await authService.register(formData, idempotencyKey);

      if (lifecycleEpochRef.current !== epoch) {
        return;
      }

      const payload = response.data?.data || response.data;
      clearLocalState();

      if (payload?.status !== 'verification_required') {
        throw new Error('Регистрация завершена, но статус подтверждения email не получен.');
      }
    } catch (error) {
      if (lifecycleEpochRef.current === epoch) {
        clearLocalState();
      }
      throw error;
    } finally {
      if (lifecycleEpochRef.current === epoch) {
        setIsLoading(false);
      }
    }
  };

  const logout = useCallback((): Promise<void> => {
    if (logoutPromiseRef.current) {
      return logoutPromiseRef.current;
    }

    const operation = (async (): Promise<void> => {
      lifecycleEpochRef.current += 1;
      const tokenSnapshot = getAuthToken();
      disconnectEchoSafely();

      try {
        await authService.logout(tokenSnapshot);
      } catch {
      } finally {
        invalidateAuthSession(true);
      }
    })();
    const trackedOperation = operation.finally(() => {
      if (logoutPromiseRef.current === trackedOperation) {
        logoutPromiseRef.current = null;
      }
    });
    logoutPromiseRef.current = trackedOperation;

    return trackedOperation;
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      fetchUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
