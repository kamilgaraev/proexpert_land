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

export interface IntraGroupFilters {
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface SubcontractDetails {
  id: number;
  number: string;
  contractor_name: string;
  amount: number;
  paid: number;
  status: string;
}

export interface ChildOrganizationIntraGroup {
  organization_id: number;
  organization_name: string;
  role: string;
  parent_contract_id: number;
  parent_contract_number: string;
  parent_contract_amount: number;
  subcontracts_count: number;
  subcontracts_amount: number;
  subcontracts_paid: number;
  subcontracts_remaining: number;
  margin: number;
  margin_percentage: number;
  subcontracts: SubcontractDetails[];
}

export interface HeadOrganizationData {
  id: number;
  name: string;
  contracts_count: number;
  contracts_amount: number;
  contracts_paid: number;
  contracts_remaining: number;
}

export interface FinancialFlow {
  total_inflow: number;
  total_outflow: number;
  net_margin: number;
}

export interface IntraGroupProject {
  project_id: number;
  project_name: string;
  project_address: string;
  project_status: string;
  project_budget: number;
  head_organization: HeadOrganizationData;
  child_organizations: ChildOrganizationIntraGroup[];
  financial_flow: FinancialFlow;
}

export interface IntraGroupSummary {
  total_projects: number;
  head_organization: {
    contracts_count: number;
    contracts_amount: number;
    contracts_paid: number;
    contracts_remaining: number;
  };
  child_organizations: {
    unique_count: number;
    total_contracts_received: number;
    subcontracts_count: number;
    subcontracts_amount: number;
    subcontracts_paid: number;
    subcontracts_remaining: number;
  };
  financial_analysis: {
    total_margin: number;
    average_margin_percentage: number;
    internal_efficiency: number;
  };
}

export interface IntraGroupReportData {
  title: string;
  holding: HoldingInfo;
  period: {
    from: string | null;
    to: string | null;
  };
  filters: IntraGroupFilters;
  summary: IntraGroupSummary;
  projects: IntraGroupProject[];
  generated_at: string;
}

export interface IntraGroupReportResponse {
  success: boolean;
  data: IntraGroupReportData;
}

export interface ConsolidatedFilters {
  organization_ids?: number[];
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface ConsolidatedContractor {
  id: number;
  name: string;
  inn: string;
  contact_person: string;
  phone: string;
  email: string;
  contractor_type: string;
  organization_id: number | null;
}

export interface ConsolidatedPayment {
  id: number;
  amount: number;
  payment_date: string;
  payment_type: string;
  notes: string | null;
}

export interface ConsolidatedAct {
  id: number;
  number: string;
  amount: number;
  act_date: string;
  is_approved: boolean;
}

export interface ConsolidatedCompletedWork {
  id: number;
  work_type: string;
  quantity: number;
  price: number;
  total_amount: number;
  completion_date: string;
  status: string;
}

export interface ConsolidatedAgreement {
  id: number;
  number: string;
  date: string;
  amount_change: number;
  description: string | null;
}

export interface ConsolidatedSpecification {
  id: number;
  name: string;
  total_amount: number;
}

export interface ConsolidatedChildContract {
  id: number;
  number: string;
  contractor_name: string;
  amount: number;
  paid: number;
  status: string;
}

export interface ConsolidatedContractFinancial {
  total_amount: number;
  gp_amount: number;
  gp_percentage: number;
  subcontract_amount: number;
  planned_advance: number;
  actual_advance: number;
  total_paid: number;
  total_acts: number;
  total_works: number;
  remaining: number;
  completion_percentage: number;
  payment_percentage: number;
}

export interface ConsolidatedContract {
  contract_id: number;
  contract_number: string;
  contract_date: string;
  contract_status: string;
  work_type_category: string;
  start_date: string;
  end_date: string;
  contractor: ConsolidatedContractor | null;
  financial: ConsolidatedContractFinancial;
  payments: ConsolidatedPayment[];
  acts: ConsolidatedAct[];
  completed_works: ConsolidatedCompletedWork[];
  agreements: ConsolidatedAgreement[];
  specifications: ConsolidatedSpecification[];
  child_contracts: ConsolidatedChildContract[];
  parent_contract: any;
  payments_count: number;
  acts_count: number;
  works_count: number;
  agreements_count: number;
  specifications_count: number;
  child_contracts_count: number;
}

export interface ConsolidatedMaterialReceipt {
  id: number;
  material_name: string;
  material_code: string;
  supplier_name: string;
  quantity: number;
  price: number;
  total_amount: number;
  receipt_date: string;
  document_number: string;
  status: string;
}

export interface ConsolidatedMaterialWriteOff {
  id: number;
  material_name: string;
  material_code: string;
  quantity: number;
  write_off_date: string;
  notes: string | null;
}

export interface ConsolidatedMaterialsSummary {
  receipts_count: number;
  receipts_total: number;
  write_offs_count: number;
}

export interface ConsolidatedProject {
  project_id: number;
  project_name: string;
  project_address: string;
  project_status: string;
  project_budget: number;
  customer: string | null;
  designer: string | null;
  site_area_m2: number | null;
  start_date: string | null;
  end_date: string | null;
  is_archived: boolean;
  contracts_count: number;
  contracts: ConsolidatedContract[];
  material_receipts: ConsolidatedMaterialReceipt[];
  material_write_offs: ConsolidatedMaterialWriteOff[];
  materials_summary: ConsolidatedMaterialsSummary;
}

export interface ConsolidatedOrganization {
  organization_id: number;
  organization_name: string;
  organization_type: string;
  projects_count: number;
  projects: ConsolidatedProject[];
}

export interface ConsolidatedSummary {
  total_organizations: number;
  total_projects: number;
  total_contracts: number;
  total_contractors: number;
  financial: {
    total_amount: number;
    total_paid: number;
    total_acts: number;
    remaining: number;
    completion_percentage: number;
    payment_percentage: number;
  };
  details: {
    total_payments: number;
    total_acts: number;
    total_completed_works: number;
    total_agreements: number;
    total_specifications: number;
    total_child_contracts: number;
  };
  materials: {
    total_receipts: number;
    receipts_amount: number;
    total_write_offs: number;
  };
}

export interface ConsolidatedReportData {
  title: string;
  holding: HoldingInfo;
  period: {
    from: string | null;
    to: string | null;
  };
  filters: ConsolidatedFilters;
  summary: ConsolidatedSummary;
  data: ConsolidatedOrganization[];
  generated_at: string;
}

export interface ConsolidatedReportResponse {
  success: boolean;
  data: ConsolidatedReportData;
}
