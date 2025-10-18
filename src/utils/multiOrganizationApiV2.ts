import axios, { AxiosInstance } from 'axios';
import type {
  HoldingDashboardData,
  ProjectWithOrganization,
  ProjectDetailV2,
  ContractWithOrganization,
  FilterOptions,
  HoldingFilters,
  PaginatedData,
  ApiResponse,
} from '@/types/multi-organization-v2';
import { getTokenFromStorages } from './api';

const API_BASE_DOMAIN = 'https://api.prohelper.pro';
const MULTI_ORG_API_URL = `${API_BASE_DOMAIN}/api/v1/landing/multi-organization`;

const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: MULTI_ORG_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  client.interceptors.request.use((config) => {
    const token = getTokenFromStorages();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 403) {
        const message = error.response?.data?.message || error.response?.data?.error;
        if (message?.includes('holding')) {
          console.error('Access denied: Not a holding organization');
        } else if (message?.includes('module')) {
          console.error('Access denied: Multi-organization module not active');
        }
      }
      return Promise.reject(error);
    }
  );

  return client;
};

const api = createApiClient();

const buildQueryParams = (filters?: HoldingFilters, page?: number, perPage?: number): string => {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.organization_ids && filters.organization_ids.length > 0) {
      filters.organization_ids.forEach(id => {
        params.append('filters[organization_ids][]', id.toString());
      });
    }

    if (filters.status) {
      params.append('filters[status]', filters.status);
    }

    if (filters.date_from) {
      params.append('filters[date_from]', filters.date_from);
    }

    if (filters.date_to) {
      params.append('filters[date_to]', filters.date_to);
    }

    if (filters.include_archived !== undefined) {
      params.append('filters[include_archived]', filters.include_archived.toString());
    }

    if (filters.contractor_search) {
      params.append('filters[contractor_search]', filters.contractor_search);
    }

    if (filters.project_id) {
      params.append('filters[project_id]', filters.project_id.toString());
    }

    if (filters.name) {
      params.append('filters[name]', filters.name);
    }
  }

  if (page) {
    params.append('page', page.toString());
  }

  if (perPage) {
    params.append('per_page', perPage.toString());
  }

  return params.toString();
};

export const multiOrgApiV2 = {
  getDashboard: async () => {
    const response = await api.get<ApiResponse<HoldingDashboardData>>('/dashboard-v2');
    return response.data;
  },

  getProjects: async (filters?: HoldingFilters, page = 1, perPage = 50) => {
    const queryString = buildQueryParams(filters, page, perPage);
    const response = await api.get<ApiResponse<PaginatedData<ProjectWithOrganization>>>(
      `/projects${queryString ? '?' + queryString : ''}`
    );
    return response.data;
  },

  getProject: async (projectId: number) => {
    const response = await api.get<ApiResponse<ProjectDetailV2>>(`/projects/${projectId}`);
    return response.data;
  },

  getContracts: async (filters?: HoldingFilters, page = 1, perPage = 50) => {
    const queryString = buildQueryParams(filters, page, perPage);
    const response = await api.get<ApiResponse<PaginatedData<ContractWithOrganization>>>(
      `/contracts-v2${queryString ? '?' + queryString : ''}`
    );
    return response.data;
  },

  getFilterOptions: async () => {
    const response = await api.get<ApiResponse<FilterOptions>>('/filter-options');
    return response.data;
  },
};

export default multiOrgApiV2;

