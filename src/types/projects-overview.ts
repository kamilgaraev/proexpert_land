export type ProjectStatus = 'planned' | 'active' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export type ProjectOrganizationRole =
  | 'owner'
  | 'customer'
  | 'general_contractor'
  | 'contractor'
  | 'subcontractor'
  | 'construction_supervision'
  | 'designer'
  | 'observer';

export type RoleInfo = 
  | ProjectOrganizationRole 
  | { value: ProjectOrganizationRole; label: string };

export interface ProjectOverview {
  id: number;
  name: string;
  status: ProjectStatus;
  is_archived: boolean;
  role: RoleInfo;
  role_label?: string;
  is_owner?: boolean;
  budget_amount?: string | number | null;
  total_contracts?: number;
  total_works?: number;
  total_amount_contracts?: number;
  total_amount_works?: number;
  participants_count?: number;
  description?: string;
  address?: string;
  start_date?: string;
  end_date?: string;
  completion_percentage?: number;
  stats?: {
    contracts: {
      total: number;
      my: number;
      total_amount: number;
      my_amount: number;
    };
    works: {
      total: number;
      my: number;
      total_amount: number;
      my_amount: number;
    };
  };
}

export interface ProjectsGrouped {
  owned: ProjectOverview[];
  participant: ProjectOverview[];
}

export interface ProjectsTotals {
  all: number;
  owned: number;
  participant: number;
  active: number;
  archived: number;
}

export interface MyProjectsResponse {
  success: boolean;
  data: {
    projects: ProjectOverview[];
    grouped: ProjectsGrouped;
    totals: ProjectsTotals;
  };
}

export interface ProjectParticipant {
  id: number;
  name: string;
  role: RoleInfo;
  role_label?: string;
}

export interface MyProjectContext {
  role: RoleInfo;
  role_label?: string;
  is_owner: boolean;
  can_manage_contracts: boolean;
  can_view_finances: boolean;
  can_manage_works: boolean;
  can_manage_warehouse: boolean;
  can_invite_participants: boolean;
}

export interface ProjectStatistics {
  contracts_count: number;
  works_count: number;
  total_contracts_amount: number;
  total_works_amount: number;
  completion_percentage: number;
}

export interface ProjectDetails {
  project: {
    id: number;
    name: string;
    description: string;
    address: string;
    start_date: string;
    end_date: string;
    status: ProjectStatus;
    owner_organization: {
      id: number;
      name: string;
    };
  };
  my_context: MyProjectContext;
  statistics: ProjectStatistics;
  participants: ProjectParticipant[];
}

export interface ProjectDetailsResponse {
  success: boolean;
  data: ProjectDetails;
}

export interface RoleBadgeConfig {
  label: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

