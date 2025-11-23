import { MapPin, ArrowUpRight } from 'lucide-react';
import type { ProjectOverview } from '@/types/projects-overview';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
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
  const statusConfig: Record<string, { color: string; label: string }> = {
    planned: { color: 'bg-slate-100 text-slate-600', label: 'Запланирован' },
    active: { color: 'bg-emerald-100 text-emerald-600', label: 'Активен' },
    in_progress: { color: 'bg-blue-100 text-blue-600', label: 'В работе' },
    completed: { color: 'bg-slate-100 text-slate-500', label: 'Завершен' },
    on_hold: { color: 'bg-amber-100 text-amber-600', label: 'На паузе' },
    cancelled: { color: 'bg-red-100 text-red-600', label: 'Отменен' }
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

  const status = statusConfig[project.status] || { color: 'bg-slate-100 text-slate-600', label: project.status };

  return (
    <Card className="group relative overflow-hidden border border-border/60 bg-background shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary/30 flex flex-col h-full">
      {/* Top Accent Line */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", 
         project.status === 'active' ? "bg-emerald-500" : 
         project.status === 'in_progress' ? "bg-blue-500" : "bg-slate-200"
      )} />

      <CardContent className="p-5 flex-1 flex flex-col gap-4">
        {/* Header: Title & Status */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
             <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1" title={project.name}>
                  {project.name}
                </h3>
                {/* Role Indicator (Minimal) */}
                {project.role === 'owner' ? (
                   <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-bold border-orange-200 text-orange-600 bg-orange-50">
                      Владелец
                   </Badge>
                ) : (
                   <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-bold border-blue-200 text-blue-600 bg-blue-50">
                      Подрядчик
                   </Badge>
                )}
             </div>
            
            {project.address ? (
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0 opacity-70" />
                <span className="truncate max-w-[240px]">{project.address}</span>
              </div>
            ) : (
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 mr-1.5 shrink-0 opacity-70" />
                <span className="italic opacity-50">Адрес не указан</span>
              </div>
            )}
          </div>

          {/* Minimal Status Badge */}
          <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap", status.color)}>
             <div className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
             {status.label}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Контракты</span>
               <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-foreground">{totalContracts}</span>
                  <span className="text-xs text-muted-foreground">шт</span>
               </div>
               <div className="text-xs font-medium text-foreground">{formatAmount(totalAmountContracts)}</div>
            </div>
            <div className="space-y-1">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Работы</span>
               <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-foreground">{totalWorks}</span>
                  <span className="text-xs text-muted-foreground">акт</span>
               </div>
               <div className="text-xs font-medium text-emerald-600">{formatAmount(totalAmountWorks)}</div>
            </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-auto space-y-2">
           <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Выполнение</span>
              <span>{completionPercentage}%</span>
           </div>
           <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-500 rounded-full", 
                   completionPercentage >= 100 ? "bg-emerald-500" : "bg-primary"
                )} 
                style={{ width: `${completionPercentage}%` }} 
              />
           </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 grid grid-cols-2 gap-3">
        <Button 
            variant="outline" 
            className="w-full h-10 text-xs font-bold border-border hover:bg-secondary hover:text-foreground" 
            onClick={() => onViewDetails(project.id)}
        >
            Подробнее
        </Button>
        <Button 
            className="w-full h-10 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm group-hover:shadow-md transition-all" 
            onClick={() => onGoToWork(project.id)}
        >
            В проект
            <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 opacity-70" />
        </Button>
      </CardFooter>
    </Card>
  );
};
