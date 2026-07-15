import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { authService, type LandingUser } from '@utils/api';
import {
  clearAuthToken,
  getAuthToken,
  getAuthTokenPersistence,
  saveAuthToken,
  synchronizeAuthToken,
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
  register: (formData: FormData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(true);
  const lifecycleEpochRef = useRef(0);

  const loadUser = useCallback(async (epoch: number): Promise<void> => {
    const response = await authService.getCurrentUser();

    if (lifecycleEpochRef.current !== epoch) {
      return;
    }

    setUser(extractUser(response));
  }, []);

  const fetchUser = useCallback(async (): Promise<void> => {
    const epoch = lifecycleEpochRef.current;
    await loadUser(epoch);
  }, [loadUser]);

  useEffect(() => {
    const epoch = lifecycleEpochRef.current + 1;
    lifecycleEpochRef.current = epoch;

    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key !== 'authToken' && event.key !== 'token') {
        return;
      }

      disconnectEchoSafely();
      const nextEpoch = lifecycleEpochRef.current + 1;
      lifecycleEpochRef.current = nextEpoch;
      synchronizeAuthToken(event.newValue, event.newValue ? 'local' : 'memory');
      setToken(event.newValue);
      setUser(null);

      if (!event.newValue) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      void loadUser(nextEpoch)
        .catch(() => {
          if (lifecycleEpochRef.current === nextEpoch) {
            clearAuthToken();
            setToken(null);
            setUser(null);
          }
        })
        .finally(() => {
          if (lifecycleEpochRef.current === nextEpoch) {
            setIsLoading(false);
          }
        });
    };

    window.addEventListener('storage', handleStorageChange);

    const checkAuth = async (): Promise<void> => {
      if (window.location.pathname.includes('/login')
        || window.location.pathname.includes('/register')) {
        if (lifecycleEpochRef.current === epoch) {
          setIsLoading(false);
        }
        return;
      }

      const existingToken = getAuthToken();

      if (!existingToken) {
        if (lifecycleEpochRef.current === epoch) {
          setToken(null);
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      const persistence = getAuthTokenPersistence();

      try {
        setToken(existingToken);
        await loadUser(epoch);
      } catch {
        if (lifecycleEpochRef.current !== epoch) {
          return;
        }

        try {
          const refreshResponse = await authService.refreshToken();

          if (lifecycleEpochRef.current !== epoch) {
            return;
          }

          const refreshPayload = refreshResponse.data as { token?: string; data?: { token?: string } };
          const refreshedToken = refreshPayload.data?.token || refreshPayload.token;

          if (!refreshedToken) {
            throw new Error('Токен не получен от сервера.');
          }

          disconnectEchoSafely();
          saveAuthToken(refreshedToken, persistence);
          setToken(refreshedToken);
          setUser(null);
          await loadUser(epoch);
        } catch {
          if (lifecycleEpochRef.current === epoch) {
            disconnectEchoSafely();
            clearAuthToken();
            setToken(null);
            setUser(null);
          }
        }
      } finally {
        if (lifecycleEpochRef.current === epoch) {
          setIsLoading(false);
        }
      }
    };

    void checkAuth();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      lifecycleEpochRef.current += 1;
    };
  }, [loadUser]);

  const login = async (email: string, password: string, rememberMe = false): Promise<void> => {
    const epoch = lifecycleEpochRef.current + 1;
    lifecycleEpochRef.current = epoch;
    setIsLoading(true);
    disconnectEchoSafely();

    try {
      const response = await authService.login({ email, password });

      if (lifecycleEpochRef.current !== epoch) {
        return;
      }

      const apiToken = response.data?.token || response.data?.data?.token;
      const nextUser = response.data?.user || response.data?.data?.user;

      if (!apiToken) {
        throw new Error('Токен не получен от сервера.');
      }

      saveAuthToken(apiToken, rememberMe ? 'local' : 'session');
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
        clearAuthToken();
        setToken(null);
        setUser(null);
      }
      throw error;
    } finally {
      if (lifecycleEpochRef.current === epoch) {
        setIsLoading(false);
      }
    }
  };

  const register = async (formData: FormData): Promise<void> => {
    const epoch = lifecycleEpochRef.current + 1;
    lifecycleEpochRef.current = epoch;
    setIsLoading(true);
    disconnectEchoSafely();

    try {
      const response = await authService.register(formData);

      if (lifecycleEpochRef.current !== epoch) {
        return;
      }

      const payload = response.data?.data || response.data;
      clearAuthToken();
      setToken(null);
      setUser(null);

      if (payload?.status !== 'verification_required') {
        throw new Error('Регистрация завершена, но статус подтверждения email не получен.');
      }
    } catch (error) {
      if (lifecycleEpochRef.current === epoch) {
        clearAuthToken();
        setToken(null);
        setUser(null);
      }
      throw error;
    } finally {
      if (lifecycleEpochRef.current === epoch) {
        setIsLoading(false);
      }
    }
  };

  const logout = (): void => {
    lifecycleEpochRef.current += 1;
    const tokenSnapshot = getAuthToken();
    disconnectEchoSafely();

    try {
      const logoutRequest = authService.logout(tokenSnapshot);
      void Promise.resolve(logoutRequest).catch(() => undefined);
    } catch {
    } finally {
      clearAuthToken();
      setToken(null);
      setUser(null);
      setIsLoading(false);
      window.dispatchEvent(new CustomEvent('user-logout'));
    }
  };

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
