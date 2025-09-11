import { useState, useCallback } from 'react';
import { modulesService, type ModulesResponse, type ActivatedModule, type OrganizationModule, type ActivateModuleRequest, type RenewModuleRequest, type CancelPreviewResponse, type CancelModuleRequest, type CancelModuleResponse } from '@utils/api';
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
        setModules(response.data.data);
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
        await fetchModules();
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
    if (!modules || !modules.data) return [];
    return modules.data.filter(module => module.module.category === category);
  }, [modules]);

  const getAvailableModulesByCategory = useCallback((category: string): OrganizationModule[] => {
    if (!availableModules || !availableModules[category]) return [];
    return availableModules[category];
  }, [availableModules]);

  const getModuleWithStatus = useCallback((module: OrganizationModule) => {
    const activatedModule = modules?.data?.find(am => am.module.id === module.id);
    return {
      ...module,
      isActivated: !!activatedModule,
      activatedInfo: activatedModule || null,
      status: activatedModule?.status || 'inactive'
    };
  }, [modules]);

  const getAllActiveModules = useCallback((): ActivatedModule[] => {
    if (!modules || !modules.data) return [];
    return modules.data.filter(module => module.status === 'active');
  }, [modules]);

  const getActiveModuleSlugs = useCallback((): string[] => {
    return getAllActiveModules().map(module => module.module.slug);
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
    getModuleWithStatus,
    getAllActiveModules,
    getActiveModuleSlugs,
    getCancelPreview,
    cancelModule,
    clearCancelPreview,
  };
}; 