import { BuildingOfficeIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';

interface OrganizationContextBadgeProps {
  currentOrg: {
    id: number;
    name: string;
    is_holding: boolean;
    parent_organization_id?: number;
  };
  mode: 'admin' | 'holding';
}

export const OrganizationContextBadge = ({ currentOrg, mode }: OrganizationContextBadgeProps) => {
  const isHoldingMode = mode === 'holding';
  const Icon = currentOrg.is_holding ? BuildingLibraryIcon : BuildingOfficeIcon;
  
  const badgeColor = isHoldingMode 
    ? 'bg-purple-100 text-purple-800 border-purple-200'
    : 'bg-blue-100 text-blue-800 border-blue-200';

  const modeLabel = isHoldingMode ? 'Режим холдинга' : 'Операционный режим';

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${badgeColor}`}>
      <Icon className="w-5 h-5" />
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{currentOrg.name}</span>
        <span className="text-xs opacity-75">{modeLabel}</span>
      </div>
    </div>
  );
};

