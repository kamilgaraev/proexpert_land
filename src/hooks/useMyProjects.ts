import { useState, useCallback } from 'react';
import api from '@/utils/api';
import type {
  ProjectOverview,
  ProjectDetails
} from '@/types/projects-overview';

interface UseMyProjectsState {
  projects: ProjectOverview[];
  loading: boolean;
  error: string | null;
}

interface UseMyProjectsReturn extends UseMyProjectsState {
  fetchProjects: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useMyProjects = (): UseMyProjectsReturn => {
  const [projects, setProjects] = useState<ProjectOverview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/my-projects');
      const responseData = response.data as any;
      
      if (responseData && responseData.success !== false) {
         // Support both { data: [...] } and { data: { projects: [...] } }
         const data = responseData.data?.projects || responseData.data || [];
         setProjects(Array.isArray(data) ? data : []);
      } else {
        setError(responseData?.message || 'Ошибка загрузки проектов');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки проектов';
      setError(errorMessage);
      console.error('Ошибка при загрузке проектов:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    refresh
  };
};

interface UseProjectDetailsState {
  projectDetails: ProjectDetails | null;
  loading: boolean;
  error: string | null;
}

interface UseProjectDetailsReturn extends UseProjectDetailsState {
  fetchProjectDetails: (projectId: number) => Promise<void>;
  clearDetails: () => void;
}

export const useProjectDetails = (): UseProjectDetailsReturn => {
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjectDetails = useCallback(async (projectId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/my-projects/${projectId}`);
      const responseData = response.data as any;
      
      if (responseData && responseData.success !== false) {
        setProjectDetails(responseData.data);
      } else {
        setError(responseData?.message || 'Ошибка загрузки деталей проекта');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка загрузки деталей проекта';
      setError(errorMessage);
      console.error('Ошибка при загрузке деталей проекта:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearDetails = useCallback(() => {
    setProjectDetails(null);
    setError(null);
  }, []);

  return {
    projectDetails,
    loading,
    error,
    fetchProjectDetails,
    clearDetails
  };
};
