import { useState, useCallback } from 'react';
import { modulesService, type ModulesResponse, type ModuleWithActivation, type OrganizationModule, type ActivatedModule, type ActivateModuleRequest, type RenewModuleRequest, type CancelPreviewResponse, type CancelModuleRequest, type CancelModuleResponse } from '@utils/api';
import { toast } from 'react-toastify';

export const useModules = () => {
  const [modules, setModules] = useState<ModulesResponse | null>(null);
  const [availableModules, setAvailableModules] = useState<Record<string, OrganizationModule[]>>({});
  const [expiringModules, setExpiringModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelPreview, setCancelPreview] = useState<CancelPreviewResponse | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await modulesService.getModules();
      
      if (response.data && response.data.success) {
        setModules(response.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки модулей');
      }
    } catch (err: any) {
      console.error('Ошибка при загрузке модулей:', err);
      setError(err.message || 'Ошибка загрузки модулей');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAvailableModules = useCallback(async () => {
    try {
      setLoading(true);
      const response = await modulesService.getAvailableModules();
      
      if (response.data && response.data.success) {
        setAvailableModules(response.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки доступных модулей');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchExpiringModules = useCallback(async () => {
    try {
      const response = await modulesService.getExpiringModules();
      
      if (response.data && response.data.success) {
        setExpiringModules(response.data.data);
      }
    } catch (err: any) {
      console.error('Ошибка при загрузке истекающих модулей:', err);
    }
  }, []);

  const activateModule = async (moduleData: ActivateModuleRequest) => {
    try {
      setLoading(true);
      const response = await modulesService.activateModule(moduleData);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Модуль успешно активирован');
        await new Promise(resolve => setTimeout(resolve, 500));
        await fetchModules();
        await fetchAvailableModules();
        return response.data;
      }
      throw new Error(response.data.message || 'Ошибка активации модуля');
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка активации модуля';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deactivateModule = async (moduleId: number) => {
    try {
      setLoading(true);
      const response = await modulesService.deactivateModule(moduleId);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Модуль успешно деактивирован');
        await fetchModules();
        return response.data;
      }
      throw new Error(response.data.message || 'Ошибка деактивации модуля');
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка деактивации модуля';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const renewModule = async (moduleId: number, renewData: RenewModuleRequest) => {
    try {
      setLoading(true);
      const response = await modulesService.renewModule(moduleId, renewData);
      
      if (response.data.success) {
        toast.success('Модуль успешно продлен');
        await fetchModules();
        return response.data;
      }
      throw new Error(response.data.message || 'Ошибка продления модуля');
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка продления модуля';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const checkModuleAccess = async (moduleSlug: string): Promise<boolean> => {
    try {
      const response = await modulesService.checkAccess({ module_slug: moduleSlug });
      if (response.status === 500) {
        console.warn(`Серверная ошибка при проверке модуля ${moduleSlug}, возвращаем false`);
        return false;
      }
      return response.data?.has_access || false;
    } catch (err: any) {
      console.error('Ошибка проверки доступа к модулю:', err);
      return false;
    }
  };

  const getModulesByCategory = useCallback((category: string): ActivatedModule[] => {
    if (!modules || !modules.data || !Array.isArray(modules.data)) return [];
    return modules.data.filter(module => module.module?.category === category);
  }, [modules]);

  // Унифицированный поиск активации по ID модуля организации
  const findActivationByModuleId = useCallback((organizationModuleId: number): ActivatedModule | null => {
    if (!modules || !modules.data) return null;
    const raw = modules.data as any;

    // Вариант 1: сервер вернул плоский массив ActivatedModule[]
    if (Array.isArray(raw)) {
      const match = (raw as ActivatedModule[]).find(
        (am) => am.organization_module_id === organizationModuleId || am.module?.id === organizationModuleId
      );
      return match || null;
    }

    // Вариант 2: сервер вернул объект категорий { analytics: ModuleWithActivation[], ... }
    if (raw && typeof raw === 'object') {
      for (const value of Object.values(raw)) {
        if (!Array.isArray(value)) continue;
        for (const item of value as any[]) {
          const moduleId = item?.module?.id ?? item?.organization_module_id ?? item?.id;
          if (moduleId === organizationModuleId) {
            if (item?.activation) {
              return item.activation as ActivatedModule;
            }
            // Сконструируем минимальную запись ActivatedModule, если её нет
            const constructed: ActivatedModule = {
              id: item?.id ?? 0,
              organization_id: item?.organization_id ?? 0,
              organization_module_id: moduleId,
              module: item?.module,
              activated_at: item?.activated_at ?? null,
              expires_at: item?.expires_at ?? null,
              status: (item?.status ?? (item?.is_activated ? 'active' : 'inactive')) as any,
              paid_amount: item?.paid_amount ?? 0,
              payment_method: (item?.payment_method ?? 'balance') as any,
            };
            return constructed;
          }
        }
      }
    }

    return null;
  }, [modules]);

  const getAvailableModulesByCategory = useCallback((category: string): ModuleWithActivation[] => {
    if (!availableModules || !availableModules[category] || !Array.isArray(availableModules[category])) {
      return [];
    }
    
    // Преобразуем OrganizationModule в ModuleWithActivation
    const modulesWithStatus = availableModules[category].map((orgModule: OrganizationModule): ModuleWithActivation => {
      const activatedModule = findActivationByModuleId(orgModule.id);
      
      return {
        module: orgModule,
        is_activated: !!activatedModule,
        activation: activatedModule || null,
        days_until_expiration: null,
        expires_at: activatedModule?.expires_at || null,
        status: activatedModule?.status || 'inactive'
      };
    });
    
    return modulesWithStatus;
  }, [availableModules, findActivationByModuleId]);

  const getAllActiveModules = useCallback((): ActivatedModule[] => {
    if (!modules || !modules.data || !Array.isArray(modules.data)) return [];
    return modules.data.filter(module => module.status === 'active');
  }, [modules]);

  const getActiveModuleSlugs = useCallback((): string[] => {
    return getAllActiveModules().map(module => module.module?.slug).filter(Boolean) as string[];
  }, [getAllActiveModules]);

  // Новые методы для работы с отменой модулей
  const getCancelPreview = async (moduleSlug: string): Promise<CancelPreviewResponse | null> => {
    try {
      setLoading(true);
      const response = await modulesService.getCancelPreview(moduleSlug);
      
      if (response.data && response.data.success) {
        setCancelPreview(response.data.data);
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Ошибка получения предварительного просмотра отмены');
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка получения предварительного просмотра отмены';
      setError(errorMsg);
      toast.error(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelModule = async (moduleSlug: string, cancelData: CancelModuleRequest): Promise<CancelModuleResponse | null> => {
    try {
      setLoading(true);
      const response = await modulesService.cancelModule(moduleSlug, cancelData);
      
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Модуль успешно отменен');
        await fetchModules(); // Обновляем список модулей
        setCancelPreview(null); // Очищаем предварительный просмотр
        return response.data.data;
      }
      throw new Error(response.data?.message || 'Ошибка отмены модуля');
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка отмены модуля';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearCancelPreview = () => {
    setCancelPreview(null);
  };

  return {
    modules,
    availableModules,
    expiringModules,
    loading,
    error,
    cancelPreview,
    fetchModules,
    fetchAvailableModules,
    fetchExpiringModules,
    activateModule,
    deactivateModule,
    renewModule,
    checkModuleAccess,
    getModulesByCategory,
    getAvailableModulesByCategory,
    getAllActiveModules,
    getActiveModuleSlugs,
    getCancelPreview,
    cancelModule,
    clearCancelPreview,
  };
}; 