import { useState, useEffect, useCallback, useRef } from 'react';
import { newModulesService, Module, ModuleBillingInfo } from '@utils/api';
import { usePermissions } from '@/hooks/usePermissions';

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

  const { reload: reloadPermissions } = usePermissions();

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
      
      const [modulesResponse, activeResponse, expiringResponse, billingResponse] = await Promise.all([
        newModulesService.getModules(),
        newModulesService.getActiveModules(),
        newModulesService.getExpiringModules(7),
        newModulesService.getBillingInfo()
      ]);

      if (modulesResponse.status === 200 && activeResponse.status === 200) {
        // Унифицированный доступ к полезной части ответа
        const unwrap = (resp: any) => (resp?.data?.data ?? resp?.data ?? null);

        // Все модули
        let allModulesData: Module[] = [];
        const allRaw = unwrap(modulesResponse);
        if (Array.isArray(allRaw)) {
          allModulesData = allRaw as Module[];
        } else if (allRaw?.modules && Array.isArray(allRaw.modules)) {
          allModulesData = allRaw.modules as Module[];
        } else {
          allModulesData = extractModulesFromCategories(allRaw);
        }

        // Активные модули
        let activeModulesData: Module[] = [];
        const activeRaw = unwrap(activeResponse);
        if (Array.isArray(activeRaw)) {
          activeModulesData = activeRaw as Module[];
        } else if (activeRaw?.modules && Array.isArray(activeRaw.modules)) {
          activeModulesData = activeRaw.modules as Module[];
        } else {
          activeModulesData = extractModulesFromCategories(activeRaw);
        }

        // Истекающие модули
        let expiringModulesData: Module[] = [];
        const expiringRaw = unwrap(expiringResponse);
        if (Array.isArray(expiringRaw)) {
          expiringModulesData = expiringRaw as Module[];
        } else if (expiringRaw?.modules && Array.isArray(expiringRaw.modules)) {
          expiringModulesData = expiringRaw.modules as Module[];
        } else {
          expiringModulesData = extractModulesFromCategories(expiringRaw);
        }

        // Биллинг
        const billingRaw = unwrap(billingResponse);
        const billingData: ModuleBillingInfo | null = (billingRaw?.billing_info ?? billingRaw) || null;

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
        // Обновляем права после активации модуля
        await reloadPermissions();
        return true;
      } else if (response.status === 402) {
        // Ошибка недостаточности средств
        const errorMessage = response.data?.message || 'Недостаточно средств для активации модуля';
        handleError(errorMessage);
        return false;
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
  }, [fetchAllData, handleError, reloadPermissions]);

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
      } else if (response.status === 402) {
        // Ошибка недостаточности средств
        const errorMessage = response.data?.message || 'Недостаточно средств для продления модуля';
        handleError(errorMessage);
        return false;
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
  const computeMonthlyCost = useCallback((modules: Module[]): number => {
    try {
      return modules.reduce((sum, m) => {
        if (!m) return sum;
        
        // Проверяем различные варианты структуры данных для цены
        let price = 0;
        let durationDays = 30;
        
        // Вариант 1: прямые поля price/duration_days
        if (typeof m.price === 'number') {
          price = m.price;
        }
        
        // Вариант 2: pricing_config.base_price/duration_days
        const pricingConfig = (m as any).pricing_config;
        if (pricingConfig && typeof pricingConfig.base_price === 'number') {
          price = pricingConfig.base_price;
          if (typeof pricingConfig.duration_days === 'number' && pricingConfig.duration_days > 0) {
            durationDays = pricingConfig.duration_days;
          }
        }
        
        // Вариант 3: duration_days в корне объекта
        if (typeof m.duration_days === 'number' && m.duration_days > 0) {
          durationDays = m.duration_days;
        }
        
        // Пропускаем бесплатные модули
        if (price === 0 || (m as any).billing_model === 'free') {
          return sum;
        }
        
        const monthly = price * (30 / durationDays);
        console.log(`📊 Модуль ${m.name}: цена=${price}, дни=${durationDays}, месячная=${monthly.toFixed(2)}`);
        return sum + monthly;
      }, 0);
    } catch (error) {
      console.error('Ошибка подсчета месячной стоимости:', error);
      return 0;
    }
  }, []);

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
  const totalMonthlyCost = (state.billingInfo && (state.billingInfo as any).total_monthly_cost != null)
    ? Number((state.billingInfo as any).total_monthly_cost)
    : computeMonthlyCost(state.activeModules);
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
