import { useState, useCallback, useEffect } from 'react';
import { userManagementService, customRolesService, CreateUserWithCustomRolesData } from '@utils/api';

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
  users_count: number;
  created_at: string;
}

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

export interface SubscriptionLimits {
  has_subscription: boolean;
  limits: {
    users: {
      limit: number;
      used: number;
      remaining: number;
      percentage_used: number;
      is_unlimited: boolean;
    };
    foremen: {
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

export const useUserManagement = () => {
  const [roles, setRoles] = useState<OrganizationRole[]>([]);
  const [invitations, setInvitations] = useState<UserInvitation[]>([]);
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [limits, setLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customRolesService.getAvailableRoles();
      const payload = response?.data;
      const data = payload?.data ?? payload;

      const systemSlugs: string[] = Array.isArray(data?.system_roles) ? data.system_roles : [];
      const customRolesRaw: any[] = Array.isArray(data?.custom_roles) ? data.custom_roles : [];

      const SYSTEM_ROLE_NAME_MAP: Record<string, string> = {
        super_admin: 'Суперадминистратор',
        support: 'Поддержка',
        system_admin: 'Системный администратор',
        accountant: 'Бухгалтер',
        organization_admin: 'Администратор организации',
        organization_owner: 'Владелец организации',
        viewer: 'Просмотр (только чтение)',
        foreman: 'Прораб',
        observer: 'Наблюдатель',
        worker: 'Рабочий',
        contractor: 'Подрядчик',
        project_manager: 'Руководитель проекта',
        site_engineer: 'Инженер ПТО',
      };

      const humanize = (slug: string) => SYSTEM_ROLE_NAME_MAP[slug] ?? slug
        .split('_')
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');

      const normalizedSystemRoles: OrganizationRole[] = systemSlugs.map((slug, idx) => ({
        id: -1000 - idx,
        name: humanize(slug),
        slug,
        description: '',
        color: '#64748b',
        is_active: true,
        is_system: true,
        display_order: idx,
        permissions: [],
        permissions_formatted: {},
        users_count: 0,
        created_at: ''
      }));

      const normalizedCustomRoles: OrganizationRole[] = customRolesRaw.map((r: any, idx: number) => ({
        id: typeof r.id === 'number' ? r.id : (-2000 - idx),
        name: r.name ?? r.slug,
        slug: r.slug,
        description: r.description ?? '',
        color: r.color ?? '#f97316',
        is_active: r.is_active ?? true,
        is_system: false,
        display_order: typeof r.display_order === 'number' ? r.display_order : idx,
        permissions: Array.isArray(r.permissions) ? r.permissions : [],
        permissions_formatted: {},
        users_count: typeof r.users_count === 'number' ? r.users_count : 0,
        created_at: r.created_at ?? ''
      }));

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

  const fetchLimits = useCallback(async () => {
    try {
      const response = await userManagementService.getUserLimits();
      if (response.data.success) {
        setLimits(response.data.data);
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    fetchLimits();
  }, [fetchLimits]);

  return {
    roles,
    invitations,
    users,
    limits,
    loading,
    error,
    fetchRoles,
    fetchInvitations,
    fetchUsers,
    fetchLimits,
    createRole,
    sendInvitation,
    updateUserRoles,
    resendInvitation,
    createUserWithCustomRoles,
    getUserRoles,
    assignRoleToUser,
    unassignRoleFromUser,
    clearError
  };
}; 