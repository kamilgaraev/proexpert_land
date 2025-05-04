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
      
      // Проверяем ответ напрямую
      if (response.data && response.data.data) {
        // Сохраняем токен
        localStorage.setItem('token', response.data.data.token);
        setToken(response.data.data.token);
        
        // Сохраняем пользователя
        if (response.data.data.user) {
          setUser(response.data.data.user as unknown as User);
        } else {
          await fetchUser();
        }
      } else {
        throw new Error('Некорректный ответ от сервера');
      }
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    
    try {
      // Выполняем запрос к API напрямую
      const rawResponse = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1/landing'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      // Получаем данные
      const data = await rawResponse.json();
      
      // Сохраняем токен напрямую
      if (data && data.data && data.data.token) {
        const tokenValue = data.data.token;
        localStorage.setItem('token', tokenValue);
        setToken(tokenValue);
        
        // Устанавливаем пользователя напрямую
        if (data.data.user) {
          setUser(data.data.user as unknown as User);
        } else {
          await fetchUser();
        }
      } else {
        throw new Error('Токен не получен от сервера');
      }
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUser = async () => {
    if (!token) return;
    
    try {
      // Выполняем запрос к API напрямую
      const rawResponse = await fetch(`${import.meta.env.VITE_API_URL || '/api/v1/landing'}/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Получаем данные
      const data = await rawResponse.json();
      
      // Проверяем и устанавливаем данные пользователя
      if (data && data.data && data.data.user) {
        setUser(data.data.user as unknown as User);
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