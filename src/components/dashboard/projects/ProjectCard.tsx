import { ArrowUpRight, Building2, FileText, MapPin, Hammer, User } from 'lucide-react';
import type { ProjectOverview } from '@/types/projects-overview';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: ProjectOverview;
  onViewDetails: (projectId: number) => void;
  onGoToWork?: (projectId: number) => void;
}

export const ProjectCard = ({ project, onViewDetails }: ProjectCardProps) => {
  const statuses: Record<string, { label: string; color: string }> = {
    planned: { label: 'Запланирован', color: 'text-muted-foreground' },
    active: { label: 'Активен', color: 'text-emerald-800' },
    in_progress: { label: 'В работе', color: 'text-blue-800' },
    completed: { label: 'Завершён', color: 'text-muted-foreground' },
    on_hold: { label: 'На паузе', color: 'text-amber-800' },
    cancelled: { label: 'Отменён', color: 'text-red-800' }
  };
  const status = statuses[project.status] ?? { label: 'Статус не указан', color: 'text-muted-foreground' };
  const completionPercentage = Math.min(100, Math.max(0, Math.round(project.progress_percent ?? project.completion_percentage ?? 0)));
  const totalContracts = project.stats?.contracts.total ?? project.total_contracts ?? 0;
  const totalWorks = project.stats?.works.total ?? project.total_works ?? 0;
  const totalAmountContracts = project.stats?.contracts.total_amount ?? project.total_amount_contracts ?? 0;
  const totalAmountWorks = project.stats?.works.total_amount ?? project.total_amount_works ?? 0;
  const formatAmount = (amount: number) => new Intl.NumberFormat('ru-RU', {
    style: 'currency', currency: 'RUB', maximumFractionDigits: 0,
    notation: amount >= 1000000 ? 'compact' : 'standard'
  }).format(amount);
  const roleValue = typeof project.role === 'string' ? project.role : project.role.value;
  const roleLabels: Record<string, string> = {
    owner: 'Владелец', customer: 'Заказчик', general_contractor: 'Генподрядчик',
    contractor: 'Подрядчик', subcontractor: 'Субподрядчик',
    construction_supervision: 'Стройконтроль', designer: 'Проектировщик', observer: 'Наблюдатель'
  };
  const roleLabel = typeof project.role === 'string' ? roleLabels[roleValue] || 'Участник проекта' : project.role.label;
  const RoleIcon = roleValue === 'owner' ? Building2 : User;

  return (
    <Card className="flex h-full min-w-0 flex-col rounded-lg border-border bg-card shadow-none">
      <CardContent className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
        <p className={cn('text-sm font-medium', status.color)}>{status.label}</p>
        <h2 className="most-workspace-heading break-words">{project.name}</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p className="flex items-start gap-2.5">
            <MapPin aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <span className="break-words">{project.address || 'Адрес не указан'}</span>
          </p>
          <p className="flex items-start gap-2.5">
            <RoleIcon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{roleLabel}</span>
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-5 border-y border-border py-5 tabular-nums">
          <div className="min-w-0">
            <dt className="mb-2 flex items-center gap-2 text-sm text-muted-foreground"><FileText aria-hidden="true" className="h-5 w-5 shrink-0" />Контракты</dt>
            <dd className="most-workspace-heading">{totalContracts}</dd>
            <dd className="mt-1 break-words text-sm text-muted-foreground">{formatAmount(totalAmountContracts)}</dd>
          </div>
          <div className="min-w-0">
            <dt className="mb-2 flex items-center gap-2 text-sm text-muted-foreground"><Hammer aria-hidden="true" className="h-5 w-5 shrink-0" />Работы</dt>
            <dd className="most-workspace-heading">{totalWorks}</dd>
            <dd className="mt-1 break-words text-sm text-muted-foreground">{formatAmount(totalAmountWorks)}</dd>
          </div>
        </dl>
        <div className="mt-auto space-y-3">
          <div className="flex justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Готовность проекта</span>
            <span className="font-medium tabular-nums">{completionPercentage}%</span>
          </div>
          <div role="progressbar" aria-label="Готовность проекта" aria-valuenow={completionPercentage} aria-valuemin={0} aria-valuemax={100} className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-border p-3">
        <Button variant="ghost" className="h-11 w-full justify-between rounded-md px-3 text-sm font-medium" aria-label={`Открыть проект «${project.name}»`} onClick={() => onViewDetails(project.id)}>
          Открыть проект<ArrowUpRight aria-hidden="true" className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
};
