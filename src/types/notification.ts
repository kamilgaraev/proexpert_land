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
  sequence: number;
  organization_id?: number | null;
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
  unread_count: number;
  unread_by_category: Record<string, number>;
  unread_by_notification_type: Record<string, number>;
  unread_by_type: Record<string, number>;
  snapshot_sequence: number;
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
  snapshot_sequence: number;
  by_category?: Record<string, number>;
  by_notification_type?: Record<string, number>;
  by_type?: Record<string, number>;
}

export interface MarkAllAsReadResponse {
  count: number;
  sequence_cut: number;
}

export type NotificationFilter = 'all' | 'unread' | 'read';
