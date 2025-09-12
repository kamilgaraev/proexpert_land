import {
  PermissionsData,
  PermissionsResponse,
  CheckPermissionRequest,
  CheckPermissionResponse,
  CanAccessOptions,
  Permission,
  SystemRole,
  AccessInterface,
  ActiveModule
} from '@/types/permissions';
import { API_URL, getTokenFromStorages } from '@/utils/api';

/**
 * Централизованный менеджер для управления правами пользователей
 * Основан на гайде QUICK_START_PERMISSIONS.md
 */
export class PermissionsManager {
  private permissions: string[] = [];
  private roles: string[] = [];
  private interfaces: string[] = [];
  private activeModules: string[] = [];
  private userId: number | null = null;
  private organizationId: number | null = null;
  private isLoaded = false;
  private isLoading = false;

  constructor() {
    this.permissions = [];
    this.roles = [];
    this.interfaces = [];
    this.activeModules = [];
  }

  /**
   * Загрузить права с сервера
   */
  async load(interfaceType: AccessInterface = 'lk'): Promise<boolean> {
    if (this.isLoading) {
      console.log('⏳ Права уже загружаются...');
      return false;
    }

    try {
      this.isLoading = true;
      const token = this.getToken();
      
      if (!token) {
        console.warn('⚠️ Токен авторизации отсутствует');
        return false;
      }

      const endpoint = this.getEndpoint(interfaceType);
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data: PermissionsResponse = await response.json();

      if (data.success && data.data) {
        this.permissions = data.data.permissions_flat || [];
        this.roles = data.data.roles || [];
        this.interfaces = data.data.interfaces || [];
        this.activeModules = data.data.active_modules || [];
        this.userId = data.data.user_id || null;
        this.organizationId = data.data.organization_id || null;
        this.isLoaded = true;

        console.log('✅ Права загружены:', {
          permissions: this.permissions.length,
          roles: this.roles,
          modules: this.activeModules
        });

        return true;
      } else {
        console.error('❌ Ошибка загрузки прав:', data.message);
        return false;
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки прав:', error);
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Проверить право
   */
  can(permission: Permission): boolean {
    if (!this.isLoaded) {
      console.warn('⚠️ Права не загружены. Вызовите load() сначала.');
      return false;
    }

    // Проверка wildcard прав (например, projects.*)
    if (permission.includes('.')) {
      const [module, action] = permission.split('.');
      const wildcardPermission = `${module}.*`;
      
      if (this.permissions.includes(wildcardPermission)) {
        return true;
      }
    }

    return this.permissions.includes(permission);
  }

  /**
   * Проверить роль
   */
  hasRole(role: SystemRole | string): boolean {
    if (!this.isLoaded) {
      console.warn('⚠️ Права не загружены. Вызовите load() сначала.');
      return false;
    }
    
    return this.roles.includes(role);
  }

  /**
   * Проверить модуль
   */
  hasModule(module: ActiveModule | string): boolean {
    if (!this.isLoaded) {
      console.warn('⚠️ Права не загружены. Вызовите load() сначала.');
      return false;
    }
    
    return this.activeModules.includes(module);
  }

  /**
   * Проверить интерфейс
   */
  canAccessInterface(interfaceName: AccessInterface): boolean {
    if (!this.isLoaded) {
      console.warn('⚠️ Права не загружены. Вызовите load() сначала.');
      return false;
    }
    
    return this.interfaces.includes(interfaceName);
  }

  /**
   * Комплексная проверка доступа
   */
  canAccess(options: CanAccessOptions): boolean {
    if (!this.isLoaded) {
      console.warn('⚠️ Права не загружены. Вызовите load() сначала.');
      return false;
    }

    const { 
      permission, 
      role, 
      module, 
      interface: interfaceName, 
      requireAll = true 
    } = options;

    const checks: boolean[] = [];

    if (permission !== undefined) {
      checks.push(this.can(permission));
    }
    
    if (role !== undefined) {
      checks.push(this.hasRole(role));
    }
    
    if (module !== undefined) {
      checks.push(this.hasModule(module));
    }
    
    if (interfaceName !== undefined) {
      checks.push(this.canAccessInterface(interfaceName));
    }

    if (checks.length === 0) {
      return true; // Если проверок нет, разрешаем доступ
    }

    // AND логика - все проверки должны пройти
    if (requireAll) {
      return checks.every(check => check);
    }
    
    // OR логика - хотя бы одна проверка должна пройти  
    return checks.some(check => check);
  }

  /**
   * Проверить конкретное право через API (медленно, но актуально)
   */
  async checkPermission(
    permission: Permission,
    context?: CheckPermissionRequest['context'],
    interfaceType: AccessInterface = 'lk'
  ): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;

      const response = await fetch('https://api.prohelper.pro/api/lk/v1/permissions/check', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          permission,
          context,
          interface: interfaceType
        })
      });

      const data: CheckPermissionResponse = await response.json();
      return data.success ? data.data.has_permission : false;
    } catch (error) {
      console.error('Ошибка проверки права:', error);
      return false;
    }
  }

  /**
   * Получить все данные о правах
   */
  getPermissions(): PermissionsData {
    return {
      user_id: this.userId || 0,
      organization_id: this.organizationId,
      permissions_flat: [...this.permissions],
      roles: [...this.roles],
      interfaces: [...this.interfaces],
      active_modules: [...this.activeModules]
    };
  }

  /**
   * Проверить, загружены ли права
   */
  isReady(): boolean {
    return this.isLoaded;
  }

  /**
   * Очистить права (при выходе)
   */
  clear(): void {
    this.permissions = [];
    this.roles = [];
    this.interfaces = [];
    this.activeModules = [];
    this.userId = null;
    this.organizationId = null;
    this.isLoaded = false;
    this.isLoading = false;
    
    console.log('🧹 Права очищены');
  }

  /**
   * Получить токен из storage
   */
  private getToken(): string | null {
    return getTokenFromStorages();
  }

  /**
   * Получить правильный endpoint для интерфейса
   */
  private getEndpoint(interfaceType: AccessInterface): string {
    // Используем базовый API_URL и строим полные адреса
    const baseUrl = 'https://api.prohelper.pro/api';
    const endpoints = {
      'lk': `${baseUrl}/lk/v1/permissions`,
      'admin': `${baseUrl}/admin/v1/permissions`, 
      'mobile': `${baseUrl}/mobile/v1/permissions`
    };
    
    return endpoints[interfaceType];
  }

  // Методы для отладки (только в dev режиме)
  debug = {
    show: () => {
      if (process.env.NODE_ENV !== 'development') return;
      console.table(this.permissions);
    },
    
    can: (permission: Permission) => {
      if (process.env.NODE_ENV !== 'development') return false;
      const result = this.can(permission);
      console.log(`🔒 ${permission}: ${result ? '✅ РАЗРЕШЕНО' : '❌ ЗАПРЕЩЕНО'}`);
      return result;
    },
    
    roles: () => {
      if (process.env.NODE_ENV !== 'development') return [];
      console.log('👤 Роли:', this.roles);
      return this.roles;
    },
    
    modules: () => {
      if (process.env.NODE_ENV !== 'development') return [];
      console.log('📦 Модули:', this.activeModules);
      return this.activeModules;
    },
    
    reload: () => this.load()
  };
}

// Глобальный экземпляр
export const permissionsManager = new PermissionsManager();

// Экспорт для window (отладка)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (window as any).DEBUG_PERMISSIONS = permissionsManager.debug;
  console.log('🔧 Отладка прав доступна:', 'DEBUG_PERMISSIONS');
}
