import { MapPin, ArrowUpRight, Building2, User, FileText, CheckCircle2, TrendingUp } from 'lucide-react';
import type { ProjectOverview } from '@/types/projects-overview';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: ProjectOverview;
  onViewDetails: (projectId: number) => void;
  onGoToWork?: (projectId: number) => void;
}

export const ProjectCard = ({
  project,
  onViewDetails
}: ProjectCardProps) => {
  const statusConfig: Record<string, { color: string; label: string; dot: string; bg: string }> = {
    planned: { color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400', label: 'Запланирован' },
    active: { color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', label: 'Активен' },
    in_progress: { color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500', label: 'В работе' },
    completed: { color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-500', label: 'Завершен' },
    on_hold: { color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500', label: 'На паузе' },
    cancelled: { color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500', label: 'Отменен' }
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
      maximumFractionDigits: 0,
      notation: amount > 1000000 ? 'compact' : 'standard'
    }).format(amount);
  };

  const status = statusConfig[project.status] || { 
    color: 'text-slate-600', 
    bg: 'bg-slate-100', 
    dot: 'bg-slate-400', 
    label: project.status 
  };

  // Determine progress color based on percentage
  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-emerald-500';
    if (percent > 75) return 'bg-blue-500';
    if (percent > 40) return 'bg-primary';
    return 'bg-orange-500';
  };

  return (
    <Card 
      onClick={() => onViewDetails(project.id)}
      className="group relative overflow-hidden border border-border/60 bg-white hover:border-primary/20 transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 flex flex-col h-full rounded-3xl cursor-pointer"
    >
      {/* Decorative gradient blob background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <CardContent className="p-6 flex-1 flex flex-col gap-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3 flex-1">
              <div className={cn(
                "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border transition-colors duration-300", 
                status.bg, 
                status.color,
                "border-transparent group-hover:border-current/10"
              )}>
                <span className={cn("relative flex h-2 w-2")}>
                  <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", status.dot)}></span>
                  <span className={cn("relative inline-flex rounded-full h-2 w-2", status.dot)}></span>
                </span>
                {status.label}
              </div>
              
              <h3 className="font-bold text-xl leading-snug text-slate-900 group-hover:text-primary transition-colors duration-300 line-clamp-2 tracking-tight">
                {project.name}
              </h3>
            </div>
          </div>

          <div className="space-y-2">
            {project.address ? (
              <div className="flex items-start text-sm text-slate-500 group-hover:text-slate-600 transition-colors">
                <MapPin className="w-4 h-4 mr-2.5 text-slate-400 mt-0.5 shrink-0" />
                <span className="line-clamp-1">{project.address}</span>
              </div>
            ) : (
              <div className="flex items-center text-sm text-slate-400 italic">
                <MapPin className="w-4 h-4 mr-2.5 shrink-0" />
                <span>Адрес не указан</span>
              </div>
            )}

            <div className="flex items-center pl-1">
              {project.role === 'owner' ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-orange-700 bg-orange-50 px-2.5 py-1.5 rounded-lg border border-orange-100/50">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Владелец</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                  <User className="w-3.5 h-3.5" />
                  <span>Подрядчик</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 group-hover:border-slate-200 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-slate-500">
              <div className="p-1.5 bg-white rounded-md shadow-sm">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Контракты</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalContracts}</span>
              <span className="text-xs text-slate-500 font-medium">{formatAmount(totalAmountContracts)}</span>
            </div>
          </div>
          
          <div className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100/60 group-hover:border-emerald-100 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-emerald-700/80">
              <div className="p-1.5 bg-white/80 rounded-md shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">Выполнено</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">{totalWorks}</span>
              <span className="text-xs text-emerald-600 font-bold">{formatAmount(totalAmountWorks)}</span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mt-auto pt-2">
          <div className="flex justify-between items-end mb-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Прогресс</span>
            </div>
            <span className="text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
              {completionPercentage}%
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden p-[2px]">
            <div 
              className={cn("h-full rounded-full transition-all duration-1000 ease-out shadow-sm relative overflow-hidden", getProgressColor(completionPercentage))} 
              style={{ width: `${completionPercentage}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] skew-x-12 -translate-x-full" />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 relative z-10">
        <Button 
          className="w-full h-11 text-sm font-bold bg-white text-slate-700 hover:text-white border-2 border-slate-100 hover:border-primary hover:bg-primary rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg group/btn" 
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(project.id);
          }}
        >
          <span className="flex-1 text-center pl-4">Подробнее о проекте</span>
          <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover/btn:bg-white/20 group-hover/btn:text-white transition-all">
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
          </div>
        </Button>
      </CardFooter>
    </Card>
  );
};
