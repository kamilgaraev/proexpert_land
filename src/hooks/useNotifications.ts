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
const MAX_REALTIME_BUFFER = 200;
const MAX_LOCAL_METADATA = 200;

interface ActiveMarkAllBuffer {
  items: Map<number, Notification>;
  overflowCount: number;
  overflowMinSequence: number | null;
  overflowMaxSequence: number | null;
}

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

const trimMap = <T,>(map: Map<string, T>, protectedKeys: Set<string>): void => {
  for (const key of map.keys()) {
    if (map.size <= MAX_LOCAL_METADATA) {
      break;
    }
    if (!protectedKeys.has(key)) {
      map.delete(key);
    }
  }
};

const trimSet = (set: Set<string>, protectedKeys: Set<string>): void => {
  for (const key of set) {
    if (set.size <= MAX_LOCAL_METADATA) {
      break;
    }
    if (!protectedKeys.has(key)) {
      set.delete(key);
    }
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

const isSafePositiveInteger = (value: unknown): value is number => (
  typeof value === 'number' && Number.isSafeInteger(value) && value > 0
);

const normalizeRealtimeNotification = (payload: unknown): Notification | null => {
  const source = parseObject(payload);

  if (!source
    || source.interface !== 'lk'
    || typeof source.id !== 'string'
    || !isSafePositiveInteger(source.sequence)) {
    return null;
  }

  const id = source.id.trim();
  const data = parseObject(source.data);

  if (!id || !data) {
    return null;
  }

  const organizationId = source.organization_id;
  if (organizationId !== undefined
    && organizationId !== null
    && !isSafePositiveInteger(organizationId)) {
    return null;
  }

  return {
    ...source,
    id,
    sequence: source.sequence,
    organization_id: organizationId ?? null,
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
  organizationId: number | null = null,
): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const lifecycleEpochRef = useRef(0);
  const listRequestVersionRef = useRef(0);
  const snapshotRequestVersionRef = useRef(0);
  const lastAppliedSnapshotSequenceRef = useRef(-1);
  const lastAppliedSnapshotRequestVersionRef = useRef(0);
  const lastAppliedListSequenceRef = useRef(-1);
  const lastAppliedListRequestVersionRef = useRef(0);
  const notificationsRef = useRef<Notification[]>([]);
  const unreadCountRef = useRef(0);
  const unreadRevisionRef = useRef(0);
  const mutationRevisionRef = useRef(0);
  const countRequestVersionRef = useRef(0);
  const notificationVersionsRef = useRef<Map<string, number>>(new Map());
  const dedupeCacheRef = useRef<Map<string, true>>(new Map());
  const activeListBuffersRef = useRef<Map<number, Map<string, Notification>>>(new Map());
  const activeCountBuffersRef = useRef<Map<number, Map<string, Notification>>>(new Map());
  const listAbortControllerRef = useRef<AbortController | null>(null);
  const countAbortControllerRef = useRef<AbortController | null>(null);
  const overflowRefreshScheduledRef = useRef(false);
  const activeMarkAllBufferRef = useRef<ActiveMarkAllBuffer | null>(null);
  const knownNotificationsRef = useRef<Map<string, Notification>>(new Map());
  const readOverridesRef = useRef<Map<string, string>>(new Map());
  const deleteTombstonesRef = useRef<Set<string>>(new Set());
  const pendingReadRef = useRef<Map<string, symbol>>(new Map());
  const pendingDeleteRef = useRef<Map<string, symbol>>(new Map());
  const pendingMarkAllRef = useRef<symbol | null>(null);
  const markAllSequenceCutRef = useRef(0);
  const markAllReadAtRef = useRef<string | null>(null);

  const publishNotifications = useCallback((next: Notification[]): void => {
    notificationsRef.current = next;
    setNotifications(next);
  }, []);

  const publishUnreadCount = useCallback((next: number): void => {
    unreadCountRef.current = Math.max(0, next);
    setUnreadCount(unreadCountRef.current);
  }, []);

  const applyLocalState = useCallback((notification: Notification): Notification | null => {
    if (deleteTombstonesRef.current.has(notification.id)) {
      return null;
    }

    const readAt = readOverridesRef.current.get(notification.id)
      ?? (notification.sequence <= markAllSequenceCutRef.current ? markAllReadAtRef.current : null);
    return readAt && !notification.read_at ? { ...notification, read_at: readAt } : notification;
  }, []);

  const canPublishUnread = useCallback((sequence: number, requestVersion: number): boolean => {
    if (sequence < lastAppliedSnapshotSequenceRef.current
      || (sequence === lastAppliedSnapshotSequenceRef.current
        && requestVersion < lastAppliedSnapshotRequestVersionRef.current)) {
      return false;
    }

    lastAppliedSnapshotSequenceRef.current = sequence;
    lastAppliedSnapshotRequestVersionRef.current = requestVersion;
    return true;
  }, []);

  const canApplyListContent = useCallback((sequence: number, requestVersion: number): boolean => {
    if (sequence < lastAppliedSnapshotSequenceRef.current
      || sequence < lastAppliedListSequenceRef.current
      || (sequence === lastAppliedListSequenceRef.current
        && requestVersion < lastAppliedListRequestVersionRef.current)) {
      return false;
    }

    lastAppliedListSequenceRef.current = sequence;
    lastAppliedListRequestVersionRef.current = requestVersion;
    return true;
  }, []);

  const refreshUnreadCount = useCallback(async (): Promise<void> => {
    const epoch = lifecycleEpochRef.current;
    const snapshotRequestVersion = snapshotRequestVersionRef.current + 1;
    const requestVersion = countRequestVersionRef.current + 1;
    const mutationRevision = mutationRevisionRef.current;
    const unreadRevision = unreadRevisionRef.current;
    const realtimeBuffer = new Map<string, Notification>();
    const controller = new AbortController();
    snapshotRequestVersionRef.current = snapshotRequestVersion;
    countRequestVersionRef.current = requestVersion;
    countAbortControllerRef.current?.abort();
    countAbortControllerRef.current = controller;
    activeCountBuffersRef.current.clear();
    activeCountBuffersRef.current.set(requestVersion, realtimeBuffer);

    try {
      const response = await notificationService.getUnreadCount(controller.signal);

      const bufferedUnreadChanges = [...realtimeBuffer.values()].filter(notification => (
        !applyLocalState(notification)?.read_at
      )).length;
      if (lifecycleEpochRef.current === epoch
        && !controller.signal.aborted
        && mutationRevisionRef.current === mutationRevision
        && unreadRevisionRef.current === unreadRevision + bufferedUnreadChanges
        && canPublishUnread(response.snapshot_sequence, snapshotRequestVersion)) {
        const realtimeUnread = [...realtimeBuffer.values()].filter(notification => (
          notification.sequence > response.snapshot_sequence && !applyLocalState(notification)?.read_at
        )).length;
        publishUnreadCount(response.count + realtimeUnread);
      }
    } catch (error) {
      if (lifecycleEpochRef.current === epoch && !controller.signal.aborted) {
        console.error('Ошибка при загрузке счётчика уведомлений:', error);
      }
    } finally {
      activeCountBuffersRef.current.delete(requestVersion);
      if (countAbortControllerRef.current === controller) {
        countAbortControllerRef.current = null;
      }
    }
  }, [applyLocalState, canPublishUnread, publishUnreadCount]);

  const refreshNotifications = useCallback(async (): Promise<void> => {
    const epoch = lifecycleEpochRef.current;
    const snapshotRequestVersion = snapshotRequestVersionRef.current + 1;
    const requestVersion = listRequestVersionRef.current + 1;
    const mutationRevision = mutationRevisionRef.current;
    const unreadRevision = unreadRevisionRef.current;
    const realtimeBuffer = new Map<string, Notification>();
    const controller = new AbortController();
    snapshotRequestVersionRef.current = snapshotRequestVersion;
    listRequestVersionRef.current = requestVersion;
    listAbortControllerRef.current?.abort();
    listAbortControllerRef.current = controller;
    activeListBuffersRef.current.clear();
    activeListBuffersRef.current.set(requestVersion, realtimeBuffer);
    setLoading(true);

    try {
      const response = await notificationService.getNotifications(
        1,
        5,
        'all',
        organizationId,
        controller.signal,
      );

      const bufferedUnreadChanges = [...realtimeBuffer.values()].filter(notification => (
        !applyLocalState(notification)?.read_at
      )).length;
      if (lifecycleEpochRef.current !== epoch
        || controller.signal.aborted
        || mutationRevisionRef.current !== mutationRevision
        || unreadRevisionRef.current !== unreadRevision + bufferedUnreadChanges
        || !canApplyListContent(response.meta.snapshot_sequence, requestVersion)) {
        return;
      }

      response.data.forEach(notification => knownNotificationsRef.current.set(notification.id, notification));

      const fetched = response.data
        .filter(notification => typeof notification.id === 'string' && notification.id.trim().length > 0)
        .map(notification => ({ ...notification, id: notification.id.trim() }))
        .filter(notification => {
          rememberNotification(dedupeCacheRef.current, `${notification.id}:lk`);
          return true;
        })
        .map(applyLocalState)
        .filter((notification): notification is Notification => notification !== null);

      const realtime = [...realtimeBuffer.values()]
        .filter(notification => notification.sequence > response.meta.snapshot_sequence)
        .map(applyLocalState)
        .filter((notification): notification is Notification => notification !== null)
        .reverse();
      const nextNotifications = mergeVisible(realtime, fetched);
      publishNotifications(nextNotifications);

      const realtimeOnlyUnread = [...realtimeBuffer.values()].filter(notification => (
        notification.sequence > response.meta.snapshot_sequence && !applyLocalState(notification)?.read_at
      )).length;
      countRequestVersionRef.current += 1;
      if (canPublishUnread(response.meta.snapshot_sequence, snapshotRequestVersion)) {
        publishUnreadCount(response.meta.unread_count + realtimeOnlyUnread);
      }
      const protectedIds = new Set([
        ...response.data.map(notification => notification.id),
        ...nextNotifications.map(notification => notification.id),
        ...pendingReadRef.current.keys(),
        ...pendingDeleteRef.current.keys(),
      ]);
      for (const key of knownNotificationsRef.current.keys()) {
        if (!protectedIds.has(key)) {
          knownNotificationsRef.current.delete(key);
        }
      }
      for (const key of notificationVersionsRef.current.keys()) {
        if (!protectedIds.has(key)) {
          notificationVersionsRef.current.delete(key);
        }
      }
      response.data.forEach(notification => {
        if (notification.read_at) {
          readOverridesRef.current.delete(notification.id);
        }
      });
      trimMap(readOverridesRef.current, new Set(pendingReadRef.current.keys()));
      if (readOverridesRef.current.size > MAX_LOCAL_METADATA) {
        void refreshNotifications();
      }
      for (const key of deleteTombstonesRef.current) {
        if (!pendingDeleteRef.current.has(key)) {
          deleteTombstonesRef.current.delete(key);
        }
      }
    } catch (error) {
      if (lifecycleEpochRef.current === epoch && !controller.signal.aborted) {
        console.error('Ошибка при загрузке уведомлений:', error);
      }
    } finally {
      activeListBuffersRef.current.delete(requestVersion);
      if (listAbortControllerRef.current === controller) {
        listAbortControllerRef.current = null;
      }

      if (lifecycleEpochRef.current === epoch
        && listRequestVersionRef.current === requestVersion) {
        setLoading(false);
      }
    }
  }, [applyLocalState, canApplyListContent, canPublishUnread, organizationId, publishNotifications, publishUnreadCount]);

  const markAsRead = useCallback(async (notificationId: string): Promise<void> => {
    if (pendingReadRef.current.has(notificationId)) {
      return;
    }

    const operation = Symbol(notificationId);
    const epoch = lifecycleEpochRef.current;
    const version = notificationVersionsRef.current.get(notificationId) ?? 0;
    const targetAtStart = knownNotificationsRef.current.get(notificationId)
      ?? notificationsRef.current.find(notification => notification.id === notificationId);
    pendingReadRef.current.set(notificationId, operation);

    try {
      await notificationService.markAsRead(notificationId);

      if (lifecycleEpochRef.current !== epoch
        || (notificationVersionsRef.current.get(notificationId) ?? 0) !== version) {
        return;
      }

      const readAt = new Date().toISOString();
      mutationRevisionRef.current += 1;
      readOverridesRef.current.set(notificationId, readAt);

      if (targetAtStart && !targetAtStart.read_at) {
        unreadRevisionRef.current += 1;
        publishUnreadCount(unreadCountRef.current - 1);
      }
      if (targetAtStart) {
        activeMarkAllBufferRef.current?.items.delete(targetAtStart.sequence);
        knownNotificationsRef.current.set(notificationId, {
          ...targetAtStart,
          read_at: readAt,
        });
      }
      trimMap(readOverridesRef.current, new Set(pendingReadRef.current.keys()));

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
      const protectedIds = new Set([
        ...pendingReadRef.current.keys(),
        ...pendingDeleteRef.current.keys(),
        ...notificationsRef.current.map(notification => notification.id),
      ]);
      trimMap(notificationVersionsRef.current, protectedIds);
      trimMap(knownNotificationsRef.current, protectedIds);
      trimMap(readOverridesRef.current, new Set(pendingReadRef.current.keys()));
    }
  }, [publishNotifications, publishUnreadCount, refreshNotifications]);

  const markAllAsRead = useCallback(async (): Promise<void> => {
    if (pendingMarkAllRef.current) {
      return;
    }

    const operation = Symbol('mark-all');
    const epoch = lifecycleEpochRef.current;
    const realtimeBuffer: ActiveMarkAllBuffer = {
      items: new Map<number, Notification>(),
      overflowCount: 0,
      overflowMinSequence: null,
      overflowMaxSequence: null,
    };
    const preOperationCandidates = new Map<number, Notification>();
    activeListBuffersRef.current.forEach(buffer => {
      buffer.forEach(notification => preOperationCandidates.set(notification.sequence, notification));
    });
    notificationsRef.current.forEach(notification => (
      preOperationCandidates.set(notification.sequence, notification)
    ));
    activeMarkAllBufferRef.current = realtimeBuffer;
    pendingMarkAllRef.current = operation;

    try {
      const response = await notificationService.markAllAsRead();

      if (lifecycleEpochRef.current !== epoch) {
        return;
      }

      const readAt = new Date().toISOString();
      mutationRevisionRef.current += 1;
      markAllSequenceCutRef.current = Math.max(markAllSequenceCutRef.current, response.sequence_cut);
      markAllReadAtRef.current = readAt;
      notificationsRef.current.forEach(notification => {
        if (notification.sequence <= markAllSequenceCutRef.current) {
          readOverridesRef.current.set(notification.id, readAt);
        }
      });
      knownNotificationsRef.current.forEach((notification, id) => {
        if (notification.sequence <= markAllSequenceCutRef.current) {
          knownNotificationsRef.current.set(id, { ...notification, read_at: readAt });
        }
      });
      realtimeBuffer.items.forEach(notification => (
        preOperationCandidates.set(notification.sequence, notification)
      ));
      let overflowUnread: number | null = 0;
      if (realtimeBuffer.overflowCount > 0) {
        if ((realtimeBuffer.overflowMinSequence ?? 0) > markAllSequenceCutRef.current) {
          overflowUnread = realtimeBuffer.overflowCount;
        } else if ((realtimeBuffer.overflowMaxSequence ?? 0) > markAllSequenceCutRef.current) {
          overflowUnread = null;
        }
      }
      unreadRevisionRef.current += 1;
      if (overflowUnread !== null) {
        publishUnreadCount(overflowUnread + [...preOperationCandidates.values()].filter(notification => (
          notification.sequence > markAllSequenceCutRef.current && !applyLocalState(notification)?.read_at
        )).length);
      }
      publishNotifications(notificationsRef.current
        .map(applyLocalState)
        .filter((notification): notification is Notification => notification !== null));
      toast.success('Все уведомления отмечены прочитанными');
    } catch (error) {
      if (lifecycleEpochRef.current === epoch) {
        console.error('Ошибка при отметке всех уведомлений:', error);
        toast.error('Не удалось отметить все уведомления');
      }
    } finally {
      if (pendingMarkAllRef.current === operation) {
        pendingMarkAllRef.current = null;
        activeMarkAllBufferRef.current = null;
        if (realtimeBuffer.overflowCount > 0) {
          void refreshNotifications();
        }
      }
    }
  }, [applyLocalState, publishNotifications, publishUnreadCount, refreshNotifications]);

  const deleteNotification = useCallback(async (notificationId: string): Promise<void> => {
    if (pendingDeleteRef.current.has(notificationId)) {
      return;
    }

    const operation = Symbol(notificationId);
    const epoch = lifecycleEpochRef.current;
    const version = notificationVersionsRef.current.get(notificationId) ?? 0;
    const targetAtStart = knownNotificationsRef.current.get(notificationId)
      ?? notificationsRef.current.find(notification => notification.id === notificationId);
    pendingDeleteRef.current.set(notificationId, operation);

    try {
      await notificationService.deleteNotification(notificationId);

      if (lifecycleEpochRef.current !== epoch
        || (notificationVersionsRef.current.get(notificationId) ?? 0) !== version) {
        return;
      }

      mutationRevisionRef.current += 1;

      if (targetAtStart && !targetAtStart.read_at) {
        unreadRevisionRef.current += 1;
        publishUnreadCount(unreadCountRef.current - 1);
      }
      if (targetAtStart) {
        activeMarkAllBufferRef.current?.items.delete(targetAtStart.sequence);
      }

      deleteTombstonesRef.current.add(notificationId);
      readOverridesRef.current.delete(notificationId);
      knownNotificationsRef.current.delete(notificationId);
      if (deleteTombstonesRef.current.size > MAX_LOCAL_METADATA) {
        void refreshNotifications();
      }
      trimSet(deleteTombstonesRef.current, new Set(pendingDeleteRef.current.keys()));
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
      const protectedIds = new Set([
        ...pendingReadRef.current.keys(),
        ...pendingDeleteRef.current.keys(),
        ...notificationsRef.current.map(notification => notification.id),
      ]);
      trimMap(notificationVersionsRef.current, protectedIds);
      trimMap(knownNotificationsRef.current, protectedIds);
      trimSet(deleteTombstonesRef.current, new Set(pendingDeleteRef.current.keys()));
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
    knownNotificationsRef.current.clear();
    listAbortControllerRef.current?.abort();
    countAbortControllerRef.current?.abort();
    listAbortControllerRef.current = null;
    countAbortControllerRef.current = null;
    activeListBuffersRef.current.clear();
    activeCountBuffersRef.current.clear();
    activeMarkAllBufferRef.current = null;
    readOverridesRef.current.clear();
    deleteTombstonesRef.current.clear();
    pendingReadRef.current.clear();
    pendingDeleteRef.current.clear();
    pendingMarkAllRef.current = null;
    markAllSequenceCutRef.current = 0;
    markAllReadAtRef.current = null;
    lastAppliedSnapshotSequenceRef.current = -1;
    lastAppliedSnapshotRequestVersionRef.current = 0;
    lastAppliedListSequenceRef.current = -1;
    lastAppliedListRequestVersionRef.current = 0;
    overflowRefreshScheduledRef.current = false;
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

    const channelNames = [
      `App.Models.User.${userId}.lk.global`,
      ...(isSafePositiveInteger(organizationId)
        ? [`App.Models.User.${userId}.lk.org.${organizationId}`]
        : []),
    ];
    let echo: ReturnType<typeof getEcho> = null;

    const acceptRealtime = (payload: unknown, expectedOrganizationId: number | null): void => {
      if (lifecycleEpochRef.current !== epoch) {
        return;
      }

      const notification = normalizeRealtimeNotification(payload);

      if (!notification) {
        return;
      }

      if (notification.organization_id !== expectedOrganizationId) {
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
      knownNotificationsRef.current.set(notification.id, notification);
      const protectedIds = new Set([
        ...pendingReadRef.current.keys(),
        ...pendingDeleteRef.current.keys(),
        ...notificationsRef.current.map(item => item.id),
      ]);
      trimMap(knownNotificationsRef.current, protectedIds);
      trimMap(notificationVersionsRef.current, protectedIds);
      let overflowed = false;
      const addToBuffer = (buffer: Map<string, Notification>): void => {
        if (!buffer.has(key) && buffer.size >= MAX_REALTIME_BUFFER) {
          overflowed = true;
          return;
        }
        buffer.set(key, notification);
      };
      activeListBuffersRef.current.forEach(addToBuffer);
      activeCountBuffersRef.current.forEach(addToBuffer);
      if (overflowed && !overflowRefreshScheduledRef.current) {
        overflowRefreshScheduledRef.current = true;
        listAbortControllerRef.current?.abort();
        countAbortControllerRef.current?.abort();
        activeListBuffersRef.current.clear();
        activeCountBuffersRef.current.clear();
        queueMicrotask(() => {
          overflowRefreshScheduledRef.current = false;
          if (lifecycleEpochRef.current === epoch) {
            void refreshNotifications();
          }
        });
      }
      const locallyApplied = applyLocalState(notification);
      if (locallyApplied && !locallyApplied.read_at) {
        const markAllBuffer = activeMarkAllBufferRef.current;
        if (markAllBuffer) {
          if (markAllBuffer.items.size < MAX_REALTIME_BUFFER) {
            markAllBuffer.items.set(notification.sequence, locallyApplied);
          } else if (!markAllBuffer.items.has(notification.sequence)) {
            markAllBuffer.overflowCount += 1;
            markAllBuffer.overflowMinSequence = Math.min(
              markAllBuffer.overflowMinSequence ?? notification.sequence,
              notification.sequence,
            );
            markAllBuffer.overflowMaxSequence = Math.max(
              markAllBuffer.overflowMaxSequence ?? notification.sequence,
              notification.sequence,
            );
          }
        }
        unreadRevisionRef.current += 1;
        publishUnreadCount(unreadCountRef.current + 1);
      }

      if (locallyApplied) {
        publishNotifications(mergeVisible([locallyApplied], notificationsRef.current));
      }
      toast.info(`${notification.data.title}: ${notification.data.message}`, {
        position: 'top-right',
        autoClose: 5000,
      });
    };

    const leaveChannels = (): void => {
      channelNames.forEach(channelName => {
        try {
          echo?.leave(channelName);
        } catch {
        }
      });
    };

    try {
      echo = getEcho(userId);

      if (echo) {
        channelNames.forEach((channelName, index) => {
          const expectedOrganizationId = index === 0 ? null : organizationId;
          const handler = (payload: unknown): void => acceptRealtime(payload, expectedOrganizationId);
          const channel = echo!.private(channelName);
          channel.notification(handler);
          channel.listen('.notification.new', handler);
          channel.error(() => undefined);
        });
      }
    } catch {
      leaveChannels();
    }

    void refreshNotifications();

    return () => {
      if (lifecycleEpochRef.current === epoch) {
        lifecycleEpochRef.current += 1;
      }

      activeListBuffersRef.current.clear();
      activeCountBuffersRef.current.clear();
      listAbortControllerRef.current?.abort();
      countAbortControllerRef.current?.abort();
      leaveChannels();
    };
  }, [applyLocalState, organizationId, publishNotifications, publishUnreadCount, refreshNotifications, token, userId]);

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
