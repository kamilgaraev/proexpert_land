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

const list = (items: ReturnType<typeof notification>[], unreadCount = 0) => ({
  data: items,
  meta: {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: items.length,
    unread_count: unreadCount,
    unread_by_category: {},
    unread_by_notification_type: {},
    unread_by_type: {},
  },
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

  it('does not double count realtime already included in the atomic list snapshot', async () => {
    const initialList = deferred<ReturnType<typeof list>>();
    vi.mocked(notificationService.getNotifications).mockReturnValueOnce(initialList.promise);
    const { result } = renderHook(() => useNotifications('162', 'token-one'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));

    act(() => standardHandlers[0](notification('realtime')));
    expect(result.current.unreadCount).toBe(1);

    await act(async () => {
      initialList.resolve(list([notification('server'), notification('realtime')], 2));
      await initialList.promise;
    });

    expect(result.current.notifications.map(item => item.id)).toEqual(['realtime', 'server']);
    expect(result.current.unreadCount).toBe(2);
    expect(notificationService.getUnreadCount).not.toHaveBeenCalled();
  });

  it('adds realtime that arrived after the atomic list snapshot', async () => {
    const initialList = deferred<ReturnType<typeof list>>();
    vi.mocked(notificationService.getNotifications).mockReturnValueOnce(initialList.promise);
    const { result } = renderHook(() => useNotifications('162', 'token-one'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));

    act(() => standardHandlers[0](notification('realtime-only')));
    await act(async () => {
      initialList.resolve(list([notification('server')], 1));
      await initialList.promise;
    });

    expect(result.current.unreadCount).toBe(2);
    expect(notificationService.getUnreadCount).not.toHaveBeenCalled();
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

  it('keeps the current StrictMode realtime buffer after the stale request settles', async () => {
    const stale = deferred<ReturnType<typeof list>>();
    const current = deferred<ReturnType<typeof list>>();
    vi.mocked(notificationService.getNotifications)
      .mockReturnValueOnce(stale.promise)
      .mockReturnValueOnce(current.promise);
    const { result } = renderHook(() => useNotifications('7', 'token-a'), {
      wrapper: StrictMode,
    });
    await waitFor(() => expect(notificationService.getNotifications).toHaveBeenCalledTimes(2));

    await act(async () => {
      stale.resolve(list([], 0));
      await stale.promise;
    });
    act(() => standardHandlers.at(-1)?.(notification('strict-realtime')));
    await act(async () => {
      current.resolve(list([], 0));
      await current.promise;
    });

    expect(result.current.notifications.map(item => item.id)).toEqual(['strict-realtime']);
    expect(result.current.unreadCount).toBe(1);
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

  it('counts every realtime event during mark-all even beyond the 200-ID dedupe capacity', async () => {
    const mutation = deferred<void>();
    vi.mocked(notificationService.markAllAsRead).mockReturnValueOnce(mutation.promise);
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));
    void result.current.markAllAsRead();

    act(() => {
      for (let index = 0; index < 201; index += 1) {
        standardHandlers[0](notification(`burst-${index}`));
      }
    });

    await act(async () => {
      mutation.resolve();
      await mutation.promise;
    });

    expect(result.current.unreadCount).toBe(201);
  });

  it('does not let a stale manual list resurrect a successfully deleted notification', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(list([notification('deleted')], 1));
    const staleList = deferred<ReturnType<typeof list>>();
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('deleted'));
    vi.mocked(notificationService.getNotifications).mockReturnValueOnce(staleList.promise);
    void result.current.refreshNotifications();
    await result.current.deleteNotification('deleted');

    await act(async () => {
      staleList.resolve(list([notification('deleted')], 1));
      await staleList.promise;
    });

    expect(result.current.notifications.find(item => item.id === 'deleted')).toBeUndefined();
    expect(result.current.unreadCount).toBe(0);
  });

  it('does not let the pending initial list resurrect a realtime notification deleted meanwhile', async () => {
    const initial = deferred<ReturnType<typeof list>>();
    vi.mocked(notificationService.getNotifications).mockReturnValueOnce(initial.promise);
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));
    act(() => standardHandlers[0](notification('initial-delete')));
    await act(async () => result.current.deleteNotification('initial-delete'));

    await act(async () => {
      initial.resolve(list([notification('initial-delete')], 1));
      await initial.promise;
    });

    expect(result.current.notifications).toEqual([]);
    expect(result.current.unreadCount).toBe(0);
  });

  it('does not let a stale manual list undo mark-read', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(list([notification('read')], 1));
    const staleList = deferred<ReturnType<typeof list>>();
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('read'));
    vi.mocked(notificationService.getNotifications).mockReturnValueOnce(staleList.promise);
    void result.current.refreshNotifications();
    await result.current.markAsRead('read');

    await act(async () => {
      staleList.resolve(list([notification('read')], 1));
      await staleList.promise;
    });

    expect(result.current.notifications.find(item => item.id === 'read')?.read_at).not.toBeNull();
    expect(result.current.unreadCount).toBe(0);
  });

  it('does not let a stale manual list undo mark-all', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(list([notification('read-all')], 1));
    const staleList = deferred<ReturnType<typeof list>>();
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('read-all'));
    vi.mocked(notificationService.getNotifications).mockReturnValueOnce(staleList.promise);
    void result.current.refreshNotifications();
    await result.current.markAllAsRead();

    await act(async () => {
      staleList.resolve(list([notification('read-all')], 1));
      await staleList.promise;
    });

    expect(result.current.notifications.find(item => item.id === 'read-all')?.read_at).not.toBeNull();
    expect(result.current.unreadCount).toBe(0);
  });

  it('ignores an older same-epoch manual list response', async () => {
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(notificationService.getNotifications).toHaveBeenCalledOnce());
    const older = deferred<ReturnType<typeof list>>();
    const newer = deferred<ReturnType<typeof list>>();
    vi.mocked(notificationService.getNotifications)
      .mockReturnValueOnce(older.promise)
      .mockReturnValueOnce(newer.promise);
    void result.current.refreshNotifications();
    void result.current.refreshNotifications();

    await act(async () => {
      newer.resolve(list([notification('newer-list')], 1));
      await newer.promise;
    });
    await act(async () => {
      older.resolve(list([notification('older-list')], 1));
      await older.promise;
    });

    expect(result.current.notifications.map(item => item.id)).toEqual(['newer-list']);
  });

  it('deduplicates concurrent delete requests for the same notification', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(list([notification('delete-once')], 1));
    const mutation = deferred<void>();
    vi.mocked(notificationService.deleteNotification).mockReturnValueOnce(mutation.promise);
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('delete-once'));
    const first = result.current.deleteNotification('delete-once');
    const second = result.current.deleteNotification('delete-once');

    expect(notificationService.deleteNotification).toHaveBeenCalledOnce();
    mutation.resolve();
    await act(async () => Promise.all([first, second]));
  });

  it('deduplicates concurrent mark-read requests for the same notification', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(list([notification('read-once')], 1));
    const mutation = deferred<void>();
    vi.mocked(notificationService.markAsRead).mockReturnValueOnce(mutation.promise);
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('read-once'));
    const first = result.current.markAsRead('read-once');
    const second = result.current.markAsRead('read-once');

    expect(notificationService.markAsRead).toHaveBeenCalledOnce();
    mutation.resolve();
    await act(async () => Promise.all([first, second]));
  });

  it('deduplicates concurrent mark-all requests', async () => {
    const mutation = deferred<void>();
    vi.mocked(notificationService.markAllAsRead).mockReturnValueOnce(mutation.promise);
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    const first = result.current.markAllAsRead();
    const second = result.current.markAllAsRead();

    expect(notificationService.markAllAsRead).toHaveBeenCalledOnce();
    mutation.resolve();
    await act(async () => Promise.all([first, second]));
  });

  it('refetches authoritative state after an ambiguous delete failure', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(notificationService.getNotifications)
      .mockResolvedValueOnce(list([notification('maybe-deleted')], 1))
      .mockResolvedValueOnce(list([], 0));
    vi.mocked(notificationService.deleteNotification).mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('maybe-deleted'));

    await act(async () => result.current.deleteNotification('maybe-deleted'));

    expect(notificationService.getNotifications).toHaveBeenCalledTimes(2);
    expect(result.current.notifications).toEqual([]);
    consoleError.mockRestore();
  });

  it.each(['private', 'notification', 'listen', 'error'] as const)(
    'leaves the captured channel when %s subscription stage throws',
    stage => {
      const stageLeave = vi.fn();
      const channel = {
        notification: vi.fn().mockReturnThis(),
        listen: vi.fn().mockReturnThis(),
        error: vi.fn().mockReturnThis(),
      };
      const echo = {
        private: vi.fn(() => channel),
        leave: stageLeave,
      };

      if (stage === 'private') {
        echo.private.mockImplementationOnce(() => { throw new Error(stage); });
      } else {
        channel[stage].mockImplementationOnce(() => { throw new Error(stage); });
      }

      vi.mocked(getEcho).mockReturnValueOnce(echo as never);
      const view = renderHook(() => useNotifications('7', 'token-a'));
      expect(() => view.unmount()).not.toThrow();
      expect(stageLeave).toHaveBeenCalledWith('App.Models.User.7.lk');
    },
  );

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
