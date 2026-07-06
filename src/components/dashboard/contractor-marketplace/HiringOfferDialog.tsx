import { useEffect, useMemo, useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useMyProjects } from '@/hooks/useMyProjects';
import type {
  MarketplaceContractorProfile,
  MarketplaceCreateOfferPayload,
  MarketplaceCreateOfferWorkPackage,
  MarketplaceProjectRole,
} from '@/types/contractor-marketplace';

type OfferRole = Extract<
  MarketplaceProjectRole,
  'contractor' | 'subcontractor' | 'construction_supervision' | 'designer' | 'observer'
>;

interface WorkPackageDraft {
  category_id: number | null;
  title: string;
  description: string;
  quantity: string;
  unit: string;
  budget_min: string;
  budget_max: string;
  starts_at: string;
  ends_at: string;
}

interface HiringOfferDialogProps {
  open: boolean;
  profile: MarketplaceContractorProfile | null;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (payload: MarketplaceCreateOfferPayload) => Promise<void>;
}

const roleOptions: Array<{ value: OfferRole; label: string }> = [
  { value: 'contractor', label: 'Подрядчик' },
  { value: 'subcontractor', label: 'Субподрядчик' },
  { value: 'construction_supervision', label: 'Стройконтроль' },
  { value: 'designer', label: 'Проектировщик' },
  { value: 'observer', label: 'Наблюдатель' },
];

const emptyWorkPackage = (categoryId: number | null = null): WorkPackageDraft => ({
  category_id: categoryId,
  title: '',
  description: '',
  quantity: '',
  unit: '',
  budget_min: '',
  budget_max: '',
  starts_at: '',
  ends_at: '',
});

const optionalString = (value: string): string | undefined => {
  const trimmed = value.trim();

  return trimmed === '' ? undefined : trimmed;
};

const optionalNumber = (value: string): number | undefined => {
  if (value.trim() === '') {
    return undefined;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
};

export const HiringOfferDialog = ({
  open,
  profile,
  submitting,
  onClose,
  onSubmit,
}: HiringOfferDialogProps) => {
  const { projects, loading: projectsLoading, fetchProjects } = useMyProjects();
  const categoryOptions = useMemo(() => profile?.categories ?? [], [profile]);
  const firstCategoryId = categoryOptions[0]?.category_id ?? null;
  const availableProjects = useMemo(
    () => projects.filter((project) => !['completed', 'cancelled'].includes(project.status)),
    [projects]
  );

  const [projectId, setProjectId] = useState<number | null>(null);
  const [role, setRole] = useState<OfferRole>('contractor');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [workPackages, setWorkPackages] = useState<WorkPackageDraft[]>([emptyWorkPackage()]);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      void fetchProjects();
    }
  }, [fetchProjects, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setProjectId((current) => current ?? availableProjects[0]?.id ?? null);
    setRole('contractor');
    setTitle(profile?.display_name ? `Офер для ${profile.display_name}` : '');
    setMessage('');
    setStartsAt('');
    setEndsAt('');
    setBudgetMin('');
    setBudgetMax('');
    setExpiresAt('');
    setWorkPackages([emptyWorkPackage(firstCategoryId)]);
    setValidationError(null);
  }, [availableProjects, firstCategoryId, open, profile]);

  const updateWorkPackage = <K extends keyof WorkPackageDraft>(
    index: number,
    field: K,
    value: WorkPackageDraft[K]
  ) => {
    setWorkPackages((current) => current.map((workPackage, workPackageIndex) => (
      workPackageIndex === index ? { ...workPackage, [field]: value } : workPackage
    )));
  };

  const addWorkPackage = () => {
    setWorkPackages((current) => [...current, emptyWorkPackage(firstCategoryId)]);
  };

  const removeWorkPackage = (index: number) => {
    setWorkPackages((current) => current.filter((_, workPackageIndex) => workPackageIndex !== index));
  };

  const buildPayload = (): MarketplaceCreateOfferPayload | null => {
    if (!profile) {
      return null;
    }

    if (projectId === null) {
      setValidationError('Выберите проект для оффера.');
      return null;
    }

    if (title.trim() === '') {
      setValidationError('Заполните название оффера.');
      return null;
    }

    const normalizedWorkPackages: MarketplaceCreateOfferWorkPackage[] = [];

    for (const workPackage of workPackages) {
      if (workPackage.category_id === null || workPackage.title.trim() === '') {
        setValidationError('В каждом пакете работ должна быть категория и название.');
        return null;
      }

      normalizedWorkPackages.push({
        category_id: workPackage.category_id,
        title: workPackage.title.trim(),
        description: optionalString(workPackage.description),
        quantity: optionalNumber(workPackage.quantity),
        unit: optionalString(workPackage.unit),
        budget_min: optionalNumber(workPackage.budget_min),
        budget_max: optionalNumber(workPackage.budget_max),
        starts_at: optionalString(workPackage.starts_at),
        ends_at: optionalString(workPackage.ends_at),
      });
    }

    setValidationError(null);

    return {
      project_id: projectId,
      contractor_profile_id: profile.id,
      role,
      title: title.trim(),
      message: optionalString(message),
      starts_at: optionalString(startsAt),
      ends_at: optionalString(endsAt),
      budget_min: optionalNumber(budgetMin),
      budget_max: optionalNumber(budgetMax),
      currency: 'RUB',
      expires_at: optionalString(expiresAt),
      work_packages: normalizedWorkPackages,
    };
  };

  const handleSubmit = async () => {
    const payload = buildPayload();

    if (payload) {
      await onSubmit(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => !nextOpen && !submitting && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Офер подрядчику</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {profile && (
            <Alert>
              <AlertDescription>
                Офер будет отправлен подрядчику {profile.display_name ?? 'из каталога'} по выбранному проекту.
              </AlertDescription>
            </Alert>
          )}

          {validationError && (
            <Alert variant="destructive">
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-2">
              <Label>Проект</Label>
              <Select
                value={projectId === null ? undefined : String(projectId)}
                disabled={projectsLoading || submitting}
                onValueChange={(value) => setProjectId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите проект" />
                </SelectTrigger>
                <SelectContent>
                  {availableProjects.map((project) => (
                    <SelectItem key={project.id} value={String(project.id)}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Роль</Label>
              <Select
                value={role}
                disabled={submitting}
                onValueChange={(value) => setRole(value as OfferRole)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {projectsLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Загружаем проекты
            </div>
          )}

          {!projectsLoading && availableProjects.length === 0 && (
            <Alert variant="destructive">
              <AlertDescription>Нет активных проектов для отправки оффера.</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Название оффера</Label>
            <Input value={title} disabled={submitting} onChange={(event) => setTitle(event.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Сообщение подрядчику</Label>
            <Textarea
              value={message}
              rows={4}
              disabled={submitting}
              onChange={(event) => setMessage(event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>Начало</Label>
              <Input type="date" value={startsAt} disabled={submitting} onChange={(event) => setStartsAt(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Завершение</Label>
              <Input type="date" value={endsAt} disabled={submitting} onChange={(event) => setEndsAt(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Бюджет от</Label>
              <Input type="number" value={budgetMin} disabled={submitting} onChange={(event) => setBudgetMin(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Бюджет до</Label>
              <Input type="number" value={budgetMax} disabled={submitting} onChange={(event) => setBudgetMax(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Действует до</Label>
              <Input type="date" value={expiresAt} disabled={submitting} onChange={(event) => setExpiresAt(event.target.value)} />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold">Пакеты работ</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={submitting || categoryOptions.length === 0}
                onClick={addWorkPackage}
              >
                <Plus className="mr-2 h-4 w-4" />
                Добавить пакет
              </Button>
            </div>

            {workPackages.map((workPackage, index) => (
              <div key={index} className="space-y-4 rounded-xl border p-4">
                <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px]">
                  <div className="space-y-2">
                    <Label>Категория</Label>
                    <Select
                      value={workPackage.category_id === null ? undefined : String(workPackage.category_id)}
                      disabled={submitting}
                      onValueChange={(value) => updateWorkPackage(index, 'category_id', Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Категория работ" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category.category_id} value={String(category.category_id)}>
                            {category.category?.name ?? `Категория #${category.category_id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Название работ</Label>
                    <Input
                      value={workPackage.title}
                      disabled={submitting}
                      onChange={(event) => updateWorkPackage(index, 'title', event.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={submitting || workPackages.length === 1}
                      onClick={() => removeWorkPackage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea
                    value={workPackage.description}
                    rows={3}
                    disabled={submitting}
                    onChange={(event) => updateWorkPackage(index, 'description', event.target.value)}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-6">
                  <div className="space-y-2">
                    <Label>Объем</Label>
                    <Input
                      type="number"
                      value={workPackage.quantity}
                      disabled={submitting}
                      onChange={(event) => updateWorkPackage(index, 'quantity', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ед. изм.</Label>
                    <Input
                      value={workPackage.unit}
                      disabled={submitting}
                      onChange={(event) => updateWorkPackage(index, 'unit', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Бюджет от</Label>
                    <Input
                      type="number"
                      value={workPackage.budget_min}
                      disabled={submitting}
                      onChange={(event) => updateWorkPackage(index, 'budget_min', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Бюджет до</Label>
                    <Input
                      type="number"
                      value={workPackage.budget_max}
                      disabled={submitting}
                      onChange={(event) => updateWorkPackage(index, 'budget_max', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Начало</Label>
                    <Input
                      type="date"
                      value={workPackage.starts_at}
                      disabled={submitting}
                      onChange={(event) => updateWorkPackage(index, 'starts_at', event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Завершение</Label>
                    <Input
                      type="date"
                      value={workPackage.ends_at}
                      disabled={submitting}
                      onChange={(event) => updateWorkPackage(index, 'ends_at', event.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Отмена
          </Button>
          <Button
            onClick={() => void handleSubmit()}
            disabled={submitting || projectsLoading || availableProjects.length === 0 || categoryOptions.length === 0}
          >
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Отправить оффер
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HiringOfferDialog;
