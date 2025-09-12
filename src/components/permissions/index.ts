// Экспорт всех компонентов и хуков системы разрешений

// Контекст и провайдер
export { PermissionsProvider, usePermissionsContext } from '@/contexts/PermissionsContext';

// Хуки
export {
  usePermissions,
  useHasPermission,
  useHasRole,
  useHasModule,
  useCanAccessInterface,
  useCanAccess,
  useUserPermissions,
  useUserRoles,
  useActiveModules,
  useIsOwner,
  useIsAdmin,
  useIsSuperAdmin,
  usePermissionsReady,
  usePermissionsLoading,
  usePermissionsError,
  usePermissionsManager
} from '@/hooks/usePermissions';

// Компоненты для защиты UI
export {
  ProtectedComponent,
  HiddenComponent,
  DisabledComponent,
  withPermissions,
  PermissionsGuard
} from './ProtectedComponent';

// Компоненты для защиты маршрутов
export {
  ProtectedRoute,
  NoAccessPage,
  withProtectedRoute,
  ConditionalRoute
} from './ProtectedRoute';

// Типы
export type {
  PermissionsData,
  PermissionsResponse,
  CheckPermissionRequest,
  CheckPermissionResponse,
  CanAccessOptions,
  SystemRole,
  AccessInterface,
  SystemPermission,
  ModulePermission,
  Permission,
  ActiveModule
} from '@/types/permissions';

// Менеджер
export { permissionsManager, PermissionsManager } from '@/services/permissionsManager';
