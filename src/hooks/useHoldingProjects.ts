import { useState, useEffect, useCallback } from 'react';
import { multiOrgApiV2 } from '@/utils/multiOrganizationApiV2';
import type { 
  ProjectWithOrganization, 
  HoldingFilters, 
  PaginatedData 
} from '@/types/multi-organization-v2';
import { getErrorMessage } from '@/utils/multiOrgErrorHandler';

export const useHoldingProjects = (initialFilters?: HoldingFilters) => {
  const [data, setData] = useState<PaginatedData<ProjectWithOrganization> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<HoldingFilters>(initialFilters || {});
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(50);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await multiOrgApiV2.getProjects(filters, currentPage, perPage);
      setData(response.data);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to load holding projects:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, perPage]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const updateFilters = useCallback((newFilters: Partial<HoldingFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const changePerPage = useCallback((newPerPage: number) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  }, []);

  return {
    data,
    loading,
    error,
    filters,
    currentPage,
    perPage,
    updateFilters,
    resetFilters,
    refetch: fetchProjects,
    goToPage,
    changePerPage,
  };
};

