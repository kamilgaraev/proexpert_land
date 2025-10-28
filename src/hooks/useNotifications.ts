import { useState, useEffect, useCallback, useRef } from 'react';
import getEcho from '../services/echo';
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
  const [loading, setLoading] = useState<boolean>(false);
  const channelRef = useRef<any>(null);

  const refreshUnreadCount = useCallback(async () => {
    try {
      console.log('📊 Загружаем счетчик непрочитанных...');
      const count = await notificationService.getUnreadCount();
      console.log('✅ Счетчик загружен:', count);
      setUnreadCount(count);
    } catch (error) {
      console.error('❌ Ошибка при загрузке счетчика (игнорируем):', error);
      setUnreadCount(0);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    try {
      console.log('📋 Загружаем уведомления...');
      setLoading(true);
      const response = await notificationService.getNotifications(1, 5);
      console.log('✅ Уведомления загружены:', response);
      setNotifications(response.data);
    } catch (error) {
      console.error('❌ Ошибка при загрузке уведомлений:', error);
      setNotifications([]);
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
    refreshUnreadCount();
    refreshNotifications();
  }, []);

  useEffect(() => {
    if (!userId) {
      console.log('⏳ Ожидание загрузки userId для WebSocket...');
      return;
    }

    console.log('🔌 Подключение к WebSocket для userId:', userId);

    const echo = getEcho();
    
    if (!echo) {
      console.warn('⚠️ Echo не инициализирован (нет токена)');
      return;
    }

    try {
      const channel = echo.private(`App.Models.User.${userId}.lk`)
        .error((error: any) => {
          console.warn('⚠️ WebSocket авторизация не удалась (работаем без realtime):', error);
        })
        .listen('notification.new', (eventData: any) => {
          console.log('🔔 Получено событие notification.new RAW:', eventData);
          
          let e = eventData;
          if (typeof eventData === 'string') {
            try {
              e = JSON.parse(eventData);
              console.log('📦 Распарсили JSON:', e);
            } catch (error) {
              console.error('❌ Ошибка парсинга JSON:', error);
              return;
            }
          }
          
          console.log('🔍 Финальная структура данных:', e);
          
          if (e?.data?.interface === 'lk') {
            const notification: Notification = {
              id: e.id || Math.random().toString(),
              type: e.type || 'notification',
              data: e.data,
              read_at: e.read_at || null,
              created_at: e.created_at || new Date().toISOString()
            };
            
            console.log('✅ Добавляем уведомление в список:', notification);
            
            setUnreadCount(prev => prev + 1);
            setNotifications(prev => [notification, ...prev.slice(0, 4)]);
            
            toast.info(`${e.data.title}: ${e.data.message}`, {
              position: 'top-right',
              autoClose: 5000
            });
          } else {
            console.log('⏭️ Пропускаем уведомление, interface:', e?.data?.interface);
          }
        });
      
      channelRef.current = channel;
    } catch (error) {
      console.warn('⚠️ WebSocket недоступен (работаем без realtime):', error);
    }

    return () => {
      if (channelRef.current && userId && echo) {
        console.log('🔌 Отключение от WebSocket для userId:', userId);
        try {
          echo.leave(`App.Models.User.${userId}.lk`);
        } catch (e) {
          console.warn('Ошибка при отключении WebSocket:', e);
        }
        channelRef.current = null;
      }
    };
  }, [userId]);

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

