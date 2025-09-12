import { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService, LandingUser } from '@utils/api';

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
          }
          
          // Сохраняем в sessionStorage как запасной вариант
          try {
            sessionStorage.setItem('authToken', token);
          } catch (e) {
          }
          
          // Пробуем использовать куки
          try {
            document.cookie = `authToken=${token}; path=/; max-age=86400`;
          } catch (e) {
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
      }
    }
  }, []);

  // Определяем fetchUser с useCallback до useEffect, который его использует
  const fetchUser = useCallback(async () => {
    // Используем token из замыкания useCallback или получаем актуальный, если нужно
    // Но т.к. fetchUser будет в зависимостях у другого useEffect, который следит за token,
    // то при изменении token, fetchUser пересоздастся и useEffect вызовется с актуальной версией.
    const currentToken = window.getTokenFromStorages ? window.getTokenFromStorages() : localStorage.getItem('token');
    if (!currentToken) {
        return;
    }
    try {
      const response = await authService.getCurrentUser(); // getCurrentUser уже использует getTokenFromStorages()
      
      if (response.data?.data?.user) {
        setUser(response.data.data.user as unknown as User);
      } else {
        // Если данные пользователя не получены, но токен был, это может быть ошибкой
        // Можно вызвать logout() или специфическую обработку ошибки
        // logout(); 
        throw new Error('Данные пользователя не получены от сервера, хотя токен присутствовал.');
      }
    } catch (error) {
      throw error; 
    }
  }, []); // Зависимостей нет, т.к. token читается внутри из хранилища, а authService стабилен

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      const currentTokenFromStorage = window.getTokenFromStorages ? window.getTokenFromStorages() : localStorage.getItem('token');
      
      if (currentTokenFromStorage) {
        if (token !== currentTokenFromStorage && token === null) {
            setToken(currentTokenFromStorage);
        }
        try {
          await fetchUser();
        } catch (error) {
        } finally {
          setIsLoading(false);
        }
      } else {
        if (token !== null) {
            setToken(null);
            setUser(null);
        }
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [token, fetchUser]); // Теперь fetchUser корректно добавлен в зависимости

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      const response = await authService.login({ email, password });
      
      const currentToken = window.getTokenFromStorages ? window.getTokenFromStorages() : localStorage.getItem('token');
      
      if (!currentToken) {
        if (response.data && response.data.data && response.data.data.token) {
          const apiToken = response.data.data.token;
          
          // Сохраняем токен в хранилище напрямую из компонента
          if (window.saveTokenToMultipleStorages) {
            window.saveTokenToMultipleStorages(apiToken);
          } else {
            localStorage.setItem('token', apiToken);
            sessionStorage.setItem('authToken', apiToken);
            document.cookie = `authToken=${apiToken}; path=/; max-age=86400`;
          }
          
          setToken(apiToken);
        } else {
        throw new Error('Токен не получен от сервера');
      }
      } else {
        setToken(currentToken);
      }
      
      if (response.data?.data?.user) {
        setUser(response.data.data.user as unknown as User);
      } else {
        await fetchUser();
      }
    } catch (error) {
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

  const register = async (formData: FormData) => {
    setIsLoading(true);
    try {
      const response = await authService.register(formData);
      
      // Считаем регистрацию успешной, если сервер вернул статус 201 **или** 200 и присутствует токен в одном из ожидаемых мест.
      const isRegisterSuccess =
        (response.status === 201 || response.status === 200) &&
        (response.data?.success === true || response.data?.token || (response.data?.data && response.data?.data.token));

      if (isRegisterSuccess) {
        // Пытаемся извлечь токен несколькими способами
        let receivedToken =
          response.data.token || // корневое поле
          (response.data.data && response.data.data.token) || // внутри data
          (response.data.data && response.data.data.data && response.data.data.data.token); // некоторые API оборачивают data ещё раз

        // Если всё ещё нет токена, пробуем забрать из хранилища (authService.register мог уже его положить)
        if (!receivedToken) {
          receivedToken = window.getTokenFromStorages ? window.getTokenFromStorages() : localStorage.getItem('token');
        }

        // Пользователь может лежать в нескольких уровнях data
        const receivedUser =
          (response.data.user ||
            (response.data.data && (response.data.data.user || (response.data.data.data && response.data.data.data.user)))) as LandingUser | undefined;
        
        if (!receivedToken) {
          throw new Error('Токен не получен от сервера после регистрации.');
        }
        if (!receivedUser) {
          throw new Error('Данные пользователя не получены от сервера после регистрации.');
        }
        
        // Сохраняем токен (сервис уже должен был это сделать, но дублируем для надежности)
        if (window.saveTokenToMultipleStorages) {
            window.saveTokenToMultipleStorages(receivedToken);
        } else {
            localStorage.setItem('token', receivedToken);
        }
        
        setToken(receivedToken);
        setUser(receivedUser as unknown as User);

      } else {
        const errorMsg = response.data?.message || `Ошибка регистрации (статус ${response.status})`;
        const validationErrors = response.data?.errors;
        const errorToThrow = new Error(errorMsg) as any;
        if (validationErrors) {
          errorToThrow.errors = validationErrors;
        }
         if (response.status) {
           errorToThrow.status = response.status;
        }
        throw errorToThrow; 
      }
    } catch (error) {
      if (window.clearTokenFromStorages) {
        window.clearTokenFromStorages();
      } else {
        localStorage.removeItem('token');
      }
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const currentTokenForLogout = token;
    if (currentTokenForLogout) {
      authService.logout().catch((_err: Error) => {
      });
    }
    
    // Гарантированная очистка из всех хранилищ
    if (window.clearTokenFromStorages) {
        window.clearTokenFromStorages();
    } else {
        localStorage.removeItem('token');
        sessionStorage.removeItem('authToken');
        document.cookie = 'authToken=; path=/; max-age=0';
    }
    setToken(null);
    setUser(null);
    setIsLoading(false);
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