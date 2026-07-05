import { type ComponentType, type SVGProps, useEffect, useMemo, useState } from 'react';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  CircleStackIcon,
  SparklesIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import NotificationService from '@/components/shared/NotificationService';
import { cn } from '@/lib/utils';
import {
  billingService,
  type EnterpriseConstructorPreview,
  type EnterpriseConstructorSelectionPayload,
} from '@/utils/api';

type EnterpriseConstructorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onActivated: () => Promise<void> | void;
};

type ConstructorStatus = 'idle' | 'loading' | 'ready' | 'project' | 'success' | 'error';

const PREVIEW_RECALCULATION_DELAY_MS = 120;

const formatRubles = (value: number) => (
  `${Number(value || 0).toLocaleString('ru-RU')} ₽`
);

const normalizeResponseMessage = (responseData: any, fallback: string) => (
  typeof responseData?.message === 'string' && responseData.message.trim() !== ''
    ? responseData.message
    : fallback
);

export default function EnterpriseConstructorModal({
  isOpen,
  onClose,
  onActivated,
}: EnterpriseConstructorModalProps) {
  const [users, setUsers] = useState(100);
  const [additionalOrganizations, setAdditionalOrganizations] = useState(0);
  const [extraStorageUnits, setExtraStorageUnits] = useState(0);
  const [extendedAi, setExtendedAi] = useState(false);
  const [prioritySupport, setPrioritySupport] = useState(false);
  const [needsIntegrations, setNeedsIntegrations] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [needsSla, setNeedsSla] = useState(false);
  const [preview, setPreview] = useState<EnterpriseConstructorPreview | null>(null);
  const [status, setStatus] = useState<ConstructorStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [balanceAfter, setBalanceAfter] = useState<number | null>(null);
  const [isPreviewRefreshing, setIsPreviewRefreshing] = useState(false);

  const moreThan250Users = users > 250;

  const payload = useMemo<EnterpriseConstructorSelectionPayload>(() => ({
    users,
    additional_organizations: additionalOrganizations,
    extra_storage_units: extraStorageUnits,
    extended_ai: extendedAi,
    priority_support: prioritySupport,
    needs_integrations: needsIntegrations,
    needs_migration: needsMigration,
    needs_sla: needsSla,
    more_than_250_users: moreThan250Users,
  }), [
    users,
    additionalOrganizations,
    extraStorageUnits,
    extendedAi,
    prioritySupport,
    needsIntegrations,
    needsMigration,
    needsSla,
    moreThan250Users,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isActual = true;
    setStatus('loading');
    setIsPreviewRefreshing(true);
    setError(null);

    const timer = window.setTimeout(async () => {
      try {
        const response = await billingService.previewEnterpriseConstructor(payload);
        const responseData = response.data as any;

        if (response.status >= 400 || responseData?.success === false) {
          throw new Error(normalizeResponseMessage(responseData, 'Не удалось рассчитать конфигурацию.'));
        }

        if (!isActual) {
          return;
        }

        const nextPreview = responseData?.data as EnterpriseConstructorPreview;
        setPreview(nextPreview);
        setStatus(nextPreview.requires_implementation_project ? 'project' : 'ready');
        setIsPreviewRefreshing(false);
      } catch (requestError: any) {
        if (!isActual) {
          return;
        }

        setPreview(null);
        setStatus('error');
        setIsPreviewRefreshing(false);
        setError(requestError?.message || 'Не удалось рассчитать конфигурацию.');
      }
    }, PREVIEW_RECALCULATION_DELAY_MS);

    return () => {
      isActual = false;
      window.clearTimeout(timer);
    };
  }, [isOpen, payload]);

  const handleCheckout = async () => {
    if (!preview || preview.requires_implementation_project) {
      return;
    }

    setCheckoutLoading(true);
    setError(null);

    try {
      const response = await billingService.checkoutEnterpriseConstructor(payload);
      const responseData = response.data as any;

      if (response.status >= 400 || responseData?.success === false) {
        throw new Error(normalizeResponseMessage(responseData, 'Не удалось подключить Enterprise Конструктор.'));
      }

      const checkoutData = responseData?.data || {};
      setBalanceAfter(typeof checkoutData?.balance?.amount === 'number' ? checkoutData.balance.amount : null);
      setStatus('success');
      await onActivated();
      NotificationService.show({
        type: 'success',
        title: 'Enterprise Конструктор подключен',
        message: 'Оплата списана с баланса организации.',
      });
    } catch (requestError: any) {
      const message = requestError?.message || 'Не удалось подключить Enterprise Конструктор.';
      setError(message);
      setStatus('error');
      NotificationService.show({
        type: 'error',
        title: 'Не удалось подключить тариф',
        message,
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleClose = () => {
    if (checkoutLoading) {
      return;
    }

    onClose();
  };

  const isCalculating = status === 'loading' || isPreviewRefreshing;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        handleClose();
      }
    }}>
      <DialogContent className="max-h-[92vh] max-w-5xl overflow-y-auto p-0">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="text-2xl">Enterprise Конструктор</DialogTitle>
          <DialogDescription>
            Соберите конфигурацию и оплатите подключение с баланса организации.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-0 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6 px-6 py-5">
            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Размер команды</h3>
                <p className="mt-1 text-sm text-slate-500">До 250 пользователей можно подключить сразу.</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[100, 250, 300].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setUsers(value)}
                    className={cn(
                      'rounded-xl border px-3 py-3 text-left text-sm transition',
                      users === value
                        ? 'border-orange-500 bg-orange-50 text-slate-950 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300'
                    )}
                  >
                    <span className="block font-bold">
                      {value === 300 ? 'Больше 250' : `${value} пользователей`}
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {value === 300 ? 'Через проект внедрения' : 'Оплата с баланса'}
                    </span>
                  </button>
                ))}
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Точное количество пользователей</span>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={users}
                  onChange={(event) => setUsers(Math.max(1, Number(event.target.value || 1)))}
                />
              </label>
            </section>

            <section className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Дополнительные организации</span>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={additionalOrganizations}
                  onChange={(event) => setAdditionalOrganizations(Math.max(0, Number(event.target.value || 0)))}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Дополнительное хранилище по 100 ГБ</span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={extraStorageUnits}
                  onChange={(event) => setExtraStorageUnits(Math.max(0, Number(event.target.value || 0)))}
                />
              </label>
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Расширения</h3>
              <ToggleRow
                title="Расширенный AI"
                description="Добавляет дополнительный объем AI-запросов."
                checked={extendedAi}
                onCheckedChange={setExtendedAi}
              />
              <ToggleRow
                title="Приоритетная поддержка"
                description="Ускоренный канал помощи для команды."
                checked={prioritySupport}
                onCheckedChange={setPrioritySupport}
              />
            </section>

            <section className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">Нужен проект внедрения</h3>
              <ToggleRow
                title="Интеграции с корпоративными системами"
                description="Подключение требует отдельной подготовки."
                checked={needsIntegrations}
                onCheckedChange={setNeedsIntegrations}
              />
              <ToggleRow
                title="Перенос данных"
                description="Нужно перенести данные из старой системы."
                checked={needsMigration}
                onCheckedChange={setNeedsMigration}
              />
              <ToggleRow
                title="Индивидуальные условия сопровождения"
                description="Нужны отдельные условия обслуживания."
                checked={needsSla}
                onCheckedChange={setNeedsSla}
              />
            </section>
          </div>

          <aside className="border-t border-slate-100 bg-slate-50 px-6 py-5 lg:border-l lg:border-t-0">
            <div className="sticky top-4 space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Стоимость</p>
                    <div className="mt-1 text-3xl font-bold text-slate-950">
                      {isCalculating ? 'Пересчитываем...' : preview?.price.label || '...'}
                    </div>
                    {isCalculating && preview && (
                      <p className="mt-1 text-xs font-medium text-orange-600">
                        Обновляем итог по выбранной конфигурации
                      </p>
                    )}
                  </div>
                  {isCalculating ? (
                    <ArrowPathIcon className="h-7 w-7 animate-spin text-orange-500" />
                  ) : (
                    <SparklesIcon className="h-7 w-7 text-orange-500" />
                  )}
                </div>

                {preview && (
                  <div className="space-y-3">
                    <LimitLine icon={UserGroupIcon} label="Пользователи" value={preview.limits.users} />
                    <LimitLine icon={CircleStackIcon} label="Хранилище" value={`${preview.limits.storage_gb} ГБ`} />
                    <LimitLine icon={SparklesIcon} label="AI-запросы" value={preview.limits.ai_requests} />
                  </div>
                )}

                {preview?.selected_extensions.length ? (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="mb-2 text-sm font-bold text-slate-700">Выбранные расширения</p>
                    <div className="space-y-2">
                      {preview.selected_extensions.map((extension) => (
                        <div key={extension.key} className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-slate-600">{extension.name}</span>
                          <Badge variant="secondary">{formatRubles(extension.price)}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {status === 'project' && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-bold">Нужен проект внедрения</p>
                  <p className="mt-1">
                    Деньги с баланса не списываются. Конфигурация требует отдельной подготовки перед подключением.
                  </p>
                </div>
              )}

              {status === 'success' && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircleIcon className="h-5 w-5" />
                    Enterprise Конструктор подключен
                  </div>
                  {balanceAfter !== null && (
                    <p className="mt-1">Остаток баланса: {formatRubles(balanceAfter / 100)}</p>
                  )}
                </div>
              )}

              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                {status === 'success' ? (
                  <Button className="h-12" onClick={handleClose}>
                    Закрыть
                  </Button>
                ) : (
                  <Button
                    className="h-12 bg-orange-600 font-bold hover:bg-orange-700"
                    disabled={!preview || isCalculating || status === 'project' || checkoutLoading}
                    onClick={handleCheckout}
                  >
                    {checkoutLoading && <ArrowPathIcon className="mr-2 h-5 w-5 animate-spin" />}
                    {status === 'project' ? 'Нужен проект внедрения' : 'Оплатить с баланса'}
                  </Button>
                )}
                <Button variant="outline" className="h-11" onClick={handleClose} disabled={checkoutLoading}>
                  {status === 'success' ? 'Готово' : 'Вернуться к тарифам'}
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type ToggleRowProps = {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

function ToggleRow({ title, description, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-slate-950">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
      <Switch aria-label={title} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

type LimitLineProps = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  value: string | number;
};

function LimitLine({ icon: Icon, label, value }: LimitLineProps) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}
