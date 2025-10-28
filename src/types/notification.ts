export interface NotificationAction {
  label: string;
  url: string;
  style: 'success' | 'danger' | 'warning' | 'info';
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  confirm?: string;
}

export interface NotificationData {
  title: string;
  message: string;
  icon?: string;
  color?: string;
  interface: 'lk' | 'admin';
  priority?: 'low' | 'normal' | 'high' | 'critical';
  contractor?: any;
  verification?: any;
  actions?: NotificationAction[];
}

export interface Notification {
  id: string;
  type: string;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface NotificationResponse {
  data: Notification[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

export type NotificationFilter = 'all' | 'unread' | 'read';

