import {
  commercialPackages,
  type CommercialPackage,
  type CommercialPackageSlug,
} from '@/data/marketing/packages';
import type { ModuleInfo } from '@/types/organization-profile';

export const moduleToPackageSlug: Readonly<Record<string, CommercialPackageSlug>> = {
  organizations: 'projects-processes',
  users: 'projects-processes',
  'project-management': 'projects-processes',
  'workflow-management': 'projects-processes',
  'site-requests': 'projects-processes',
  'file-management': 'projects-processes',
  reports: 'projects-processes',
  'dashboard-widgets': 'projects-processes',
  'data-filters': 'projects-processes',
  brigades: 'projects-processes',
  'schedule-management': 'planning-schedules',
  'budget-estimates': 'estimates-norms',
  'rate-management': 'estimates-norms',
  'quality-control': 'quality-safety',
  'safety-management': 'quality-safety',
  'report-templates': 'pto-handover',
  'executive-documentation': 'pto-handover',
  'design-management': 'pto-handover',
  'handover-acceptance': 'pto-handover',
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
