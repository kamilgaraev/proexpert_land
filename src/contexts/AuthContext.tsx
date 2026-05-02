import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService, LandingUser } from '@utils/api';
import { clearAuthToken, clearPersistedAuthToken, getAuthToken, saveAuthToken } from '@utils/authTokenStorage';

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
  login: (email: string, password: string) => Promise<void>;
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => getAuthToken());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    clearPersistedAuthToken();
  }, []);
  const fetchUser = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const response = await authService.getCurrentUser();
    const nextUser = response.data?.user || response.data?.data?.user;

    if (!nextUser) {
      throw new Error('Данные пользователя не получены от сервера.');
    }

    setUser(nextUser as unknown as User);
  }, []);
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.location.pathname.includes('/login') || window.location.pathname.includes('/register')) {
      setIsLoading(false);
      return;
    }

    const checkAuth = async () => {
      try {
        const refreshResponse = await authService.refreshToken();
        const refreshedToken = refreshResponse.data?.data?.token;

        if (refreshedToken) {
          saveAuthToken(refreshedToken);
          setToken(refreshedToken);
        }

        await fetchUser();
      } catch (_error) {
        clearAuthToken();
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void checkAuth();
  }, [fetchUser]);
  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await authService.login({ email, password });
      const apiToken = response.data?.token || response.data?.data?.token;
      const nextUser = response.data?.user || response.data?.data?.user;

      if (!apiToken) {
        throw new Error('Токен не получен от сервера.');
      }

      saveAuthToken(apiToken);
      setToken(apiToken);

      if (nextUser) {
        setUser(nextUser as unknown as User);
      } else {
        await fetchUser();
      }

      window.dispatchEvent(new CustomEvent('user-login'));
    } catch (error: any) {
      clearAuthToken();
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const register = async (formData: FormData) => {
    setIsLoading(true);

    try {
      const response = await authService.register(formData);
      const apiToken = response.data?.token || response.data?.data?.token || response.data?.data?.data?.token;
      const nextUser = response.data?.user || response.data?.data?.user || response.data?.data?.data?.user;

      if (!apiToken) {
        throw new Error('Токен не получен от сервера после регистрации.');
      }

      if (!nextUser) {
        throw new Error('Данные пользователя не получены от сервера после регистрации.');
      }

      saveAuthToken(apiToken);
      setToken(apiToken);
      setUser(nextUser as unknown as User);
      window.dispatchEvent(new CustomEvent('user-login'));
    } catch (error) {
      clearAuthToken();
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  const logout = () => {
    authService.logout().catch((_err: Error) => {});
    clearAuthToken();
    setToken(null);
    setUser(null);
    setIsLoading(false);
    window.dispatchEvent(new CustomEvent('user-logout'));
  };
  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
