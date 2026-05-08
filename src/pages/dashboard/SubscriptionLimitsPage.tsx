import {
  ArrowPathIcon,
  BeakerIcon,
  BuildingOfficeIcon,
  CircleStackIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useSubscriptionLimits } from '@hooks/useSubscriptionLimits';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { StorageLimitItem, SubscriptionLimitItem } from '@utils/api';

type LimitCard = {
  key: string;
  title: string;
  unit: string;
  icon: typeof UsersIcon;
  value: SubscriptionLimitItem | StorageLimitItem | undefined;
  storage?: boolean;
};

const statusText: Record<string, string> = {
  normal: 'В норме',
  approaching: 'Скоро закончится',
  warning: 'Требует внимания',
  exceeded: 'Превышен',
  unlimited: 'Без ограничений',
};

const statusClass: Record<string, string> = {
  normal: 'bg-emerald-50 text-emerald-700',
  approaching: 'bg-amber-50 text-amber-700',
  warning: 'bg-orange-50 text-orange-700',
  exceeded: 'bg-red-50 text-red-700',
  unlimited: 'bg-slate-100 text-slate-700',
};

const isStorageLimit = (_limit: SubscriptionLimitItem | StorageLimitItem, storage?: boolean): _limit is StorageLimitItem => (
  Boolean(storage)
);

const formatNumber = (value: number, storage?: boolean) => (
  storage ? value.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : value.toLocaleString('ru-RU')
);

const getUsed = (limit: SubscriptionLimitItem | StorageLimitItem, storage?: boolean) => (
  isStorageLimit(limit, storage) ? limit.used_gb : limit.used
);

const getLimit = (limit: SubscriptionLimitItem | StorageLimitItem, storage?: boolean) => (
  isStorageLimit(limit, storage) ? limit.limit_gb : limit.limit
);

const getRemaining = (limit: SubscriptionLimitItem | StorageLimitItem, storage?: boolean) => (
  isStorageLimit(limit, storage) ? limit.remaining_gb : limit.remaining
);

const formatLimitValue = (limit: SubscriptionLimitItem | StorageLimitItem, storage?: boolean) => {
  const value = getLimit(limit, storage);

  if (value === null || value === undefined) {
    return 'Индивидуально';
  }

  return `${formatNumber(value, storage)} ${storage ? 'ГБ' : ''}`.trim();
};

const LimitSummaryCard = ({ item }: { item: LimitCard }) => {
  if (!item.value) {
    return null;
  }

  const Icon = item.icon;
  const used = getUsed(item.value, item.storage);
  const remaining = getRemaining(item.value, item.storage);
  const status = statusText[item.value.status] ?? 'В норме';
  const percentage = Math.min(Math.max(item.value.percentage_used ?? 0, 0), 100);

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="rounded-2xl bg-orange-50 p-3 text-orange-600">
            <Icon className="h-6 w-6" />
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass[item.value.status] ?? statusClass.normal}`}>
            {status}
          </span>
        </div>
        <h2 className="mt-4 text-lg font-black text-slate-950">{item.title}</h2>
        <div className="mt-3 flex items-end gap-2">
          <span className="text-3xl font-black text-slate-950">{formatNumber(used, item.storage)}</span>
          <span className="pb-1 text-sm font-semibold text-slate-500">
            из {formatLimitValue(item.value, item.storage)} {item.unit}
          </span>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${item.value.status === 'exceeded' ? 'bg-red-500' : 'bg-orange-500'}`}
            style={{ width: `${getLimit(item.value, item.storage) === null ? 100 : percentage}%` }}
          />
        </div>
        <p className="mt-3 text-sm font-medium text-slate-500">
          {remaining > 0 ? `Осталось ${formatNumber(remaining, item.storage)} ${item.unit}` : 'Доступный объём исчерпан'}
        </p>
      </CardContent>
    </Card>
  );
};

const SubscriptionLimitsPage = () => {
  const { data, loading, error, refresh, lastUpdated } = useSubscriptionLimits({ autoRefresh: false });

  const limits = data?.limits;
  const cards: LimitCard[] = [
    { key: 'users', title: 'Пользователи', unit: 'чел.', icon: UserGroupIcon, value: limits?.users },
    { key: 'projects', title: 'Проекты', unit: 'шт.', icon: BuildingOfficeIcon, value: limits?.projects },
    { key: 'foremen', title: 'Прорабы', unit: 'чел.', icon: UsersIcon, value: limits?.foremen },
    { key: 'storage', title: 'Хранилище', unit: 'ГБ', icon: CircleStackIcon, value: limits?.storage, storage: true },
    { key: 'invitations', title: 'Приглашения', unit: 'шт.', icon: EnvelopeIcon, value: limits?.invitations },
    { key: 'ai', title: 'AI-запросы', unit: 'шт.', icon: BeakerIcon, value: limits?.ai_requests ?? limits?.ai },
  ];

  const visibleCards = cards.filter(item => item.value);

  if (loading && !data) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-orange-600" />
          <p className="mt-3 text-sm font-medium text-slate-500">Загружаем лимиты тарифа</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card className="border-red-100 bg-red-50">
          <CardContent className="p-6 text-center">
            <ExclamationTriangleIcon className="mx-auto h-10 w-10 text-red-600" />
            <h1 className="mt-3 text-2xl font-black text-red-950">Не удалось загрузить лимиты</h1>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <Button onClick={refresh} className="mt-5">Повторить</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-7 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px] space-y-7">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600">Тариф и доступ</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Лимиты тарифа</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Контролируйте доступный объём команды, проектов, хранилища и дополнительных возможностей.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {lastUpdated && (
              <span className="text-xs font-semibold text-slate-500">
                Обновлено {lastUpdated.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <Button variant="outline" onClick={refresh} disabled={loading}>
              <ArrowPathIcon className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </header>

        <Card className="border-slate-200 bg-slate-50 shadow-none">
          <CardContent className="grid gap-4 p-5 md:grid-cols-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Текущий тариф</p>
              <p className="mt-1 text-xl font-black text-slate-950">
                {data?.subscription?.plan_name ?? (data?.has_subscription ? 'Активный тариф' : 'Базовый доступ')}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Статус</p>
              <p className="mt-1 text-xl font-black text-slate-950">
                {data?.has_subscription ? 'Подключён' : 'Тариф не подключён'}
              </p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Следующее списание</p>
              <p className="mt-1 text-xl font-black text-slate-950">
                {data?.subscription?.next_billing_at
                  ? new Date(data.subscription.next_billing_at).toLocaleDateString('ru-RU')
                  : 'Не назначено'}
              </p>
            </div>
          </CardContent>
        </Card>

        {visibleCards.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleCards.map(item => <LimitSummaryCard key={item.key} item={item} />)}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
            Для текущего тарифа пока нет отдельных лимитов.
          </div>
        )}

        {(data?.warnings?.length ?? 0) > 0 && (
          <section className="space-y-3">
            <h2 className="text-xl font-black text-slate-950">Требуют внимания</h2>
            {data?.warnings.map((warning, index) => (
              <div key={`${warning.type}-${index}`} className="rounded-2xl border border-orange-100 bg-orange-50 px-5 py-4 text-sm font-semibold text-orange-900">
                {warning.message}
              </div>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default SubscriptionLimitsPage;
