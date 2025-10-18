export interface HoldingInfo {
  id: number;
  name: string;
  subdomain: string;
}

export interface HoldingSummary {
  projects: number;
  active_projects: number;
  completed_projects: number;
  budget: number;
  contracts: number;
  contract_amount: number;
  users: number;
}

export interface OrganizationMetric {
  org_id: number;
  org_name: string;
  is_holding: boolean;
  projects: number;
  budget: number;
  contracts: number;
  users: number;
}

export interface HoldingDashboardData {
  holding_info: HoldingInfo;
  summary: HoldingSummary;
  organizations: OrganizationMetric[];
  last_update: string;
}

export interface OrganizationNode {
  id: number;
  name: string;
  type: 'holding' | 'child' | 'single';
  parent_id?: number;
  is_holding?: boolean;
  projects_count: number;
  is_active: boolean;
}

export interface OrganizationTree {
  current: OrganizationNode;
  children: OrganizationNode[];
}

export interface HoldingFilters {
  organization_ids?: number[];
  status?: string;
  date_from?: string;
  date_to?: string;
  include_archived?: boolean;
  contractor_search?: string;
  project_id?: number;
  name?: string;
}

export interface FilterOptions {
  organizations: OrganizationTree;
  date_ranges: {
    today: [string, string];
    this_week: [string, string];
    this_month: [string, string];
    this_quarter: [string, string];
    this_year: [string, string];
    last_month?: [string, string];
    last_quarter?: [string, string];
  };
}

export interface ProjectWithOrganization {
  id: number;
  name: string;
  status: string;
  budget_amount: number;
  organization_id: number;
  organization: {
    id: number;
    name: string;
    is_holding: boolean;
    parent_organization_id?: number;
  };
  created_at: string;
  is_archived: boolean;
}

export type ProjectOrganizationRoleType = 
  | 'owner' 
  | 'participant' 
  | 'observer' 
  | 'contractor' 
  | 'parent_administrator';

export interface ProjectOrganizationRole {
  organization_id: number;
  role: ProjectOrganizationRoleType;
  role_label: string;
  is_active: boolean;
}

export interface ContractWithOrganization {
  id: number;
  number: string;
  status: string;
  total_amount: number;
  organization_id: number;
  organization: {
    id: number;
    name: string;
    is_holding: boolean;
  };
  project?: {
    id: number;
    name: string;
  };
  contractor?: {
    id: number;
    name: string;
  };
  created_at: string;
}

export interface PaginatedData<T> {
  current_page: number;
  data: T[];
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface MultiOrgError {
  message: string;
  code: string;
  statusCode: number;
}

export interface ProjectDetailV2 extends ProjectWithOrganization {
  contracts: Array<{
    id: number;
    number: string;
    total_amount: number;
    contractor: {
      id: number;
      name: string;
    };
  }>;
  organizations: ProjectOrganizationRole[];
}

