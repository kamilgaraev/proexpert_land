/**
 * Утилиты для работы с API
 */

// @ts-ignore
import axios from 'axios';

// Используем тип для ImportMeta.env
declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

const API_URL = import.meta.env.VITE_API_URL || 'http://89.111.153.146/api/v1/landing';

// Создаем экземпляр axios с базовым URL и заголовками
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

const getTokenFromStorages = (): string | null => {
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
    // Обработка ошибки 401 (Unauthorized)
    if (error.response?.status === 401) {
      // Попытка обновить токен
      try {
        const refreshResponse = await api.post('/auth/refresh');
        const token = (refreshResponse.data as any).token;
        
        // Сохраняем новый токен
        saveTokenToMultipleStorages(token);
        
        // Повторяем оригинальный запрос с новым токеном
        const originalRequest = error.config;
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Если не удалось обновить токен - разлогиниваем пользователя
        clearTokenFromStorages();
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
  register: async (userData: RegisterRequest): Promise<any> => {
    const response = await fetch(`http://89.111.153.146/api/v1/landing/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
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
  
  // Вход в систему
  login: async (credentials: LoginRequest): Promise<any> => {
    console.log('API: Начало функции login');
    const response = await fetch(`http://89.111.153.146/api/v1/landing/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    const data = await response.json();
    console.log('API: Ответ от сервера:', data);
    
    // Сразу сохраняем токен в хранилище
    if (data && data.success && data.data && data.data.token) {
      console.log('API: Токен получен, сохраняем в хранилища:', data.data.token);
      saveTokenToMultipleStorages(data.data.token);
      console.log('API: Проверка токена после сохранения:', getTokenFromStorages());
    } else {
      console.log('API: Токен не получен или структура ответа некорректна:', data);
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
    
    const response = await fetch(`http://89.111.153.146/api/v1/landing/auth/me`, {
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
      statusText: response.statusText,
      headers: {},
      config: {} as any
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
    
    const response = await fetch(`http://89.111.153.146/api/v1/landing/user/profile`, {
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
  updateProfile: async (profileData: UpdateProfileRequest) => {
    const token = getTokenFromStorages();
    
    if (!token) {
      throw new Error('Токен авторизации отсутствует');
    }
    
    const response = await fetch(`http://89.111.153.146/api/v1/landing/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(profileData)
    });
    
    const data = await response.json();
    
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
    
    const response = await fetch(`http://89.111.153.146/api/v1/landing/user/password`, {
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
    
    const response = await fetch(`http://89.111.153.146/api/v1/landing/user/organizations`, {
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
    
    const response = await fetch(`http://89.111.153.146/api/v1/landing/adminPanelUsers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    console.log('API response for users:', data);
    
    // Смотря на скриншот, данные пользователя находятся в data.data
    // и имеют формат [{ id: 1, name: "Иван Иванов", email: "kamilgaraev3@gmail.com", ... }]
    return {
      data: {
        success: true, // Предполагаем успех, так как код 200
        message: '',
        data: Array.isArray(data) ? data : 
              (data && data.data && Array.isArray(data.data)) ? data.data : 
              (data && data.id) ? [data] : []
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
  }) => {
    const token = getTokenFromStorages();
    
    if (!token) {
      throw new Error('Токен авторизации отсутствует');
    }
    
    const response = await fetch(`http://89.111.153.146/api/v1/landing/users/invite`, {
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
    
    const response = await fetch(`http://89.111.153.146/api/v1/landing/organizations`, {
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
    
    const response = await fetch(`http://89.111.153.146/api/v1/landing/organizations/${orgId}`, {
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
    
    const response = await fetch(`http://89.111.153.146/api/v1/landing/organizations/${orgId}`, {
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
    
    const response = await fetch(`http://89.111.153.146/api/v1/landing/support/request`, {
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

// Типы для AdminPanelUsers, используемые в adminPanelUserService и AdminsPage
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'web_admin' | 'accountant' | string;
}

export interface AdminUsersApiResponse {
  data: AdminUser[];
  links?: any; // Опционально для пагинации
  meta?: any;  // Опционально для пагинации
}

// Тип для данных формы создания/редактирования администратора
// Пароль и его подтверждение опциональны при редактировании
export interface AdminFormData {
  name: string;
  email: string;
  role_slug: 'web_admin' | 'accountant';
  password?: string;
  password_confirmation?: string;
}

// Сервис для управления пользователями Админ-панели
export const adminPanelUserService = {
  getAdminPanelUsers: async (): Promise<AdminUsersApiResponse> => {
    // @ts-ignore
    const response = await api.get('/landing/adminPanelUsers');
    return response.data as AdminUsersApiResponse;
  },
  createAdminPanelUser: async (userData: AdminFormData): Promise<any> => {
    // @ts-ignore
    const response = await api.post('/landing/adminPanelUsers', userData);
    return response.data;
  },
  updateAdminPanelUser: async (userId: number, userData: Partial<AdminFormData>): Promise<any> => {
    // @ts-ignore
    const response = await api.patch(`/landing/adminPanelUsers/${userId}`, userData);
    return response.data;
  },
  deleteAdminPanelUser: async (userId: number): Promise<any> => {
    // @ts-ignore
    const response = await api.delete(`/landing/adminPanelUsers/${userId}`);
    return response.data;
  },
};

export default api; 