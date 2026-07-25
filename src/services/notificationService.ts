import type {
  Notification,
  NotificationFilter,
  NotificationPaginationLinks,
  NotificationPaginationMeta,
  NotificationResponse,
  MarkAllAsReadResponse,
  UnreadCountResponse,
} from '../types/notification';
import api, { API_URL } from '../utils/api';

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

const resolveNotificationActionUrl = (url: string): string => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  if (url.startsWith('/api/')) {
    return `${new URL(API_URL).origin}${url}`;
  }

  return `${API_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

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

    const response = await api.get<unknown>('/notifications', {
      params,
      signal,
    });

    return normalizeNotificationListResponse(response.data, expectedOrganizationId);
  },

  getUnreadCount: async (signal?: AbortSignal): Promise<UnreadCountResponse> => {
    const response = await api.get<unknown>('/notifications/unread-count', { signal });

    return normalizeUnreadCountResponse(response.data);
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`, {});
  },

  markAllAsRead: async (): Promise<MarkAllAsReadResponse> => {
    const response = await api.post<unknown>('/notifications/mark-all-read', {});

    return normalizeMarkAllAsReadResponse(response.data);
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },

  executeAction: async (url: string, method: string = 'POST'): Promise<unknown> => {
    const fullUrl = resolveNotificationActionUrl(url);
    const parsedUrl = new URL(fullUrl);
    const apiUrl = new URL(API_URL);

    if (parsedUrl.origin !== apiUrl.origin || !parsedUrl.pathname.startsWith('/api/v1/landing/')) {
      throw new Error('Недопустимый адрес действия уведомления.');
    }

    const response = await api({
      method: method.toLowerCase(),
      url: fullUrl,
    });

    return response.data;
  },
};
