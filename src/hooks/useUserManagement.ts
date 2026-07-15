import { useState, useCallback, useEffect } from 'react';
import {
  userManagementService,
  customRolesService,
  CreateUserWithCustomRolesData,
  AvailableRole,
  RolePermissionGroup,
  RolePermissionsPayload,
} from '@utils/api';

export interface OrganizationRole {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  is_active: boolean;
  is_system: boolean;
  display_order: number;
  permissions: string[];
  permissions_formatted: Record<string, Array<{
    slug: string;
    name: string;
    granted: boolean;
  }>>;
  permission_groups?: RolePermissionGroup[];
  permission_preview?: string[];
  system_permissions_count?: number;
  module_permissions_count?: number;
  interface_access?: string[];
  context?: string;
  interface?: string | null;
  users_count: number;
  created_at: string;
}

const SYSTEM_ROLE_NAME_MAP: Record<string, string> = {
  super_admin: 'Суперадминистратор',
  support: 'Поддержка',
  system_admin: 'Системный администратор',
  accountant: 'Бухгалтер',
  organization_admin: 'Администратор организации',
  organization_owner: 'Владелец организации',
  viewer: 'Наблюдатель',
  supplier: 'Снабженец',
  brigade_manager: 'Менеджер бригады',
  brigade_representative: 'Представитель бригады',
  admin_viewer: 'Наблюдатель админ-панели',
  brigade_catalog_moderator: 'Модератор каталога бригад',
  finance_admin: 'Финансовый администратор',
  web_admin: 'Веб-администратор',
  foreman: 'Прораб',
  observer: 'Наблюдатель проекта',
  worker: 'Рабочий',
  contractor: 'Подрядчик',
  project_manager: 'Руководитель проекта',
  project_viewer: 'Наблюдатель проекта',
  site_engineer: 'Инженер ПТО',
  parent_administrator: 'Администратор холдинга',
};

const OWNER_ROLE_SLUG = 'organization_owner';

const humanizeRoleSlug = (slug: string) => SYSTEM_ROLE_NAME_MAP[slug] ?? slug
  .split('_')
  .map(s => s.charAt(0).toUpperCase() + s.slice(1))
  .join(' ');

const normalizePermissionGroups = (
  permissionGroups?: RolePermissionGroup[],
  permissions?: RolePermissionsPayload,
): Record<string, Array<{ slug: string; name: string; granted: boolean }>> => {
  if (Array.isArray(permissionGroups) && permissionGroups.length > 0) {
    return permissionGroups.reduce((acc, group) => {
      acc[group.slug] = (group.permissions || []).map(permission => ({
        slug: permission.slug,
        name: permission.name,
        granted: true,
      }));
      return acc;
    }, {} as Record<string, Array<{ slug: string; name: string; granted: boolean }>>);
  }

  const formatted: Record<string, Array<{ slug: string; name: string; granted: boolean }>> = {};

  if (permissions?.interface_access) {
    formatted.interfaces = Object.entries(permissions.interface_access).map(([slug, name]) => ({
      slug,
      name,
      granted: true,
    }));
  }

  if (permissions?.system_permissions) {
    formatted.system = Object.entries(permissions.system_permissions).map(([slug, name]) => ({
      slug,
      name,
      granted: true,
    }));
  }

  Object.entries(permissions?.module_permissions || {}).forEach(([module, modulePermissions]) => {
    formatted[module] = Object.entries(modulePermissions).map(([slug, name]) => ({
      slug,
      name,
      granted: true,
    }));
  });

  return formatted;
};

const permissionSlugs = (
  permissionsFormatted: Record<string, Array<{ slug: string; name: string; granted: boolean }>>,
): string[] => Object.values(permissionsFormatted)
  .flat()
  .filter(permission => permission.granted)
  .map(permission => permission.slug);

const normalizeAvailableRole = (item: string | AvailableRole, idx: number): OrganizationRole => {
  const role: AvailableRole = typeof item === 'string'
    ? {
        slug: item,
        name: humanizeRoleSlug(item),
        type: 'system',
        is_active: true,
      }
    : item;

  const permissionsFormatted = normalizePermissionGroups(role.permission_groups, role.permissions);

  return {
    id: typeof role.id === 'number' ? role.id : -1000 - idx,
    name: role.name ?? humanizeRoleSlug(role.slug),
    slug: role.slug,
    description: role.description ?? '',
    color: role.type === 'custom' ? '#f97316' : '#64748b',
    is_active: role.is_active ?? true,
    is_system: role.type !== 'custom',
    display_order: idx,
    permissions: permissionSlugs(permissionsFormatted),
    permissions_formatted: permissionsFormatted,
    permission_groups: role.permission_groups,
    permission_preview: role.permission_preview,
    system_permissions_count: role.system_permissions_count,
    module_permissions_count: role.module_permissions_count,
    interface_access: role.interface_access,
    context: role.context,
    interface: role.interface,
    users_count: 0,
    created_at: '',
  };
};

export interface UserInvitation {
  id: number;
  email: string;
  name: string;
  role_slugs: string[];
  role_names: string[];
  status: 'pending' | 'accepted' | 'expired';
  status_text: string;
  status_color: string;
  expires_at: string;
  is_expired: boolean;
  can_be_accepted: boolean;
  invited_by: {
    id: number;
    name: string;
    email: string;
  };
  created_at: string;
}

export interface OrganizationUser {
  id: number;
  name: string;
  email: string;
  status: string;
  user_type: string;
  last_login_at: string | null;
  email_verified_at: string | null;
  roles: Array<{
    id: number;
    name: string;
    slug: string;
    color: string;
  }>;
  custom_roles: Array<{
    id: number;
    name: string;
    slug: string;
    color: string;
  }>;
  permissions: string[];
  created_at: string;
}

interface UserLimitsApiPayload {
  has_subscription: boolean;
  limits: {
    users: {
      limit: number;
      used: number;
      remaining: number;
      percentage_used: number;
      is_unlimited: boolean;
    };
  };
  warnings: Array<{
    type: string;
    resource: string;
    message: string;
  }>;
}

export interface UserManagementCapacity {
  hasAccess: boolean;
  resources: UserLimitsApiPayload['limits'];
  warnings: UserLimitsApiPayload['warnings'];
}

const normalizeUserCapacity = (payload: UserLimitsApiPayload): UserManagementCapacity => ({
  hasAccess: payload.has_subscription,
  resources: payload.limits,
  warnings: payload.warnings,
});

export const useUserManagement = () => {
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [capacity, setCapacity] = useState<UserManagementCapacity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customRolesService.getAvailableRoles();
      const payload = response?.data;
      const data = payload?.data ?? payload;

      const systemRolesRaw: Array<string | AvailableRole> = Array.isArray(data?.system_roles) ? data.system_roles : [];
      const customRolesRaw: AvailableRole[] = Array.isArray(data?.custom_roles) ? data.custom_roles : [];

      const normalizedSystemRoles: OrganizationRole[] = systemRolesRaw
        .map((role, idx) => normalizeAvailableRole(role, idx))
        .filter(role => role.slug !== OWNER_ROLE_SLUG);

      const normalizedCustomRoles: OrganizationRole[] = customRolesRaw.map((role, idx) => {
        const normalized = normalizeAvailableRole({ ...role, type: 'custom' }, idx);
        return {
          ...normalized,
          id: typeof role.id === 'number' ? role.id : (-2000 - idx),
          color: '#f97316',
          users_count: typeof (role as any).users_count === 'number' ? (role as any).users_count : 0,
          created_at: typeof (role as any).created_at === 'string' ? (role as any).created_at : '',
        };
      });

      setRoles([...normalizedCustomRoles, ...normalizedSystemRoles]);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки ролей');
      setRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchInvitations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userManagementService.getInvitations();
      if (response.data.success) {
        const payload = response.data;
        let list: any[] = [];
        if (Array.isArray(payload.data)) list = payload.data;
        else if (Array.isArray(payload.data?.data)) list = payload.data.data;
        else if (Array.isArray(payload)) list = payload;
        const norm = list.map((inv) => ({
          ...inv,
          role_names: inv.role_names ?? [],
          invited_by: inv.invited_by ?? { name: 'Система' },
          status_text: inv.status_text ?? (inv.status === 'pending' ? 'Ожидает' : inv.status),
          status_color: inv.status_color ?? '#6B7280',
        }));
        setInvitations(norm);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки приглашений');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userManagementService.getOrganizationUsers();
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCapacity = useCallback(async () => {
    try {
      const response = await userManagementService.getUserLimits();
      if (response.data.success) {
        setCapacity(normalizeUserCapacity(response.data.data as UserLimitsApiPayload));
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки лимитов');
    }
  }, []);

  const createRole = async (roleData: {
    name: string;
    slug?: string;
    description?: string;
    permissions: string[];
    color?: string;
    is_active?: boolean;
    display_order?: number;
  }) => {
    try {
      setLoading(true);
      const response = await userManagementService.createRole(roleData);
      if (response.data.success) {
        await fetchRoles();
        return response.data;
      }
      throw new Error(response.data.message || 'Ошибка создания роли');
    } catch (err: any) {
      setError(err.message || 'Ошибка создания роли');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async (invitationData: {
    email: string;
    name: string;
    role_slugs: string[];
    metadata?: Record<string, any>;
  }) => {
    try {
      setLoading(true);
      const response = await userManagementService.createInvitation(invitationData);
      if (response.data.success) {
        await fetchInvitations();
        return response.data;
      }
      throw new Error(response.data.message || 'Ошибка отправки приглашения');
    } catch (err: any) {
      setError(err.message || 'Ошибка отправки приглашения');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserRoles = async (userId: number, rolesData: {
    system_roles?: string[];
    custom_roles?: number[];
    action: 'replace' | 'add' | 'remove';
  }) => {
    try {
      setLoading(true);
      const response = await userManagementService.updateUserRoles(userId, rolesData);
      if (response.data.success) {
        await fetchUsers();
        return response.data;
      }
      throw new Error(response.data.message || 'Ошибка обновления ролей');
    } catch (err: any) {
      setError(err.message || 'Ошибка обновления ролей');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendInvitation = async (invitationId: number) => {
    try {
      setLoading(true);
      const response = await userManagementService.resendInvitation(invitationId);
      if (response.data.success) {
        await fetchInvitations();
        return response.data;
      }
      throw new Error(response.data.message || 'Ошибка повторной отправки');
    } catch (err: any) {
      setError(err.message || 'Ошибка повторной отправки');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Новые методы для работы с кастомными ролями
  const createUserWithCustomRoles = async (userData: CreateUserWithCustomRolesData) => {
    try {
      setLoading(true);
      const response = await customRolesService.createUserWithCustomRoles(userData);
      if (response.data && response.data.success) {
        await fetchUsers(); // Обновляем список пользователей
        return response.data;
      }
      throw new Error(response.data?.message || 'Ошибка создания пользователя');
    } catch (err: any) {
      setError(err.message || 'Ошибка создания пользователя');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserRoles = async (userId: number) => {
    try {
      const response = await userManagementService.getUserRoles(userId);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Ошибка загрузки ролей пользователя');
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки ролей пользователя');
      throw err;
    }
  };

  const assignRoleToUser = async (userId: number, roleId: number) => {
    try {
      setLoading(true);
      const response = await userManagementService.assignRoleToUser(userId, roleId);
      if (response.data && response.data.success) {
        await fetchUsers(); // Обновляем список пользователей
        return response.data;
      }
      throw new Error(response.data?.message || 'Ошибка назначения роли');
    } catch (err: any) {
      setError(err.message || 'Ошибка назначения роли');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const unassignRoleFromUser = async (userId: number, roleId: number) => {
    try {
      setLoading(true);
      const response = await userManagementService.unassignRoleFromUser(userId, roleId);
      if (response.data && response.data.success) {
        await fetchUsers(); // Обновляем список пользователей
        return response.data;
      }
      throw new Error(response.data?.message || 'Ошибка отзыва роли');
    } catch (err: any) {
      setError(err.message || 'Ошибка отзыва роли');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmailForUser = async (userId: number) => {
    try {
      setLoading(true);
      const response = await userManagementService.resendVerificationEmailForUser(userId);
      if (response.data && response.data.success) {
        await fetchUsers(); // Обновляем список пользователей
        return response.data;
      }
      throw new Error(response.data?.message || 'Ошибка отправки письма');
    } catch (err: any) {
      setError(err.message || 'Ошибка отправки письма');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchCapacity();
  }, [fetchCapacity]);

  return {
    roles,
    invitations,
    users,
    capacity,
    loading,
    error,
    fetchRoles,
    fetchInvitations,
    fetchUsers,
    fetchCapacity,
    createRole,
    sendInvitation,
    updateUserRoles,
    resendInvitation,
    createUserWithCustomRoles,
    getUserRoles,
    assignRoleToUser,
    unassignRoleFromUser,
    resendVerificationEmailForUser,
    clearError
  };
}; 
