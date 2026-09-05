import api from '@/utils/api';

export type NotificationChannel = 'email' | 'telegram' | 'in_app' | 'websocket';

export interface NotificationPreference {
  notification_type: string;
  name: string;
  description: string;
  mandatory: boolean;
  user_customizable: boolean;
  enabled_channels: NotificationChannel[];
}

export interface NotificationPreferences {
  items: NotificationPreference[];
  available_channels: NotificationChannel[];
}

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const isChannel = (value: unknown): value is NotificationChannel => typeof value === 'string' && ['email', 'telegram', 'in_app', 'websocket'].includes(value);
const isChannels = (value: unknown): value is NotificationChannel[] => Array.isArray(value) && value.every(isChannel);
const isPreference = (value: unknown): value is NotificationPreference => isObject(value)
  && typeof value.notification_type === 'string'
  && typeof value.name === 'string'
  && typeof value.description === 'string'
  && typeof value.mandatory === 'boolean'
  && typeof value.user_customizable === 'boolean'
  && isChannels(value.enabled_channels);

const unwrap = (value: unknown): unknown => {
  if (!isObject(value) || value.success !== true || !('data' in value)) {
    throw new Error('Сервер не подтвердил выполнение запроса. Попробуйте ещё раз.');
  }
  return value.data;
};

export const notificationPreferencesService = {
  async load(signal?: AbortSignal): Promise<NotificationPreferences> {
    const response = await api.get<unknown>('/notifications/preferences', { signal });
    const data = unwrap(response.data);
    if (!isObject(data) || !Array.isArray(data.items) || !data.items.every(isPreference) || !isChannels(data.available_channels)) {
      throw new Error('Не удалось получить настройки уведомлений. Попробуйте ещё раз.');
    }
    return { items: data.items, available_channels: data.available_channels };
  },

  async save(type: string, channels: NotificationChannel[]): Promise<void> {
    const response = await api.put<unknown>('/notifications/preferences', {
      notification_type: type,
      enabled_channels: channels,
    });
    unwrap(response.data);
  },
};
