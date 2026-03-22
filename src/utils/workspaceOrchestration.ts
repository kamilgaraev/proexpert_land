import type {
  OrganizationCapability,
  WorkspaceInteractionMode,
  WorkspaceProfile,
} from '@/types/organization-profile';
import { BUSINESS_TYPE_LABELS } from '@/utils/organizationProfile';

export interface WorkspaceSummary {
  label: string;
  description: string;
  modeLabels: string[];
}

type NavigationItemLike = {
  href: string;
};

const WORKSPACE_MODE_LABELS: Record<WorkspaceInteractionMode, string> = {
  project_participant: 'Проектный контур',
  procurement_counterparty: 'Закупочный контур',
  service_counterparty: 'Сервисный контур',
};

const WORKSPACE_DESCRIPTIONS: Record<OrganizationCapability, string> = {
  general_contracting:
    'Проекты, связи с подрядчиками и модули снабжения идут в приоритете.',
  subcontracting:
    'На первом месте проекты, приглашения и работа в контуре подрядчика.',
  design:
    'Основной сценарий строится вокруг проектной документации и проектных ролей.',
  construction_supervision:
    'В фокусе остаются проектные роли, контроль и рабочие процессы проекта.',
  equipment_rental:
    'По умолчанию организация ведется как сервисный контрагент, а не как участник проекта.',
  materials_supply:
    'По умолчанию организация ведется как контрагент снабжения, а не как участник проекта.',
  consulting:
    'Основной workspace смещен в настройки профиля, договорной контур и модульные сервисы.',
  facility_management:
    'Приоритет у проектов эксплуатации, графиков и сервисного контура.',
};

const PROFILE_ROUTE_PRIORITIES: Record<OrganizationCapability, string[]> = {
  general_contracting: [
    '/dashboard/projects',
    '/dashboard/contractor-invitations',
    '/dashboard/admins',
    '/dashboard/modules',
    '/dashboard/organization/settings',
    '/dashboard/organization',
    '/dashboard/billing',
    '/dashboard/profile',
    '/dashboard',
  ],
  subcontracting: [
    '/dashboard/projects',
    '/dashboard/contractor-invitations',
    '/dashboard/modules',
    '/dashboard/organization/settings',
    '/dashboard/organization',
    '/dashboard/profile',
    '/dashboard/billing',
    '/dashboard',
  ],
  design: [
    '/dashboard/projects',
    '/dashboard/organization/settings',
    '/dashboard/organization',
    '/dashboard/modules',
    '/dashboard/profile',
    '/dashboard',
  ],
  construction_supervision: [
    '/dashboard/projects',
    '/dashboard/organization/settings',
    '/dashboard/organization',
    '/dashboard/modules',
    '/dashboard/profile',
    '/dashboard',
  ],
  equipment_rental: [
    '/dashboard/modules',
    '/dashboard/billing',
    '/dashboard/contractor-invitations',
    '/dashboard/organization/settings',
    '/dashboard/organization',
    '/dashboard/projects',
    '/dashboard/profile',
    '/dashboard',
  ],
  materials_supply: [
    '/dashboard/modules',
    '/dashboard/billing',
    '/dashboard/contractor-invitations',
    '/dashboard/organization/settings',
    '/dashboard/organization',
    '/dashboard/projects',
    '/dashboard/profile',
    '/dashboard',
  ],
  consulting: [
    '/dashboard/organization/settings',
    '/dashboard/organization',
    '/dashboard/modules',
    '/dashboard/projects',
    '/dashboard/profile',
    '/dashboard/billing',
    '/dashboard',
  ],
  facility_management: [
    '/dashboard/projects',
    '/dashboard/organization/settings',
    '/dashboard/modules',
    '/dashboard/organization',
    '/dashboard/billing',
    '/dashboard/profile',
    '/dashboard',
  ],
};

const MODULE_ROUTE_PRIORITIES: Record<string, string[]> = {
  'project-management': ['/dashboard/projects'],
  'contractor-portal': ['/dashboard/contractor-invitations'],
  procurement: ['/dashboard/modules', '/dashboard/billing'],
  payments: ['/dashboard/billing', '/dashboard/modules'],
  'basic-warehouse': ['/dashboard/modules'],
  'schedule-management': ['/dashboard/projects'],
  'workflow-management': ['/dashboard/projects'],
};

const getRoutePriority = (
  route: string,
  orderedRoutes: string[]
): number => {
  const index = orderedRoutes.indexOf(route);

  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
};

export const buildWorkspaceSummary = (
  workspaceProfile?: WorkspaceProfile | null
): WorkspaceSummary | null => {
  if (!workspaceProfile?.primary_profile) {
    return null;
  }

  const workspaceOption = workspaceProfile.workspace_options.find(
    (option) => option.value === workspaceProfile.primary_profile
  );

  return {
    label: BUSINESS_TYPE_LABELS[workspaceProfile.primary_profile],
    description: WORKSPACE_DESCRIPTIONS[workspaceProfile.primary_profile],
    modeLabels:
      workspaceOption?.interaction_modes.map((mode) => WORKSPACE_MODE_LABELS[mode]) ?? [],
  };
};

export const prioritizeWorkspaceNavigation = <T extends NavigationItemLike>(
  navigation: T[],
  workspaceProfile?: WorkspaceProfile | null,
  activeModuleSlugs: string[] = []
): T[] => {
  if (!workspaceProfile?.primary_profile) {
    return navigation;
  }

  const workspaceRoutes = PROFILE_ROUTE_PRIORITIES[workspaceProfile.primary_profile] ?? [];
  const moduleRoutes = Array.from(
    new Set(
      activeModuleSlugs.flatMap((moduleSlug) => MODULE_ROUTE_PRIORITIES[moduleSlug] ?? [])
    )
  );

  if (activeModuleSlugs.length > 0 && !moduleRoutes.includes('/dashboard/modules')) {
    moduleRoutes.unshift('/dashboard/modules');
  }

  return [...navigation].sort((leftItem, rightItem) => {
    const workspaceLeft = getRoutePriority(leftItem.href, workspaceRoutes);
    const workspaceRight = getRoutePriority(rightItem.href, workspaceRoutes);

    if (workspaceLeft !== workspaceRight) {
      return workspaceLeft - workspaceRight;
    }

    const moduleLeft = getRoutePriority(leftItem.href, moduleRoutes);
    const moduleRight = getRoutePriority(rightItem.href, moduleRoutes);

    if (moduleLeft !== moduleRight) {
      return moduleLeft - moduleRight;
    }

    return navigation.findIndex((item) => item.href === leftItem.href) -
      navigation.findIndex((item) => item.href === rightItem.href);
  });
};

export const getPreferredWorkspaceRoute = <T extends NavigationItemLike>(
  navigation: T[],
  workspaceProfile?: WorkspaceProfile | null,
  activeModuleSlugs: string[] = []
): string => {
  const prioritizedNavigation = prioritizeWorkspaceNavigation(
    navigation,
    workspaceProfile,
    activeModuleSlugs
  );

  return prioritizedNavigation.find((item) => item.href !== '/dashboard')?.href ?? '/dashboard';
};
