import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { permissionsManager } from '@/services/permissionsManager';
import { getTokenFromStorages } from '@/utils/api';
import {
  PermissionsData,
  CanAccessOptions,
  Permission,
  SystemRole,
  AccessInterface,
  ActiveModule
} from '@/types/permissions';

interface PermissionsContextType {
  // Данные
  permissions: PermissionsData;
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Методы проверки
  can: (permission: Permission) => boolean;
  hasRole: (role: SystemRole | string) => boolean;
  hasModule: (module: ActiveModule | string) => boolean;
  canAccessInterface: (interfaceName: AccessInterface) => boolean;
  canAccess: (options: CanAccessOptions) => boolean;
  
  // Управление
  load: (interfaceType?: AccessInterface) => Promise<boolean>;
  reload: () => Promise<boolean>;
  clear: () => void;
  
  // Проверка через API
  checkPermission: (
    permission: Permission,
    context?: any,
    interfaceType?: AccessInterface
  ) => Promise<boolean>;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

interface PermissionsProviderProps {
  children: React.ReactNode;
  autoLoad?: boolean;
  interfaceType?: AccessInterface;
  refreshInterval?: number; // в миллисекундах
}

export const PermissionsProvider: React.FC<PermissionsProviderProps> = ({
  children,
  autoLoad = true,
  interfaceType = 'lk',
  refreshInterval = 15 * 60 * 1000 // 15 минут по умолчанию (было 5)
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<PermissionsData>({
    user_id: 0,
    organization_id: null,
    permissions_flat: [],
    roles: [],
    interfaces: [],
    active_modules: []
  });
  
  const hasAutoLoaded = useRef(false);

  const updatePermissions = useCallback(() => {
    const data = permissionsManager.getPermissions();
    setPermissions(data);
    setIsLoaded(permissionsManager.isReady());
  }, []);

  const load = useCallback(async (iType: AccessInterface = interfaceType): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await permissionsManager.load(iType);
      
      if (success) {
        updatePermissions();
        setError(null);
      } else {
        setError('Не удалось загрузить права доступа');
      }
      
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      console.error('❌ Ошибка загрузки прав:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [interfaceType, updatePermissions]);

  const reload = useCallback(async (): Promise<boolean> => {
    console.log('🔄 Перезагрузка прав...');
    return await load();
  }, [load]);

  const clear = useCallback(() => {
    permissionsManager.clear();
    setPermissions({
      user_id: 0,
      organization_id: null,
      permissions_flat: [],
      roles: [],
      interfaces: [],
      active_modules: []
    });
    setIsLoaded(false);
    setError(null);
    hasAutoLoaded.current = false;
  }, []);

  // Методы проверки (прокси к permissionsManager)
  const can = useCallback((permission: Permission): boolean => {
    return permissionsManager.can(permission);
  }, []);

  const hasRole = useCallback((role: SystemRole | string): boolean => {
    return permissionsManager.hasRole(role);
  }, []);

  const hasModule = useCallback((module: ActiveModule | string): boolean => {
    return permissionsManager.hasModule(module);
  }, []);

  const canAccessInterface = useCallback((interfaceName: AccessInterface): boolean => {
    return permissionsManager.canAccessInterface(interfaceName);
  }, []);

  const canAccess = useCallback((options: CanAccessOptions): boolean => {
    return permissionsManager.canAccess(options);
  }, []);

  const checkPermission = useCallback(async (
    permission: Permission,
    context?: any,
    iType: AccessInterface = interfaceType
  ): Promise<boolean> => {
    return await permissionsManager.checkPermission(permission, context, iType);
  }, [interfaceType]);

  // Автоматическая загрузка при монтировании (один раз)
  useEffect(() => {
    if (autoLoad && !hasAutoLoaded.current) {
      const token = getTokenFromStorages();
      if (token) {
        hasAutoLoaded.current = true;
        load();
      } else {
        console.log('⚠️ Токен отсутствует, пропускаем загрузку прав');
      }
    }
  }, [autoLoad, load]);

  // Автообновление прав (только если загружены успешно)
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0 || !isLoaded || error) {
      return;
    }

    const interval = setInterval(() => {
      if (isLoaded && !isLoading && !error) {
        console.log('🔄 Автообновление прав...');
        reload().catch(err => {
          console.warn('⚠️ Ошибка автообновления прав:', err);
        });
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, isLoaded, isLoading, error, reload]);

  // Обработка событий смены организации/входа/выхода
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'organization_id' || e.key === 'token' || e.key === 'authToken') {
        console.log('🔄 Изменение в localStorage, перезагружаем права...');
        hasAutoLoaded.current = false;
        reload();
      }
    };

    const handleOrganizationChange = () => {
      console.log('🔄 Смена организации, перезагружаем права...');
      reload();
    };

    const handleLogin = () => {
      console.log('🔄 Вход в систему, загружаем права...');
      hasAutoLoaded.current = false;
      load();
    };

    const handleLogout = () => {
      console.log('🔄 Выход из системы, очищаем права...');
      clear();
    };

    // Слушаем изменения localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Слушаем кастомные события
    window.addEventListener('organization-changed', handleOrganizationChange);
    window.addEventListener('user-login', handleLogin);
    window.addEventListener('user-logout', handleLogout);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('organization-changed', handleOrganizationChange);
      window.removeEventListener('user-login', handleLogin);
      window.removeEventListener('user-logout', handleLogout);
    };
  }, [load, reload, clear]);

  const contextValue: PermissionsContextType = {
    permissions,
    isLoaded,
    isLoading,
    error,
    can,
    hasRole,
    hasModule,
    canAccessInterface,
    canAccess,
    load,
    reload,
    clear,
    checkPermission
  };

  return (
    <PermissionsContext.Provider value={contextValue}>
      {children}
    </PermissionsContext.Provider>
  );
};

/**
 * Хук для получения контекста разрешений
 */
export const usePermissionsContext = (): PermissionsContextType => {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error('usePermissionsContext must be used within a PermissionsProvider');
  }
  return context;
};
