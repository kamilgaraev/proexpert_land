import { useState, useEffect, useCallback, useRef } from 'react';
import { newModulesService, Module, ModuleBillingInfo } from '@utils/api';

interface UseModulesOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onError?: (error: string) => void;
}

interface UseModulesState {
  allModules: Module[];
  activeModules: Module[];
  expiringModules: Module[];
  billingInfo: ModuleBillingInfo | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

interface UseModulesReturn extends UseModulesState {
  refresh: () => void;
  activateModule: (moduleSlug: string, durationDays?: number) => Promise<boolean>;
  deactivateModule: (moduleSlug: string) => Promise<boolean>;
  renewModule: (moduleSlug: string, durationDays?: number) => Promise<boolean>;
  checkAccess: (moduleSlug: string, permission?: string) => Promise<{ hasAccess: boolean; hasPermission: boolean; expiresAt: string | null }>;
  getActivationPreview: (moduleSlug: string) => Promise<any>;
  isModuleActive: (moduleSlug: string) => boolean;
  getModule: (moduleSlug: string) => Module | null;
  hasExpiring: boolean;
  totalMonthlyCost: number;
  activeModulesCount: number;
}

export const useModules = (options: UseModulesOptions = {}): UseModulesReturn => {
  const {
    autoRefresh = false,
    refreshInterval = 300000, // 5 минут
    onError = null
  } = options;

  const [state, setState] = useState<UseModulesState>({
    allModules: [],
    activeModules: [],
    expiringModules: [],
    billingInfo: null,
    loading: true,
    error: null,
    lastUpdated: null
  });

  const onErrorRef = useRef(onError);
  const isLoadingRef = useRef(false);
  
  useEffect(() => {
    onErrorRef.current = onError;
  });

  const handleError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error, loading: false }));
    if (onErrorRef.current) {
      onErrorRef.current(error);
    }
  }, []);

  // Функция для динамического извлечения модулей из всех категорий
  const extractModulesFromCategories = useCallback((responseData: any): Module[] => {
    let modules: Module[] = [];
    if (responseData && typeof responseData === 'object') {
      // Перебираем все категории в ответе (core, reports, addon, premium и т.д.)
      Object.keys(responseData).forEach(category => {
        if (Array.isArray(responseData[category])) {
          modules = [...modules, ...responseData[category]];
        }
      });
    }
    return modules;
  }, []);

  const fetchAllData = useCallback(async () => {
    if (isLoadingRef.current) {
      return;
    }
    
    try {
      isLoadingRef.current = true;
      setState(prev => ({ ...prev, error: null }));
      
      const [
        modulesResponse,
        activeResponse,
        expiringResponse,
        billingResponse
      ] = await Promise.all([
        newModulesService.getModules(),
        newModulesService.getActiveModules(),
        newModulesService.getExpiringModules(7),
        newModulesService.getBillingInfo()
      ]);

      if (modulesResponse.status === 200 && activeResponse.status === 200) {
        // Обрабатываем новый формат данных API - модули группируются по категориям
        let allModulesData: Module[] = [];
        if (modulesResponse.data?.success && modulesResponse.data.data) {
          // Динамически извлекаем модули из всех категорий (core, reports, addon, premium и др.)
          allModulesData = extractModulesFromCategories(modulesResponse.data.data);
        }

        // Для активных модулей используем тот же подход
        let activeModulesData: Module[] = [];
        if (activeResponse.data?.success && activeResponse.data.data) {
          if (activeResponse.data.data.modules) {
            // Если есть прямое поле modules
            activeModulesData = activeResponse.data.data.modules;
          } else {
            // Иначе динамически извлекаем из категорий
            activeModulesData = extractModulesFromCategories(activeResponse.data.data);
          }
        }

        // Для истекающих модулей используем тот же подход
        let expiringModulesData: Module[] = [];
        if (expiringResponse.data?.success && expiringResponse.data.data) {
          if (expiringResponse.data.data.modules) {
            // Если есть прямое поле modules
            expiringModulesData = expiringResponse.data.data.modules;
          } else {
            // Иначе динамически извлекаем из категорий
            expiringModulesData = extractModulesFromCategories(expiringResponse.data.data);
          }
        }
        
        const billingData = billingResponse.data?.success ? billingResponse.data.data : null;

        setState({
          allModules: allModulesData,
          activeModules: activeModulesData,
          expiringModules: expiringModulesData,
          billingInfo: billingData,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
        isLoadingRef.current = false;
      } else {
        const errorMessage = modulesResponse.data?.message || activeResponse.data?.message || 'Ошибка загрузки модулей';
        handleError(errorMessage);
        isLoadingRef.current = false;
      }
    } catch (error: any) {
      console.error('Ошибка загрузки модулей:', error);
      handleError(error.message || 'Не удалось загрузить модули');
      isLoadingRef.current = false;
    }
  }, [handleError, extractModulesFromCategories]);

  // Первоначальная загрузка
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Автообновление
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      const interval = setInterval(fetchAllData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchAllData]);

  const refresh = useCallback(() => {
    if (!isLoadingRef.current) {
      setState(prev => ({ ...prev, loading: true }));
      fetchAllData();
    }
  }, [fetchAllData]);

  const activateModule = useCallback(async (moduleSlug: string, durationDays: number = 30): Promise<boolean> => {
    try {
      const response = await newModulesService.activateModule(moduleSlug, durationDays);
      
      if (response.status === 200 && response.data?.success) {
        await fetchAllData();
        return true;
      } else {
        const errorMessage = response.data?.message || 'Ошибка активации модуля';
        handleError(errorMessage);
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка активации модуля';
      handleError(errorMessage);
      return false;
    }
  }, [fetchAllData, handleError]);

  const deactivateModule = useCallback(async (moduleSlug: string): Promise<boolean> => {
    try {
      const response = await newModulesService.deactivateModule(moduleSlug);
      
      if (response.status === 200 && response.data?.success) {
        await fetchAllData();
        return true;
      } else {
        const errorMessage = response.data?.message || 'Ошибка деактивации модуля';
        handleError(errorMessage);
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка деактивации модуля';
      handleError(errorMessage);
      return false;
    }
  }, [fetchAllData, handleError]);

  const renewModule = useCallback(async (moduleSlug: string, durationDays: number = 30): Promise<boolean> => {
    try {
      const response = await newModulesService.renewModule(moduleSlug, durationDays);
      
      if (response.status === 200 && response.data?.success) {
        await fetchAllData();
        return true;
      } else {
        const errorMessage = response.data?.message || 'Ошибка продления модуля';
        handleError(errorMessage);
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Ошибка продления модуля';
      handleError(errorMessage);
      return false;
    }
  }, [fetchAllData, handleError]);

  const checkAccess = useCallback(async (moduleSlug: string, permission?: string) => {
    try {
      const response = await newModulesService.checkAccess(moduleSlug, permission);
      
      if (response.status === 200 && response.data?.success) {
        const data = response.data.data;
        return {
          hasAccess: data.has_access,
          hasPermission: data.has_permission,
          expiresAt: data.expires_at
        };
      } else {
        return {
          hasAccess: false,
          hasPermission: false,
          expiresAt: null
        };
      }
    } catch (error: any) {
      return {
        hasAccess: false,
        hasPermission: false,
        expiresAt: null
      };
    }
  }, []);

  const getActivationPreview = useCallback(async (moduleSlug: string) => {
    try {
      const response = await newModulesService.getActivationPreview(moduleSlug);
      
      if (response.status === 200 && response.data?.success) {
        // Проверяем, есть ли двойная вложенность данных
        const previewData = response.data.data || response.data;
        console.log('Preview data received:', previewData); // Для отладки
        return previewData;
      } else {
        throw new Error(response.data?.message || 'Ошибка получения предпросмотра');
      }
    } catch (error: any) {
      console.error('Error in getActivationPreview:', error); // Для отладки
      throw new Error(error.response?.data?.message || error.message || 'Ошибка получения предпросмотра');
    }
  }, []);

  // Вспомогательные методы
  const isModuleActive = useCallback((moduleSlug: string): boolean => {
    // Сначала проверяем в активных модулях
    const isInActiveList = state.activeModules.some(module => module.slug === moduleSlug);
    if (isInActiveList) return true;
    
    // Затем проверяем флаг is_active у модуля
    const module = state.allModules.find(m => m.slug === moduleSlug);
    return module?.is_active || false;
  }, [state.activeModules, state.allModules]);

  const getModule = useCallback((moduleSlug: string): Module | null => {
    return state.allModules.find(module => module.slug === moduleSlug) || null;
  }, [state.allModules]);

  // Вспомогательные геттеры
  const hasExpiring = state.expiringModules.length > 0;
  const totalMonthlyCost = state.billingInfo?.total_monthly_cost || 0;
  const activeModulesCount = state.billingInfo?.active_modules_count || state.activeModules.length;

  return {
    ...state,
    refresh,
    activateModule,
    deactivateModule,
    renewModule,
    checkAccess,
    getActivationPreview,
    isModuleActive,
    getModule,
    hasExpiring,
    totalMonthlyCost,
    activeModulesCount
  };
};
