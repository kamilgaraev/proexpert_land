import type { WorkspaceAction, WorkspaceProfile } from '@/types/organization-profile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, Briefcase, Puzzle, Settings } from 'lucide-react';

interface WorkspaceQuickActionsCardProps {
  workspaceProfile?: WorkspaceProfile | null;
  onActionClick: (action: WorkspaceAction) => void;
  showTitle?: boolean;
}

const ACTION_ICONS: Record<string, typeof Briefcase> = {
  create_project: Briefcase,
  open_projects: Briefcase,
  open_invitations: Briefcase,
  open_modules: Puzzle,
  open_settings: Settings,
};

export const WorkspaceQuickActionsCard = ({
  workspaceProfile,
  onActionClick,
  showTitle = true,
}: WorkspaceQuickActionsCardProps) => {
  const actions = workspaceProfile?.recommended_actions ?? [];

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {showTitle && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Быстрые действия</h3>
          <p className="text-sm text-gray-600">Стартовые сценарии для выбранного режима работы</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {actions.map((action) => {
          const Icon = ACTION_ICONS[action.key] ?? Briefcase;

          return (
            <Card
              key={action.key}
              className="cursor-pointer transition-all duration-200 hover:border-construction-300 hover:shadow-lg"
              onClick={() => onActionClick(action)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="rounded-lg bg-construction-50 p-2 text-construction-600">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-construction-500" />
                </div>
                <CardTitle className="text-base">{action.label}</CardTitle>
                <CardDescription>{action.route}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="ghost" size="sm" className="w-full text-construction-600 hover:bg-construction-50">
                  Открыть
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
