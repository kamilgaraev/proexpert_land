import { useState, useCallback } from 'react';
import { multiOrgApiV2 } from '@/utils/multiOrganizationApiV2';
import type { ProjectDetailV2 } from '@/types/multi-organization-v2';
import { getErrorMessage } from '@/utils/multiOrgErrorHandler';

export const useHoldingProjectDetails = (projectId?: number) => {
  const [data, setData] = useState<ProjectDetailV2 | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProject = useCallback(async (id?: number) => {
    const targetId = id || projectId;
    
    if (!targetId) {
      setError('ID проекта не указан');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await multiOrgApiV2.getProject(targetId);
      setData(response.data);
    } catch (err: any) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      console.error('Failed to load project details:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const refetch = useCallback(() => {
    if (projectId) {
      fetchProject(projectId);
    }
  }, [projectId, fetchProject]);

  return {
    data,
    loading,
    error,
    fetchProject,
    refetch,
  };
};

