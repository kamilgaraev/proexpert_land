/**
 * Утилиты для работы с API
 */

export const API_BASE_URL = 'http://89.111.153.146/api/v1';

type FetchOptions = RequestInit & {
  token?: string | null;
}

/**
 * Логирование запросов
 */
export const logRequest = (method: string, endpoint: string, body?: any) => {
  console.log(`[API ${method}] ${endpoint}`, body || '');
};

/**
 * Логирование ответов
 */
export const logResponse = (endpoint: string, status: number, data: any) => {
  console.log(`[API Response] ${endpoint} (${status})`, data);
};

/**
 * Универсальная функция для выполнения API запросов с обработкой ошибок
 * @param endpoint - Эндпоинт API (без базового URL)
 * @param options - Опции запроса (как для fetch)
 * @returns Промис с данными ответа
 */
export const apiRequest = async <T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> => {
  const { token, ...fetchOptions } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  logRequest(options.method || 'GET', url, options.body);
  
  try {
    // Базовые заголовки
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };
    
    // Добавляем токен авторизации, если он есть
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...defaultHeaders,
        ...fetchOptions.headers,
      },
      credentials: 'include',
      mode: 'cors',
    });
    
    // Получаем текст ответа, чтобы в случае невалидного JSON не упасть с ошибкой
    const text = await response.text();
    
    // Пытаемся распарсить JSON, если есть содержимое
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.error('Невозможно распарсить ответ как JSON:', text);
      data = { message: 'Неверный формат ответа от сервера' };
    }
    
    // Логируем полученный ответ
    logResponse(url, response.status, data);
    
    // Если ответ не успешный, выбрасываем ошибку
    if (!response.ok) {
      let errorMessage = data.message || `Ошибка ${response.status}`;
      
      // Обработка валидационных ошибок
      if (data.errors) {
        const firstError = Object.values(data.errors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0];
        }
      }
      
      throw new Error(errorMessage);
    }
    
    return data as T;
  } catch (error) {
    // Отлавливаем ошибки сети (Failed to fetch)
    if (error instanceof Error) {
      if (error.message === 'Failed to fetch') {
        console.error('Ошибка сети:', error);
        throw new Error('Не удалось подключиться к серверу. Проверьте подключение к интернету или попробуйте позже.');
      }
      
      console.error('Ошибка запроса:', error);
      throw error;
    }
    
    console.error('Неизвестная ошибка:', error);
    throw new Error('Произошла непредвиденная ошибка');
  }
};

/**
 * Хелпер для GET запросов
 */
export const get = <T = any>(endpoint: string, token?: string | null) => {
  return apiRequest<T>(endpoint, { method: 'GET', token });
};

/**
 * Хелпер для POST запросов
 */
export const post = <T = any>(endpoint: string, data: any, token?: string | null) => {
  return apiRequest<T>(endpoint, { 
    method: 'POST', 
    body: JSON.stringify(data),
    token
  });
};

/**
 * Хелпер для PUT запросов
 */
export const put = <T = any>(endpoint: string, data: any, token?: string | null) => {
  return apiRequest<T>(endpoint, { 
    method: 'PUT', 
    body: JSON.stringify(data),
    token
  });
};

/**
 * Хелпер для DELETE запросов
 */
export const del = <T = any>(endpoint: string, token?: string | null) => {
  return apiRequest<T>(endpoint, { method: 'DELETE', token });
};

/**
 * API клиент для аутентификации
 */
export const authApi = {
  /**
   * Вход в систему
   */
  login: async (email: string, password: string) => {
    return post<{ token: string; user: any }>('/landing/auth/login', { email, password });
  },
  
  /**
   * Регистрация нового пользователя
   */
  register: async (userData: any) => {
    return post<{ token: string; user: any }>('/landing/auth/register', userData);
  },
  
  /**
   * Получение данных текущего пользователя
   */
  getMe: async (token: string) => {
    return get<{ user: any }>('/landing/auth/me', token);
  },
}; 