import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import getEcho from '../services/echo';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types/notification';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  executeAction: (url: string, method?: string) => Promise<void>;
}

const MAX_VISIBLE_NOTIFICATIONS = 5;
const MAX_DEDUPE_NOTIFICATIONS = 200;

const rememberNotification = (cache: Map<string, true>, key: string): void => {
  if (cache.has(key)) {
    cache.delete(key);
  }

  cache.set(key, true);

  while (cache.size > MAX_DEDUPE_NOTIFICATIONS) {
    const oldest = cache.keys().next().value;

    if (typeof oldest !== 'string') {
      return;
    }

    cache.delete(oldest);
  }
};

const mergeVisible = (primary: Notification[], secondary: Notification[]): Notification[] => {
  const ids = new Set<string>();

  return [...primary, ...secondary]
    .filter(notification => {
      if (ids.has(notification.id)) {
        return false;
      }

      ids.add(notification.id);
      return true;
    })
    .slice(0, MAX_VISIBLE_NOTIFICATIONS);
};

const parseObject = (value: unknown): Record<string, unknown> | null => {
  let parsed = value;

  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed) as unknown;
    } catch {
      return null;
    }
  }

  return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
    ? parsed as Record<string, unknown>
    : null;
};

const normalizeRealtimeNotification = (payload: unknown): Notification | null => {
  const source = parseObject(payload);

  if (!source || source.interface !== 'lk' || typeof source.id !== 'string') {
    return null;
  }

  const id = source.id.trim();
  const data = parseObject(source.data);

  if (!id || !data) {
    return null;
  }

  return {
    ...source,
    id,
    type: typeof source.type === 'string'
      ? source.type
      : typeof source.notification_type === 'string'
        ? source.notification_type
        : 'notification',
    interface: 'lk',
    data: {
      ...data,
      title: typeof data.title === 'string' ? data.title : '',
      message: typeof data.message === 'string' ? data.message : '',
      interface: 'lk',
    },
    read_at: typeof source.read_at === 'string' ? source.read_at : null,
    created_at: typeof source.created_at === 'string'
      ? source.created_at
      : new Date().toISOString(),
  } as Notification;
};

export const useNotifications = (
  userId: string | null,
  token: string | null = null,
): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const lifecycleEpochRef = useRef(0);
  const notificationsRef = useRef<Notification[]>([]);
  const unreadCountRef = useRef(0);
  const unreadRevisionRef = useRef(0);
  const realtimeSequenceRef = useRef(0);
  const realtimeUnreadRef = useRef<Array<{ id: string; sequence: number }>>([]);
  const notificationVersionsRef = useRef<Map<string, number>>(new Map());
  const dedupeCacheRef = useRef<Map<string, true>>(new Map());

  const publishNotifications = useCallback((next: Notification[]): void => {
    notificationsRef.current = next;
    setNotifications(next);
  }, []);

  const publishUnreadCount = useCallback((next: number): void => {
    unreadCountRef.current = Math.max(0, next);
    setUnreadCount(unreadCountRef.current);
  }, []);

  const refreshUnreadCount = useCallback(async (): Promise<void> => {
    const epoch = lifecycleEpochRef.current;
    const revision = unreadRevisionRef.current;

    try {
      const count = await notificationService.getUnreadCount();

      if (lifecycleEpochRef.current === epoch && unreadRevisionRef.current === revision) {
        publishUnreadCount(count);
      }
    } catch (error) {
      if (lifecycleEpochRef.current === epoch) {
        console.error('Ошибка при загрузке счётчика уведомлений:', error);
      }
    }
  }, [publishUnreadCount]);

  const refreshNotifications = useCallback(async (): Promise<void> => {
    const epoch = lifecycleEpochRef.current;
    setLoading(true);

    try {
      const response = await notificationService.getNotifications(1, 5);

      if (lifecycleEpochRef.current !== epoch) {
        return;
      }

      response.data.forEach(notification => {
        const id = typeof notification.id === 'string' ? notification.id.trim() : '';

        if (id) {
          rememberNotification(dedupeCacheRef.current, `${id}:lk`);
        }
      });
      publishNotifications(mergeVisible(notificationsRef.current, response.data));
    } catch (error) {
      if (lifecycleEpochRef.current === epoch) {
        console.error('Ошибка при загрузке уведомлений:', error);
      }
    } finally {
      if (lifecycleEpochRef.current === epoch) {
        setLoading(false);
      }
    }
  }, [publishNotifications]);

  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    const epoch = lifecycleEpochRef.current;

    try {
      await notificationService.markAsRead(notificationId);

      if (lifecycleEpochRef.current !== epoch) {
        return;
      }

      const current = notificationsRef.current.find(notification => notification.id === notificationId);

      if (current && !current.read_at) {
        unreadRevisionRef.current += 1;
        publishUnreadCount(unreadCountRef.current - 1);
      }

      publishNotifications(notificationsRef.current.map(notification => (
        notification.id === notificationId
          ? { ...notification, read_at: new Date().toISOString() }
          : notification
      )));
    } catch (error) {
      if (lifecycleEpochRef.current === epoch) {
        console.error('Ошибка при отметке уведомления прочитанным:', error);
        toast.error('Не удалось отметить уведомление');
      }
    }
  }, [publishNotifications, publishUnreadCount]);

  const markAllAsRead = useCallback(async (): Promise<void> => {
    const epoch = lifecycleEpochRef.current;
    const startSequence = realtimeSequenceRef.current;
    const ids = new Set(notificationsRef.current.map(notification => notification.id));

    try {
      await notificationService.markAllAsRead();

      if (lifecycleEpochRef.current !== epoch) {
        return;
      }

      const realtimeAfterStart = realtimeUnreadRef.current
        .filter(event => event.sequence > startSequence).length;
      unreadRevisionRef.current += 1;
      publishUnreadCount(realtimeAfterStart);
      publishNotifications(notificationsRef.current.map(notification => (
        ids.has(notification.id)
          ? { ...notification, read_at: new Date().toISOString() }
          : notification
      )));
      toast.success('Все уведомления отмечены прочитанными');
    } catch (error) {
      if (lifecycleEpochRef.current === epoch) {
        console.error('Ошибка при отметке всех уведомлений:', error);
        toast.error('Не удалось отметить все уведомления');
      }
    }
  }, [publishNotifications, publishUnreadCount]);

  const deleteNotification = useCallback(async (notificationId: string): Promise<void> => {
    const epoch = lifecycleEpochRef.current;
    const version = notificationVersionsRef.current.get(notificationId) ?? 0;

    try {
      await notificationService.deleteNotification(notificationId);

      if (lifecycleEpochRef.current !== epoch
        || (notificationVersionsRef.current.get(notificationId) ?? 0) !== version) {
        return;
      }

      const current = notificationsRef.current.find(notification => notification.id === notificationId);

      if (current && !current.read_at) {
        unreadRevisionRef.current += 1;
        publishUnreadCount(unreadCountRef.current - 1);
      }

      rememberNotification(dedupeCacheRef.current, `${notificationId}:lk`);
      publishNotifications(notificationsRef.current.filter(notification => notification.id !== notificationId));
      toast.success('Уведомление удалено');
    } catch (error) {
      if (lifecycleEpochRef.current === epoch) {
        console.error('Ошибка при удалении уведомления:', error);
        toast.error('Не удалось удалить уведомление');
      }
    }
  }, [publishNotifications, publishUnreadCount]);

  const executeAction = useCallback(async (url: string, method: string = 'POST'): Promise<void> => {
    const epoch = lifecycleEpochRef.current;

    try {
      await notificationService.executeAction(url, method);

      if (lifecycleEpochRef.current !== epoch) {
        return;
      }

      toast.success('Действие выполнено успешно');
      await refreshNotifications();
    } catch (error) {
      if (lifecycleEpochRef.current === epoch) {
        console.error('Ошибка при выполнении действия:', error);
        toast.error('Не удалось выполнить действие');
      }
    }
  }, [refreshNotifications]);

  useEffect(() => {
    const epoch = lifecycleEpochRef.current + 1;
    lifecycleEpochRef.current = epoch;
    dedupeCacheRef.current.clear();
    notificationVersionsRef.current.clear();
    realtimeUnreadRef.current = [];
    realtimeSequenceRef.current = 0;
    unreadRevisionRef.current = 0;
    publishNotifications([]);
    publishUnreadCount(0);
    setLoading(false);

    if (!userId || !token) {
      return () => {
        if (lifecycleEpochRef.current === epoch) {
          lifecycleEpochRef.current += 1;
        }
      };
    }

    const channelName = `App.Models.User.${userId}.lk`;
    const bufferedNotifications = new Map<string, Notification>();
    let initializing = true;
    let echo: ReturnType<typeof getEcho> = null;

    const acceptRealtime = (payload: unknown): void => {
      if (lifecycleEpochRef.current !== epoch) {
        return;
      }

      const notification = normalizeRealtimeNotification(payload);

      if (!notification) {
        return;
      }

      const key = `${notification.id}:lk`;
      notificationVersionsRef.current.set(
        notification.id,
        (notificationVersionsRef.current.get(notification.id) ?? 0) + 1,
      );

      if (dedupeCacheRef.current.has(key)) {
        rememberNotification(dedupeCacheRef.current, key);
        return;
      }

      rememberNotification(dedupeCacheRef.current, key);

      if (initializing) {
        bufferedNotifications.set(key, notification);
      }

      if (!notification.read_at) {
        realtimeSequenceRef.current += 1;
        realtimeUnreadRef.current.push({ id: notification.id, sequence: realtimeSequenceRef.current });
        realtimeUnreadRef.current = realtimeUnreadRef.current.slice(-MAX_DEDUPE_NOTIFICATIONS);
        unreadRevisionRef.current += 1;
        publishUnreadCount(unreadCountRef.current + 1);
      }

      publishNotifications(mergeVisible([notification], notificationsRef.current));
      toast.info(`${notification.data.title}: ${notification.data.message}`, {
        position: 'top-right',
        autoClose: 5000,
      });
    };

    try {
      echo = getEcho(userId);

      if (echo) {
        const channel = echo.private(channelName);
        channel.notification(acceptRealtime);
        channel.listen('.notification.new', acceptRealtime);
        channel.error(() => undefined);
      }
    } catch {
      echo = null;
    }

    const initialize = async (): Promise<void> => {
      setLoading(true);
      const [listResult, countResult] = await Promise.allSettled([
        notificationService.getNotifications(1, 5),
        notificationService.getUnreadCount(),
      ]);

      if (lifecycleEpochRef.current !== epoch) {
        return;
      }

      const fetchedIds = new Set<string>();

      if (listResult.status === 'fulfilled') {
        const fetched = listResult.value.data.filter(notification => (
          typeof notification.id === 'string' && notification.id.trim().length > 0
        ));

        fetched.forEach(notification => {
          const id = notification.id.trim();
          fetchedIds.add(id);
          rememberNotification(dedupeCacheRef.current, `${id}:lk`);
        });
        publishNotifications(mergeVisible(notificationsRef.current, fetched));
      }

      if (countResult.status === 'fulfilled') {
        const realtimeOnlyUnread = [...bufferedNotifications.values()].filter(notification => (
          !notification.read_at && !fetchedIds.has(notification.id)
        )).length;
        publishUnreadCount(countResult.value + realtimeOnlyUnread);
      }

      initializing = false;
      setLoading(false);
    };

    void initialize();

    return () => {
      if (lifecycleEpochRef.current === epoch) {
        lifecycleEpochRef.current += 1;
      }

      initializing = false;
      bufferedNotifications.clear();

      try {
        echo?.leave(channelName);
      } catch {
        return;
      }
    };
  }, [publishNotifications, publishUnreadCount, token, userId]);

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    executeAction,
  };
};
