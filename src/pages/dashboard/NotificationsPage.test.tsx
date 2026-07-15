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
    onExecuteAction,
  }: {
    notification: Notification;
    onExecuteAction: (url: string, method: string) => void;
  }) => (
    <div data-testid={`notification-${notification.id}`} data-read={String(Boolean(notification.read_at))}>
      {notification.data.title}
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
    organizationId = 44;
    vi.mocked(notificationService.markAsRead).mockResolvedValue();
    vi.mocked(notificationService.markAllAsRead).mockResolvedValue({ count: 0, sequence_cut: 1 });
    vi.mocked(notificationService.deleteNotification).mockResolvedValue();
    vi.mocked(notificationService.executeAction).mockResolvedValue(undefined);
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

    fireEvent.click(screen.getByRole('button', { name: '2' }));
    await waitFor(() => expect(notificationService.getNotifications).toHaveBeenCalledTimes(2));
    fireEvent.click(screen.getAllByRole('button')[1]);
    await waitFor(() => expect(screen.getByTestId('notification-newest-filter')).toBeInTheDocument());

    await act(async () => {
      olderPage.resolve(response('older-page', { read: true, pages: 2, page: 2 }));
      await olderPage.promise;
    });

    expect(screen.queryByTestId('notification-older-page')).not.toBeInTheDocument();
    expect(screen.getByTestId('notification-newest-filter')).toBeInTheDocument();
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
