import { useState, useCallback } from 'react';
import { multiOrgApiV2 } from '@/utils/multiOrganizationApiV2';
import type { 
  HoldingDashboardData,
  ProjectWithOrganization,
  FilterOptions,
  HoldingFilters,
  PaginatedData,
} from '@/types/multi-organization-v2';
import { getErrorMessage } from '@/utils/multiOrgErrorHandler';
import { toast } from 'react-toastify';

export const useMultiOrganizationV2 = () => {
  const [dashboard, setDashboard] = useState<HoldingDashboardData | null>(null);
  const [projects, setProjects] = useState<PaginatedData<ProjectWithOrganization> | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await multiOrgApiV2.getDashboard();
      setDashboard(response.data);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProjects = useCallback(async (filters?: HoldingFilters, page = 1, perPage = 50) => {
    try {
      setLoading(true);
      setError(null);
      const response = await multiOrgApiV2.getProjects(filters, page, perPage);
      setProjects(response.data);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFilterOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await multiOrgApiV2.getFilterOptions();
      setFilterOptions(response.data);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const isHolding = useCallback(() => {
    return dashboard?.holding_info !== undefined;
  }, [dashboard]);

  return {
    dashboard,
    projects,
    filterOptions,
    loading,
    error,
    fetchDashboard,
    fetchProjects,
    fetchFilterOptions,
    isHolding,
  };
};

