import { useState, useEffect, useCallback } from 'react';
import { multiOrgApiV2 } from '@/utils/multiOrganizationApiV2';
import type { FilterOptions, HoldingFilters } from '@/types/multi-organization-v2';
import { getErrorMessage } from '@/utils/multiOrgErrorHandler';

export const useHoldingFilters = () => {
  const [options, setOptions] = useState<FilterOptions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrgIds, setSelectedOrgIds] = useState<number[]>([]);

  const fetchOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await multiOrgApiV2.getFilterOptions();
      setOptions(response.data);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to load filter options:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  const selectOrganization = useCallback((orgId: number) => {
    setSelectedOrgIds(prev => {
      if (prev.includes(orgId)) {
        return prev.filter(id => id !== orgId);
      }
      return [...prev, orgId];
    });
  }, []);

  const selectAllOrganizations = useCallback(() => {
    if (!options) return;
    const allIds = [
      options.organizations.current.id,
      ...options.organizations.children.map(child => child.id),
    ];
    setSelectedOrgIds(allIds);
  }, [options]);

  const deselectAllOrganizations = useCallback(() => {
    setSelectedOrgIds([]);
  }, []);

  const buildFiltersWithOrganizations = useCallback(
    (additionalFilters?: Partial<HoldingFilters>): HoldingFilters => {
      return {
        ...additionalFilters,
        organization_ids: selectedOrgIds.length > 0 ? selectedOrgIds : undefined,
      };
    },
    [selectedOrgIds]
  );

  return {
    options,
    loading,
    error,
    selectedOrgIds,
    selectOrganization,
    selectAllOrganizations,
    deselectAllOrganizations,
    setSelectedOrgIds,
    buildFiltersWithOrganizations,
    refetch: fetchOptions,
  };
};

