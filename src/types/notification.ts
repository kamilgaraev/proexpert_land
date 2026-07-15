export interface NotificationAction {
  label: string;
  url: string;
  style: 'success' | 'danger' | 'warning' | 'info';
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  confirm?: string;
}

export type NotificationInterface = 'admin' | 'lk' | 'mobile' | 'customer';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface NotificationData {
  title: string;
  message: string;
  icon?: string;
  color?: string;
  interface: NotificationInterface;
  priority?: NotificationPriority;
  contractor?: unknown;
  verification?: unknown;
  actions?: NotificationAction[];
  [key: string]: unknown;
}

export interface Notification {
  id: string;
  type: string;
  interface?: NotificationInterface;
  data: NotificationData;
  read_at: string | null;
  created_at: string;
  priority?: NotificationPriority;
  [key: string]: unknown;
}

export interface NotificationPaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  [key: string]: unknown;
}

export interface NotificationPaginationLinks {
  first?: string | null;
  last?: string | null;
  prev?: string | null;
  next?: string | null;
}

export interface NotificationResponse {
  data: Notification[];
  meta: NotificationPaginationMeta;
  links?: NotificationPaginationLinks;
}

export interface UnreadCountResponse {
  count: number;
}

export type NotificationFilter = 'all' | 'unread' | 'read';
