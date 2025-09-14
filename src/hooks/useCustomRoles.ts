import { useState, useCallback, useEffect } from 'react';
import { customRolesService, CustomRole, CreateCustomRoleData, AvailableRolesResponse } from '@utils/api';

export interface Permission {
  key: string;
  name: string;
  description?: string;
  category?: string;
}

export interface AvailablePermissions {
  system_permissions: Permission[];
  module_permissions: {
    [module: string]: Permission[];
  };
}

export const useCustomRoles = () => {
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [availableRoles, setAvailableRoles] = useState<AvailableRolesResponse | null>(null);
  const [availablePermissions, setAvailablePermissions] = useState<AvailablePermissions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomRoles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await customRolesService.getCustomRoles();
      const payload = response.data;
      const roles = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.data)
          ? payload.data.data
          : [];

      setCustomRoles(roles);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки ролей');
      setCustomRoles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableRoles = useCallback(async () => {
    try {
      const response = await customRolesService.getAvailableRoles();
      if (response.data) setAvailableRoles(response.data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки доступных ролей');
    }
  }, []);

  const fetchAvailablePermissions = useCallback(async () => {
    try {
      const response = await customRolesService.getCustomRolePermissions();
      const raw = response?.data?.data || response?.data;
      if (!raw) return;

      const systemPermissionsObj = raw.system_permissions || {};
      const modulePermissionsObj = raw.module_permissions || {};

      const system_permissions: Permission[] = Object.entries(systemPermissionsObj).map(([key, name]: [string, any]) => ({
        key,
        name: String(name ?? key)
      }));

      const module_permissions: { [module: string]: Permission[] } = Object.entries(modulePermissionsObj).reduce(
        (acc, [module, perms]) => {
          const asArray = Array.isArray(perms) ? perms : [];
          acc[module] = asArray.map((perm: any) => ({
            key: String(perm),
            name: String(perm)
          }));
          return acc;
        },
        {} as { [module: string]: Permission[] }
      );

      setAvailablePermissions({ system_permissions, module_permissions });
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки доступных прав');
    }
  }, []);

  const createCustomRole = async (roleData: CreateCustomRoleData) => {
    try {
      setLoading(true);
      const response = await customRolesService.createCustomRole(roleData);
      if (response.data && response.data.success) {
        await fetchCustomRoles(); // Обновляем список
        return response.data;
      }
      throw new Error(response.data?.message || 'Ошибка создания роли');
    } catch (err: any) {
      setError(err.message || 'Ошибка создания роли');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCustomRole = async (roleId: number, roleData: Partial<CreateCustomRoleData>) => {
    try {
      setLoading(true);
      const response = await customRolesService.updateCustomRole(roleId, roleData);
      if (response.data && response.data.success) {
        await fetchCustomRoles(); // Обновляем список
        return response.data;
      }
      throw new Error(response.data?.message || 'Ошибка обновления роли');
    } catch (err: any) {
      setError(err.message || 'Ошибка обновления роли');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCustomRole = async (roleId: number) => {
    try {
      setLoading(true);
      const response = await customRolesService.deleteCustomRole(roleId);
      if (response.data && response.data.success) {
        await fetchCustomRoles(); // Обновляем список
        return response.data;
      }
      throw new Error(response.data?.message || 'Ошибка удаления роли');
    } catch (err: any) {
      setError(err.message || 'Ошибка удаления роли');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cloneCustomRole = async (roleId: number, newName: string) => {
    try {
      setLoading(true);
      const response = await customRolesService.cloneCustomRole(roleId, newName);
      if (response.data && response.data.success) {
        await fetchCustomRoles(); // Обновляем список
        return response.data;
      }
      throw new Error(response.data?.message || 'Ошибка клонирования роли');
    } catch (err: any) {
      setError(err.message || 'Ошибка клонирования роли');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignRoleToUser = async (roleId: number, userId: number) => {
    try {
      setLoading(true);
      const response = await customRolesService.assignRole(roleId, userId);
      if (response.data && response.data.success) {
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

  const unassignRoleFromUser = async (roleId: number, userId: number) => {
    try {
      setLoading(true);
      const response = await customRolesService.unassignRole(roleId, userId);
      if (response.data && response.data.success) {
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

  const getRoleUsers = async (roleId: number) => {
    try {
      const response = await customRolesService.getCustomRoleUsers(roleId);
      if (response.data && response.data.success) {
        return response.data.data || [];
      }
      throw new Error(response.data?.message || 'Ошибка загрузки пользователей роли');
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки пользователей роли');
      throw err;
    }
  };

  const getCustomRole = async (roleId: number): Promise<CustomRole | null> => {
    try {
      const response = await customRolesService.getCustomRole(roleId);
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Ошибка загрузки роли');
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки роли');
      throw err;
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Вспомогательные функции
  const findRoleById = useCallback((roleId: number): CustomRole | undefined => {
    return customRoles.find(role => role.id === roleId);
  }, [customRoles]);

  const getRolesByUser = useCallback((userId: number): CustomRole[] => {
    // Эта функция будет реализована после интеграции с основными данными пользователей
    void userId;
    return customRoles.filter(() => {
      // TODO: добавить логику фильтрации по пользователю
      return false;
    });
  }, [customRoles]);

  // Auto-load data on mount
  useEffect(() => {
    fetchCustomRoles();
    fetchAvailableRoles();
    fetchAvailablePermissions();
  }, [fetchCustomRoles, fetchAvailableRoles, fetchAvailablePermissions]);

  return {
    // Data
    customRoles,
    availableRoles,
    availablePermissions,
    loading,
    error,
    
    // Actions
    fetchCustomRoles,
    fetchAvailableRoles,
    fetchAvailablePermissions,
    createCustomRole,
    updateCustomRole,
    deleteCustomRole,
    cloneCustomRole,
    assignRoleToUser,
    unassignRoleFromUser,
    getRoleUsers,
    getCustomRole,
    clearError,
    
    // Helpers
    findRoleById,
    getRolesByUser,
  };
};
