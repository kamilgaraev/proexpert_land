export interface HoldingOrganizationStats {
  users_count: number;
  projects_count: number;
  contracts_count: number;
  active_contracts_value?: number;
}

export interface HoldingOrganization {
  id: number;
  name: string;
  description?: string;
  organization_type: string;
  hierarchy_level: number;
  tax_number?: string;
  registration_number?: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at?: string;
  is_active?: boolean;
  stats: HoldingOrganizationStats;
}

export interface HoldingOrganizationsPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface HoldingOrganizationsResult {
  organizations: HoldingOrganization[];
  pagination: HoldingOrganizationsPagination;
}

export interface HoldingOrganizationsFilters {
  search?: string;
  status?: 'active' | 'inactive' | 'all';
  sort_by?: 'name' | 'created_at' | 'users_count' | 'projects_count';
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
}

export interface HoldingContext {
  name: string;
  groupId: number;
}
