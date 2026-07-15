import axios from 'axios';
import type {
  Notification,
  NotificationFilter,
  NotificationPaginationLinks,
  NotificationPaginationMeta,
  NotificationResponse,
  MarkAllAsReadResponse,
  UnreadCountResponse,
} from '../types/notification';
import { getJsonAuthHeaders } from '../utils/authTokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.1мост.рф';

const isRecord = (value: unknown): value is Record<string, unknown> => (
  value !== null && typeof value === 'object' && !Array.isArray(value)
);

const isFiniteNumber = (value: unknown): value is number => (
  typeof value === 'number' && Number.isFinite(value)
);

const isSafePositiveInteger = (value: unknown): value is number => (
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0
);

const isSafeNonNegativeInteger = (value: unknown): value is number => (
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
);

const normalizeCountMap = (value: unknown): Record<string, number> => {
  if (Array.isArray(value) && value.length === 0) {
    return {};
  }

  if (!isRecord(value) || Object.values(value).some(count => !isFiniteNumber(count) || count < 0)) {
    throw new Error('Некорректный ответ списка уведомлений');
  }

  return value as Record<string, number>;
};

const normalizeMeta = (value: unknown): NotificationPaginationMeta => {
  if (!isRecord(value)
    || !isFiniteNumber(value.current_page)
    || !isFiniteNumber(value.last_page)
    || !isFiniteNumber(value.per_page)
    || !isFiniteNumber(value.total)
    || !isFiniteNumber(value.unread_count)
    || value.unread_count < 0
    || !isSafeNonNegativeInteger(value.snapshot_sequence)) {
    throw new Error('Некорректный ответ списка уведомлений');
  }

  return {
    ...value,
    unread_by_category: normalizeCountMap(value.unread_by_category),
    unread_by_notification_type: normalizeCountMap(value.unread_by_notification_type),
    unread_by_type: normalizeCountMap(value.unread_by_type),
  } as NotificationPaginationMeta;
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

export const normalizeNotificationListResponse = (
  payload: unknown,
  expectedOrganizationId: number | null = null,
): NotificationResponse => {
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

  if (data.some(item => !isRecord(item)
    || typeof item.id !== 'string'
    || !item.id.trim()
    || !isSafePositiveInteger(item.sequence))) {
    throw new Error('Некорректный ответ списка уведомлений');
  }

  const notifications = data.filter(item => isRecord(item)
    && item.interface === 'lk'
    && (item.organization_id === null || item.organization_id === expectedOrganizationId));

  return {
    data: notifications as Notification[],
    meta: normalizeMeta(source.meta),
    ...(links ? { links } : {}),
  };
};

export const normalizeUnreadCountResponse = (payload: unknown): UnreadCountResponse => {
  if (!isRecord(payload)) {
    throw new Error('Некорректный ответ счётчика уведомлений');
  }

  if ('success' in payload && payload.success !== true) {
    throw new Error('Не удалось загрузить счётчик уведомлений');
  }

  const source = 'success' in payload ? payload.data : payload;

  if (!isRecord(source)
    || !isSafeNonNegativeInteger(source.count)
    || !isSafeNonNegativeInteger(source.snapshot_sequence)) {
    throw new Error('Некорректный ответ счётчика уведомлений');
  }

  return source as unknown as UnreadCountResponse;
};

export const normalizeMarkAllAsReadResponse = (payload: unknown): MarkAllAsReadResponse => {
  if (!isRecord(payload) || ('success' in payload && payload.success !== true)) {
    throw new Error('Некорректный ответ операции с уведомлениями');
  }

  const source = 'success' in payload ? payload.data : payload;
  if (!isRecord(source)
    || !isSafeNonNegativeInteger(source.count)
    || !isSafeNonNegativeInteger(source.sequence_cut)) {
    throw new Error('Некорректный ответ операции с уведомлениями');
  }

  return source as unknown as MarkAllAsReadResponse;
};

export const notificationService = {
  getNotifications: async (
    page: number = 1,
    perPage: number = 15,
    filter: NotificationFilter = 'all',
    expectedOrganizationId: number | null = null,
    signal?: AbortSignal,
  ): Promise<NotificationResponse> => {
    const params: Record<string, number | NotificationFilter> = { page, per_page: perPage };

    if (filter !== 'all') {
      params.filter = filter;
    }

    const response = await axios.get<unknown>(`${API_BASE_URL}/api/v1/landing/notifications`, {
      params,
      withCredentials: true,
      headers: getJsonAuthHeaders(),
      signal,
    });

    return normalizeNotificationListResponse(response.data, expectedOrganizationId);
  },

  getUnreadCount: async (signal?: AbortSignal): Promise<UnreadCountResponse> => {
    const response = await axios.get<unknown>(
      `${API_BASE_URL}/api/v1/landing/notifications/unread-count`,
      {
        withCredentials: true,
        headers: getJsonAuthHeaders(),
        signal,
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

  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    const response = await axios.post<unknown>(
      `${API_BASE_URL}/api/v1/landing/notifications/mark-all-read`,
      {},
      { withCredentials: true, headers: getJsonAuthHeaders() },
    );

    return normalizeMarkAllAsReadResponse(response.data);
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
