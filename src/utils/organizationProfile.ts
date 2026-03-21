import type { OrganizationCapability, WorkspaceOption, WorkspaceProfile } from '@/types/organization-profile';

export interface BusinessTypeOption {
  value: OrganizationCapability;
  label: string;
  description: string;
  icon: string;
}

export const BUSINESS_TYPE_OPTIONS: BusinessTypeOption[] = [
  {
    value: 'general_contracting',
    label: 'Генеральный подряд',
    description: 'Управление всем строительным проектом',
    icon: '🏗️',
  },
  {
    value: 'subcontracting',
    label: 'Субподрядные работы',
    description: 'Специализированные работы для подрядчика',
    icon: '🔧',
  },
  {
    value: 'design',
    label: 'Проектирование',
    description: 'Разработка проектной документации',
    icon: '📐',
  },
  {
    value: 'construction_supervision',
    label: 'Строительный контроль',
    description: 'Технический надзор за строительством',
    icon: '👷',
  },
  {
    value: 'equipment_rental',
    label: 'Аренда техники',
    description: 'Предоставление строительной техники',
    icon: '🚜',
  },
  {
    value: 'materials_supply',
    label: 'Поставка материалов',
    description: 'Поставка строительных материалов',
    icon: '📦',
  },
  {
    value: 'consulting',
    label: 'Консалтинг',
    description: 'Консультационные услуги в строительстве',
    icon: '💼',
  },
  {
    value: 'facility_management',
    label: 'Эксплуатация объектов',
    description: 'Обслуживание и эксплуатация зданий',
    icon: '🏢',
  },
];

export const BUSINESS_TYPE_LABELS: Record<OrganizationCapability, string> = BUSINESS_TYPE_OPTIONS.reduce(
  (labels, option) => {
    labels[option.value] = option.label;
    return labels;
  },
  {} as Record<OrganizationCapability, string>
);

export const resolvePrimaryBusinessType = (
  capabilities: OrganizationCapability[],
  currentBusinessType: string | null
): OrganizationCapability | null => {
  const normalizedCapabilities = Array.from(new Set(capabilities));

  if (normalizedCapabilities.length === 0) {
    return null;
  }

  if (
    currentBusinessType &&
    normalizedCapabilities.includes(currentBusinessType as OrganizationCapability)
  ) {
    return currentBusinessType as OrganizationCapability;
  }

  if (normalizedCapabilities.length === 1) {
    return normalizedCapabilities[0];
  }

  return null;
};

export const filterBusinessTypeOptions = (
  capabilities: OrganizationCapability[]
): BusinessTypeOption[] => {
  const normalizedCapabilities = new Set(capabilities);

  return BUSINESS_TYPE_OPTIONS.filter((option) => normalizedCapabilities.has(option.value));
};

export const getPrimaryWorkspaceOption = (
  workspaceProfile?: WorkspaceProfile | null
): WorkspaceOption | null => {
  if (!workspaceProfile?.primary_profile) {
    return null;
  }

  return (
    workspaceProfile.workspace_options.find(
      (workspaceOption) => workspaceOption.value === workspaceProfile.primary_profile
    ) ?? null
  );
};

export const getPrimaryWorkspaceRoute = (
  workspaceProfile?: WorkspaceProfile | null
): string => {
  return getPrimaryWorkspaceOption(workspaceProfile)?.default_route ?? '/dashboard';
};
