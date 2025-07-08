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

  // Определяем fetchUser с useCallback до useEffect, который его использует
  const fetchUser = useCallback(async () => {
    // Используем token из замыкания useCallback или получаем актуальный, если нужно
    // Но т.к. fetchUser будет в зависимостях у другого useEffect, который следит за token,
    // то при изменении token, fetchUser пересоздастся и useEffect вызовется с актуальной версией.
    const currentToken = window.getTokenFromStorages ? window.getTokenFromStorages() : localStorage.getItem('token');
    if (!currentToken) {
        console.log('[AuthContext] fetchUser: No token, cannot fetch.');
        // setUser(null); // Возможно, стоит сбросить пользователя, если токена нет
        // setIsLoading(false);
        return;
    }
    
    console.log('[AuthContext] fetchUser: Attempting to get current user with token:', currentToken);
    try {
      const response = await authService.getCurrentUser(); // getCurrentUser уже использует getTokenFromStorages()
      
      if (response.data?.data?.user) {
        setUser(response.data.data.user as unknown as User);
        console.log('[AuthContext] fetchUser: User data set.', response.data.data.user);
      } else {
        console.error('[AuthContext] fetchUser: User data not found in response.', response.data);
        // Если данные пользователя не получены, но токен был, это может быть ошибкой
        // Можно вызвать logout() или специфическую обработку ошибки
        // logout(); 
        throw new Error('Данные пользователя не получены от сервера, хотя токен присутствовал.');
      }
    } catch (error) {
      console.error('[AuthContext] fetchUser: Error fetching user:', error);
      // Важно пробросить ошибку, чтобы useEffect мог ее обработать (например, вызвать logout)
      throw error; 
    }
  }, []); // Зависимостей нет, т.к. token читается внутри из хранилища, а authService стабилен

  // Проверяем авторизацию при загрузке
  useEffect(() => {
    console.log('[AuthContext] useEffect for token check triggered. Current token state:', token);
    const checkAuth = async () => {
      const currentTokenFromStorage = window.getTokenFromStorages ? window.getTokenFromStorages() : localStorage.getItem('token');
      console.log('[AuthContext] Token from storage inside checkAuth:', currentTokenFromStorage);
      
      if (currentTokenFromStorage) {
        // Если токен в стейте отличается от токена в хранилище (например, после logout)
        // и равен null, возможно, не стоит сразу делать fetchUser, а дождаться синхронизации
        if (token !== currentTokenFromStorage && token === null) {
            console.log('[AuthContext] Token state is null, but storage has token. Likely after logout/refresh failure. Syncing state.');
            setToken(currentTokenFromStorage); // Синхронизируем, это может вызвать повторный useEffect
            // setIsLoading(false); // Возможно, загрузку пока не стоит прекращать
            // return; // Можно прервать текущий checkAuth, дождавшись нового вызова useEffect
        }
        console.log('[AuthContext] Attempting to fetch user because token exists in storage.');
        try {
          await fetchUser();
        } catch (error) {
          console.error('[AuthContext] Error fetching user in useEffect:', error);
          // logout(); // logout() здесь может быть лишним, если интерцептор уже сделал редирект
        } finally {
          setIsLoading(false);
        }
      } else {
        console.log('[AuthContext] No token in storage. Setting loading to false.');
        // Если в хранилище токена нет, а в стейте он есть, надо очистить стейт
        if (token !== null) {
            console.log('[AuthContext] Token in state but not in storage. Clearing state token.');
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

  const register = async (formData: FormData) => {
    setIsLoading(true);
    console.log('[AuthContext] Register called with FormData');
    try {
      // Передаем FormData напрямую в сервис
      const response = await authService.register(formData);
      console.log('[AuthContext] Response from authService.register:', response);
      
      // Считаем регистрацию успешной, если сервер вернул статус 201 **или** 200 и присутствует токен в одном из ожидаемых мест.
      const isRegisterSuccess =
        (response.status === 201 || response.status === 200) &&
        (response.data?.success === true || response.data?.token || (response.data?.data && response.data?.data.token));

      if (isRegisterSuccess) {
        // Токен может лежать в корне ответа или под data.token
        const receivedToken = response.data.token || (response.data.data && response.data.data.token);
        const receivedUser =
          (response.data.user || (response.data.data && response.data.data.user)) as LandingUser | undefined;
        
        if (!receivedToken) {
          console.error('[AuthContext] Token not found in successful registration response.');
          throw new Error('Токен не получен от сервера после регистрации.');
        }
        if (!receivedUser) {
          console.error('[AuthContext] User data not found in successful registration response.');
          // Можно попробовать запросить пользователя отдельно, но лучше, если API вернет его
          throw new Error('Данные пользователя не получены от сервера после регистрации.');
        }
        
        // Сохраняем токен (сервис уже должен был это сделать, но дублируем для надежности)
        if (window.saveTokenToMultipleStorages) {
            window.saveTokenToMultipleStorages(receivedToken);
        } else {
            localStorage.setItem('token', receivedToken);
        }
        
        // Обновляем состояние контекста
        setToken(receivedToken);
        setUser(receivedUser as unknown as User); // Обновляем пользователя, включая avatar_url
        console.log('[AuthContext] Registration successful. Token and user state updated.');

      } else {
        // Обработка ошибки от API
        const errorMsg = response.data?.message || `Ошибка регистрации (статус ${response.status})`;
        const validationErrors = response.data?.errors;
        console.error('[AuthContext] Registration API error:', errorMsg, validationErrors);
        // Пробрасываем ошибку для отображения в компоненте
        const errorToThrow = new Error(errorMsg) as any;
        if (validationErrors) {
          errorToThrow.errors = validationErrors; // Добавляем ошибки валидации, если есть
        }
         if (response.status) {
           errorToThrow.status = response.status;
        }
        throw errorToThrow; 
      }
    } catch (error) {
      console.error('[AuthContext] Error during registration process:', error);
      // Очищаем токен и пользователя в случае любой ошибки на этапе регистрации
      if (window.clearTokenFromStorages) {
        window.clearTokenFromStorages();
      } else {
        localStorage.removeItem('token');
      }
      setToken(null);
      setUser(null);
      throw error; // Перебрасываем ошибку дальше
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('[AuthContext] logout called. Clearing tokens and user state.');
    // Попытка выхода через API, если возможно
    const currentTokenForLogout = token; // Используем копию, чтобы избежать замыкания на старое значение
    if (currentTokenForLogout) {
      authService.logout().catch((err: Error) => {
        console.error('Ошибка при выходе из системы (API call):', err);
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
    setIsLoading(false); // Устанавливаем isLoading в false после выхода
    console.log('[AuthContext] Tokens cleared, user set to null, isLoading set to false.');
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