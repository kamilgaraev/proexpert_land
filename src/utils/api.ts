/**
 * Утилиты для работы с API
 */

// @ts-ignore
import axios from 'axios';
// @ts-ignore
// import api_instance from './axiosConfig'; 
import type { AdminFormData as AdminFormDataExternal, AdminUsersListResponse, AdminUserDetailResponse, AdminUserDeleteResponse } from '../types/admin';
import NotificationService from '@components/shared/NotificationService';

// БЛОК ОПРЕДЕЛЕНИЯ URL
// Базовый домен API
const API_BASE_DOMAIN = 'https://api.prohelper.pro';

// Базовый путь для всех API v1, включая /landing
// Результат: https://api.prohelper.pro/api/v1/landing
const API_URL = `${API_BASE_DOMAIN}/api/v1/landing`;

// URL для эндпоинтов биллинга, который должен быть https://api.prohelper.pro/api/v1/landing/billing
// Строится от API_URL (который уже .../landing) добавлением /billing
const BILLING_API_URL = `${API_URL}/billing`;
// КОНЕЦ БЛОКА

// Создаем экземпляр axios с базовым URL
// Этот экземпляр axios используется для старых сервисов, которые ожидают /landing в пути.
const api = axios.create({
  baseURL: API_URL, 
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

// Дополнительная функция для работы с токеном через разные типы хранилищ
const saveTokenToMultipleStorages = (token: string) => {
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
  
  // Пробуем использовать куки (работает только при определенных настройках безопасности)
  try {
    document.cookie = `authToken=${token}; path=/; max-age=86400`;
  } catch (e) {
    console.error('Ошибка сохранения в cookie', e);
  }
};

export const getTokenFromStorages = (): string | null => {
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

const clearTokenFromStorages = () => {
  // Очищаем во всех хранилищах
  localStorage.removeItem('token');
  sessionStorage.removeItem('authToken');
  document.cookie = 'authToken=; path=/; max-age=0';
};

// Интерцептор для добавления токена аутентификации
api.interceptors.request.use((config: any) => {
  const token = getTokenFromStorages();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response: any) => response,
  async (error: any) => {
    const originalRequest = error.config;
    // Обработка ошибки 401 (Unauthorized)
    // Добавляем проверку, чтобы не попасть в цикл, если сам /auth/refresh вернул 401
    if (error.response?.status === 401 && originalRequest.url !== '/auth/refresh') {
      // Попытка обновить токен
      try {
        const refreshResponse = await api.post('/auth/refresh'); // Предполагается, что refresh-токен обрабатывается бэкендом через httpOnly cookie или сессию
        const token = (refreshResponse.data as any).token; // ВАЖНО: Убедитесь, что API /auth/refresh возвращает access_token в поле token
        
        if (!token) {
            console.error('Refresh response did not contain a token.');
            clearTokenFromStorages();
            window.location.href = '/login'; // Или другой обработчик, например, показать модальное окно
            return Promise.reject(new Error('Refresh response did not contain a token.'));
        }

        saveTokenToMultipleStorages(token);
        
        // Повторяем оригинальный запрос с новым токеном
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      } catch (refreshError: any) {
        clearTokenFromStorages();
        window.location.href = '/login'; // Или другой обработчик
        return Promise.reject(refreshError);
      }
    } else if (error.response?.status === 401 && originalRequest.url === '/auth/refresh') {
      // Если /auth/refresh сам вернул 401, значит refresh token невалиден или истек
      console.error('Refresh token is invalid or expired. Logging out.');
      clearTokenFromStorages();
      window.location.href = '/login'; // Или другой обработчик
      return Promise.reject(error); // Важно отклонить промис, чтобы вызывающий код мог обработать ошибку
    }
    
    // Обработка 403 (Forbidden / insufficient permissions)
    if (error.response?.status === 403) {
      const apiMessage = error.response?.data?.message || 'У вас нет доступа к этому ресурсу.﻿';
      NotificationService.show({
        type: 'error',
        title: 'Недостаточно прав',
        message: apiMessage,
        duration: 7000,
      });
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
  register: async (formData: FormData): Promise<any> => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json'
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data && data.token) {
      saveTokenToMultipleStorages(data.token);
    } else if (data && data.data && data.data.token) {
      saveTokenToMultipleStorages(data.data.token);
    }
    
    return {
      data: data,
      status: response.status,
      statusText: response.statusText,
      headers: {},
      config: {} as any
    };
  },
  
  // Вход в систему
  login: async (credentials: LoginRequest): Promise<any> => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    
    // Сразу сохраняем токен в хранилище
    if (data && data.success && data.data && data.data.token) {
      saveTokenToMultipleStorages(data.data.token);
    }
    
    // Создаем объект, имитирующий ответ Axios
    return {
      data: data,
      status: response.status,
      statusText: response.statusText,
      headers: {},
      config: {} as any
    };
  },
  
  // Выход из системы
  logout: () => {
    clearTokenFromStorages();
    return api.post<ApiResponse<null>>('/auth/logout');
  },
  
  // Получение данных текущего пользователя
  getCurrentUser: async (): Promise<any> => {
    const token = getTokenFromStorages();
    
    if (!token) {
      throw new Error('Токен авторизации отсутствует');
    }
    
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    // Создаем объект, имитирующий ответ Axios
    return {
      data: data,
      status: response.status,
      statusText: response.statusText
    };
  },
  
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
  getProfile: async () => {
    const token = getTokenFromStorages();
    
    if (!token) {
      throw new Error('Токен авторизации отсутствует');
    }
    
    const response = await fetch(`${API_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    return {
      data: data,
      status: response.status,
      statusText: response.statusText
    };
  },
  
  // Обновление профиля пользователя
  updateProfile: async (formData: FormData) => {
    const token = getTokenFromStorages();
    
    if (!token) {
      throw new Error('Токен авторизации отсутствует');
    }
    
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();

    if (!response.ok) {
        const errorMsg = data?.message || `Ошибка обновления профиля (статус ${response.status})`;
        const validationErrors = data?.errors;
        const errorToThrow = new Error(errorMsg) as any;
        if (validationErrors) {
          errorToThrow.errors = validationErrors; 
        }
        errorToThrow.status = response.status;
        throw errorToThrow; 
    }
    
    return {
      data: data, 
      status: response.status,
      statusText: response.statusText
    };
  },
  
  // Изменение пароля
  changePassword: async (passwordData: ChangePasswordRequest) => {
    const token = getTokenFromStorages();
    
    if (!token) {
      throw new Error('Токен авторизации отсутствует');
    }
    
    const response = await fetch(`${API_URL}/user/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(passwordData)
    });
    
    const data = await response.json();
    
    return {
      data: data,
      status: response.status,
      statusText: response.statusText
    };
  },
  
  // Получение списка организаций пользователя
  getUserOrganizations: async () => {
    const token = getTokenFromStorages();
    
    if (!token) {
      throw new Error('Токен авторизации отсутствует');
    }
    
    const response = await fetch(`${API_URL}/user/organizations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    return {
      data: data,
      status: response.status,
      statusText: response.statusText
    };
  },
  
  // Получение списка пользователей организации
  getOrganizationUsers: async () => {
    const token = getTokenFromStorages();
    
    if (!token) {
      throw new Error('Токен авторизации отсутствует');
    }
    
    const response = await fetch(`${API_URL}/adminPanelUsers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    return {
      data: {
        success: data.success !== undefined ? data.success : response.ok,
        message: data.message || '',
        data: (data && data.data && typeof data.data === 'object' && data.data.data && Array.isArray(data.data.data)) 
              ? data.data.data 
              : (data && Array.isArray(data.data)) 
                ? data.data
                : Array.isArray(data) 
                  ? data
                  : []
      },
      status: response.status,
      statusText: response.statusText
    };
  },
  
  // Приглашение нового пользователя в организацию
  inviteUser: async (userData: {
    name: string;
    email: string;
    role: string;
    password?: string;
    password_confirmation?: string;
    organization_id?: number;
  }) => {
    const token = getTokenFromStorages();
    
    if (!token) {
      throw new Error('Токен авторизации отсутствует');
    }
    
    const response = await fetch(`${API_URL}/users/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    
    const data = await response.json();
    
    return {
      data: data,
      status: response.status,
      statusText: response.statusText
    };
  }
};

export const organizationService = {
  // Создание новой организации
  createOrganization: async (orgData: any) => {
    const token = getTokenFromStorages();
    
    if (!token) {
      throw new Error('Токен авторизации отсутствует');
    }
    
    const response = await fetch(`${API_URL}/organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orgData)
    });
    
    const data = await response.json();
    
    return {
      data: data,
      status: response.status,
      statusText: response.statusText
    };
  },
  
  // Получение данных организации
  getOrganization: async (orgId: number) => {
    const token = getTokenFromStorages();
    
    if (!token) {
      throw new Error('Токен авторизации отсутствует');
    }
    
    const response = await fetch(`${API_URL}/organizations/${orgId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    return {
      data: data,
      status: response.status,
      statusText: response.statusText
    };
  },
  
  // Обновление данных организации
  updateOrganization: async (orgId: number, orgData: any) => {
    const token = getTokenFromStorages();
    
    if (!token) {
      throw new Error('Токен авторизации отсутствует');
    }
    
    const response = await fetch(`${API_URL}/organizations/${orgId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orgData)
    });
    
    const data = await response.json();
    
    return {
      data: data,
      status: response.status,
      statusText: response.statusText
    };
  },

  getList: async (): Promise<ApiResponse<Organization[]>> => {
    const response = await api.get('/organizations');
    return response.data as ApiResponse<Organization[]>;
  },

  getCurrent: async (): Promise<ApiResponse<OrganizationWithRecommendations>> => {
    const response = await api.get('/organization/verification');
    return response.data as ApiResponse<OrganizationWithRecommendations>;
  },

  update: async (data: OrganizationUpdateData): Promise<ApiResponse<OrganizationWithRecommendations>> => {
    const response = await api.patch('/organization/verification', data);
    return response.data as ApiResponse<OrganizationWithRecommendations>;
  },

  requestVerification: async (): Promise<ApiResponse<{ verification_result: any; organization: Organization }>> => {
    const response = await api.post('/organization/verification/request');
    return response.data as ApiResponse<{ verification_result: any; organization: Organization }>;
  },

  getVerificationRecommendations: async (): Promise<ApiResponse<{ recommendations: VerificationRecommendations; user_message: UserMessage }>> => {
    const response = await api.get('/organization/verification/recommendations');
    return response.data as ApiResponse<{ recommendations: VerificationRecommendations; user_message: UserMessage }>;
  }
};

export const supportService = {
  // Отправка запроса в поддержку
  submitSupportRequest: async (requestData: SupportRequest) => {
    const token = getTokenFromStorages();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}/support/request`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestData)
    });
    
    const data = await response.json();
    
    return {
      data: data,
      status: response.status,
      statusText: response.statusText
    };
  }
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

export interface OrganizationVerification {
  is_verified: boolean;
  verified_at: string | null;
  verification_status: 'verified' | 'partially_verified' | 'needs_review' | 'failed' | 'pending';
  verification_status_text: string;
  verification_score: number;
  verification_data: any;
  verification_notes: string;
  can_be_verified: boolean;
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
  description?: string;
  logo_path?: string;
  is_active: boolean;
  subscription_expires_at?: string;
  verification: OrganizationVerification;
  created_at: string;
  updated_at: string;
}

export interface OrganizationUpdateData {
  name?: string;
  legal_name?: string;
  tax_number?: string;
  registration_number?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  description?: string;
}

export interface MissingField {
  field: string;
  name: string;
  description: string;
  weight: number;
  required: boolean;
}

export interface FieldIssue {
  field: string;
  name: string;
  description: string;
  current_value: string;
  weight: number;
}

export interface VerificationIssue {
  type: 'warning' | 'error' | 'info';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface VerificationRecommendations {
  current_score: number;
  max_score: number;
  status: string;
  status_text: string;
  missing_fields: MissingField[];
  field_issues: FieldIssue[];
  verification_issues: VerificationIssue[];
  can_auto_verify: boolean;
  potential_score_increase: number;
  needs_verification: boolean;
}

export interface UserMessage {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  action: 'verify' | 'edit' | null;
}

export interface OrganizationWithRecommendations {
  organization: Organization;
  recommendations: VerificationRecommendations;
  user_message: UserMessage;
}

export interface LandingUser {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
  current_organization_id?: number;
  avatar_url: string | null;
  phone?: string | null;
  position?: string | null;
  is_active?: boolean;
  user_type?: string;
  last_login_at?: string | null;
}

export interface SupportRequest {
  name?: string;
  email?: string;
  subject: string;
  message: string;
  type?: 'Сообщение об ошибке' | 'Запрос функциональности' | 'Общий вопрос' | 'Вопрос по оплате';
}

// Типы для AdminPanelUsers, используемые в adminPanelUserService и AdminsPage
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'web_admin' | 'accountant' | string;
}

// Сервис для управления пользователями Админ-панели
export const adminPanelUserService = {
  getAdminPanelUsers: async (): Promise<AdminUsersListResponse> => {
    const response = await api.get('/adminPanelUsers');
    return response.data as AdminUsersListResponse; 
  },

  getAdminPanelUserById: async (userId: number): Promise<AdminUserDetailResponse> => {
    const response = await api.get(`/adminPanelUsers/${userId}`);
    return response.data as AdminUserDetailResponse;
  },

  createAdminPanelUser: async (userData: AdminFormDataExternal): Promise<AdminUserDetailResponse> => {
    const response = await api.post('/adminPanelUsers', userData);
    return response.data as AdminUserDetailResponse;
  },
  
  updateAdminPanelUser: async (userId: number, userData: Partial<AdminFormDataExternal>): Promise<AdminUserDetailResponse> => {
    const response = await api.patch(`/adminPanelUsers/${userId}`, userData);
    return response.data as AdminUserDetailResponse;
  },
  
  deleteAdminPanelUser: async (userId: number): Promise<AdminUserDeleteResponse> => {
    const response = await api.delete(`/adminPanelUsers/${userId}`);
    if (response.status === 204) {
      return { success: true, message: 'Пользователь успешно удален' };
    }
    return response.data as AdminUserDeleteResponse; 
  },
};

// Интерфейсы для Billing API на основе billing_openapi.yaml

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string;
  duration_in_days: number;
  max_foremen?: number | null;
  max_projects?: number | null;
  max_storage_gb?: number | null;
  features: string[];
  display_order: number;
}

export interface UserSubscription {
  id: number;
  status: string; // e.g., trial, active, pending_payment, past_due, canceled, expired, incomplete
  trial_ends_at?: string | null; // ISO DateTime
  starts_at?: string | null; // ISO DateTime
  ends_at?: string | null; // ISO DateTime
  next_billing_at?: string | null; // ISO DateTime
  canceled_at?: string | null; // ISO DateTime
  is_active_now: boolean;
  plan: SubscriptionPlan;
  payment_gateway_subscription_id?: string | null;
}

export interface OrganizationBalance {
  organization_id: number;
  balance_cents: number;
  balance_formatted: string;
  currency: string;
  updated_at: string; // ISO DateTime
}

export interface BalanceTransaction {
  id: number;
  type: 'credit' | 'debit';
  amount_cents: number;
  amount_formatted: string;
  balance_before_cents: number;
  balance_after_cents: number;
  description?: string | null;
  payment_id?: number | null;
  user_subscription_id?: number | null;
  meta?: object | null;
  created_at: string; // ISO DateTime
}

export interface PaginatedBalanceTransactions {
  data: BalanceTransaction[];
  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };
  meta: {
    current_page: number;
    from?: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to?: number | null;
    total: number;
  };
}

export interface PaymentGatewayChargeResponse {
  success: boolean;
  chargeId?: string | null;
  status: string; // e.g., succeeded, pending, failed
  message?: string | null;
  redirectUrl?: string | null;
  gatewaySpecificResponse?: object | null;
}

// Запросы
export interface SubscribeToPlanRequest {
  plan_slug: string;
  payment_method_token?: string | null;
}

export interface CancelSubscriptionRequest {
  at_period_end?: boolean;
}

export interface TopUpBalanceRequest {
  amount: number; // Сумма в основной валюте
  currency: string; // e.g., RUB
  payment_method_token: string;
}

// Общий интерфейс для ошибок API (на основе ErrorResponse из OpenAPI)
export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>; // Для ошибок валидации (как в ValidationErrorResponse)
}

// Интерфейсы для API лимитов подписки
export interface SubscriptionLimitItem {
  limit: number | null;
  used: number;
  remaining: number;
  percentage_used: number;
  is_unlimited: boolean;
  status: 'normal' | 'approaching' | 'warning' | 'exceeded' | 'unlimited';
}

export interface StorageLimitItem {
  limit_gb: number | null;
  used_gb: number;
  remaining_gb: number;
  percentage_used: number;
  is_unlimited: boolean;
  status: 'normal' | 'approaching' | 'warning' | 'exceeded' | 'unlimited';
}

export interface SubscriptionLimits {
  foremen: SubscriptionLimitItem;
  projects: SubscriptionLimitItem;
  storage: StorageLimitItem;
}

export interface SubscriptionWarning {
  type: string;
  level: 'warning' | 'critical';
  message: string;
}

export interface SubscriptionInfo {
  id: number;
  status: string;
  plan_name: string;
  plan_description: string;
  is_trial: boolean;
  trial_ends_at: string | null;
  ends_at: string | null;
  next_billing_at: string | null;
  is_canceled: boolean;
}

export interface SubscriptionLimitsResponse {
  has_subscription: boolean;
  subscription: SubscriptionInfo | null;
  limits: SubscriptionLimits;
  features: string[];
  warnings: SubscriptionWarning[];
  upgrade_required: boolean;
}

// Вспомогательная функция для запросов
async function fetchWithBillingLogging(url: string, options: RequestInit): Promise<Response> {
  const response = await fetch(url, options);
  
  // Если токен истёк или сессия недействительна, перенаправляем на страницу логина
  if (response.status === 401 || response.status === 419) {
    try {
      clearTokenFromStorages();
    } catch (e) {
      console.warn('[BillingService] clearToken error', e);
    }
    if (!window.location.pathname.includes('/login')) {
      window.location.replace('/login');
    }
  }

  return response; // Возвращаем оригинальный response для дальнейшей обработки
}

export const billingService = {
  getPlans: async (): Promise<{ data: SubscriptionPlan[] | ErrorResponse, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/plans`;
    const options: RequestInit = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();

    if (response.ok && responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray(responseData.data)) {
      // Успешный ответ, и структура соответствует { data: [...] }
      return { data: responseData.data as SubscriptionPlan[], status: response.status, statusText: response.statusText }; 
    } else if (!response.ok) {
      // Ошибка от сервера
      return { data: responseData as ErrorResponse, status: response.status, statusText: response.statusText };
    } else {
      // Неожиданная структура успешного ответа
      console.error('[BillingService] getPlans: Unexpected response structure:', responseData);
      return { data: { message: 'Неожиданная структура ответа от сервера для планов.' } as ErrorResponse, status: response.status, statusText: 'Unexpected structure' };
    }
  },

  getCurrentSubscription: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/subscription`;
    const options: RequestInit = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },

  subscribeToPlan: async (payload: { plan_slug: string; is_auto_payment_enabled?: boolean }): Promise<{ data: any, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/subscribe`;
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },

  cancelSubscription: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/subscription/cancel`;
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({}),
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },

  changePlanPreview: async (payload: { plan_slug: string }): Promise<{ data: any, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    
    const url = `${BILLING_API_URL}/subscription/change-plan-preview`;
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    };
    
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },

  changePlan: async (payload: { plan_slug: string }): Promise<{ data: any, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/subscription/change-plan`;
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },

  getSubscriptionLimits: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/subscription/limits`;
    const options: RequestInit = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },


  getBalance: async (): Promise<{ data: OrganizationBalance | ErrorResponse, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/balance`;
    const options: RequestInit = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData as OrganizationBalance | ErrorResponse, status: response.status, statusText: response.statusText };
  },

  getBalanceTransactions: async (page: number = 1, limit: number = 15): Promise<{ data: PaginatedBalanceTransactions | ErrorResponse, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/balance/transactions?page=${page}&limit=${limit}`;
    const options: RequestInit = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData as PaginatedBalanceTransactions | ErrorResponse, status: response.status, statusText: response.statusText };
  },

  topUpBalance: async (payload: TopUpBalanceRequest): Promise<{ data: PaymentGatewayChargeResponse | ErrorResponse, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/balance/top-up`;
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData as PaymentGatewayChargeResponse | ErrorResponse, status: response.status, statusText: response.statusText };
  },

  // Получить список add-on'ов и подключённых
  getAddons: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/addons`;
    const options: RequestInit = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },

  // Подключить add-on
  connectAddon: async (addon_id: number): Promise<{ data: any, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/org-addon`;
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ addon_id }),
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },

  // Отключить add-on
  disconnectAddon: async (subscription_addon_id: number): Promise<{ data: any, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/org-addon/${subscription_addon_id}`;
    const options: RequestInit = {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },


  // Совершить одноразовую покупку
  oneTimePurchase: async (payload: { type: string; description: string; amount: number; currency: string }): Promise<{ data: any, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/org-one-time-purchase`;
    const options: RequestInit = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload),
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },

  // Получить историю одноразовых покупок
  getOneTimePurchases: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/org-one-time-purchases`;
    const options: RequestInit = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },

  // Получить дашборд организации (тариф, лимиты, add-on)
  getOrgDashboard: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/org-dashboard`;
    const options: RequestInit = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },


  // Включить / выключить автоплатёж для подписки
  updateAutoPayment: async (is_auto_payment_enabled: boolean): Promise<{ data: any, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = `${BILLING_API_URL}/subscription/auto-payment`;
    const options: RequestInit = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ is_auto_payment_enabled }),
    };
    const response = await fetchWithBillingLogging(url, options);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },
};

export const userManagementService = {
  getRoles: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.get('/user-management/roles');
    return response;
  },

  createRole: async (roleData: {
    name: string;
    slug?: string;
    description?: string;
    permissions: string[];
    color?: string;
    is_active?: boolean;
    display_order?: number;
  }): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.post('/user-management/roles', roleData);
    return response;
  },

  getAvailablePermissions: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.get('/user-management/roles/permissions/available');
    return response;
  },

  assignRoleToUser: async (roleId: number, userId: number): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.post(`/user-management/roles/${roleId}/assign-user`, { user_id: userId });
    return response;
  },

  duplicateRole: async (roleId: number, name: string): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.post(`/user-management/roles/${roleId}/duplicate`, { name });
    return response;
  },

  getInvitations: async (status?: string, email?: string): Promise<{ data: any, status: number, statusText: string }> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (email) params.append('email', email);
    
    const response = await api.get(`/user-management/invitations${params.toString() ? '?' + params.toString() : ''}`);
    return response;
  },

  createInvitation: async (invitationData: {
    email: string;
    name: string;
    role_slugs: string[];
    metadata?: Record<string, any>;
  }): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.post('/user-management/invitations', invitationData);
    return response;
  },

  acceptInvitation: async (token: string, password?: string, passwordConfirmation?: string): Promise<{ data: any, status: number, statusText: string }> => {
    const payload: any = {};
    if (password) {
      payload.password = password;
      payload.password_confirmation = passwordConfirmation;
    }
    
    const response = await api.post(`/user-management/invitation/${token}/accept`, payload);
    return response;
  },

  getInvitationStats: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.get('/user-management/invitations/stats/overview');
    return response;
  },

  resendInvitation: async (invitationId: number): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.post(`/user-management/invitations/${invitationId}/resend`);
    return response;
  },

  getOrganizationUsers: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.get('/user-management/organization-users');
    return response;
  },

  updateUserRoles: async (userId: number, rolesData: {
    system_roles?: string[];
    custom_roles?: number[];
    action: 'replace' | 'add' | 'remove';
  }): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.post(`/user-management/organization-users/${userId}/roles`, rolesData);
    return response;
  },

  getUserLimits: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.get('/user-management/user-limits');
    return response;
  },

  deleteUser: async (userId: number): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.delete(`/user-management/organization-users/${userId}`);
    return response;
  },

  updateRole: async (roleId: number, roleData: {
    name?: string;
    description?: string;
    permissions?: string[];
    color?: string;
    is_active?: boolean;
    display_order?: number;
  }): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.put(`/user-management/roles/${roleId}`, roleData);
    return response;
  },

  deleteRole: async (roleId: number): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.delete(`/user-management/roles/${roleId}`);
    return response;
  },

  cancelInvitation: async (invitationId: number): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.delete(`/user-management/invitations/${invitationId}`);
    return response;
  },
};

export interface OrganizationModule {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  category: string;
  icon: string;
  is_premium: boolean;
}

export interface ModuleActivation {
  id: number;
  activated_at: string;
  expires_at: string | null;
  status: 'active' | 'expired' | 'pending';
}

export interface ActivatedModule {
  id: number;
  organization_id: number;
  organization_module_id?: number;
  module?: OrganizationModule;
  activated_at: string;
  expires_at: string | null;
  status: 'active' | 'expired' | 'pending';
  paid_amount: number;
  payment_method: 'balance' | 'card' | 'invoice' | 'free';
}

export interface ModulesResponse {
  success: boolean;
  data: ActivatedModule[];
}

export interface ModuleWithActivation {
  module: OrganizationModule;
  is_activated: boolean;
  activation: ActivatedModule | null;
  days_until_expiration: number | null;
  expires_at: string | null;
  status: 'active' | 'expired' | 'pending' | 'inactive';
}

export interface AvailableModulesResponse {
  success: boolean;
  data: Record<string, OrganizationModule[]>;
}

export interface ActivateModuleRequest {
  module_id: number;
  payment_method?: 'balance' | 'card' | 'invoice';
  settings?: Record<string, any>;
}

export interface RenewModuleRequest {
  days?: number;
}

export interface CheckAccessRequest {
  module_slug: string;
}

export interface ModuleActivationResponse {
  id: number;
  organization_id: number;
  organization_module_id: number;
  activated_at: string;
  expires_at: string | null;
  status: 'active' | 'expired' | 'pending';
  paid_amount: number;
  payment_method: 'balance' | 'card' | 'invoice';
}

export interface CancelPreviewResponse {
  can_cancel: boolean;
  refund_amount: number;
  days_used: number;
  days_remaining: number;
  daily_cost: number;
  message: string;
}

export interface CancelModuleRequest {
  confirm: boolean;
  reason?: string;
}

export interface CancelModuleResponse {
  refund_amount: number;
  days_used: number;
  days_remaining: number;
}

export interface MultiOrganizationAvailability {
  available: boolean;
  can_create_holding: boolean;
  current_type: 'single' | 'parent' | 'child';
  is_holding: boolean;
}

export interface CreateHoldingRequest {
  name: string;
  description?: string;
  max_child_organizations?: number;
  settings?: {
    consolidated_reports?: boolean;
    shared_materials?: boolean;
    unified_billing?: boolean;
  };
  permissions_config?: {
    default_child_permissions?: {
      projects?: string[];
      contracts?: string[];
      materials?: string[];
      reports?: string[];
      users?: string[];
    };
  };
}

export interface AddChildOrganizationRequest {
  group_id: number;
  name: string;
  description?: string;
  inn?: string;
  kpp?: string;
  address?: string;
  phone?: string;
  email?: string;
  owner: {
    name: string;
    email: string;
    password: string;
  };
}

export interface OrganizationHierarchy {
  parent: {
    id: number;
    group_id?: number; // идентификатор группы холдинга
    name: string;
    slug?: string;
    organization_type: 'parent';
    is_holding: boolean;
    hierarchy_level: number;
    tax_number?: string;
    registration_number?: string;
    address?: string;
    created_at: string;
  };
  children: Array<{
    id: number;
    group_id?: number; // идентификатор группы для дочерней организации
    name: string;
    organization_type: 'child';
    is_holding: boolean;
    hierarchy_level: number;
    tax_number?: string;
    created_at: string;
  }>;
  total_stats: {
    total_organizations: number;
    total_users: number;
    total_projects: number;
    total_contracts: number;
  };
}

export interface AccessibleOrganization {
  id: number;
  name: string;
  organization_type: 'single' | 'parent' | 'child';
  is_holding: boolean;
  hierarchy_level: number;
}

export interface OrganizationDetails {
  organization: {
    id: number;
    name: string;
    organization_type: 'single' | 'parent' | 'child';
    is_holding: boolean;
    hierarchy_level: number;
    inn?: string;
    address?: string;
    created_at: string;
  };
  stats: {
    users_count: number;
    projects_count: number;
    contracts_count: number;
    active_contracts_value: number;
  };
  recent_activity: {
    last_project_created?: string;
    last_contract_signed?: string;
    last_user_added?: string;
  };
}

export interface SwitchContextRequest {
  organization_id: number;
}

export interface HoldingPublicData {
  holding: {
    id: number;
    name: string;
    slug: string;
    description: string;
    parent_organization_id: number;
    status: string;
    created_at: string;
  };
  parent_organization: {
    id: number;
    name: string;
    legal_name: string;
    tax_number: string;
    registration_number: string;
    address: string;
    phone?: string;
    email?: string;
    city: string;
    description?: string;
  };
  stats: {
    total_child_organizations: number;
    total_users: number;
    total_projects: number;
    total_contracts: number;
    total_contracts_value: number;
    active_contracts_count: number;
  };
}

export interface HoldingDashboardData {
  holding: {
    id: number;
    name: string;
    slug: string;
    description: string;
    parent_organization_id: number;
    status: string;
  };
  hierarchy: OrganizationHierarchy;
  user: {
    id: number;
    name: string;
    email: string;
  };
  consolidated_stats: {
    total_child_organizations: number;
    total_users: number;
    total_projects: number;
    total_contracts: number;
    total_contracts_value: number;
    active_contracts_count: number;
    recent_activity: Array<{
      type: string;
      organization_name: string;
      description: string;
      date: string;
    }>;
    performance_metrics: {
      monthly_growth: number;
      efficiency_score: number;
      satisfaction_index: number;
    };
  };
}

export interface HoldingOrganization {
  id: number;
  name: string;
  description?: string;
  organization_type: 'child';
  hierarchy_level: number;
  tax_number?: string;
  registration_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  stats: {
    users_count: number;
    projects_count: number;
    contracts_count: number;
    active_contracts_value: number;
  };
}

export const modulesService = {
  getModules: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.get('/modules/');
    return response;
  },

  getAvailableModules: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.get('/modules/available');
    return response;
  },

  activateModule: async (moduleData: ActivateModuleRequest): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.post('/modules/activate', moduleData);
    return response;
  },

  deactivateModule: async (moduleId: number): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.delete(`/modules/${moduleId}`);
    return response;
  },

  renewModule: async (moduleId: number, renewData: RenewModuleRequest): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.patch(`/modules/${moduleId}/renew`, renewData);
    return response;
  },

  checkAccess: async (accessData: CheckAccessRequest): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.post('/modules/check-access', accessData);
    return response;
  },

  getExpiringModules: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.get('/modules/expiring');
    return response;
  },

  // Новые методы для работы с отменой модулей
  getCancelPreview: async (moduleSlug: string): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.get(`/modules/${moduleSlug}/cancel-preview`);
    return response;
  },

  cancelModule: async (moduleSlug: string, cancelData: CancelModuleRequest): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.post(`/modules/${moduleSlug}/cancel`, cancelData);
    return response;
  },
};

export const multiOrganizationService = {
  checkAvailability: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.get('/multi-organization/check-availability');
    return response;
  },

  createHolding: async (holdingData: CreateHoldingRequest): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.post('/multi-organization/create-holding', holdingData);
    return response;
  },

  addChildOrganization: async (childData: AddChildOrganizationRequest): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.post('/multi-organization/add-child', childData);
    return response;
  },

  getHierarchy: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.get('/multi-organization/hierarchy');
    return response;
  },

  getAccessibleOrganizations: async (): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.get('/multi-organization/accessible');
    return response;
  },

  getOrganizationDetails: async (organizationId: number): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.get(`/multi-organization/organization/${organizationId}`);
    return response;
  },

  switchContext: async (contextData: SwitchContextRequest): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.post('/multi-organization/switch-context', contextData);
    return response;
  },

  getHoldingPublicInfo: async (slug: string): Promise<HoldingPublicData> => {
    const isLocalDev = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
    let url: string;
    
    if (isLocalDev) {
      url = `https://api.prohelper.pro/api/v1/holding-api/${slug}`;
    } else {
      url = `https://api.prohelper.pro/api/v1/holding-api/${slug}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Ошибка загрузки данных холдинга: ${response.status}`);
    }

    const responseData = await response.json();
    
    if (!responseData.success) {
      throw new Error(responseData.message || 'Ошибка при получении данных холдинга');
    }
    
    return responseData.data;
  },

  getHoldingDashboardInfo: async (slug: string, token: string): Promise<HoldingDashboardData> => {
    const isLocalDev = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
    let url: string;
    
    if (isLocalDev) {
      url = `https://api.prohelper.pro/api/v1/holding-api/${slug}/dashboard`;
    } else {
      url = `https://api.prohelper.pro/api/v1/holding-api/${slug}/dashboard`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    
    if (!response.ok) {
      throw new Error(`Ошибка загрузки панели управления: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Не удалось загрузить данные холдинга');
    }
    
    return data.data;
  },

  getHoldingOrganizations: async (slug: string, token: string): Promise<any[]> => {
    const isLocalDev = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1');
    let url: string;
    
    if (isLocalDev) {
      url = `/api/v1/multi-organization/accessible`;
    } else {
      url = `https://api.prohelper.pro/api/v1/holding-api/${slug}/organizations`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED');
      }
      throw new Error(`Ошибка загрузки организаций: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Не удалось загрузить организации');
    }
    
    return data.data;
  },

  // Расширенные методы для дочерних организаций
  getChildOrganizations: async (params?: {
    search?: string;
    status?: 'active' | 'inactive' | 'all';
    sort_by?: 'name' | 'created_at' | 'users_count' | 'projects_count';
    sort_direction?: 'asc' | 'desc';
    per_page?: number;
  }): Promise<{ data: any, status: number, statusText: string }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    
    const response = await api.get(`/multi-organization/child-organizations?${queryParams}`);
    return response;
  },

  updateChildOrganization: async (childOrgId: number, data: {
    name?: string;
    description?: string;
    inn?: string;
    kpp?: string;
    address?: string;
    phone?: string;
    email?: string;
    is_active?: boolean;
    settings?: Record<string, any>;
  }): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.put(`/multi-organization/child-organizations/${childOrgId}`, data);
    return response;
  },

  deleteChildOrganization: async (childOrgId: number, data: {
    transfer_data_to?: number;
    confirm_deletion: boolean;
  }): Promise<{ data: any, status: number, statusText: string }> => {
    const token = getTokenFromStorages();
    const response = await fetch(`https://api.prohelper.pro/api/v1/landing/multi-organization/child-organizations/${childOrgId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },

  getChildOrganizationStats: async (childOrgId: number): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.get(`/multi-organization/child-organizations/${childOrgId}/stats`);
    return response;
  },

  // Управление пользователями дочерних организаций
  getChildOrganizationUsers: async (childOrgId: number, params?: {
    search?: string;
    role?: 'admin' | 'manager' | 'employee';
    status?: 'active' | 'inactive' | 'all';
    per_page?: number;
  }): Promise<{ data: any, status: number, statusText: string }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    
    const response = await api.get(`/multi-organization/child-organizations/${childOrgId}/users?${queryParams}`);
    return response;
  },

  addUserToChildOrganization: async (childOrgId: number, data: {
    email: string;
    role: 'admin' | 'manager' | 'employee';
    permissions?: string[];
    send_invitation?: boolean;
  }): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.post(`/multi-organization/child-organizations/${childOrgId}/users`, data);
    return response;
  },

  updateChildOrganizationUser: async (childOrgId: number, userId: number, data: {
    role?: 'admin' | 'manager' | 'employee';
    permissions?: string[];
    is_active?: boolean;
  }): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.put(`/multi-organization/child-organizations/${childOrgId}/users/${userId}`, data);
    return response;
  },

  removeUserFromChildOrganization: async (childOrgId: number, userId: number): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.delete(`/multi-organization/child-organizations/${childOrgId}/users/${userId}`);
    return response;
  },

  // Настройки холдинга
  updateHoldingSettings: async (data: {
    group_id: number;
    name?: string;
    description?: string;
    max_child_organizations?: number;
    settings?: Record<string, any>;
    permissions_config?: Record<string, any>;
  }): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.put('/multi-organization/holding-settings', data);
    return response;
  },

  // Массовые операции
  bulkUpdateChildOrganizations: async (data: {
    organization_ids: number[];
    updates: Record<string, any>;
  }): Promise<{ data: any, status: number, statusText: string }> => {
    const response = await api.patch('/multi-organization/child-organizations/bulk-update', data);
    return response;
  },

  exportChildOrganizations: async (params?: {
    format?: 'xlsx' | 'csv' | 'pdf';
    include_stats?: boolean;
    organization_ids?: number[];
  }): Promise<{ data: any, status: number, statusText: string }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(item => queryParams.append(`${key}[]`, item.toString()));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });
    }
    
    const response = await api.get(`/multi-organization/child-organizations/export?${queryParams}`);
    return response;
  },

  // Аналитика
  getHoldingAnalytics: async (params?: {
    period?: 'week' | 'month' | 'quarter' | 'year';
    include_trends?: boolean;
  }): Promise<{ data: any, status: number, statusText: string }> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) queryParams.append(key, value.toString());
      });
    }
    
    const response = await api.get(`/multi-organization/analytics/summary?${queryParams}`);
    return response;
  },

  /**
   * Получить сводку по холдингу
   * @param params { date_from?: string, date_to?: string, status?: string, is_approved?: boolean, export?: string, section?: string }
   */
  getHoldingSummary: async (params: {
    date_from?: string;
    date_to?: string;
    status?: string;
    is_approved?: boolean;
    export?: string;
    section?: 'projects' | 'contracts' | 'acts' | 'completed_works';
  }) => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');
    const url = new URL(`${API_URL}/multi-organization/summary`);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) url.searchParams.append(key, String(value));
    });
    const options: RequestInit = {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Authorization': `Bearer ${token}` },
    };
    const response = await fetchWithBillingLogging(url.toString(), options);
    const responseData = await response.json();
    return { data: responseData, status: response.status, statusText: response.statusText };
  },
};

export const landingService = {
  // Получить данные дашборда лендинга /dashboard
  getLandingDashboard: async (): Promise<{ data: LandingDashboardResponse; status: number; statusText: string }> => {
    const token = getTokenFromStorages();
    if (!token) throw new Error('Токен авторизации отсутствует');

    const url = `${API_URL}/dashboard`;
    const options: RequestInit = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    const response = await fetch(url, options);
    const responseData = await response.json();
    return { data: responseData as LandingDashboardResponse, status: response.status, statusText: response.statusText };
  }
};

// --- Глобальный перехват fetch, чтобы при любом 401/419 делать redirect на /login ---
if (typeof window !== 'undefined' && typeof window.fetch === 'function' && !(window as any).__authFetchPatched) {
  const nativeFetch = window.fetch.bind(window);
  (window as any).__authFetchPatched = true;
  window.fetch = async (...args: Parameters<typeof nativeFetch>): Promise<Response> => {
    const resp = await nativeFetch(...(args as Parameters<typeof nativeFetch>));
    if (resp.status === 401 || resp.status === 419) {
      try { clearTokenFromStorages(); } catch {}
      if (!window.location.pathname.includes('/login')) {
        window.location.replace('/login');
      }
    }
    if (resp.status === 403) {
      try {
        const cloned = resp.clone();
        let apiMessage = 'У вас нет доступа к этому ресурсу.';
        try {
          const body = await cloned.json();
          apiMessage = body?.message || apiMessage;
        } catch {}
        NotificationService.show({
          type: 'error',
          title: 'Недостаточно прав',
          message: apiMessage,
          duration: 7000,
        });
      } catch {}
    }
    return resp;
  };
}
// --- конец перехвата ---

export default api; 

// --- Типы дашборда лендинга ---
export interface LandingDashboardResponse {
  financial: {
    balance: number;
    credits_this_month: number;
    debits_this_month: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
  };
  contracts: {
    total: number;
    active: number;
    draft: number;
    completed: number;
    total_amount: number;
  };
  works_materials: {
    works: Record<string, any>;
    materials: Record<string, any>;
  };
  acts: {
    total: number;
    approved: number;
    total_amount: number;
  };
  team: {
    total: number;
    by_roles: Record<string, number>;
  };
  team_details: any[];
  charts: {
    projects_monthly: { labels: string[]; values: number[] };
    contracts_monthly: { labels: string[]; values: number[] };
    completed_works_monthly: { labels: string[]; values: number[] };
    balance_monthly: { labels: string[]; values: number[] };
    projects_status: Record<string, number>;
    contracts_status: Record<string, number>;
  };
}
// --- конец типов дашборда лендинга --- 