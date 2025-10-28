import { useState, useEffect, useCallback, useRef } from 'react';
import echo from '../services/echo';
import { notificationService } from '../services/notificationService';
import type { Notification } from '../types/notification';
import { toast } from 'react-toastify';

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  executeAction: (url: string, method: string) => Promise<void>;
}

export const useNotifications = (userId: string | null): UseNotificationsReturn => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const channelRef = useRef<any>(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Ошибка при загрузке счетчика непрочитанных:', error);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await notificationService.getNotifications(1, 5);
      setNotifications(response.data);
    } catch (error) {
      console.error('Ошибка при загрузке уведомлений:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, read_at: new Date().toISOString() } 
            : n
        )
      );
    } catch (error) {
      console.error('Ошибка при отметке уведомления прочитанным:', error);
      toast.error('Не удалось отметить уведомление');
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      
      setNotifications(prev => 
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      
      toast.success('Все уведомления отмечены прочитанными');
    } catch (error) {
      console.error('Ошибка при отметке всех уведомлений:', error);
      toast.error('Не удалось отметить все уведомления');
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.read_at) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      toast.success('Уведомление удалено');
    } catch (error) {
      console.error('Ошибка при удалении уведомления:', error);
      toast.error('Не удалось удалить уведомление');
    }
  }, [notifications]);

  const executeAction = useCallback(async (url: string, method: string = 'POST') => {
    try {
      await notificationService.executeAction(url, method);
      toast.success('Действие выполнено успешно');
      await refreshNotifications();
    } catch (error) {
      console.error('Ошибка при выполнении действия:', error);
      toast.error('Не удалось выполнить действие');
    }
  }, [refreshNotifications]);

  useEffect(() => {
    if (!userId) return;

    refreshUnreadCount();
    refreshNotifications();

    try {
      channelRef.current = echo.private(`App.Models.User.${userId}`);
      
      channelRef.current.notification((notification: Notification) => {
        console.log('Новое уведомление:', notification);
        
        if (notification.data?.interface === 'lk') {
          setUnreadCount(prev => prev + 1);
          setNotifications(prev => [notification, ...prev.slice(0, 4)]);
          
          toast.info(`${notification.data.title}: ${notification.data.message}`, {
            position: 'top-right',
            autoClose: 5000
          });
        }
      });
    } catch (error) {
      console.error('Ошибка при подключении к WebSocket:', error);
    }

    return () => {
      if (channelRef.current) {
        echo.leave(`App.Models.User.${userId}`);
        channelRef.current = null;
      }
    };
  }, [userId, refreshNotifications, refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    refreshNotifications,
    refreshUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    executeAction
  };
};

