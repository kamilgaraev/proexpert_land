// Типы для системы разрешений ProHelper

export interface PermissionsData {
  user_id: number;
  organization_id: number | null;
  permissions_flat: string[];
  roles: string[];
  interfaces: string[];
  active_modules: string[];
}

export interface PermissionsResponse {
  success: boolean;
  data: PermissionsData;
  message?: string;
}

export interface CheckPermissionRequest {
  permission: string;
  context?: {
    project_id?: number;
    organization_id?: number;
    [key: string]: any;
  };
  interface?: 'lk' | 'admin' | 'mobile';
}

export interface CheckPermissionResponse {
  success: boolean;
  data: {
    has_permission: boolean;
    reason?: string;
  };
  message?: string;
}

export interface CanAccessOptions {
  permission?: string;
  role?: string;
  module?: string;
  interface?: 'lk' | 'admin' | 'mobile';
  requireAll?: boolean; // true = AND логика, false = OR логика
}

// Основные роли системы
export type SystemRole = 
  | 'organization_owner'
  | 'organization_admin' 
  | 'accountant'
  | 'viewer'
  | 'project_manager'
  | 'foreman'
  | 'worker'
  | 'contractor'
  | 'super_admin'
  | 'system_admin'
  | 'support';

// Интерфейсы доступа  
export type AccessInterface = 'lk' | 'admin' | 'mobile';

// Системные права
export type SystemPermission = 
  | 'billing.manage'
  | 'billing.view'
  | 'users.manage'
  | 'users.manage_admin'
  | 'users.invite'
  | 'organization.manage'
  | 'organization.view'
  | 'modules.manage'
  | 'modules.billing'
  | 'multi_organization.manage'
  | 'roles.create_custom'
  | 'roles.manage_custom'
  | 'admin.access'
  | 'profile.view'
  | 'profile.edit';

// Модульные права
export type ModulePermission = 
  | 'projects.view'
  | 'projects.create'
  | 'projects.edit'
  | 'projects.delete'
  | 'projects.*'
  | 'materials.view'
  | 'materials.create'
  | 'materials.edit'
  | 'materials.manage_costs'
  | 'reports.view'
  | 'reports.create'
  | 'reports.export'
  | 'finance.view'
  | 'finance.manage'
  | 'finance.approve_payments'
  | 'personnel.view'
  | 'personnel.manage'
  | 'personnel.assign_tasks';

// Объединенный тип прав
export type Permission = SystemPermission | ModulePermission | string;

// Модули системы
export type ActiveModule = 
  | 'projects'
  | 'materials'
  | 'reports'
  | 'finance'
  | 'personnel'
  | 'multi_organization'
  | string;
