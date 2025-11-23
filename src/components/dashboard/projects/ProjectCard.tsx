import { MapPin, ArrowUpRight, Building2, User } from 'lucide-react';
import type { ProjectOverview } from '@/types/projects-overview';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  const statusConfig: Record<string, { color: string; label: string; dot: string }> = {
    planned: { color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', label: 'Запланирован' },
    active: { color: 'bg-emerald-50/50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', label: 'Активен' },
    in_progress: { color: 'bg-blue-50/50 text-blue-700 border-blue-100', dot: 'bg-blue-500', label: 'В работе' },
    completed: { color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-500', label: 'Завершен' },
    on_hold: { color: 'bg-amber-50/50 text-amber-700 border-amber-100', dot: 'bg-amber-500', label: 'На паузе' },
    cancelled: { color: 'bg-red-50/50 text-red-700 border-red-100', dot: 'bg-red-500', label: 'Отменен' }
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

  const status = statusConfig[project.status] || { color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400', label: project.status };

  return (
    <Card className="group relative overflow-hidden border border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-lg flex flex-col h-full rounded-2xl">
      <CardContent className="p-6 flex-1 flex flex-col gap-5">
        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
             <h3 className="font-bold text-lg leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 flex-1" title={project.name}>
               {project.name}
             </h3>
             <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap border", status.color)}>
                <div className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                {status.label}
             </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            {project.address ? (
              <div className="flex items-center text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-muted-foreground/70" />
                <span className="truncate max-w-[260px]">{project.address}</span>
              </div>
            ) : (
              <div className="flex items-center text-xs text-muted-foreground opacity-50">
                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                <span>Адрес не указан</span>
              </div>
            )}
            
            <div className="flex items-center text-xs font-medium text-foreground/80">
               {project.role === 'owner' ? (
                  <>
                    <Building2 className="w-3.5 h-3.5 mr-1.5 text-orange-600" />
                    Владелец
                  </>
               ) : (
                  <>
                    <User className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                    Подрядчик
                  </>
               )}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 py-3 border-y border-border/50 border-dashed">
            <div>
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Контракты</span>
               <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="text-xl font-bold text-foreground">{totalContracts}</span>
               </div>
               <div className="text-xs text-muted-foreground font-medium">{formatAmount(totalAmountContracts)}</div>
            </div>
            <div>
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block mb-1">Выполнено</span>
               <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="text-xl font-bold text-foreground">{totalWorks}</span>
               </div>
               <div className="text-xs text-emerald-600 font-bold">{formatAmount(totalAmountWorks)}</div>
            </div>
        </div>

        {/* Progress */}
        <div className="mt-auto space-y-2">
           <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Готовность</span>
              <span className="text-foreground">{completionPercentage}%</span>
           </div>
           <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-500 rounded-full bg-primary")} 
                style={{ width: `${completionPercentage}%` }} 
              />
           </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-3 bg-gradient-to-b from-transparent to-secondary/20">
        <Button 
            variant="ghost" 
            className="flex-1 h-10 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl" 
            onClick={() => onViewDetails(project.id)}
        >
            Подробнее
        </Button>
        <Button 
            className="flex-1 h-10 text-xs font-bold bg-foreground text-background hover:bg-foreground/90 rounded-xl shadow-lg" 
            onClick={() => onGoToWork(project.id)}
        >
            В работу
            <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};
