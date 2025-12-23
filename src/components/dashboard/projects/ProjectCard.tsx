import { MapPin, ArrowUpRight, Building2, User, FileText, CheckCircle2 } from 'lucide-react';
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
    active: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500', label: 'Активен' },
    in_progress: { color: 'bg-blue-50 text-blue-700 border-blue-100', dot: 'bg-blue-500', label: 'В работе' },
    completed: { color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-500', label: 'Завершен' },
    on_hold: { color: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500', label: 'На паузе' },
    cancelled: { color: 'bg-red-50 text-red-700 border-red-100', dot: 'bg-red-500', label: 'Отменен' }
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
    <Card 
      onClick={() => onViewDetails(project.id)}
      className="group relative overflow-hidden border border-border bg-card hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full rounded-2xl cursor-pointer"
    >
      <CardContent className="p-6 flex-1 flex flex-col gap-5">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
             <div className="space-y-1.5 flex-1">
               <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap border mb-2 w-fit", status.color)}>
                  <div className={cn("w-1.5 h-1.5 rounded-full", status.dot)} />
                  {status.label}
               </div>
               <h3 className="font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2" title={project.name}>
                 {project.name}
               </h3>
             </div>
          </div>
          
          <div className="flex flex-col gap-2">
            {project.address ? (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2 text-muted-foreground/70 shrink-0" />
                <span className="truncate max-w-[280px]">{project.address}</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-muted-foreground opacity-50">
                <MapPin className="w-4 h-4 mr-2 shrink-0" />
                <span>Адрес не указан</span>
              </div>
            )}
            
            <div className="flex items-center text-xs font-medium text-foreground/80 pl-0.5">
               {project.role === 'owner' ? (
                  <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-2 py-1 rounded-md border border-orange-100">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Владелец</span>
                  </div>
               ) : (
                  <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2 py-1 rounded-md border border-slate-200">
                    <User className="w-3.5 h-3.5" />
                    <span>Подрядчик</span>
                  </div>
               )}
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-3 py-4 border-y border-border/50 border-dashed">
            <div className="bg-secondary/30 p-3 rounded-xl">
               <div className="flex items-center gap-1.5 mb-1 text-muted-foreground">
                 <FileText className="w-3.5 h-3.5" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Контракты</span>
               </div>
               <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="text-2xl font-bold text-foreground">{totalContracts}</span>
               </div>
               <div className="text-xs text-muted-foreground font-medium truncate" title={formatAmount(totalAmountContracts)}>
                 {formatAmount(totalAmountContracts)}
               </div>
            </div>
            <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100/50">
               <div className="flex items-center gap-1.5 mb-1 text-emerald-600/80">
                 <CheckCircle2 className="w-3.5 h-3.5" />
                 <span className="text-[10px] font-bold uppercase tracking-wider">Выполнено</span>
               </div>
               <div className="flex items-baseline gap-1 mb-0.5">
                  <span className="text-2xl font-bold text-foreground">{totalWorks}</span>
               </div>
               <div className="text-xs text-emerald-600 font-bold truncate" title={formatAmount(totalAmountWorks)}>
                 {formatAmount(totalAmountWorks)}
               </div>
            </div>
        </div>

        {/* Progress */}
        <div className="mt-auto space-y-2.5">
           <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-muted-foreground">Прогресс выполнения</span>
              <span className="text-foreground font-bold">{completionPercentage}%</span>
           </div>
           <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn("h-full transition-all duration-500 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]")} 
                style={{ width: `${completionPercentage}%` }} 
              />
           </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Button 
            className="w-full h-10 text-xs font-bold bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-xl transition-all shadow-none hover:shadow-lg border border-primary/10 hover:border-primary group/btn" 
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(project.id);
            }}
        >
            Подробнее
            <ArrowUpRight className="w-3.5 h-3.5 ml-1.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </Button>
      </CardFooter>
    </Card>
  );
};
};
