import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { notificationService } from '../../services/notificationService';
import { toast } from 'react-toastify';
import type { Notification, NotificationResponse } from '../../types/notification';
import { Page } from './NotificationsPage';

let organizationId = 44;

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 7, current_organization_id: organizationId } }),
}));
vi.mock('../../services/notificationService', () => ({
  notificationService: {
    getNotifications: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteNotification: vi.fn(),
    executeAction: vi.fn(),
  },
}));
vi.mock('../../components/dashboard/notifications/NotificationItem', () => ({
  NotificationItem: ({
    notification,
    onDelete,
    onMarkAsRead,
    onExecuteAction,
  }: {
    notification: Notification;
    onDelete: (id: string) => Promise<void>;
    onMarkAsRead: (id: string) => Promise<void>;
    onExecuteAction: (url: string, method: string) => void;
  }) => (
    <div data-testid={`notification-${notification.id}`} data-read={String(Boolean(notification.read_at))}>
      {notification.data.title}
      <button data-testid={`delete-${notification.id}`} onClick={() => void onDelete(notification.id)}>delete</button>
      <button data-testid={`read-${notification.id}`} onClick={() => void onMarkAsRead(notification.id)}>read</button>
      <button
        data-testid={`action-${notification.id}`}
        onClick={() => onExecuteAction(`/notifications/${notification.id}`, 'POST')}
      >
        action
      </button>
    </div>
  ),
}));
vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((next, fail) => {
    resolve = next;
    reject = fail;
  });
  return { promise, reject, resolve };
};

const notification = (id: string, read = false): Notification => ({
  id,
  sequence: 1,
  organization_id: null,
  type: 'system',
  interface: 'lk',
  data: { title: id, message: id, interface: 'lk' },
  read_at: read ? '2026-07-15T10:00:00Z' : null,
  created_at: '2026-07-15T10:00:00Z',
});

const response = (id: string, options: { read?: boolean; pages?: number; page?: number } = {}): NotificationResponse => ({
  data: [notification(id, options.read)],
  meta: {
    current_page: options.page ?? 1,
    last_page: options.pages ?? 1,
    per_page: 15,
    total: 1,
    unread_count: options.read ? 0 : 1,
    unread_by_category: {},
    unread_by_notification_type: {},
    unread_by_type: {},
    snapshot_sequence: 1,
  },
});

describe('NotificationsPage lifecycle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    organizationId = 44;
    vi.mocked(notificationService.markAsRead).mockResolvedValue();
    vi.mocked(notificationService.markAllAsRead).mockResolvedValue({ count: 0, sequence_cut: 1 });
    vi.mocked(notificationService.deleteNotification).mockResolvedValue();
    vi.mocked(notificationService.executeAction).mockResolvedValue(undefined);
  });

  it('removes a marked item from unread results using the refreshed server snapshot', async () => {
    const empty = response('unused', { read: true });
    empty.data = [];
    empty.meta.total = 0;
    vi.mocked(notificationService.getNotifications)
      .mockResolvedValueOnce(response('unread'))
      .mockResolvedValueOnce(response('unread'))
      .mockResolvedValueOnce(empty);
    render(<Page />);
    await screen.findByTestId('notification-unread');
    fireEvent.click(screen.getByRole('button', { name: 'Непрочитанные' }));
    await waitFor(() => expect(notificationService.getNotifications).toHaveBeenCalledTimes(2));
    await screen.findByTestId('notification-unread');
    fireEvent.click(screen.getByTestId('read-unread'));
    await screen.findByText('У вас нет непрочитанных уведомлений');
    expect(notificationService.getNotifications).toHaveBeenLastCalledWith(1, 15, 'unread', 44, expect.any(AbortSignal));
    expect(screen.getByText(/Всего:/)).toHaveTextContent('Всего: 0');
    expect(screen.getByRole('heading', { name: 'Уведомления' })).toHaveFocus();
  });

  it('returns to the last existing page after deleting its final item', async () => {
    const emptyLastPage = response('unused', { page: 2 });
    emptyLastPage.data = [];
    emptyLastPage.meta.total = 15;
    vi.mocked(notificationService.getNotifications)
      .mockResolvedValueOnce(response('first', { pages: 2 }))
      .mockResolvedValueOnce(response('last', { pages: 2, page: 2 }))
      .mockResolvedValueOnce(emptyLastPage)
      .mockResolvedValueOnce(response('remaining'));
    render(<Page />);
    await screen.findByTestId('notification-first');
    fireEvent.click(screen.getByRole('button', { name: 'Страница 2' }));
    await screen.findByTestId('notification-last');
    fireEvent.click(screen.getByTestId('delete-last'));
    await screen.findByTestId('notification-remaining');
    expect(notificationService.getNotifications).toHaveBeenLastCalledWith(1, 15, 'all', 44, expect.any(AbortSignal));
    expect(screen.queryByRole('button', { name: 'Страница 2' })).not.toBeInTheDocument();
  });

  it('uses aggregate unread count and preserves notifications newer than mark-all snapshot', async () => {
    const pending = deferred<{ count: number; sequence_cut: number }>();
    const initial = response('old', { read: true, pages: 2 });
    initial.meta.unread_count = 18;
    vi.mocked(notificationService.markAllAsRead).mockReturnValueOnce(pending.promise);
    vi.mocked(notificationService.getNotifications)
      .mockResolvedValueOnce(initial)
      .mockResolvedValueOnce(response('new-after-cut'));
    render(<Page />);
    await screen.findByTestId('notification-old');
    expect(screen.getByText(/Всего:/)).toHaveTextContent('Непрочитанных: 18');
    const markAll = screen.getByRole('button', { name: 'Отметить все прочитанными' });
    fireEvent.click(markAll);
    fireEvent.click(markAll);
    expect(markAll).toBeDisabled();
    expect(notificationService.markAllAsRead).toHaveBeenCalledOnce();
    await act(async () => { pending.resolve({ count: 18, sequence_cut: 2 }); await pending.promise; });
    await screen.findByTestId('notification-new-after-cut');
    expect(screen.getByTestId('notification-new-after-cut')).toHaveAttribute('data-read', 'false');
    expect(screen.getByText(/Всего:/)).toHaveTextContent('Непрочитанных: 1');
  });

  it('does not restore a deleted item when refreshing the list fails', async () => {
    vi.mocked(notificationService.getNotifications)
      .mockResolvedValueOnce(response('deleted'))
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(response('remaining'));
    render(<Page />);
    await screen.findByTestId('notification-deleted');
    fireEvent.click(screen.getByTestId('delete-deleted'));
    await screen.findByRole('alert');
    expect(screen.queryByTestId('notification-deleted')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
    await screen.findByTestId('notification-remaining');
    expect(notificationService.deleteNotification).toHaveBeenCalledOnce();
  });

  it('allows retry after mark-all fails', async () => {
    vi.mocked(notificationService.getNotifications).mockResolvedValue(response('unread'));
    vi.mocked(notificationService.markAllAsRead).mockRejectedValueOnce(new Error('offline'));
    render(<Page />);
    await screen.findByTestId('notification-unread');
    const markAll = screen.getByRole('button', { name: 'Отметить все прочитанными' });
    fireEvent.click(markAll);
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Не удалось отметить все уведомления'));
    expect(markAll).not.toBeDisabled();
    fireEvent.click(markAll);
    await waitFor(() => expect(notificationService.markAllAsRead).toHaveBeenCalledTimes(2));
  });

  it('shows a persistent loading error and retries without showing an empty result', async () => {
    vi.mocked(notificationService.getNotifications)
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(response('recovered'));
    render(<Page />);
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Не удалось загрузить уведомления'));
    expect(screen.queryByText('Нет уведомлений')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
    expect(screen.getByRole('heading', { name: 'Уведомления' })).toHaveFocus();
    await waitFor(() => expect(screen.getByTestId('notification-recovered')).toBeInTheDocument());
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('resets pagination when the filter changes and never keeps previous-filter items after failure', async () => {
    vi.mocked(notificationService.getNotifications)
      .mockResolvedValueOnce(response('first', { pages: 3 }))
      .mockResolvedValueOnce(response('second', { pages: 3, page: 2 }))
      .mockRejectedValueOnce(new Error('offline'));
    render(<Page />);
    await waitFor(() => expect(screen.getByTestId('notification-first')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Страница 2' }));
    await waitFor(() => expect(screen.getByTestId('notification-second')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Непрочитанные' }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(notificationService.getNotifications).toHaveBeenLastCalledWith(1, 15, 'unread', 44, expect.any(AbortSignal));
    expect(screen.queryByTestId('notification-second')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Непрочитанные' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('keeps organization B when a deferred organization A request resolves later', async () => {
    const organizationA = deferred<NotificationResponse>();
    vi.mocked(notificationService.getNotifications)
      .mockReturnValueOnce(organizationA.promise)
      .mockResolvedValueOnce(response('organization-b'));
    const view = render(<Page />);
    await waitFor(() => expect(notificationService.getNotifications).toHaveBeenCalledOnce());

    organizationId = 45;
    view.rerender(<Page />);
    await waitFor(() => expect(screen.getByTestId('notification-organization-b')).toBeInTheDocument());
    const firstSignal = vi.mocked(notificationService.getNotifications).mock.calls[0][4] as AbortSignal;
    expect(firstSignal.aborted).toBe(true);

    await act(async () => {
      organizationA.resolve(response('organization-a'));
      await organizationA.promise;
    });

    expect(screen.queryByTestId('notification-organization-a')).not.toBeInTheDocument();
    expect(screen.getByTestId('notification-organization-b')).toBeInTheDocument();
  });

  it('keeps the newest page/filter request when an older page request resolves later', async () => {
    const olderPage = deferred<NotificationResponse>();
    vi.mocked(notificationService.getNotifications)
      .mockResolvedValueOnce(response('initial', { read: true, pages: 2 }))
      .mockReturnValueOnce(olderPage.promise)
      .mockResolvedValueOnce(response('newest-filter', { read: true, pages: 2, page: 2 }));
    render(<Page />);
    await waitFor(() => expect(screen.getByTestId('notification-initial')).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Страница 2' }));
    await waitFor(() => expect(notificationService.getNotifications).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getByRole('button', { name: 'Непрочитанные' }));
    await waitFor(() => expect(screen.getByTestId('notification-newest-filter')).toBeInTheDocument());

    await act(async () => {
      olderPage.resolve(response('older-page', { read: true, pages: 2, page: 2 }));
      await olderPage.promise;
    });

    expect(screen.queryByTestId('notification-older-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('notification-newest-filter')).toBeInTheDocument();
  });

  it.each(['delete', 'read'] as const)('ignores delayed %s after changing organization', async operation => {
    const pending = deferred<void>();
    const method = operation === 'delete' ? notificationService.deleteNotification : notificationService.markAsRead;
    vi.mocked(method).mockReturnValueOnce(pending.promise);
    vi.mocked(notificationService.getNotifications)
      .mockResolvedValueOnce(response('organization-a'))
      .mockResolvedValueOnce(response('organization-b'));
    const view = render(<Page />);
    await waitFor(() => expect(screen.getByTestId('notification-organization-a')).toBeInTheDocument());
    fireEvent.click(screen.getByTestId(`${operation}-organization-a`));
    organizationId = 45;
    view.rerender(<Page />);
    await waitFor(() => expect(screen.getByTestId('notification-organization-b')).toBeInTheDocument());
    await act(async () => { pending.resolve(); await pending.promise; });
    expect(screen.getByTestId('notification-organization-b')).toHaveAttribute('data-read', 'false');
    expect(screen.getByText(/Всего:/)).toHaveTextContent('Всего: 1');
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('does not apply mark-all completion after the organization changes', async () => {
    const markAll = deferred<{ count: number; sequence_cut: number }>();
    vi.mocked(notificationService.markAllAsRead).mockReturnValueOnce(markAll.promise);
    vi.mocked(notificationService.getNotifications)
      .mockResolvedValueOnce(response('organization-a'))
      .mockResolvedValueOnce(response('organization-b'));
    const view = render(<Page />);
    await waitFor(() => expect(screen.getByTestId('notification-organization-a')).toBeInTheDocument());
    fireEvent.click(screen.getAllByRole('button')[0]);

    organizationId = 45;
    view.rerender(<Page />);
    await waitFor(() => expect(screen.getByTestId('notification-organization-b')).toBeInTheDocument());
    await act(async () => {
      markAll.resolve({ count: 1, sequence_cut: 1 });
      await markAll.promise;
    });

    expect(screen.getByTestId('notification-organization-b')).toHaveAttribute('data-read', 'false');
  });

  it.each(['success', 'failure'] as const)(
    'ignores stale execute-action %s after the organization changes',
    async outcome => {
      const action = deferred<unknown>();
      vi.mocked(notificationService.executeAction).mockReturnValueOnce(action.promise);
      vi.mocked(notificationService.getNotifications)
        .mockResolvedValueOnce(response('organization-a'))
        .mockResolvedValueOnce(response('organization-b'));
      const view = render(<Page />);
      await waitFor(() => expect(screen.getByTestId('notification-organization-a')).toBeInTheDocument());
      fireEvent.click(screen.getByTestId('action-organization-a'));

      organizationId = 45;
      view.rerender(<Page />);
      await waitFor(() => expect(screen.getByTestId('notification-organization-b')).toBeInTheDocument());
      await act(async () => {
        if (outcome === 'success') {
          action.resolve(undefined);
          await action.promise;
        } else {
          action.reject(new Error('stale action'));
          await action.promise.catch(() => undefined);
        }
      });

      expect(notificationService.getNotifications).toHaveBeenCalledTimes(2);
      expect(screen.getByTestId('notification-organization-b')).toBeInTheDocument();
      expect(toast.success).not.toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalled();
    },
  );
});
