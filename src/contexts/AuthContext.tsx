import { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@utils/api';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  current_organization_id: number;
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

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  phone?: string;
  position?: string;
  organization_name: string;
  organization_legal_name?: string;
  organization_tax_number?: string;
  organization_registration_number?: string;
  organization_phone?: string;
  organization_email?: string;
  organization_address?: string;
  organization_city?: string;
  organization_postal_code?: string;
  organization_country?: string;
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
      const data = await authApi.login(email, password);
      
      // Сохраняем токен
      const bearerToken = data.token;
      if (!bearerToken) {
        throw new Error('Токен не получен от сервера');
      }
      
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
      const data = await authApi.register(userData);
      
      // Сохраняем токен
      const bearerToken = data.token;
      if (!bearerToken) {
        throw new Error('Токен не получен от сервера');
      }
      
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
      const data = await authApi.getMe(token);
      setUser(data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
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