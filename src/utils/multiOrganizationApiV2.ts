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
import api from './api';

const MULTI_ORG_PATH = '/multi-organization';

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
    const response = await api.get<ApiResponse<HoldingDashboardData>>(`${MULTI_ORG_PATH}/dashboard-v2`);
    return response.data;
  },

  getProjects: async (filters?: HoldingFilters, page = 1, perPage = 50) => {
    const queryString = buildQueryParams(filters, page, perPage);
    const response = await api.get<ApiResponse<PaginatedData<ProjectWithOrganization>>>(
      `${MULTI_ORG_PATH}/projects${queryString ? '?' + queryString : ''}`
    );
    return response.data;
  },

  getProject: async (projectId: number) => {
    const response = await api.get<ApiResponse<ProjectDetailV2>>(`${MULTI_ORG_PATH}/projects/${projectId}`);
    return response.data;
  },

  getContracts: async (filters?: HoldingFilters, page = 1, perPage = 50) => {
    const queryString = buildQueryParams(filters, page, perPage);
    const response = await api.get<ApiResponse<PaginatedData<ContractWithOrganization>>>(
      `${MULTI_ORG_PATH}/contracts-v2${queryString ? '?' + queryString : ''}`
    );
    return response.data;
  },

  getFilterOptions: async () => {
    const response = await api.get<ApiResponse<FilterOptions>>(`${MULTI_ORG_PATH}/filter-options`);
    return response.data;
  },
};

export default multiOrgApiV2;

