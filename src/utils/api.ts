/**
 * Утилиты для работы с API
 */

import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Используем тип для ImportMeta.env
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

const API_URL = import.meta.env.VITE_API_URL || '/api/v1/landing';

// Создаем экземпляр axios с базовым URL и заголовками
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Интерцептор для добавления токена аутентификации
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: any) => {
    // Обработка ошибки 401 (Unauthorized)
    if (error.response?.status === 401) {
      // Попытка обновить токен
      try {
        const refreshResponse = await api.post('/auth/refresh');
        const { token } = refreshResponse.data;
        
        // Сохраняем новый токен
        localStorage.setItem('token', token);
        
        // Повторяем оригинальный запрос с новым токеном
        const originalRequest = error.config;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Если не удалось обновить токен - разлогиниваем пользователя
        localStorage.removeItem('token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Определение интерфейса для структуры ответов API
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Интерфейсы для данных ответов
export interface AuthResponseData {
  token: string;
  user: LandingUser;
}

export interface UserResponseData {
  user: LandingUser;
}

export interface OrganizationsResponseData {
  organizations: OrganizationSummary[];
}

// Сервисы для работы с API
export const authService = {
  // Регистрация нового пользователя
  register: (userData: RegisterRequest) => 
    api.post<ApiResponse<AuthResponseData>>('/auth/register', userData),
  
  // Вход в систему
  login: (credentials: LoginRequest) => 
    api.post<ApiResponse<AuthResponseData>>('/auth/login', credentials),
  
  // Выход из системы
  logout: () => api.post<ApiResponse<null>>('/auth/logout'),
  
  // Получение данных текущего пользователя
  getCurrentUser: () => api.get<ApiResponse<UserResponseData>>('/auth/me'),
  
  // Обновление токена
  refreshToken: () => api.post<ApiResponse<{ token: string }>>('/auth/refresh'),
  
  // Запрос на сброс пароля
  requestPasswordReset: (email: string) => 
    api.post<ApiResponse<null>>('/auth/password/email', { email }),
  
  // Сброс пароля
  resetPassword: (resetData: { token: string; email: string; password: string; password_confirmation: string }) => 
    api.post<ApiResponse<null>>('/auth/password/reset', resetData),
  
  // Повторная отправка письма с подтверждением
  resendVerificationEmail: () => api.post<ApiResponse<null>>('/auth/email/resend')
};

export const userService = {
  // Получение профиля пользователя
  getProfile: () => api.get<ApiResponse<UserResponseData>>('/user/profile'),
  
  // Обновление профиля пользователя
  updateProfile: (profileData: UpdateProfileRequest) => 
    api.put<ApiResponse<UserResponseData>>('/user/profile', profileData),
  
  // Изменение пароля
  changePassword: (passwordData: ChangePasswordRequest) => 
    api.put<ApiResponse<null>>('/user/password', passwordData),
  
  // Получение списка организаций пользователя
  getUserOrganizations: () => api.get<ApiResponse<OrganizationsResponseData>>('/user/organizations')
};

export const organizationService = {
  // Создание новой организации
  createOrganization: (orgData: any) => 
    api.post<ApiResponse<Organization>>('/organizations', orgData),
  
  // Получение данных организации
  getOrganization: (orgId: number) => 
    api.get<ApiResponse<Organization>>(`/organizations/${orgId}`),
  
  // Обновление данных организации
  updateOrganization: (orgId: number, orgData: any) => 
    api.put<ApiResponse<Organization>>(`/organizations/${orgId}`, orgData)
};

export const supportService = {
  // Отправка запроса в поддержку
  submitSupportRequest: (requestData: SupportRequest) => 
    api.post<ApiResponse<null>>('/support/request', requestData)
};

// Интерфейсы для типизации данных
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface OrganizationSummary {
  id: number;
  name: string;
  role_in_org: string;
}

export interface Organization {
  id: number;
  name: string;
  legal_name?: string;
  tax_number?: string;
  registration_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  owner_id: number;
  created_at: string;
  updated_at: string;
}

export interface LandingUser {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  current_organization_id?: number;
}

export interface SupportRequest {
  name?: string;
  email?: string;
  subject: string;
  message: string;
  type?: 'Сообщение об ошибке' | 'Запрос функциональности' | 'Общий вопрос' | 'Вопрос по оплате';
}

export default api; 