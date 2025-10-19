export interface HoldingInfo {
  id: number;
  name: string;
}

export interface ProjectsSummaryFilters {
  organization_ids?: number[];
  status?: string;
  date_from?: string;
  date_to?: string;
  include_archived?: boolean;
  min_budget?: number;
  max_budget?: number;
  customer?: string;
  sort_by?: string;
  sort_direction?: string;
}

export interface ProjectStatusSummary {
  status: string;
  count: number;
  total_budget: number;
}

export interface ProjectsSummary {
  total_projects: number;
  total_budget: number;
  total_contracts_amount: number;
  total_completed_works: number;
  total_materials_cost: number;
  by_status: ProjectStatusSummary[];
}

export interface ProjectOrganizationBreakdown {
  organization_id: number;
  organization_name: string;
  projects_count: number;
  total_budget: number;
  contracts_amount: number;
  completed_works: number;
  completion_percentage: number;
  by_status: Record<string, number>;
}

export interface TopProject {
  id: number;
  name: string;
  budget_amount: number;
  status: string;
}

export interface OverdueProject {
  id: number;
  name: string;
  end_date: string;
  days_overdue: number;
}

export interface TopProjects {
  by_budget: TopProject[];
  overdue: OverdueProject[];
}

export interface ProjectsReportData {
  title: string;
  holding: HoldingInfo;
  period: {
    from: string | null;
    to: string | null;
  };
  filters: ProjectsSummaryFilters;
  summary: ProjectsSummary;
  by_organization: ProjectOrganizationBreakdown[];
  top_projects: TopProjects;
  generated_at: string;
}

export interface ProjectsReportResponse {
  success: boolean;
  data: ProjectsReportData;
}

export interface ContractsSummaryFilters {
  organization_ids?: number[];
  contractor_ids?: number[];
  project_id?: number;
  status?: string;
  date_from?: string;
  date_to?: string;
  min_amount?: number;
  max_amount?: number;
  work_type_category?: string;
  include_child_contracts?: boolean;
  page?: number;
  per_page?: number;
}

export interface ContractStatusSummary {
  status: string;
  count: number;
  total_amount: number;
}

export interface ContractsSummary {
  total_contracts: number;
  total_amount: number;
  total_gp_amount: number;
  total_paid: number;
  total_acts_approved: number;
  remaining_amount: number;
  completion_percentage: number;
  payment_percentage: number;
  total_planned_advance: number;
  total_actual_advance: number;
  by_status: ContractStatusSummary[];
}

export interface ContractOrganizationBreakdown {
  organization_id: number;
  organization_name: string;
  contracts_count: number;
  total_amount: number;
  total_gp_amount: number;
  total_paid: number;
  total_acts_approved: number;
  remaining_amount: number;
  completion_percentage: number;
  payment_percentage: number;
  by_status: Record<string, number>;
}

export interface ContractorDetails {
  contractor_id: number;
  contractor_name: string;
  contact_person: string;
  phone: string;
  email: string;
  contractor_type: string;
  contracts_count: number;
  total_amount: number;
  total_paid: number;
  total_acts_approved: number;
  remaining_amount: number;
  completion_percentage: number;
  payment_percentage: number;
  organizations: string;
}

export interface ContractorPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ContractsByContractor {
  data: ContractorDetails[];
  pagination: ContractorPagination;
}

export interface ContractsReportData {
  title: string;
  holding: HoldingInfo;
  period: {
    from: string | null;
    to: string | null;
  };
  filters: ContractsSummaryFilters;
  summary: ContractsSummary;
  by_organization: ContractOrganizationBreakdown[];
  by_contractor: ContractsByContractor;
  generated_at: string;
}

export interface ContractsReportResponse {
  success: boolean;
  data: ContractsReportData;
}

export interface ExportParams {
  export_format?: 'csv' | 'excel' | 'xlsx';
}

export interface HoldingReportsError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
