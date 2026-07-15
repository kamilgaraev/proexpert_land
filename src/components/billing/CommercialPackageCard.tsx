import { ArrowRight, CheckCircle2, Clock3, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CommercialPackage } from '@/types/commercialBilling';
import { cn } from '@/lib/utils';

type CommercialPackageCardProps = {
  packageItem: CommercialPackage;
  variant: 'connected' | 'available';
  pendingAction?: 'add' | 'remove' | null;
  primaryActionLabel?: string | null;
  secondaryActionLabel?: string | null;
  effectiveDateLabel?: string | null;
  secondaryActionDisabled?: boolean;
  disabled?: boolean;
  onPrimaryAction: () => void;
  onSecondaryAction?: () => void;
  onDetails: () => void;
};

const formatMoney = (minor: number, currency: string) => new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency,
  maximumFractionDigits: 0,
}).format(minor / 100);

export const CommercialPackageCard = ({
  packageItem,
  variant,
  pendingAction = null,
  primaryActionLabel,
  secondaryActionLabel = null,
  effectiveDateLabel,
  secondaryActionDisabled = false,
  disabled = false,
  onPrimaryAction,
  onSecondaryAction,
  onDetails,
}: CommercialPackageCardProps) => {
  const connected = variant === 'connected';
  const actionLabel = primaryActionLabel === undefined
    ? (connected ? 'Отключить со следующего периода' : 'Добавить')
    : primaryActionLabel;
  const statusLabel = pendingAction === 'remove'
    ? 'Будет отключён'
    : pendingAction === 'add'
      ? 'Будет подключён'
      : packageItem.accessSource === 'trial'
        ? 'Пробный доступ'
        : connected
          ? 'Подключён'
          : null;

  return (
    <article className={cn(
      'group flex min-h-60 min-w-0 flex-col overflow-hidden rounded-2xl border bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-200 hover:border-slate-300 hover:shadow-md sm:p-6',
      connected ? 'border-emerald-200' : 'border-slate-200',
      pendingAction === 'remove' && 'border-amber-300 bg-amber-50/40',
      pendingAction === 'add' && 'border-orange-300 bg-orange-50/40',
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          {statusLabel && (
            <div className={cn(
              'mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold',
              pendingAction === 'remove'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800',
            )}>
              {pendingAction === 'remove' ? <Clock3 className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {statusLabel}
            </div>
          )}
          <h3 className="text-xl font-semibold tracking-tight text-slate-950">{packageItem.name}</h3>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-lg font-semibold text-slate-950">{formatMoney(packageItem.priceMinor, packageItem.currency)}</div>
          <div className="text-xs text-slate-500">за 30 дней</div>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{packageItem.description}</p>
      {effectiveDateLabel && <p className="mt-3 text-sm font-medium text-amber-800">{effectiveDateLabel}</p>}

      <div className="mt-auto grid min-w-0 gap-2 pt-6 sm:grid-cols-[auto_minmax(0,1fr)]">
        <Button type="button" variant="outline" className="w-full justify-between gap-3 whitespace-normal" onClick={onDetails}>
          Подробнее
          <ArrowRight className="h-4 w-4" />
        </Button>
        {actionLabel && (
          <Button
            type="button"
            variant={connected ? 'ghost' : 'default'}
            className={cn(
              'h-auto min-h-10 w-full gap-2 whitespace-normal px-3 text-center leading-snug',
              connected && pendingAction !== 'remove' && 'text-slate-600 hover:text-red-700',
              !connected && 'bg-orange-500 text-white hover:bg-orange-600',
            )}
            disabled={disabled}
            onClick={onPrimaryAction}
          >
            {pendingAction === 'remove' ? <RotateCcw className="h-4 w-4" /> : !connected ? <Plus className="h-4 w-4" /> : null}
            {actionLabel}
          </Button>
        )}
      </div>
      {secondaryActionLabel && onSecondaryAction && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 self-start px-1 text-slate-600"
          disabled={secondaryActionDisabled || disabled}
          onClick={onSecondaryAction}
        >
          {secondaryActionLabel}
        </Button>
      )}
    </article>
  );
};
