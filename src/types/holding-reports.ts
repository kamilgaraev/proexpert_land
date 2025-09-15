export interface HoldingInfo {
  id: number;
  name: string;
  slug: string;
  organizations_count: number;
}

export interface ConsolidatedMetrics {
  total_revenue: number;
  total_expenses: number;
  net_profit: number;
  profit_margin: number;
  growth_rate: number;
}

export interface OrganizationBreakdown {
  organization_id: number;
  organization_name: string;
  revenue: number;
  expenses: number;
  profit: number;
  employees_count: number;
  projects_count: number;
}

export interface FinancialDynamics {
  period: string;
  month_name: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface KpiSummary {
  revenue_per_employee: number;
  project_completion_rate: number;
  customer_satisfaction: number;
  efficiency_score: number;
}

export interface HoldingDashboardData {
  holding_info: HoldingInfo;
  consolidated_metrics: ConsolidatedMetrics;
  organization_breakdown: OrganizationBreakdown[];
  financial_dynamics: FinancialDynamics[];
  kpi_summary: KpiSummary;
}

export interface HoldingDashboardResponse {
  success: boolean;
  data: HoldingDashboardData;
}

export interface OrganizationMetrics {
  revenue: number;
  profit_margin: number;
  employees_count: number;
  projects_count: number;
  efficiency_score: number;
  completion_rate: number;
}

export interface OrganizationRanking {
  revenue_rank: number;
  efficiency_rank: number;
  growth_rank: number;
}

export interface OrganizationComparison {
  organization_id: number;
  organization_name: string;
  metrics: OrganizationMetrics;
  ranking: OrganizationRanking;
}

export interface ComparativeCharts {
  revenue_comparison: any[];
  efficiency_comparison: any[];
  growth_trends: any[];
}

export interface OrganizationsComparisonData {
  organizations: OrganizationComparison[];
  comparative_charts: ComparativeCharts;
}

export interface OrganizationsComparisonResponse {
  success: boolean;
  data: OrganizationsComparisonData;
}

export interface FinancialPeriod {
  start_date: string;
  end_date: string;
  days_count: number;
}

export interface ConsolidatedFinancials {
  total_revenue: number;
  total_expenses: number;
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
}

export interface FinancialBreakdownByOrganization {
  organization_id: number;
  organization_name: string;
  revenue: number;
  expenses: number;
  profit: number;
  profit_margin: number;
}

export interface MonthlyDynamics {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
}

export interface FinancialReportData {
  period: FinancialPeriod;
  consolidated_financials: ConsolidatedFinancials;
  breakdown_by_organization: FinancialBreakdownByOrganization[];
  monthly_dynamics: MonthlyDynamics[];
  expense_categories: ExpenseCategory[];
}

export interface FinancialReportResponse {
  success: boolean;
  data: FinancialReportData;
}

export interface FinancialKpis {
  revenue_growth: number;
  profit_margin: number;
  roi: number;
  revenue_per_employee: number;
}

export interface OperationalKpis {
  project_completion_rate: number;
  employee_productivity: number;
  resource_utilization: number;
  quality_index: number;
}

export interface EfficiencyKpis {
  cost_efficiency: number;
  time_efficiency: number;
  automation_level: number;
}

export interface KpiMetrics {
  financial_kpis: FinancialKpis;
  operational_kpis: OperationalKpis;
  efficiency_kpis: EfficiencyKpis;
}

export interface KpiTrends {
  revenue_trend: string;
  efficiency_trend: string;
  profitability_trend: string;
}

export interface KpiReportData {
  holding_id: number;
  holding_name: string;
  period: string;
  kpis: KpiMetrics;
  trends: KpiTrends;
  organizations_count: number;
  generated_at: string;
}

export interface KpiReportResponse {
  success: boolean;
  data: KpiReportData;
}

export interface EfficiencyMetrics {
  overall_efficiency: number;
  resource_utilization: number;
}

export interface QuickMetricsData {
  organizations_count: number;
  total_users: number;
  total_projects: number;
  active_contracts: number;
  total_contracts_value: number;
  current_revenue: number;
  revenue_growth: number;
  efficiency_metrics: EfficiencyMetrics;
  updated_at: string;
}

export interface QuickMetricsResponse {
  success: boolean;
  data: QuickMetricsData;
}

export interface CacheClearResponse {
  success: boolean;
  message: string;
}

export interface HoldingReportsError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface HoldingReportsPeriodParams {
  period?: string;
}

export interface FinancialReportParams {
  start_date: string;
  end_date: string;
}

export interface KpiReportParams {
  period?: string;
}
