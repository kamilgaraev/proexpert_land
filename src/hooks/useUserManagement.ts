import { useState, useCallback, useEffect } from 'react';
import { userManagementService } from '@utils/api';

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
      console.log('Загрузка ролей...');
      
      const response = await userManagementService.getRoles();
      console.log('Ответ API для ролей:', response);
      
      if (response.data && response.data.success) {
        const customRoles = response.data.data?.custom_roles || [];
        const systemRoles = response.data.data?.system_roles || [];
        const allRoles = [...customRoles, ...systemRoles];
        
        console.log('Загруженные роли:', allRoles);
        setRoles(allRoles);
      } else {
        console.error('Неуспешный ответ API:', response.data);
        setError(response.data?.message || 'Ошибка загрузки ролей');
        setRoles([]);
      }
    } catch (err: any) {
      console.error('Ошибка при загрузке ролей:', err);
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
      console.log('--- Отправляю приглашение', invitationData);
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
    clearError
  };
}; 