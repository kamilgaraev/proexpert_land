import { createContext, useState, useEffect, ReactNode } from 'react';
import { authService, RegisterRequest, LandingUser } from '@utils/api';

export interface User extends Omit<LandingUser, 'email_verified_at'> {
  email_verified_at: string | null;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export interface RegisterData extends RegisterRequest {
  phone?: string;
  position?: string;
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
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          await fetchUser();
        } catch (error) {
          console.error('Ошибка при получении данных пользователя:', error);
          logout();
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await authService.login({ email, password });
      
      // Сохраняем токен
      const responseData = response.data;
      
      if (!responseData || !responseData.success) {
        throw new Error('Ошибка авторизации: неуспешный ответ');
      }
      
      if (!responseData.data || !responseData.data.token) {
        throw new Error('Токен не получен от сервера');
      }
      
      const bearerToken = responseData.data.token;
      localStorage.setItem('token', bearerToken);
      setToken(bearerToken);
      
      // Получаем данные пользователя
      await fetchUser();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    
    try {
      const response = await authService.register(userData);
      
      // Сохраняем токен
      const responseData = response.data;
      
      if (!responseData || !responseData.success) {
        throw new Error('Ошибка регистрации: неуспешный ответ');
      }
      
      if (!responseData.data || !responseData.data.token) {
        throw new Error('Токен не получен от сервера');
      }
      
      const bearerToken = responseData.data.token;
      localStorage.setItem('token', bearerToken);
      setToken(bearerToken);
      
      // Получаем данные пользователя
      await fetchUser();
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async () => {
    if (!token) return;
    
    try {
      const response = await authService.getCurrentUser();
      const responseData = response.data;
      
      // Проверяем наличие данных пользователя
      if (responseData && responseData.success && responseData.data && responseData.data.user) {
        setUser(responseData.data.user as unknown as User);
      } else {
        throw new Error('Данные пользователя не получены');
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    // Попытка выхода через API, если возможно
    if (token) {
      authService.logout().catch(err => {
        console.error('Ошибка при выходе из системы:', err);
      });
    }
    
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
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