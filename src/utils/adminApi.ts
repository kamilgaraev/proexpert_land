import axios from 'axios';

// Базовый домен API можно переопределить через .env
const ADMIN_API_BASE_DOMAIN = (import.meta.env.VITE_ADMIN_API_BASE as string | undefined) ?? 'https://api.prohelper.pro';
// Админ эндпоинты тоже висят под /api/v1/landing/…
const ADMIN_API_URL = `${ADMIN_API_BASE_DOMAIN}/api/v1/landing`;

// Ключи для хранилища токена админа
const ADMIN_TOKEN_KEY = 'admin_token';

const isBrowser = typeof window !== 'undefined';

export const getAdminToken = (): string | null => {
  if (!isBrowser) return null;
  let token: string | null = null;
  try {
    token = window.localStorage.getItem(ADMIN_TOKEN_KEY) || null;
  } catch {}
  if (!token) {
    try {
      token = window.sessionStorage.getItem(ADMIN_TOKEN_KEY) || null;
    } catch {}
  }
  return token;
};

export const saveAdminToken = (token: string) => {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {}
  try {
    window.sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch {}
};

export const clearAdminToken = () => {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {}
  try {
    window.sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch {}
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

adminApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
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