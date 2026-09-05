import api from '@/utils/api';

export interface SecuritySession {
  id: number;
  device_name: string | null;
  ip_address: string | null;
  ip_country: string | null;
  ip_city: string | null;
  status: string;
  is_current: boolean;
  last_seen_at: string | null;
}

const objectValue = (value: unknown): Record<string, unknown> | null => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
);

const nullableText = (value: unknown): value is string | null => (
  value === null || typeof value === 'string'
);

const isSession = (value: unknown): value is SecuritySession => {
  const session = objectValue(value);
  return session !== null
    && Number.isSafeInteger(session.id)
    && Number(session.id) > 0
    && nullableText(session.device_name)
    && nullableText(session.ip_address)
    && nullableText(session.ip_country)
    && nullableText(session.ip_city)
    && typeof session.status === 'string'
    && typeof session.is_current === 'boolean'
    && nullableText(session.last_seen_at);
};

const responseData = (value: unknown): unknown => {
  const response = objectValue(value);
  if (!response || response.success !== true || !('data' in response)) {
    throw new Error('Сервер не подтвердил выполнение запроса. Попробуйте ещё раз.');
  }
  return response.data;
};

export interface SecuritySessionPage {
  sessions: SecuritySession[];
  currentPage: number;
  lastPage: number;
  total: number;
}

export const securitySessionService = {
  async listPage(group: 'active' | 'history', page: number, signal?: AbortSignal): Promise<SecuritySessionPage> {
    const response = await api.get<unknown>('/security/sessions', {
      signal,
      params: { group, page, per_page: 20 },
    });
    const sessions = responseData(response.data);
    const meta = objectValue(objectValue(response.data)?.meta);
    if (!Array.isArray(sessions) || !sessions.every(isSession)
      || !meta || !Number.isSafeInteger(meta.current_page) || Number(meta.current_page) < 1
      || !Number.isSafeInteger(meta.last_page) || Number(meta.last_page) < 1
      || !Number.isSafeInteger(meta.total) || Number(meta.total) < 0) {
      throw new Error('Не удалось получить список устройств. Попробуйте ещё раз.');
    }
    return { sessions, currentPage: Number(meta.current_page), lastPage: Number(meta.last_page), total: Number(meta.total) };
  },

  async list(signal?: AbortSignal): Promise<SecuritySession[]> {
    const response = await api.get<unknown>('/security/sessions', { signal });
    const sessions = responseData(response.data);
    if (!Array.isArray(sessions) || !sessions.every(isSession)) {
      throw new Error('Не удалось получить список устройств. Попробуйте ещё раз.');
    }
    return sessions;
  },

  async revoke(sessionId: number): Promise<void> {
    if (!Number.isSafeInteger(sessionId) || sessionId <= 0) {
      throw new Error('Не удалось определить устройство. Обновите список.');
    }
    const response = await api.delete<unknown>(`/security/sessions/${sessionId}`);
    responseData(response.data);
  },
};
