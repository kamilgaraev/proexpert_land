import axios from 'axios';
import type { NotificationResponse, UnreadCountResponse, NotificationFilter } from '../types/notification';
import { getJsonAuthHeaders } from '../utils/authTokenStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.prohelper.pro';

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
      withCredentials: true,
      headers: getJsonAuthHeaders()
    });

    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await axios.get<UnreadCountResponse>(
      `${API_BASE_URL}/api/v1/landing/notifications/unread-count`,
      {
        withCredentials: true,
      headers: getJsonAuthHeaders()
      }
    );

    return response.data.count;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await axios.patch(
      `${API_BASE_URL}/api/v1/landing/notifications/${notificationId}/read`,
      {},
      {
        withCredentials: true,
      headers: getJsonAuthHeaders()
      }
    );
  },

  markAllAsRead: async (): Promise<void> => {
    await axios.post(
      `${API_BASE_URL}/api/v1/landing/notifications/mark-all-read`,
      {},
      {
        withCredentials: true,
      headers: getJsonAuthHeaders()
      }
    );
  },

  deleteNotification: async (notificationId: string): Promise<void> => {
    await axios.delete(
      `${API_BASE_URL}/api/v1/landing/notifications/${notificationId}`,
      {
        withCredentials: true,
      headers: getJsonAuthHeaders()
      }
    );
  },

  executeAction: async (url: string, method: string = 'POST'): Promise<any> => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
    const response = await axios({
      method: method.toLowerCase(),
      url: fullUrl,
      withCredentials: true,
      headers: getJsonAuthHeaders()
    });

    return response.data;
  }
};

