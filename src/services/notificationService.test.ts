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
  sequence: 1,
  type: 'system',
  interface: 'lk' as const,
  organization_id: null,
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
        meta: {
          current_page: 2,
          last_page: 3,
          per_page: 10,
          total: 21,
          unread_count: 9,
          unread_by_category: { system: 4 },
          unread_by_notification_type: { alert: 3 },
          unread_by_type: { system: 4 },
          snapshot_sequence: 11,
        },
        links: { first: '/first', last: '/last', prev: '/prev', next: '/next' },
      },
    } as never);

    await expect(notificationService.getNotifications(2, 10)).resolves.toEqual({
      data: [item('one')],
      meta: {
        current_page: 2,
        last_page: 3,
        per_page: 10,
        total: 21,
        unread_count: 9,
        unread_by_category: { system: 4 },
        unread_by_notification_type: { alert: 3 },
        unread_by_type: { system: 4 },
        snapshot_sequence: 11,
      },
      links: { first: '/first', last: '/last', prev: '/prev', next: '/next' },
    });
  });

  it('accepts the already-unwrapped paginated shape without losing metadata', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        data: [item('one'), item('two')],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 2,
          unread_count: 2,
          unread_by_category: {},
          unread_by_notification_type: {},
          unread_by_type: {},
          snapshot_sequence: 2,
        },
      },
    } as never);

    const response = await notificationService.getNotifications();

    expect(response.data.map(notification => notification.id)).toEqual(['one', 'two']);
    expect(response.meta.total).toBe(2);
  });

  it.each([
    { interface: 'admin', organization_id: null },
    { interface: 'lk', organization_id: 45 },
    { interface: 'lk', organization_id: undefined },
  ])('drops an item outside the expected LK organization scope %#', async mismatch => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        data: [{ ...item('one'), ...mismatch }],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 1,
          unread_count: 1,
          unread_by_category: {},
          unread_by_notification_type: {},
          unread_by_type: {},
          snapshot_sequence: 1,
        },
      },
    } as never);

    await expect(notificationService.getNotifications(1, 20, 'all', 44)).resolves.toMatchObject({ data: [] });
  });

  it('accepts global and current-organization items and forwards AbortSignal', async () => {
    const controller = new AbortController();
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        data: [
          item('global'),
          { ...item('organization'), sequence: 2, organization_id: 44 },
          { ...item('other-organization'), sequence: 3, organization_id: 45 },
        ],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 3,
          unread_count: 3,
          unread_by_category: {},
          unread_by_notification_type: {},
          unread_by_type: {},
          snapshot_sequence: 3,
        },
      },
    } as never);

    const response = await notificationService.getNotifications(1, 20, 'all', 44, controller.signal);

    expect(response.data.map(notification => notification.id)).toEqual(['global', 'organization']);
    expect(axios.get).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
      signal: controller.signal,
    }));
  });

  it('rejects malformed successful list contracts instead of masking them as an empty list', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { success: true, data: { unexpected: true } },
    } as never);

    await expect(notificationService.getNotifications()).rejects.toThrow(
      'Некорректный ответ списка уведомлений',
    );
  });

  it('rejects list metadata without the atomic unread snapshot', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: [item('one')],
        meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
      },
    } as never);

    await expect(notificationService.getNotifications()).rejects.toThrow(
      'Некорректный ответ списка уведомлений',
    );
  });

  it.each([undefined, 0, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])(
    'rejects an unsafe notification sequence %#',
    async sequence => {
      vi.mocked(axios.get).mockResolvedValueOnce({
        data: {
          data: [{ ...item('one'), sequence }],
          meta: {
            current_page: 1,
            last_page: 1,
            per_page: 20,
            total: 1,
            unread_count: 1,
            unread_by_category: {},
            unread_by_notification_type: {},
            unread_by_type: {},
            snapshot_sequence: 1,
          },
        },
      } as never);

      await expect(notificationService.getNotifications()).rejects.toThrow();
    },
  );

  it('normalizes empty PHP aggregate maps encoded as JSON arrays', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: {
        success: true,
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 20,
          total: 0,
          unread_count: 0,
          unread_by_category: [],
          unread_by_notification_type: [],
          unread_by_type: [],
          snapshot_sequence: 0,
        },
      },
    } as never);

    const response = await notificationService.getNotifications();

    expect(response.meta.unread_by_category).toEqual({});
    expect(response.meta.unread_by_notification_type).toEqual({});
    expect(response.meta.unread_by_type).toEqual({});
  });

  it('normalizes a LandingResponse unread count', async () => {
    vi.mocked(axios.get).mockResolvedValueOnce({
      data: { success: true, message: null, data: { count: 7, snapshot_sequence: 12 } },
    } as never);

    await expect(notificationService.getUnreadCount()).resolves.toEqual({ count: 7, snapshot_sequence: 12 });
  });

  it('normalizes mark-all sequence cut', async () => {
    vi.mocked(axios.post).mockResolvedValueOnce({
      data: { success: true, data: { count: 4, sequence_cut: 15 } },
    } as never);

    await expect(notificationService.markAllAsRead()).resolves.toEqual({ count: 4, sequence_cut: 15 });
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
