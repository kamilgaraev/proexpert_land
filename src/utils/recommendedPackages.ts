import {
  commercialPackages,
  type CommercialPackage,
  type CommercialPackageSlug,
} from '@/data/marketing/packages';
import type { ModuleInfo } from '@/types/organization-profile';

export const moduleToPackageSlug: Readonly<Record<string, CommercialPackageSlug>> = {
  organizations: 'working-entry',
  users: 'working-entry',
  'project-management': 'working-entry',
  'workflow-management': 'working-entry',
  'site-requests': 'working-entry',
  'file-management': 'working-entry',
  reports: 'working-entry',
  'dashboard-widgets': 'working-entry',
  'data-filters': 'working-entry',
  brigades: 'working-entry',
  'schedule-management': 'working-entry',
  'budget-estimates': 'working-entry',
  'rate-management': 'working-entry',
  'ai-assistant': 'working-entry',
  'data-export': 'working-entry',
  'ai-estimates': 'working-entry',
  'quality-control': 'quality-safety',
  'safety-management': 'quality-safety',
  'report-templates': 'working-entry',
  'executive-documentation': 'working-entry',
  'design-management': 'working-entry',
  'handover-acceptance': 'working-entry',
  'catalog-management': 'supply-warehouse',
  'basic-warehouse': 'supply-warehouse',
  procurement: 'supply-warehouse',
  'material-analytics': 'supply-warehouse',
  'contract-management': 'finance-contracts',
  payments: 'finance-contracts',
  'act-reporting': 'finance-contracts',
  budgeting: 'finance-contracts',
  'change-management': 'finance-contracts',
  'advance-accounting': 'finance-contracts',
  'time-tracking': 'workforce-output',
  'workforce-management': 'workforce-output',
  'production-labor': 'workforce-output',
  'machinery-operations': 'machinery',
  crm: 'sales-contractors',
  'commercial-proposals': 'sales-contractors',
  'contractor-portal': 'sales-contractors',
};

const getModuleSlug = (module: ModuleInfo): string => (
  typeof module === 'string' ? module : module.value
);

export const getRecommendedPackages = (modules: readonly ModuleInfo[]): CommercialPackage[] => {
  const packageSlugs = new Set(
    modules
      .map(getModuleSlug)
      .map((moduleSlug) => moduleToPackageSlug[moduleSlug])
      .filter((slug): slug is CommercialPackageSlug => Boolean(slug)),
  );

  return commercialPackages.filter((item) => packageSlugs.has(item.slug));
};
