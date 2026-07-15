import { StrictMode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import getEcho from '../services/echo';
import { notificationService } from '../services/notificationService';
import { useNotifications } from './useNotifications';
import type { Notification } from '../types/notification';

vi.mock('../services/echo', () => ({ default: vi.fn() }));
vi.mock('../services/notificationService', () => ({
  notificationService: {
    getNotifications: vi.fn(),
    getUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    executeAction: vi.fn(),
  },
}));
vi.mock('react-toastify', () => ({
  toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() },
}));

type Handler = (payload: unknown) => void;

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(next => { resolve = next; });
  return { promise, resolve };
};

const notification = (id: string, overrides: Record<string, unknown> = {}): Notification => ({
  id,
  type: 'system',
  interface: 'lk',
  data: { title: id, message: id, interface: 'lk' },
  read_at: null,
  created_at: '2026-07-15T10:00:00Z',
  ...overrides,
}) as Notification;

const list = (items: ReturnType<typeof notification>[]) => ({
  data: items,
  meta: { current_page: 1, last_page: 1, per_page: 20, total: items.length },
});

let standardHandlers: Handler[];
let notificationHandlers: Handler[];
let leave: ReturnType<typeof vi.fn>;

const configureEcho = () => {
  standardHandlers = [];
  notificationHandlers = [];
  leave = vi.fn();
  const channel = {
    error: vi.fn().mockReturnThis(),
    listen: vi.fn((_event: string, handler: Handler) => {
      standardHandlers.push(handler);
      return channel;
    }),
    notification: vi.fn((handler: Handler) => {
      notificationHandlers.push(handler);
      return channel;
    }),
  };
  const echo = { private: vi.fn(() => channel), leave };
  vi.mocked(getEcho).mockReturnValue(echo as never);
  return echo;
};

describe('useNotifications', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    configureEcho();
    vi.mocked(notificationService.getNotifications).mockResolvedValue(list([]));
    vi.mocked(notificationService.getUnreadCount).mockResolvedValue(0);
    vi.mocked(notificationService.markAsRead).mockResolvedValue();
    vi.mocked(notificationService.markAllAsRead).mockResolvedValue();
    vi.mocked(notificationService.deleteNotification).mockResolvedValue();
    vi.mocked(notificationService.executeAction).mockResolvedValue(undefined);
  });

  it('subscribes only to the LK private channel and accepts only LK payloads', async () => {
    const echo = configureEcho();
    const { result } = renderHook(() => useNotifications('162', 'token-one'));
    await waitFor(() => expect(echo.private).toHaveBeenCalledWith('App.Models.User.162.lk'));

    act(() => {
      standardHandlers[0](notification('admin', {
        interface: 'admin',
        data: { title: 'admin', message: 'admin', interface: 'admin' },
      }));
      standardHandlers[0](notification('lk'));
    });

    expect(result.current.notifications.map(item => item.id)).toEqual(['lk']);
    expect(result.current.unreadCount).toBe(1);
  });

  it('deduplicates simultaneous Echo aliases with a cache independent from the five visible items', async () => {
    const { result } = renderHook(() => useNotifications('162', 'token-one'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));

    act(() => {
      for (let index = 0; index < 6; index += 1) {
        standardHandlers[0](notification(`n-${index}`));
      }
      notificationHandlers[0](notification('n-0'));
    });

    expect(result.current.notifications).toHaveLength(5);
    expect(result.current.unreadCount).toBe(6);
  });

  it('keeps the most recent 200 notification identities in the dedupe LRU', async () => {
    const { result } = renderHook(() => useNotifications('162', 'token-one'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));

    act(() => {
      for (let index = 0; index <= 200; index += 1) {
        standardHandlers[0](notification(`lru-${index}`));
      }
      notificationHandlers[0](notification('lru-1'));
    });

    expect(result.current.notifications).toHaveLength(5);
    expect(result.current.unreadCount).toBe(201);

    act(() => standardHandlers[0](notification('lru-0')));
    expect(result.current.unreadCount).toBe(202);
  });

  it.each([
    undefined,
    null,
    {},
    notification('', { id: '' }),
    notification('space', { id: '   ' }),
  ])('rejects malformed realtime payload %#', async payload => {
    const { result } = renderHook(() => useNotifications('162', 'token-one'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));

    act(() => {
      standardHandlers[0](payload);
      notificationHandlers[0](payload);
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('reconciles realtime received during initial list/count without loss or double count', async () => {
    const initialList = deferred<ReturnType<typeof list>>();
    const initialCount = deferred<number>();
    vi.mocked(notificationService.getNotifications).mockReturnValueOnce(initialList.promise);
    vi.mocked(notificationService.getUnreadCount).mockReturnValueOnce(initialCount.promise);
    const { result } = renderHook(() => useNotifications('162', 'token-one'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));

    act(() => standardHandlers[0](notification('realtime')));
    expect(result.current.unreadCount).toBe(1);

    await act(async () => {
      initialList.resolve(list([notification('server'), notification('realtime')]));
      initialCount.resolve(2);
      await Promise.all([initialList.promise, initialCount.promise]);
    });

    expect(result.current.notifications.map(item => item.id)).toEqual(['realtime', 'server']);
    expect(result.current.unreadCount).toBe(2);
  });

  it('adds realtime-only unread to an independently captured initial count', async () => {
    const initialList = deferred<ReturnType<typeof list>>();
    const initialCount = deferred<number>();
    vi.mocked(notificationService.getNotifications).mockReturnValueOnce(initialList.promise);
    vi.mocked(notificationService.getUnreadCount).mockReturnValueOnce(initialCount.promise);
    const { result } = renderHook(() => useNotifications('162', 'token-one'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));

    act(() => standardHandlers[0](notification('realtime-only')));
    await act(async () => {
      initialList.resolve(list([notification('server')]));
      initialCount.resolve(1);
      await Promise.all([initialList.promise, initialCount.promise]);
    });

    expect(result.current.unreadCount).toBe(2);
  });

  it('seeds every initial page ID into the dedupe cache, not only five visible items', async () => {
    const initial = Array.from({ length: 8 }, (_, index) => notification(`initial-${index}`));
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(list(initial));
    const { result } = renderHook(() => useNotifications('162', 'token-one'));
    await waitFor(() => expect(result.current.notifications).toHaveLength(5));

    act(() => standardHandlers[0](notification('initial-7')));

    expect(result.current.unreadCount).toBe(0);
  });

  it('ignores stale A responses after an A to B to A lifecycle cycle', async () => {
    const oldA = deferred<ReturnType<typeof list>>();
    vi.mocked(notificationService.getNotifications)
      .mockReturnValueOnce(oldA.promise)
      .mockResolvedValueOnce(list([notification('account-b')]))
      .mockResolvedValueOnce(list([notification('account-a-current')]));
    const view = renderHook(
      ({ userId, token }) => useNotifications(userId, token),
      { initialProps: { userId: '7', token: 'token-a' } },
    );
    await waitFor(() => expect(notificationService.getNotifications).toHaveBeenCalledTimes(1));
    view.rerender({ userId: '8', token: 'token-b' });
    await waitFor(() => expect(view.result.current.notifications[0]?.id).toBe('account-b'));
    view.rerender({ userId: '7', token: 'token-a' });
    await waitFor(() => expect(view.result.current.notifications[0]?.id).toBe('account-a-current'));

    await act(async () => {
      oldA.resolve(list([notification('account-a-stale')]));
      await oldA.promise;
    });

    expect(view.result.current.notifications[0]?.id).toBe('account-a-current');
  });

  it('ignores a stale StrictMode initial response', async () => {
    const stale = deferred<ReturnType<typeof list>>();
    vi.mocked(notificationService.getNotifications)
      .mockReturnValueOnce(stale.promise)
      .mockResolvedValueOnce(list([notification('current')]));
    const { result } = renderHook(() => useNotifications('7', 'token-a'), {
      wrapper: StrictMode,
    });
    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('current'));

    await act(async () => {
      stale.resolve(list([notification('stale')]));
      await stale.promise;
    });

    expect(result.current.notifications[0]?.id).toBe('current');
  });

  it('does not apply stale mutation results to the next account', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValue(list([notification('shared')]));
    const mutation = deferred<void>();
    vi.mocked(notificationService.deleteNotification).mockReturnValueOnce(mutation.promise);
    const view = renderHook(
      ({ userId, token }) => useNotifications(userId, token),
      { initialProps: { userId: '7', token: 'token-a' } },
    );
    await waitFor(() => expect(view.result.current.notifications[0]?.id).toBe('shared'));
    void view.result.current.deleteNotification('shared');
    view.rerender({ userId: '8', token: 'token-b' });
    await waitFor(() => expect(notificationService.getNotifications).toHaveBeenCalledTimes(2));

    await act(async () => {
      mutation.resolve();
      await mutation.promise;
    });

    expect(view.result.current.notifications[0]?.id).toBe('shared');
  });

  it('invalidates same-session delete when a newer realtime version arrives', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(list([notification('shared')]));
    const mutation = deferred<void>();
    vi.mocked(notificationService.deleteNotification).mockReturnValueOnce(mutation.promise);
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('shared'));
    void result.current.deleteNotification('shared');
    act(() => standardHandlers[0](notification('newer')));

    await act(async () => {
      mutation.resolve();
      await mutation.promise;
    });

    expect(result.current.notifications.map(item => item.id)).toContain('newer');
  });

  it('does not remove an identity whose realtime version changed during delete', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(list([notification('shared')]));
    const mutation = deferred<void>();
    vi.mocked(notificationService.deleteNotification).mockReturnValueOnce(mutation.promise);
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('shared'));
    void result.current.deleteNotification('shared');
    act(() => standardHandlers[0](notification('shared')));

    await act(async () => {
      mutation.resolve();
      await mutation.promise;
    });

    expect(result.current.notifications.map(item => item.id)).toContain('shared');
  });

  it('leaves realtime received during mark-all unread', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(list([notification('old')]));
    const mutation = deferred<void>();
    vi.mocked(notificationService.markAllAsRead).mockReturnValueOnce(mutation.promise);
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('old'));
    void result.current.markAllAsRead();
    act(() => standardHandlers[0](notification('new')));

    await act(async () => {
      mutation.resolve();
      await mutation.promise;
    });

    expect(result.current.notifications.find(item => item.id === 'old')?.read_at).not.toBeNull();
    expect(result.current.notifications.find(item => item.id === 'new')?.read_at).toBeNull();
    expect(result.current.unreadCount).toBe(1);
  });

  it('continues with API state when Echo is unavailable', async () => {
    vi.mocked(getEcho).mockReturnValueOnce(null);
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(list([notification('api-only')]));

    const { result } = renderHook(() => useNotifications('7', 'token-a'));

    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('api-only'));
  });

  it('leaves the captured channel and tolerates getEcho/leave failures', () => {
    vi.mocked(getEcho).mockImplementationOnce(() => { throw new Error('init'); });
    const first = renderHook(() => useNotifications('7', 'token-a'));
    expect(() => first.unmount()).not.toThrow();

    configureEcho();
    leave.mockImplementationOnce(() => { throw new Error('leave'); });
    const second = renderHook(() => useNotifications('8', 'token-b'));
    expect(() => second.unmount()).not.toThrow();
    expect(leave).toHaveBeenCalledWith('App.Models.User.8.lk');
  });
});
