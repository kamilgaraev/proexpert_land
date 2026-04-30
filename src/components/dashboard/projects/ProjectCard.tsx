import { ArrowUpRight, Building2, CheckCircle2, FileText, MapPin, TrendingUp, User } from 'lucide-react';
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
  const statusConfig: Record<string, { color: string; label: string; dot: string; bg: string; ring: string }> = {
    planned: { color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-400', ring: 'ring-slate-200', label: 'Запланирован' },
    active: { color: 'text-emerald-700', bg: 'bg-emerald-50', dot: 'bg-emerald-500', ring: 'ring-emerald-100', label: 'Активен' },
    in_progress: { color: 'text-blue-700', bg: 'bg-blue-50', dot: 'bg-blue-500', ring: 'ring-blue-100', label: 'В работе' },
    completed: { color: 'text-slate-600', bg: 'bg-slate-100', dot: 'bg-slate-500', ring: 'ring-slate-200', label: 'Завершен' },
    on_hold: { color: 'text-amber-700', bg: 'bg-amber-50', dot: 'bg-amber-500', ring: 'ring-amber-100', label: 'На паузе' },
    cancelled: { color: 'text-red-700', bg: 'bg-red-50', dot: 'bg-red-500', ring: 'ring-red-100', label: 'Отменен' }
  };

  const completionPercentage = Math.min(100, Math.max(0, Math.round(project.progress_percent ?? project.completion_percentage ?? 0)));
  const totalContracts = project.stats?.contracts.total ?? project.total_contracts ?? 0;
  const totalWorks = project.stats?.works.total ?? project.total_works ?? 0;
  const totalAmountContracts = project.stats?.contracts.total_amount ?? project.total_amount_contracts ?? 0;
  const totalAmountWorks = project.stats?.works.total_amount ?? project.total_amount_works ?? 0;

  const formatAmount = (amount: number) => {
    if (!amount) {
      return '0 ₽';
    }

    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
      notation: amount >= 1000000 ? 'compact' : 'standard'
    }).format(amount);
  };

  const status = statusConfig[project.status] || { 
    color: 'text-slate-600', 
    bg: 'bg-slate-100', 
    dot: 'bg-slate-400', 
    ring: 'ring-slate-200',
    label: project.status 
  };

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-emerald-500';
    if (percent > 75) return 'bg-blue-500';
    if (percent > 40) return 'bg-primary';
    return 'bg-orange-500';
  };

  const roleValue = typeof project.role === 'string' ? project.role : project.role.value;
  const roleLabels: Record<string, string> = {
    owner: 'Владелец',
    customer: 'Заказчик',
    general_contractor: 'Генподрядчик',
    contractor: 'Подрядчик',
    subcontractor: 'Субподрядчик',
    construction_supervision: 'Стройконтроль',
    designer: 'Проектировщик',
    observer: 'Наблюдатель'
  };
  const roleLabel = typeof project.role === 'string' ? roleLabels[roleValue] || project.role : project.role.label;
  const isOwner = roleValue === 'owner';
  const RoleIcon = isOwner ? Building2 : User;
  const progressLabel = completionPercentage >= 100
    ? 'Завершено'
    : completionPercentage > 0
      ? 'В процессе'
      : 'Не начато';

  return (
    <Card 
      onClick={() => onViewDetails(project.id)}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_20px_45px_rgba(15,23,42,0.08)]"
    >
      <div className="h-1 bg-gradient-to-r from-primary via-amber-400 to-emerald-400" />

      <CardContent className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1',
              status.bg,
              status.color,
              status.ring
            )}>
              <span className={cn("h-2 w-2 rounded-full", status.dot)} />
              {status.label}
            </div>
            <span className="shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
              {completionPercentage}%
            </span>
          </div>

          <h3 className="line-clamp-2 text-[1.35rem] font-bold leading-tight text-slate-950 transition-colors duration-300 group-hover:text-primary">
            {project.name}
          </h3>

          <div className="space-y-2.5 text-sm">
            <div className={cn("flex items-start", project.address ? 'text-slate-600' : 'text-slate-400')}>
              <MapPin className="mr-2.5 mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
              <span className="line-clamp-1">{project.address || 'Адрес не указан'}</span>
            </div>

            <div className="flex items-center">
              <div className={cn(
                "inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold ring-1",
                isOwner
                  ? 'bg-orange-50 text-orange-700 ring-orange-100'
                  : 'bg-slate-50 text-slate-700 ring-slate-200'
              )}>
                <RoleIcon className="h-3.5 w-3.5" />
                <span>{roleLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/70">
          <div className="p-4">
            <div className="mb-3 flex items-center gap-2 text-slate-500">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
              </div>
              <span className="text-xs font-semibold">Контракты</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-950">{totalContracts}</span>
              <span className="text-xs text-slate-500 font-medium">{formatAmount(totalAmountContracts)}</span>
            </div>
          </div>
          
          <div className="border-l border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-2 text-emerald-700">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              </div>
              <span className="text-xs font-semibold">Выполнено</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-slate-950">{totalWorks}</span>
              <span className="text-xs text-emerald-600 font-bold">{formatAmount(totalAmountWorks)}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>{progressLabel}</span>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {completionPercentage}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div 
              className={cn("h-full rounded-full transition-[width] duration-700 ease-out", getProgressColor(completionPercentage))}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-slate-100 bg-slate-50/60 p-3">
        <Button 
          variant="ghost"
          className="group/btn h-11 w-full justify-between rounded-xl px-3 text-sm font-semibold text-slate-700 transition-all hover:bg-white hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(project.id);
          }}
        >
          <span>Открыть проект</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200 transition-all group-hover/btn:text-primary group-hover/btn:ring-orange-200">
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
          </div>
        </Button>
      </CardFooter>
    </Card>
  );
};
