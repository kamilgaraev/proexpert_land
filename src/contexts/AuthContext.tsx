import { createContext, useState, useEffect, ReactNode } from 'react';
import { authService, RegisterRequest, LandingUser } from '@utils/api';

// Импортирую глобальные функции работы с токеном
declare global {
  interface Window {
    getTokenFromStorages: () => string | null;
    saveTokenToMultipleStorages: (token: string) => void;
    clearTokenFromStorages: () => void;
  }
}

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
  const [token, setToken] = useState<string | null>(window.getTokenFromStorages ? window.getTokenFromStorages() : localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  // Экспортирую функции в window для доступа из других частей приложения и отладки
  useEffect(() => {
    // Экспортирую функции в window объект для доступа из других мест
    if (typeof window !== 'undefined' && window.getTokenFromStorages === undefined) {
      try {
        const getToken = () => {
          // Пробуем сначала localStorage
          let token = localStorage.getItem('token');
          
          // Если не нашли, пробуем в sessionStorage
          if (!token) {
            token = sessionStorage.getItem('authToken');
          }
          
          // Если и там нет, пробуем куки
          if (!token) {
            const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
              const [key, value] = cookie.split('=');
              acc[key] = value;
              return acc;
            }, {} as Record<string, string>);
            
            token = cookies.authToken || null;
          }
          
          return token;
        };
        
        const saveToken = (token: string) => {
          // Сохраняем в localStorage
          try {
            localStorage.setItem('token', token);
          } catch (e) {
            console.error('Ошибка сохранения в localStorage', e);
          }
          
          // Сохраняем в sessionStorage как запасной вариант
          try {
            sessionStorage.setItem('authToken', token);
          } catch (e) {
            console.error('Ошибка сохранения в sessionStorage', e);
          }
          
          // Пробуем использовать куки
          try {
            document.cookie = `authToken=${token}; path=/; max-age=86400`;
          } catch (e) {
            console.error('Ошибка сохранения в cookie', e);
          }
        };
        
        const clearToken = () => {
          localStorage.removeItem('token');
          sessionStorage.removeItem('authToken');
          document.cookie = 'authToken=; path=/; max-age=0';
        };
        
        window.getTokenFromStorages = getToken;
        window.saveTokenToMultipleStorages = saveToken;
        window.clearTokenFromStorages = clearToken;
      } catch (e) {
        console.error('Ошибка при экспорте функций в window', e);
      }
    }
  }, []);

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const currentToken = window.getTokenFromStorages ? window.getTokenFromStorages() : localStorage.getItem('token');
      
      if (currentToken) {
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
    console.log('AuthContext: Начало функции login');
    
    try {
      console.log('AuthContext: Перед вызовом authService.login');
      const response = await authService.login({ email, password });
      console.log('AuthContext: Ответ от authService.login получен:', response);
      
      // Получаем токен из хранилища
      console.log('AuthContext: Проверяем токен из хранилища');
      const currentToken = window.getTokenFromStorages ? window.getTokenFromStorages() : localStorage.getItem('token');
      console.log('AuthContext: Токен из хранилища:', currentToken);
      
      if (!currentToken) {
        console.log('AuthContext: Токен не найден в хранилище, пробуем получить из ответа');
        
        // Если токен не сохранился в хранилище, проверим ответ API напрямую
        if (response.data && response.data.data && response.data.data.token) {
          const apiToken = response.data.data.token;
          console.log('AuthContext: Токен из ответа API:', apiToken);
          
          // Сохраняем токен в хранилище напрямую из компонента
          if (window.saveTokenToMultipleStorages) {
            window.saveTokenToMultipleStorages(apiToken);
          } else {
            localStorage.setItem('token', apiToken);
            sessionStorage.setItem('authToken', apiToken);
            document.cookie = `authToken=${apiToken}; path=/; max-age=86400`;
          }
          
          // Обновляем состояние
          setToken(apiToken);
        } else {
          console.log('AuthContext: Токен не получен от сервера ни в хранилище, ни в ответе');
          throw new Error('Токен не получен от сервера');
        }
      } else {
        // Обновляем состояние
        console.log('AuthContext: Обновляем состояние с токеном из хранилища');
        setToken(currentToken);
      }
      
      // Устанавливаем пользователя 
      if (response.data?.data?.user) {
        console.log('AuthContext: Устанавливаем данные пользователя из ответа');
        setUser(response.data.data.user as unknown as User);
      } else {
        console.log('AuthContext: Пользователь не получен из ответа, вызываем fetchUser');
        await fetchUser();
      }
      
      console.log('AuthContext: Авторизация успешно завершена');
    } catch (error) {
      console.log('AuthContext: Ошибка авторизации:', error);
      if (window.clearTokenFromStorages) {
        window.clearTokenFromStorages();
      } else {
        localStorage.removeItem('token');
        sessionStorage.removeItem('authToken');
        document.cookie = 'authToken=; path=/; max-age=0';
      }
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
      const response = await authService.register(userData);
      
      // Получаем токен, который уже должен быть сохранен в localStorage
      const tokenFromStorage = localStorage.getItem('token');
      if (!tokenFromStorage) {
        throw new Error('Токен не получен от сервера');
      }
      
      // Обновляем состояние
      setToken(tokenFromStorage);
      
      // Устанавливаем пользователя
      if (response.data?.data?.user) {
        setUser(response.data.data.user as unknown as User);
      } else {
        await fetchUser();
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
      const response = await authService.getCurrentUser();
      
      if (response.data?.data?.user) {
        setUser(response.data.data.user as unknown as User);
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
      authService.logout().catch((err: Error) => {
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