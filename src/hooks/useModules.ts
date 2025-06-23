import { useState, useCallback } from 'react';
import { modulesService, type ModulesResponse, type ActivatedModule, type OrganizationModule, type ActivateModuleRequest, type RenewModuleRequest } from '@utils/api';
import { toast } from 'react-toastify';

export const useModules = () => {
  const [modules, setModules] = useState<ModulesResponse | null>(null);
  const [availableModules, setAvailableModules] = useState<Record<string, OrganizationModule[]>>({});
  const [expiringModules, setExpiringModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      return response.data?.has_access || false;
    } catch (err: any) {
      console.error('Ошибка проверки доступа к модулю:', err);
      return false;
    }
  };

  const getModulesByCategory = useCallback((category: string): ActivatedModule[] => {
    if (!modules) return [];
    return modules[category as keyof ModulesResponse] || [];
  }, [modules]);

  const getAllActiveModules = useCallback((): ActivatedModule[] => {
    if (!modules) return [];
    return Object.values(modules).flat().filter(module => module.is_activated && module.status === 'active');
  }, [modules]);

  const getActiveModuleSlugs = useCallback((): string[] => {
    return getAllActiveModules().map(module => module.module.slug);
  }, [getAllActiveModules]);

  return {
    modules,
    availableModules,
    expiringModules,
    loading,
    error,
    fetchModules,
    fetchAvailableModules,
    fetchExpiringModules,
    activateModule,
    deactivateModule,
    renewModule,
    checkModuleAccess,
    getModulesByCategory,
    getAllActiveModules,
    getActiveModuleSlugs,
  };
}; 