import { useState, useCallback } from 'react';
import { 
  multiOrganizationService, 
  type MultiOrganizationAvailability, 
  type OrganizationHierarchy, 
  type AccessibleOrganization, 
  type OrganizationDetails,
  type CreateHoldingRequest, 
  type AddChildOrganizationRequest
} from '@utils/api';
import { toast } from 'react-toastify';

export const useMultiOrganization = () => {
  const [availability, setAvailability] = useState<MultiOrganizationAvailability | null>(null);
  const [hierarchy, setHierarchy] = useState<OrganizationHierarchy | null>(null);
  const [accessibleOrganizations, setAccessibleOrganizations] = useState<AccessibleOrganization[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<OrganizationDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await multiOrganizationService.checkAvailability();
      
      if (response.data && response.data.success) {
        setAvailability(response.data.data || response.data);
        return response.data.available;
      } else {
        setError(response.data?.message || 'Ошибка проверки доступности');
        return false;
      }
    } catch (err: any) {
      console.error('Ошибка при проверке доступности мультиорганизации:', err);
      setError(err.message || 'Ошибка проверки доступности');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHierarchy = useCallback(async () => {
    try {
      setLoading(true);
      const response = await multiOrganizationService.getHierarchy();
      
      if (response.data && response.data.success) {
        setHierarchy(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки иерархии');
      }
    } catch (err: any) {
      console.error('Ошибка при загрузке иерархии:', err);
      setError(err.message || 'Ошибка загрузки иерархии');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAccessibleOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await multiOrganizationService.getAccessibleOrganizations();
      
      if (response.data && response.data.success) {
        setAccessibleOrganizations(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки организаций');
      }
    } catch (err: any) {
      console.error('Ошибка при загрузке доступных организаций:', err);
      setError(err.message || 'Ошибка загрузки организаций');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrganizationDetails = async (organizationId: number) => {
    try {
      setLoading(true);
      const response = await multiOrganizationService.getOrganizationDetails(organizationId);
      
      if (response.data && response.data.success) {
        setSelectedOrganization(response.data.data);
        return response.data.data;
      } else {
        setError(response.data?.message || 'Ошибка загрузки данных организации');
        return null;
      }
    } catch (err: any) {
      console.error('Ошибка при загрузке данных организации:', err);
      setError(err.message || 'Ошибка загрузки данных организации');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createHolding = async (holdingData: CreateHoldingRequest) => {
    try {
      setLoading(true);
      const response = await multiOrganizationService.createHolding(holdingData);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Холдинг успешно создан');
        await fetchHierarchy();
        await checkAvailability();
        return response.data;
      }
      throw new Error(response.data.message || 'Ошибка создания холдинга');
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка создания холдинга';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addChildOrganization = async (childData: AddChildOrganizationRequest) => {
    try {
      setLoading(true);
      const response = await multiOrganizationService.addChildOrganization(childData);
      
      if (response.data.success) {
        toast.success(response.data.message || 'Дочерняя организация успешно добавлена');
        await fetchHierarchy();
        await fetchAccessibleOrganizations();
        return response.data;
      }
      throw new Error(response.data.message || 'Ошибка добавления дочерней организации');
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка добавления дочерней организации';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const switchContext = async (organizationId: number) => {
    try {
      setLoading(true);
      const response = await multiOrganizationService.switchContext({ organization_id: organizationId });
      
      if (response.data.success) {
        toast.success(response.data.message || 'Контекст организации изменен');
        return response.data;
      }
      throw new Error(response.data.message || 'Ошибка смены контекста');
    } catch (err: any) {
      const errorMsg = err.message || 'Ошибка смены контекста';
      setError(errorMsg);
      toast.error(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const isMultiOrganizationAvailable = useCallback(() => {
    return availability?.available || false;
  }, [availability]);

  const canCreateHolding = useCallback(() => {
    return availability?.can_create_holding || false;
  }, [availability]);

  const isHolding = useCallback(() => {
    return availability?.is_holding || false;
  }, [availability]);

  const getCurrentOrganizationType = useCallback(() => {
    return availability?.current_type || 'single';
  }, [availability]);

  return {
    availability,
    hierarchy,
    accessibleOrganizations,
    selectedOrganization,
    loading,
    error,
    checkAvailability,
    fetchHierarchy,
    fetchAccessibleOrganizations,
    fetchOrganizationDetails,
    createHolding,
    addChildOrganization,
    switchContext,
    isMultiOrganizationAvailable,
    canCreateHolding,
    isHolding,
    getCurrentOrganizationType,
  };
};

// Хук для получения summary по холдингу
export const useHoldingSummary = () => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async (params: {
    date_from?: string;
    date_to?: string;
    status?: string;
    is_approved?: boolean;
    export?: string;
    section?: 'projects' | 'contracts' | 'acts' | 'completed_works';
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await multiOrganizationService.getHoldingSummary(params);
      if (response.data && response.data.success) {
        setSummary(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка получения сводки');
      }
    } catch (err: any) {
      setError(err.message || 'Ошибка получения сводки');
    } finally {
      setLoading(false);
    }
  }, []);

  return { summary, loading, error, fetchSummary };
}; 