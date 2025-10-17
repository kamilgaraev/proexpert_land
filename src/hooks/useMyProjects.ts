import { useState, useCallback } from 'react';
import { myProjectsService } from '@/utils/api';
import type {
  ProjectOverview,
  ProjectsGrouped,
  ProjectsTotals,
  ProjectDetails,
  MyProjectsResponse,
  ProjectDetailsResponse
} from '@/types/projects-overview';

interface UseMyProjectsState {
  projects: ProjectOverview[];
  grouped: ProjectsGrouped | null;
  totals: ProjectsTotals | null;
  loading: boolean;
  error: string | null;
}

interface UseMyProjectsReturn extends UseMyProjectsState {
  fetchProjects: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useMyProjects = (): UseMyProjectsReturn => {
  const [projects, setProjects] = useState<ProjectOverview[]>([]);
  const [grouped, setGrouped] = useState<ProjectsGrouped | null>(null);
  const [totals, setTotals] = useState<ProjectsTotals | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await myProjectsService.getMyProjects();
      
      if (response.data && response.data.success) {
        const data = response.data.data;
        setProjects(data.projects);
        setGrouped(data.grouped);
        setTotals(data.totals);
      } else {
        setError(response.data?.message || 'Ошибка загрузки проектов');
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
    grouped,
    totals,
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
      const response = await myProjectsService.getProjectDetails(projectId);
      
      if (response.data && response.data.success) {
        setProjectDetails(response.data.data);
      } else {
        setError(response.data?.message || 'Ошибка загрузки деталей проекта');
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

