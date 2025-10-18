import { useState, useEffect, useCallback } from 'react';
import { multiOrgApiV2 } from '@/utils/multiOrganizationApiV2';
import type { HoldingDashboardData } from '@/types/multi-organization-v2';
import { getErrorMessage, handleMultiOrgApiError } from '@/utils/multiOrgErrorHandler';

export const useHoldingDashboard = () => {
  const [data, setData] = useState<HoldingDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await multiOrgApiV2.getDashboard();
      setData(response.data);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to load holding dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return {
    data,
    loading,
    error,
    refetch: fetchDashboard,
  };
};

