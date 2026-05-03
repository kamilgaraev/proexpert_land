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
import { debugPermissions, isPermissionsDebugEnabled } from '@/services/debugPermissions';
import { getTokenFromStorages } from '@/utils/api';

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
  private lastLoadTime = 0;
  private loadPromise: Promise<boolean> | null = null;

  // Настройки дебаунса
  private readonly MIN_RELOAD_INTERVAL = 300000; // 5 минут между загрузками (увеличено для защиты от 429)
  private readonly REQUEST_TIMEOUT = 15000; // 15 секунд таймаут запроса

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
    // Проверяем, не слишком ли часто загружаем
    const now = Date.now();
    if (this.isLoaded && this.lastLoadTime && (now - this.lastLoadTime) < this.MIN_RELOAD_INTERVAL) {
      debugPermissions(`Permissions reload throttled. Wait ${Math.ceil((this.MIN_RELOAD_INTERVAL - (now - this.lastLoadTime)) / 1000)}s`);
      return this.isLoaded;
    }

    // Если уже загружается, возвращаем текущий промис
    if (this.loadPromise) {
      debugPermissions('Permissions are already loading');
      return this.loadPromise;
    }

    // Создаем новый промис загрузки
    this.loadPromise = this.performLoad(interfaceType);
    const result = await this.loadPromise;

    // Очищаем промис после завершения
    this.loadPromise = null;
    if (result) {
      this.lastLoadTime = Date.now();
    }

    return result;
  }

  /**
   * Внутренний метод загрузки
   */
  private async performLoad(interfaceType: AccessInterface): Promise<boolean> {
    if (this.isLoading) {
      return false;
    }

    try {
      this.isLoading = true;
      const token = this.getToken();

      if (!token) {
        debugPermissions('Permissions load skipped: auth token is missing');
        return false;
      }

      const endpoint = this.getEndpoint(interfaceType);

      // Добавляем контроллер для отмены запроса по таймауту
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

      debugPermissions(`Loading permissions from: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        debugPermissions(`Permissions HTTP error: ${response.status} ${response.statusText} for ${endpoint}`);

        // Если 404, значит endpoint не существует - не нужно спамить
        if (response.status === 404) {
          debugPermissions('Permissions endpoint was not found');
          return false;
        }

        return false;
      }

      const data: PermissionsResponse = await response.json();

      if (data.success && data.data) {
        // Нормализуем права (защита от объектов с числовыми ключами из PHP)
        const rawPerms = data.data.permissions_flat || [];
        this.permissions = Array.isArray(rawPerms) ? rawPerms : Object.values(rawPerms);

        const rawRoles = data.data.roles || [];
        this.roles = Array.isArray(rawRoles) ? rawRoles : Object.values(rawRoles);

        const rawInterfaces = data.data.interfaces || [];
        this.interfaces = Array.isArray(rawInterfaces) ? rawInterfaces : Object.values(rawInterfaces);

        // Нормализуем активные модули: API может вернуть массив строк или объектов с полем slug
        const rawModules: any = (data as any).data?.active_modules ?? [];
        let normalized: string[] = [];
        if (Array.isArray(rawModules)) {
          if (rawModules.length === 0) {
            normalized = [];
          } else if (typeof rawModules[0] === 'string') {
            normalized = rawModules as string[];
          } else if (typeof rawModules[0] === 'object') {
            normalized = (rawModules as any[])
              .map((m) => (m?.slug ? String(m.slug) : null))
              .filter((s): s is string => Boolean(s));
          }
        }
        // Добавляем синонимы c дефисом/подчеркиванием для надежной проверки
        const withSynonyms = new Set<string>();
        normalized.forEach((s) => {
          withSynonyms.add(s);
          if (s.includes('-')) withSynonyms.add(s.replace(/-/g, '_'));
          if (s.includes('_')) withSynonyms.add(s.replace(/_/g, '-'));
        });
        this.activeModules = Array.from(withSynonyms);
        this.userId = data.data.user_id || null;
        this.organizationId = data.data.organization_id || null;
        this.isLoaded = true;

        debugPermissions('Permissions loaded:', {
          permissions: this.permissions.length,
          roles: this.roles,
          modules: this.activeModules
        });

        return true;
      } else {
        debugPermissions('Permissions load failed:', data.message || 'Unknown error');
        return false;
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        debugPermissions('Permissions load timed out');
      } else {
        debugPermissions('Permissions load error:', error);
      }
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
      debugPermissions('Permission check skipped: permissions are not loaded');
      return false;
    }

    // Проверка wildcard прав (например, projects.*)
    if (permission.includes('.')) {
      const [module] = permission.split('.');
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
      debugPermissions('Role check skipped: permissions are not loaded');
      return false;
    }

    return this.roles.includes(role);
  }

  /**
   * Проверить модуль
   */
  hasModule(module: ActiveModule | string): boolean {
    if (!this.isLoaded) {
      debugPermissions('Module check skipped: permissions are not loaded');
      return false;
    }

    return this.activeModules.includes(module);
  }

  /**
   * Проверить интерфейс
   */
  canAccessInterface(interfaceName: AccessInterface): boolean {
    if (!this.isLoaded) {
      debugPermissions('Interface access check skipped: permissions are not loaded');
      return false;
    }

    return this.interfaces.includes(interfaceName);
  }

  /**
   * Комплексная проверка доступа
   */
  canAccess(options: CanAccessOptions): boolean {
    if (!this.isLoaded) {
      debugPermissions('Access check skipped: permissions are not loaded');
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
      debugPermissions('Permission API check error:', error);
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

    debugPermissions('Permissions cleared');
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
      if (!isPermissionsDebugEnabled()) return;
      debugPermissions('Permissions:', this.permissions);
    },

    can: (permission: Permission) => {
      if (!isPermissionsDebugEnabled()) return false;
      const result = this.can(permission);
      debugPermissions(`${permission}: ${result ? 'allowed' : 'denied'}`);
      return result;
    },

    roles: () => {
      if (!isPermissionsDebugEnabled()) return [];
      debugPermissions('Roles:', this.roles);
      return this.roles;
    },

    modules: () => {
      if (!isPermissionsDebugEnabled()) return [];
      debugPermissions('Modules:', this.activeModules);
      return this.activeModules;
    },

    reload: () => this.load()
  };
}

// Глобальный экземпляр
export const permissionsManager = new PermissionsManager();

// Экспорт для window (отладка)
if (typeof window !== 'undefined' && isPermissionsDebugEnabled()) {
  (window as any).DEBUG_PERMISSIONS = permissionsManager.debug;
  debugPermissions('Permissions debug is available:', 'DEBUG_PERMISSIONS');
}
