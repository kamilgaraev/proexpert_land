import { MapPin, FileText, CheckCircle } from 'lucide-react';
import type { ProjectOverview } from '@/types/projects-overview';
import { RoleBadge } from './RoleBadge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: ProjectOverview;
  onViewDetails: (projectId: number) => void;
  onGoToWork: (projectId: number) => void;
}

export const ProjectCard = ({
  project,
  onViewDetails,
  onGoToWork
}: ProjectCardProps) => {
  const statusColors: Record<string, string> = {
    planned: 'bg-gray-100 text-gray-700',
    active: 'bg-orange-100 text-orange-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    on_hold: 'bg-yellow-100 text-yellow-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  const statusLabels: Record<string, string> = {
    planned: 'Запланирован',
    active: 'Активен',
    in_progress: 'В работе',
    completed: 'Завершен',
    on_hold: 'Приостановлен',
    cancelled: 'Отменен'
  };

  const completionPercentage = project.completion_percentage || 0;
  
  const totalContracts = project.stats?.contracts.total || project.total_contracts || 0;
  const totalWorks = project.stats?.works.total || project.total_works || 0;
  const totalAmountContracts = project.stats?.contracts.total_amount || project.total_amount_contracts || 0;
  const totalAmountWorks = project.stats?.works.total_amount || project.total_amount_works || 0;

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group border-muted-foreground/20">
      <CardHeader className="p-5 pb-2">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {project.name}
            </h3>
            {project.address && (
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 mr-1 shrink-0" />
                <span className="truncate max-w-[200px]">{project.address}</span>
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
             <RoleBadge role={project.role} size="sm" />
             <Badge variant="secondary" className={cn("text-[10px] px-2 py-0.5 h-auto font-medium border-0", statusColors[project.status])}>
                {statusLabels[project.status]}
             </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-5 pt-2 space-y-4">
        {project.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
            {project.description}
          </p>
        )}

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Прогресс</span>
            <span className="font-medium text-foreground">{completionPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
             <div className="h-full bg-primary transition-all duration-500" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded-lg p-2 flex items-center gap-3">
                <div className="bg-background p-1.5 rounded-md shadow-sm text-primary">
                    <FileText className="w-4 h-4" />
                </div>
                <div>
                    <div className="text-[10px] text-muted-foreground uppercase">Контракты</div>
                    <div className="font-bold text-sm">{totalContracts}</div>
                </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-2 flex items-center gap-3">
                <div className="bg-background p-1.5 rounded-md shadow-sm text-green-600">
                    <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                    <div className="text-[10px] text-muted-foreground uppercase">Работы</div>
                    <div className="font-bold text-sm">{totalWorks}</div>
                </div>
            </div>
        </div>

        <div className="space-y-1 pt-2 border-t border-dashed">
             <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Сумма контрактов:</span>
                <span className="font-semibold">{formatAmount(totalAmountContracts)}</span>
             </div>
             <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Выполнено:</span>
                <span className="font-semibold text-green-600">{formatAmount(totalAmountWorks)}</span>
             </div>
        </div>
      </CardContent>

      <CardFooter className="p-3 bg-muted/30 flex gap-2">
        <Button variant="outline" className="flex-1 h-9 text-xs" onClick={() => onViewDetails(project.id)}>
            Подробнее
        </Button>
        <Button className="flex-1 h-9 text-xs bg-gradient-to-r from-primary to-orange-600 shadow-sm hover:shadow transition-all" onClick={() => onGoToWork(project.id)}>
            В работу
        </Button>
      </CardFooter>
    </Card>
  );
};
