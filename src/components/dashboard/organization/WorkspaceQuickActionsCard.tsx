import type { WorkspaceAction, WorkspaceProfile } from '@/types/organization-profile';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, Briefcase, PackageCheck, Settings } from 'lucide-react';

interface WorkspaceQuickActionsCardProps {
  workspaceProfile?: WorkspaceProfile | null;
  onActionClick: (action: WorkspaceAction) => void;
  showTitle?: boolean;
}

const ACTION_ICONS: Record<string, typeof Briefcase> = {
  create_project: Briefcase,
  open_projects: Briefcase,
  open_invitations: Briefcase,
  open_packages: PackageCheck,
  open_settings: Settings,
};

export const WorkspaceQuickActionsCard = ({
  workspaceProfile,
  onActionClick,
  showTitle = true,
}: WorkspaceQuickActionsCardProps) => {
  const actions = workspaceProfile?.recommended_actions ?? [];
  if (actions.length === 0) return null;

  return (
    <div className="space-y-3">
      {showTitle && <h3 className="text-lg font-semibold">Быстрые действия</h3>}
      <div className="divide-y divide-border border-y border-border">
        {actions.map(action => {
          const Icon = ACTION_ICONS[action.key] ?? Briefcase;
          return (
            <Button key={action.key} type="button" variant="ghost"
              onClick={() => onActionClick(action)}
              className="h-auto min-h-14 w-full justify-start gap-3 whitespace-normal rounded-none px-1 py-4 text-left">
              <Icon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1">{action.label}</span>
              <ArrowUpRight className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            </Button>
          );
        })}
      </div>
    </div>
  );
};