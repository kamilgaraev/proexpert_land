import axios from 'axios';

// Базовый домен API можно переопределить через .env
const ADMIN_API_BASE_DOMAIN = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? 'https://api.prohelper.pro';
// В отличие от landing-API, здесь префикс /api/v1 без /landing
const ADMIN_API_URL = `${ADMIN_API_BASE_DOMAIN}/api/v1`;

// Ключи для хранилища токена админа
const ADMIN_TOKEN_KEY = 'admin_token';

export const getAdminToken = (): string | null => {
  let token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!token) token = sessionStorage.getItem(ADMIN_TOKEN_KEY);
  return token;
};

export const saveAdminToken = (token: string) => {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {}
  try {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {}
};

export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  sessionStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Добавляем Authorization Bearer, если токен есть
adminApi.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Debug: логировать все запросы
adminApi.interceptors.request.use((config) => {
  console.log('[adminApi] REQUEST', config.method?.toUpperCase(), config.url, config.data || '');
  return config;
});

adminApi.interceptors.response.use(
  (response) => {
    console.log('[adminApi] RESPONSE', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('[adminApi] ERROR', error.response?.status, error.config?.url, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const adminAuthService = {
  login: async (email: string, password: string) => {
    const res = await adminApi.post('/landingAdminAuth/login', { email, password });
    return res;
  },
  me: async () => {
    return adminApi.get('/landingAdminAuth/me');
  },
  refresh: async () => {
    return adminApi.post('/landingAdminAuth/refresh');
  },
  logout: async () => {
    return adminApi.post('/landingAdminAuth/logout');
  },
}; 