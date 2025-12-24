import axios from 'axios';
import type { NotificationResponse, UnreadCountResponse, NotificationFilter } from '../types/notification';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.prohelper.pro';

const getAuthToken = () => {
  // SSR-safe: проверяем window перед доступом
  if (typeof window === 'undefined') {
    return '';
  }
  return localStorage.getItem('token') || 
         sessionStorage.getItem('authToken') || 
         '';
};

export const notificationService = {
  getNotifications: async (
    page: number = 1,
    perPage: number = 15,
    filter: NotificationFilter = 'all'
  ): Promise<NotificationResponse> => {
    const params: any = { page, per_page: perPage };
    
    if (filter !== 'all') {
      params.filter = filter;
    }

    const response = await axios.get<NotificationResponse>(`${API_BASE_URL}/api/v1/landing/notifications`, {
      params,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'application/json',
      }
    });

    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await axios.get<UnreadCountResponse>(
      `${API_BASE_URL}/api/v1/landing/notifications/unread-count`,
      {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Accept': 'application/json',
        }
      }
    );

    return response.data.count;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await axios.patch(
      `${API_BASE_URL}/api/v1/landing/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Accept': 'application/json',
        }
      }
    );
  },

  markAllAsRead: async (): Promise<void> => {
    await axios.post(
      `${API_BASE_URL}/api/v1/landing/notifications/mark-all-read`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Accept': 'application/json',
        }
      }
    );
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await axios.delete(
      `${API_BASE_URL}/api/v1/landing/notifications/${notificationId}`,
      {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Accept': 'application/json',
        }
      }
    );
  },

  executeAction: async (url: string, method: string = 'POST'): Promise<any> => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    const response = await axios({
      method: method.toLowerCase(),
      url: fullUrl,
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Accept': 'application/json',
      }
    });

    return response.data;
  }
};

