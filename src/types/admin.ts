export interface AdminPanelUserRole {
  id: number;
  name: string;
  slug: string;
}

export interface AdminPanelUser {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  roles?: AdminPanelUserRole[];
  role_slug: string | null;
  email_verified_at: string | null;
  created_at: string; 
}

export interface AdminFormData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role_slug: string;
  is_active?: boolean; 
}

export interface AdminUsersListResponse {
  success: boolean;
  message?: string;
  data: AdminPanelUser[];
  // TODO: Добавить поля для пагинации, если API их возвращает
}

export interface AdminUserDetailResponse {
  success: boolean;
  message?: string;
  data: AdminPanelUser;
  errors?: { [key: string]: string[] };
}

export interface AdminUserDeleteResponse {
    success: boolean;
    message?: string;
    errors?: { [key: string]: string[] };
}

// Список доступных системных ролей для выбора в форме
// Это можно будет загружать с API, если будет такой эндпоинт,
// или оставить как константу, если список фиксирован.
export const SYSTEM_ROLES = [
  { slug: 'super_admin', name: 'Главный администратор' },
  { slug: 'admin', name: 'Администратор' },
  { slug: 'content_admin', name: 'Администратор контента' },
  { slug: 'support_admin', name: 'Администратор поддержки' },
]; 