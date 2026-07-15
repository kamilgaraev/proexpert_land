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
  sequence: 1,
  organization_id: null,
  type: 'system',
  interface: 'lk',
  data: { title: id, message: id, interface: 'lk' },
  read_at: null,
  created_at: '2026-07-15T10:00:00Z',
  ...overrides,
}) as Notification;

const list = (
  items: ReturnType<typeof notification>[],
  unreadCount = 0,
  snapshotSequence = items.reduce((maximum, item) => Math.max(maximum, item.sequence), 0),
) => ({
  data: items,
  meta: {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: items.length,
    unread_count: unreadCount,
    snapshot_sequence: snapshotSequence,
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
    vi.mocked(notificationService.getUnreadCount).mockResolvedValue({ count: 0, snapshot_sequence: 0 });
    vi.mocked(notificationService.markAsRead).mockResolvedValue();
    vi.mocked(notificationService.markAllAsRead).mockResolvedValue({ count: 0, sequence_cut: 0 });
    vi.mocked(notificationService.deleteNotification).mockResolvedValue();
    vi.mocked(notificationService.executeAction).mockResolvedValue(undefined);
  });

  it('subscribes to exact global and organization LK channels and enforces their organization scope', async () => {
    const echo = configureEcho();
    const { result } = renderHook(() => useNotifications('162', 'token-one', 44));
    await waitFor(() => expect(echo.private).toHaveBeenCalledTimes(2));
    expect(echo.private).toHaveBeenNthCalledWith(1, 'App.Models.User.162.lk.global');
    expect(echo.private).toHaveBeenNthCalledWith(2, 'App.Models.User.162.lk.org.44');

    act(() => {
      standardHandlers[0](notification('admin', {
        interface: 'admin',
        data: { title: 'admin', message: 'admin', interface: 'admin' },
      }));
      standardHandlers[0](notification('cross-on-global', { organization_id: 44 }));
      standardHandlers[1](notification('global-on-org'));
      standardHandlers[1](notification('cross-org', { organization_id: 45 }));
      standardHandlers[0](notification('global'));
      standardHandlers[1](notification('organization', { sequence: 2, organization_id: 44 }));
    });

    expect(result.current.notifications.map(item => item.id)).toEqual(['organization', 'global']);
    expect(result.current.unreadCount).toBe(2);
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
    notification('missing-sequence', { sequence: undefined }),
    notification('zero-sequence', { sequence: 0 }),
    notification('negative-sequence', { sequence: -1 }),
    notification('fractional-sequence', { sequence: 1.5 }),
    notification('unsafe-sequence', { sequence: Number.MAX_SAFE_INTEGER + 1 }),
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

    act(() => standardHandlers[0](notification('realtime', { sequence: 2 })));
    expect(result.current.unreadCount).toBe(1);

    await act(async () => {
      initialList.resolve(list([
        notification('realtime', { sequence: 2 }),
        notification('server', { sequence: 1 }),
      ], 2, 2));
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

    act(() => standardHandlers[0](notification('realtime-only', { sequence: 2 })));
    await act(async () => {
      initialList.resolve(list([notification('server', { sequence: 1 })], 1, 1));
      await initialList.promise;
    });

    expect(result.current.unreadCount).toBe(2);
    expect(notificationService.getUnreadCount).not.toHaveBeenCalled();
  });

  it('uses the snapshot cursor instead of page membership for a six-event five-item page', async () => {
    const initialList = deferred<ReturnType<typeof list>>();
    vi.mocked(notificationService.getNotifications).mockReturnValueOnce(initialList.promise);
    const { result } = renderHook(() => useNotifications('162', 'token-one'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));

    act(() => {
      for (let sequence = 1; sequence <= 6; sequence += 1) {
        standardHandlers[0](notification(`event-${sequence}`, { sequence }));
      }
    });
    await act(async () => {
      initialList.resolve(list(
        [6, 5, 4, 3, 2].map(sequence => notification(`event-${sequence}`, { sequence })),
        6,
        6,
      ));
      await initialList.promise;
    });

    expect(result.current.notifications.map(item => item.id)).toEqual([
      'event-6', 'event-5', 'event-4', 'event-3', 'event-2',
    ]);
    expect(result.current.unreadCount).toBe(6);
  });

  it('drops buffered events at or below the snapshot cursor and merges only later events', async () => {
    const initialList = deferred<ReturnType<typeof list>>();
    vi.mocked(notificationService.getNotifications).mockReturnValueOnce(initialList.promise);
    const { result } = renderHook(() => useNotifications('162', 'token-one'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));

    act(() => {
      standardHandlers[0](notification('outside-page', { sequence: 4 }));
      standardHandlers[0](notification('after-snapshot', { sequence: 6 }));
    });
    await act(async () => {
      initialList.resolve(list([notification('server', { sequence: 5 })], 5, 5));
      await initialList.promise;
    });

    expect(result.current.notifications.map(item => item.id)).toEqual(['after-snapshot', 'server']);
    expect(result.current.unreadCount).toBe(6);
  });

  it('does not let an older explicit count overwrite a newer atomic list', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(list([], 0, 0));
    const count = deferred<{ count: number; snapshot_sequence: number }>();
    vi.mocked(notificationService.getUnreadCount).mockReturnValueOnce(count.promise);
    const { result } = renderHook(() => useNotifications('162', 'token-one'));
    await waitFor(() => expect(notificationService.getNotifications).toHaveBeenCalledOnce());
    void result.current.refreshUnreadCount();
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(list([], 8, 8));
    await act(async () => result.current.refreshNotifications());

    await act(async () => {
      count.resolve({ count: 2, snapshot_sequence: 2 });
      await count.promise;
    });

    expect(result.current.unreadCount).toBe(8);
  });

  it('adds realtime newer than an explicit count snapshot cursor', async () => {
    const count = deferred<{ count: number; snapshot_sequence: number }>();
    vi.mocked(notificationService.getUnreadCount).mockReturnValueOnce(count.promise);
    const { result } = renderHook(() => useNotifications('162', 'token-one'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));
    void result.current.refreshUnreadCount();
    act(() => {
      standardHandlers[0](notification('old-count-event', { sequence: 4 }));
      standardHandlers[0](notification('new-count-event', { sequence: 6 }));
    });
    await act(async () => {
      count.resolve({ count: 5, snapshot_sequence: 5 });
      await count.promise;
    });

    expect(result.current.unreadCount).toBe(6);
  });

  it('rejects a lower-cursor list that resolves after a newer count snapshot', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(
      list([notification('initial', { sequence: 1 })], 1, 1),
    );
    const count = deferred<{ count: number; snapshot_sequence: number }>();
    const olderList = deferred<ReturnType<typeof list>>();
    vi.mocked(notificationService.getUnreadCount).mockReturnValueOnce(count.promise);
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('initial'));
    void result.current.refreshUnreadCount();
    vi.mocked(notificationService.getNotifications).mockReturnValueOnce(olderList.promise);
    void result.current.refreshNotifications();

    await act(async () => {
      count.resolve({ count: 10, snapshot_sequence: 10 });
      await count.promise;
    });
    await act(async () => {
      olderList.resolve(list([notification('older-list', { sequence: 5 })], 5, 5));
      await olderList.promise;
    });

    expect(result.current.notifications.map(item => item.id)).toEqual(['initial']);
    expect(result.current.unreadCount).toBe(10);
  });

  it('rejects a lower-cursor count that resolves after a newer list snapshot', async () => {
    const newerList = deferred<ReturnType<typeof list>>();
    const olderCount = deferred<{ count: number; snapshot_sequence: number }>();
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(notificationService.getNotifications).toHaveBeenCalledOnce());
    vi.mocked(notificationService.getNotifications).mockReturnValueOnce(newerList.promise);
    void result.current.refreshNotifications();
    vi.mocked(notificationService.getUnreadCount).mockReturnValueOnce(olderCount.promise);
    void result.current.refreshUnreadCount();

    await act(async () => {
      newerList.resolve(list([notification('newer-list', { sequence: 10 })], 10, 10));
      await newerList.promise;
    });
    await act(async () => {
      olderCount.resolve({ count: 5, snapshot_sequence: 5 });
      await olderCount.promise;
    });

    expect(result.current.notifications.map(item => item.id)).toEqual(['newer-list']);
    expect(result.current.unreadCount).toBe(10);
  });

  it.each(['read', 'delete', 'all'] as const)(
    'does not let an in-flight count restore state after %s mutation',
    async operation => {
      vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(
        list([notification('mutation-target', { sequence: 5 })], 1, 5),
      );
      vi.mocked(notificationService.markAllAsRead).mockResolvedValueOnce({ count: 1, sequence_cut: 5 });
      const count = deferred<{ count: number; snapshot_sequence: number }>();
      vi.mocked(notificationService.getUnreadCount).mockReturnValueOnce(count.promise);
      const { result } = renderHook(() => useNotifications('7', 'token-a'));
      await waitFor(() => expect(result.current.unreadCount).toBe(1));
      void result.current.refreshUnreadCount();
      await act(async () => {
        if (operation === 'read') {
          await result.current.markAsRead('mutation-target');
        } else if (operation === 'delete') {
          await result.current.deleteNotification('mutation-target');
        } else {
          await result.current.markAllAsRead();
        }
      });
      await act(async () => {
        count.resolve({ count: 99, snapshot_sequence: 6 });
        await count.promise;
      });

      expect(result.current.unreadCount).toBe(0);
    },
  );

  it.each(['read', 'delete'] as const)(
    'uses operation-start metadata when an unread item is displaced before %s completes',
    async operation => {
      vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(
        list([notification('target', { sequence: 1 })], 1, 1),
      );
      const mutation = deferred<void>();
      if (operation === 'read') {
        vi.mocked(notificationService.markAsRead).mockReturnValueOnce(mutation.promise);
      } else {
        vi.mocked(notificationService.deleteNotification).mockReturnValueOnce(mutation.promise);
      }
      const { result } = renderHook(() => useNotifications('7', 'token-a'));
      await waitFor(() => expect(result.current.notifications[0]?.id).toBe('target'));
      const pending = operation === 'read'
        ? result.current.markAsRead('target')
        : result.current.deleteNotification('target');
      act(() => {
        for (let sequence = 2; sequence <= 7; sequence += 1) {
          standardHandlers[0](notification(`burst-${sequence}`, { sequence }));
        }
      });
      mutation.resolve();
      await act(async () => pending);

      expect(result.current.notifications.find(item => item.id === 'target')).toBeUndefined();
      expect(result.current.unreadCount).toBe(6);
    },
  );

  it('keeps only one active list and count request by aborting predecessors', async () => {
    const never = new Promise<ReturnType<typeof list>>(() => undefined);
    const neverCount = new Promise<{ count: number; snapshot_sequence: number }>(() => undefined);
    vi.mocked(notificationService.getNotifications).mockReturnValue(never);
    vi.mocked(notificationService.getUnreadCount).mockReturnValue(neverCount);
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(notificationService.getNotifications).toHaveBeenCalledOnce());
    void result.current.refreshNotifications();
    void result.current.refreshNotifications();
    void result.current.refreshUnreadCount();
    void result.current.refreshUnreadCount();

    const listSignals = vi.mocked(notificationService.getNotifications).mock.calls
      .map(call => call[4] as AbortSignal);
    const countSignals = vi.mocked(notificationService.getUnreadCount).mock.calls
      .map(call => call[0] as AbortSignal);
    expect(listSignals.slice(0, -1).every(signal => signal.aborted)).toBe(true);
    expect(listSignals.at(-1)?.aborted).toBe(false);
    expect(countSignals[0]?.aborted).toBe(true);
    expect(countSignals.at(-1)?.aborted).toBe(false);
  });

  it('restarts an atomic snapshot when a realtime request buffer overflows', async () => {
    const initial = deferred<ReturnType<typeof list>>();
    vi.mocked(notificationService.getNotifications).mockReturnValueOnce(initial.promise);
    renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));

    act(() => {
      for (let sequence = 1; sequence <= 201; sequence += 1) {
        standardHandlers[0](notification(`overflow-${sequence}`, { sequence }));
      }
    });

    await waitFor(() => expect(notificationService.getNotifications).toHaveBeenCalledTimes(2));
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
    vi.mocked(notificationService.getNotifications).mockResolvedValueOnce(list([notification('old', { sequence: 1 })]));
    const mutation = deferred<{ count: number; sequence_cut: number }>();
    vi.mocked(notificationService.markAllAsRead).mockReturnValueOnce(mutation.promise);
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('old'));
    void result.current.markAllAsRead();
    act(() => standardHandlers[0](notification('new', { sequence: 2 })));

    await act(async () => {
      mutation.resolve({ count: 1, sequence_cut: 1 });
      await mutation.promise;
    });

    expect(result.current.notifications.find(item => item.id === 'old')?.read_at).not.toBeNull();
    expect(result.current.notifications.find(item => item.id === 'new')?.read_at).toBeNull();
    expect(result.current.unreadCount).toBe(1);
  });

  it('counts every realtime event during mark-all even beyond the 200-ID dedupe capacity', async () => {
    const mutation = deferred<{ count: number; sequence_cut: number }>();
    vi.mocked(notificationService.markAllAsRead).mockReturnValueOnce(mutation.promise);
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));
    void result.current.markAllAsRead();

    act(() => {
      for (let index = 0; index < 201; index += 1) {
        standardHandlers[0](notification(`burst-${index}`, { sequence: index + 1 }));
      }
    });

    await act(async () => {
      mutation.resolve({ count: 0, sequence_cut: 0 });
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
    vi.mocked(notificationService.markAllAsRead).mockResolvedValueOnce({ count: 1, sequence_cut: 1 });
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

  it('applies the global mark-all cut to fetched and buffered notifications', async () => {
    const initial = deferred<ReturnType<typeof list>>();
    vi.mocked(notificationService.getNotifications).mockReturnValueOnce(initial.promise);
    vi.mocked(notificationService.markAllAsRead).mockResolvedValueOnce({ count: 1, sequence_cut: 5 });
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(standardHandlers).toHaveLength(1));
    act(() => {
      standardHandlers[0](notification('before-cut', { sequence: 1 }));
      standardHandlers[0](notification('after-cut', { sequence: 6 }));
    });
    await act(async () => result.current.markAllAsRead());
    await act(async () => {
      initial.resolve(list([notification('fetched-before-cut', { sequence: 3 })], 3, 3));
      await initial.promise;
    });

    expect(result.current.notifications.find(item => item.id === 'before-cut')?.read_at).not.toBeNull();
    expect(result.current.notifications.find(item => item.id === 'fetched-before-cut')?.read_at).not.toBeNull();
    expect(result.current.notifications.find(item => item.id === 'after-cut')?.read_at).toBeNull();
    expect(result.current.unreadCount).toBe(1);
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
    const mutation = deferred<{ count: number; sequence_cut: number }>();
    vi.mocked(notificationService.markAllAsRead).mockReturnValueOnce(mutation.promise);
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    const first = result.current.markAllAsRead();
    const second = result.current.markAllAsRead();

    expect(notificationService.markAllAsRead).toHaveBeenCalledOnce();
    mutation.resolve({ count: 0, sequence_cut: 0 });
    await act(async () => Promise.all([first, second]));
  });

  it('refetches authoritative state after an ambiguous delete failure', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.mocked(notificationService.getNotifications)
      .mockResolvedValueOnce(list([notification('maybe-deleted')], 1))
      .mockResolvedValueOnce(list([], 0, 1));
    vi.mocked(notificationService.deleteNotification).mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => useNotifications('7', 'token-a'));
    await waitFor(() => expect(result.current.notifications[0]?.id).toBe('maybe-deleted'));

    await act(async () => result.current.deleteNotification('maybe-deleted'));

    expect(notificationService.getNotifications).toHaveBeenCalledTimes(2);
    expect(result.current.notifications).toEqual([]);
    consoleError.mockRestore();
  });

  it.each(['private', 'notification', 'listen', 'error'] as const)(
    'immediately leaves every intended channel when %s subscription stage throws',
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
      const view = renderHook(() => useNotifications('7', 'token-a', 44));
      expect(stageLeave).toHaveBeenCalledWith('App.Models.User.7.lk.global');
      expect(stageLeave).toHaveBeenCalledWith('App.Models.User.7.lk.org.44');
      expect(() => view.unmount()).not.toThrow();
    },
  );

  it('leaves both old channels and reloads when the organization changes', async () => {
    const echo = configureEcho();
    const view = renderHook(
      ({ organizationId }) => useNotifications('7', 'token-a', organizationId),
      { initialProps: { organizationId: 44 } },
    );
    await waitFor(() => expect(echo.private).toHaveBeenCalledTimes(2));
    view.rerender({ organizationId: 45 });
    await waitFor(() => expect(notificationService.getNotifications).toHaveBeenCalledTimes(2));

    expect(leave).toHaveBeenCalledWith('App.Models.User.7.lk.global');
    expect(leave).toHaveBeenCalledWith('App.Models.User.7.lk.org.44');
    expect(echo.private).toHaveBeenCalledWith('App.Models.User.7.lk.org.45');
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
    expect(leave).toHaveBeenCalledWith('App.Models.User.8.lk.global');
  });
});
