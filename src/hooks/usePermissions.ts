import { usePermissionsContext } from '@/contexts/PermissionsContext';
import {
  Permission,
  SystemRole,
  AccessInterface,
  ActiveModule,
  CanAccessOptions
} from '@/types/permissions';

/**
 * Основной хук для работы с правами
 */
export const usePermissions = () => {
  return usePermissionsContext();
};

/**
 * Хук для проверки одного права
 */
export const useHasPermission = (permission: Permission): boolean => {
  const { can } = usePermissionsContext();
  return can(permission);
};

/**
 * Хук для проверки роли
 */
export const useHasRole = (role: SystemRole | string): boolean => {
  const { hasRole } = usePermissionsContext();
  return hasRole(role);
};

/**
 * Хук для проверки модуля
 */
export const useHasModule = (module: ActiveModule | string): boolean => {
  const { hasModule } = usePermissionsContext();
  return hasModule(module);
};

/**
 * Хук для проверки интерфейса
 */
export const useCanAccessInterface = (interfaceName: AccessInterface): boolean => {
  const { canAccessInterface } = usePermissionsContext();
  return canAccessInterface(interfaceName);
};

/**
 * Хук для комплексной проверки доступа
 */
export const useCanAccess = (options: CanAccessOptions): boolean => {
  const { canAccess, isLoaded, error, permissions } = usePermissionsContext();
  
  // Отладочное логирование
  const debugInfo = {
    options,
    isLoaded,
    error,
    permissionsData: {
      permissions_flat: permissions?.permissions_flat || [],
      roles: permissions?.roles || [],
      active_modules: permissions?.active_modules || []
    }
  };
  
  // Если права не загружены или есть ошибка - запрещаем доступ (безопасность)
  if (!isLoaded || error) {
    console.log('⚠️ useCanAccess: права не готовы', debugInfo);
    return false;
  }
  
  const result = canAccess(options);
  console.log('🔍 useCanAccess вызов:', { ...debugInfo, result });
  return result;
};

/**
 * Хук для получения списка прав
 */
export const useUserPermissions = () => {
  const { permissions } = usePermissionsContext();
  return permissions.permissions_flat;
};

/**
 * Хук для получения ролей пользователя
 */
export const useUserRoles = () => {
  const { permissions } = usePermissionsContext();
  return permissions.roles;
};

/**
 * Хук для получения активных модулей
 */
export const useActiveModules = () => {
  const { permissions } = usePermissionsContext();
  return permissions.active_modules;
};

/**
 * Хук для определения владельца организации
 */
export const useIsOwner = (): boolean => {
  return useHasRole('organization_owner');
};

/**
 * Хук для определения администратора
 */
export const useIsAdmin = (): boolean => {
  const { hasRole } = usePermissionsContext();
  return hasRole('organization_owner') || hasRole('organization_admin');
};

/**
 * Хук для определения супер админа
 */
export const useIsSuperAdmin = (): boolean => {
  return useHasRole('super_admin');
};

/**
 * Хук для проверки готовности системы прав
 */
export const usePermissionsReady = (): boolean => {
  const { isLoaded } = usePermissionsContext();
  return isLoaded;
};

/**
 * Хук для проверки загрузки прав
 */
export const usePermissionsLoading = (): boolean => {
  const { isLoading } = usePermissionsContext();
  return isLoading;
};

/**
 * Хук для проверки ошибок загрузки прав
 */
export const usePermissionsError = (): string | null => {
  const { error } = usePermissionsContext();
  return error;
};

/**
 * Хук для управления правами
 */
export const usePermissionsManager = () => {
  const { load, reload, clear } = usePermissionsContext();
  return { load, reload, clear };
};
