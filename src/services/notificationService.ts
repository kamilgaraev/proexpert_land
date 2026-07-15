import axios from 'axios';
import type {
  Notification,
  NotificationFilter,
  NotificationPaginationLinks,
  NotificationPaginationMeta,
  NotificationResponse,
} from '../types/notification';
import { getJsonAuthHeaders } from '../utils/authTokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.1мост.рф';

const isRecord = (value: unknown): value is Record<string, unknown> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const isFiniteNumber = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value)
);

const normalizeMeta = (value: unknown): NotificationPaginationMeta => {
  if (!isRecord(value)
    || !isFiniteNumber(value.current_page)
    || !isFiniteNumber(value.last_page)
    || !isFiniteNumber(value.per_page)
    || !isFiniteNumber(value.total)) {
    throw new Error('Некорректный ответ списка уведомлений');
  }

  return value as NotificationPaginationMeta;
};

const normalizeLinks = (value: unknown): NotificationPaginationLinks | undefined => {
  if (value === undefined) {
    return undefined;
  }

  if (!isRecord(value)) {
    throw new Error('Некорректный ответ списка уведомлений');
  }

  return value as NotificationPaginationLinks;
};

export const normalizeNotificationListResponse = (payload: unknown): NotificationResponse => {
  if (!isRecord(payload)) {
    throw new Error('Некорректный ответ списка уведомлений');
  }

  if ('success' in payload && payload.success !== true) {
    throw new Error('Не удалось загрузить уведомления');
  }

  const source = payload;
  const data = source.data;

  if (!Array.isArray(data)) {
    throw new Error('Некорректный ответ списка уведомлений');
  }

  const links = normalizeLinks(source.links);

  return {
    data: data as Notification[],
    meta: normalizeMeta(source.meta),
    ...(links ? { links } : {}),
  };
};

export const normalizeUnreadCountResponse = (payload: unknown): number => {
  if (!isRecord(payload)) {
    throw new Error('Некорректный ответ счётчика уведомлений');
  }

  if ('success' in payload && payload.success !== true) {
    throw new Error('Не удалось загрузить счётчик уведомлений');
  }

  const source = 'success' in payload ? payload.data : payload;

  if (!isRecord(source) || !isFiniteNumber(source.count) || source.count < 0) {
    throw new Error('Некорректный ответ счётчика уведомлений');
  }

  return source.count;
};

export const notificationService = {
  getNotifications: async (
    page: number = 1,
    perPage: number = 15,
    filter: NotificationFilter = 'all',
  ): Promise<NotificationResponse> => {
    const params: Record<string, number | NotificationFilter> = { page, per_page: perPage };

    if (filter !== 'all') {
      params.filter = filter;
    }

    const response = await axios.get<unknown>(`${API_BASE_URL}/api/v1/landing/notifications`, {
      params,
      withCredentials: true,
      headers: getJsonAuthHeaders(),
    });

    return normalizeNotificationListResponse(response.data);
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await axios.get<unknown>(
      `${API_BASE_URL}/api/v1/landing/notifications/unread-count`,
      {
        withCredentials: true,
        headers: getJsonAuthHeaders(),
      },
    );

    return normalizeUnreadCountResponse(response.data);
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await axios.patch(
      `${API_BASE_URL}/api/v1/landing/notifications/${notificationId}/read`,
      {},
      { withCredentials: true, headers: getJsonAuthHeaders() },
    );
  },

  markAllAsRead: async (): Promise<void> => {
    await axios.post(
      `${API_BASE_URL}/api/v1/landing/notifications/mark-all-read`,
      {},
      { withCredentials: true, headers: getJsonAuthHeaders() },
    );
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await axios.delete(
      `${API_BASE_URL}/api/v1/landing/notifications/${notificationId}`,
      { withCredentials: true, headers: getJsonAuthHeaders() },
    );
  },

  executeAction: async (url: string, method: string = 'POST'): Promise<unknown> => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    const response = await axios({
      method: method.toLowerCase(),
      url: fullUrl,
      withCredentials: true,
      headers: getJsonAuthHeaders(),
    });

    return response.data;
  },
};
