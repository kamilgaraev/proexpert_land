import { beforeEach, describe, expect, it, vi } from 'vitest';

import axios from 'axios';
import { notificationService } from './notificationService';

vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

const item = (id: string) => ({
  id,
  type: 'system',
  data: { title: id, message: id, interface: 'lk' as const },
  read_at: null,
  created_at: '2026-07-15T10:00:00Z',
});

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('normalizes a LandingResponse paginated notification list', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        success: true,
        message: null,
        data: [item('one')],
        meta: { current_page: 2, last_page: 3, per_page: 10, total: 21 },
        links: { first: '/first', last: '/last', prev: '/prev', next: '/next' },
      },
    } as never);

    await expect(notificationService.getNotifications(2, 10)).resolves.toEqual({
      data: [item('one')],
      meta: { current_page: 2, last_page: 3, per_page: 10, total: 21 },
      links: { first: '/first', last: '/last', prev: '/prev', next: '/next' },
    });
  });

  it('accepts the already-unwrapped paginated shape without losing metadata', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        data: [item('one'), item('two')],
        meta: { current_page: 1, last_page: 1, per_page: 20, total: 2 },
      },
    } as never);

    const response = await notificationService.getNotifications();

    expect(response.data.map(notification => notification.id)).toEqual(['one', 'two']);
    expect(response.meta.total).toBe(2);
  });

  it('rejects malformed successful list contracts instead of masking them as an empty list', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { success: true, data: { unexpected: true } },
    } as never);

    await expect(notificationService.getNotifications()).rejects.toThrow(
      'Некорректный ответ списка уведомлений',
    );
  });

  it('normalizes a LandingResponse unread count', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { success: true, message: null, data: { count: 7 } },
    } as never);

    await expect(notificationService.getUnreadCount()).resolves.toBe(7);
  });

  it('rejects a malformed unread count', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { success: true, data: { count: 'seven' } },
    } as never);

    await expect(notificationService.getUnreadCount()).rejects.toThrow(
      'Некорректный ответ счётчика уведомлений',
    );
  });
});
