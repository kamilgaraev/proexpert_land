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
  const listRequestVersionRef = useRef(0);
  const notificationsRef = useRef<Notification[]>([]);
  const unreadCountRef = useRef(0);
  const unreadRevisionRef = useRef(0);
  const mutationRevisionRef = useRef(0);
  const acceptedUnreadTotalRef = useRef(0);
  const notificationVersionsRef = useRef<Map<string, number>>(new Map());
  const dedupeCacheRef = useRef<Map<string, true>>(new Map());
  const activeListBuffersRef = useRef<Map<number, Map<string, Notification>>>(new Map());
  const readOverridesRef = useRef<Map<string, string>>(new Map());
  const deleteTombstonesRef = useRef<Set<string>>(new Set());
  const pendingReadRef = useRef<Map<string, symbol>>(new Map());
  const pendingDeleteRef = useRef<Map<string, symbol>>(new Map());
  const pendingMarkAllRef = useRef<symbol | null>(null);

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
    const requestVersion = listRequestVersionRef.current + 1;
    const mutationRevision = mutationRevisionRef.current;
    const realtimeBuffer = new Map<string, Notification>();
    listRequestVersionRef.current = requestVersion;
    activeListBuffersRef.current.set(requestVersion, realtimeBuffer);
    setLoading(true);

    try {
      const response = await notificationService.getNotifications(1, 5);

      if (lifecycleEpochRef.current !== epoch
        || listRequestVersionRef.current !== requestVersion) {
        return;
      }

      const fetchedIds = new Set<string>();
      const fetched = response.data
        .filter(notification => typeof notification.id === 'string' && notification.id.trim().length > 0)
        .map(notification => ({ ...notification, id: notification.id.trim() }))
        .filter(notification => {
          fetchedIds.add(notification.id);
          rememberNotification(dedupeCacheRef.current, `${notification.id}:lk`);
          return !deleteTombstonesRef.current.has(notification.id);
        })
        .map(notification => {
          const readAt = readOverridesRef.current.get(notification.id);
          return readAt ? { ...notification, read_at: readAt } : notification;
        });

      const realtime = [...realtimeBuffer.values()]
        .filter(notification => !deleteTombstonesRef.current.has(notification.id))
        .reverse();
      publishNotifications(mergeVisible(realtime, fetched));

      const realtimeOnlyUnread = [...realtimeBuffer.values()].filter(notification => (
        !notification.read_at && !fetchedIds.has(notification.id)
      )).length;
      if (mutationRevisionRef.current === mutationRevision) {
        publishUnreadCount(response.meta.unread_count + realtimeOnlyUnread);
      }
    } catch (error) {
      if (lifecycleEpochRef.current === epoch
        && listRequestVersionRef.current === requestVersion) {
        console.error('Ошибка при загрузке уведомлений:', error);
      }
    } finally {
      activeListBuffersRef.current.delete(requestVersion);

      if (lifecycleEpochRef.current === epoch
        && listRequestVersionRef.current === requestVersion) {
        setLoading(false);
      }
    }
  }, [publishNotifications, publishUnreadCount]);

  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    if (pendingReadRef.current.has(notificationId)) {
      return;
    }

    const operation = Symbol(notificationId);
    const epoch = lifecycleEpochRef.current;
    const version = notificationVersionsRef.current.get(notificationId) ?? 0;
    pendingReadRef.current.set(notificationId, operation);

    try {
      await notificationService.markAsRead(notificationId);

      if (lifecycleEpochRef.current !== epoch
        || (notificationVersionsRef.current.get(notificationId) ?? 0) !== version) {
        return;
      }

      const current = notificationsRef.current.find(notification => notification.id === notificationId);
      const readAt = new Date().toISOString();
      mutationRevisionRef.current += 1;
      readOverridesRef.current.set(notificationId, readAt);

      if (current && !current.read_at) {
        unreadRevisionRef.current += 1;
        publishUnreadCount(unreadCountRef.current - 1);
      }

      publishNotifications(notificationsRef.current.map(notification => (
        notification.id === notificationId ? { ...notification, read_at: readAt } : notification
      )));
    } catch (error) {
      if (lifecycleEpochRef.current === epoch) {
        console.error('Ошибка при отметке уведомления прочитанным:', error);
        toast.error('Не удалось отметить уведомление');
      }
    } finally {
      if (pendingReadRef.current.get(notificationId) === operation) {
        pendingReadRef.current.delete(notificationId);
      }
    }
  }, [publishNotifications, publishUnreadCount]);

  const markAllAsRead = useCallback(async (): Promise<void> => {
    if (pendingMarkAllRef.current) {
      return;
    }

    const operation = Symbol('mark-all');
    const epoch = lifecycleEpochRef.current;
    const acceptedUnreadAtStart = acceptedUnreadTotalRef.current;
    const ids = new Set(notificationsRef.current.map(notification => notification.id));
    pendingMarkAllRef.current = operation;

    try {
      await notificationService.markAllAsRead();

      if (lifecycleEpochRef.current !== epoch) {
        return;
      }

      const readAt = new Date().toISOString();
      mutationRevisionRef.current += 1;
      ids.forEach(id => readOverridesRef.current.set(id, readAt));
      unreadRevisionRef.current += 1;
      publishUnreadCount(acceptedUnreadTotalRef.current - acceptedUnreadAtStart);
      publishNotifications(notificationsRef.current.map(notification => (
        ids.has(notification.id) ? { ...notification, read_at: readAt } : notification
      )));
      toast.success('Все уведомления отмечены прочитанными');
    } catch (error) {
      if (lifecycleEpochRef.current === epoch) {
        console.error('Ошибка при отметке всех уведомлений:', error);
        toast.error('Не удалось отметить все уведомления');
      }
    } finally {
      if (pendingMarkAllRef.current === operation) {
        pendingMarkAllRef.current = null;
      }
    }
  }, [publishNotifications, publishUnreadCount]);

  const deleteNotification = useCallback(async (notificationId: string): Promise<void> => {
    if (pendingDeleteRef.current.has(notificationId)) {
      return;
    }

    const operation = Symbol(notificationId);
    const epoch = lifecycleEpochRef.current;
    const version = notificationVersionsRef.current.get(notificationId) ?? 0;
    pendingDeleteRef.current.set(notificationId, operation);

    try {
      await notificationService.deleteNotification(notificationId);

      if (lifecycleEpochRef.current !== epoch
        || (notificationVersionsRef.current.get(notificationId) ?? 0) !== version) {
        return;
      }

      const current = notificationsRef.current.find(notification => notification.id === notificationId);
      mutationRevisionRef.current += 1;

      if (current && !current.read_at) {
        unreadRevisionRef.current += 1;
        publishUnreadCount(unreadCountRef.current - 1);
      }

      deleteTombstonesRef.current.add(notificationId);
      readOverridesRef.current.delete(notificationId);
      rememberNotification(dedupeCacheRef.current, `${notificationId}:lk`);
      publishNotifications(notificationsRef.current.filter(notification => notification.id !== notificationId));
      toast.success('Уведомление удалено');
    } catch (error) {
      if (lifecycleEpochRef.current === epoch) {
        console.error('Ошибка при удалении уведомления:', error);
        toast.error('Не удалось удалить уведомление');
        await refreshNotifications();
      }
    } finally {
      if (pendingDeleteRef.current.get(notificationId) === operation) {
        pendingDeleteRef.current.delete(notificationId);
      }
    }
  }, [publishNotifications, publishUnreadCount, refreshNotifications]);

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
    activeListBuffersRef.current.clear();
    readOverridesRef.current.clear();
    deleteTombstonesRef.current.clear();
    pendingReadRef.current.clear();
    pendingDeleteRef.current.clear();
    pendingMarkAllRef.current = null;
    acceptedUnreadTotalRef.current = 0;
    unreadRevisionRef.current = 0;
    mutationRevisionRef.current = 0;
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
      activeListBuffersRef.current.forEach(buffer => buffer.set(key, notification));

      if (!notification.read_at) {
        acceptedUnreadTotalRef.current += 1;
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
    }

    void refreshNotifications();

    return () => {
      if (lifecycleEpochRef.current === epoch) {
        lifecycleEpochRef.current += 1;
      }

      activeListBuffersRef.current.clear();

      try {
        echo?.leave(channelName);
      } catch {
        return;
      }
    };
  }, [publishNotifications, publishUnreadCount, refreshNotifications, token, userId]);

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
