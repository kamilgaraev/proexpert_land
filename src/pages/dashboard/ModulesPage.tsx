import { useMemo, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { PageLoading } from '@components/common/PageLoading';
import NotificationService from '@components/shared/NotificationService';
import { useModulesOverview } from '@hooks/useModulesOverview';
import {
  ModulesOverviewModule,
  ModulesOverviewSolution,
  ModulesOverviewTier,
  ModulesOverview,
} from '@utils/api';

const formatMoney = (value: number, currency = 'RUB') => (
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
);

const tierText = (tier: string | null) => {
  const labels: Record<string, string> = {
    base: 'Базовый',
    pro: 'Профессиональный',
    enterprise: 'Корпоративный',
  };

  return tier ? labels[tier] ?? tier : 'Не подключено';
};

const statusText = (status: string) => {
  const labels: Record<string, string> = {
    active: 'Активно',
    available: 'Доступно',
    unavailable: 'Недоступно',
    expired: 'Истекло',
    trial: 'Пробный период',
  };

  return labels[status] ?? status;
};

const classificationText = (module: ModulesOverviewModule) => {
  if (module.is_system || module.classification === 'system') return 'Системный';
  if (module.classification === 'packaged') return 'В составе решения';
  return 'Отдельная возможность';
};

const ModulesPage = () => {
  const {
    overview,
    loading,
    error,
    refresh,
    subscribeToPackage,
    unsubscribeFromPackage,
    activateModule,
    deactivateModule,
    renewModule,
    toggleAutoRenew,
  } = useModulesOverview();

  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [managedSolution, setManagedSolution] = useState<ModulesOverviewSolution | null>(null);
  const [managedModule, setManagedModule] = useState<ModulesOverviewModule | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const runAction = async (key: string, action: () => Promise<void>, successMessage: string) => {
    setActionLoading(key);
    try {
      await action();
      NotificationService.show({ type: 'success', title: 'Готово', message: successMessage });
    } catch (err) {
      NotificationService.show({
        type: 'error',
        title: 'Не получилось выполнить действие',
        message: err instanceof Error ? err.message : 'Попробуйте ещё раз',
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && !overview) {
    return <PageLoading message="Загружаем модули и пакеты..." />;
  }

  if (error && !overview) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-red-100 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-red-500">Ошибка загрузки</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Модули и пакеты</h1>
          <p className="mt-3 text-slate-600">{error}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
          >
            <ArrowPathIcon className="h-5 w-5" />
            Повторить
          </button>
        </div>
      </div>
    );
  }

  if (!overview) {
    return null;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,#fff4e8_0,#f7fafc_28%,#eef3f8_58%,#f8fafc_100%)] px-4 py-7 text-slate-900 sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-x-0 top-20 -z-10 mx-auto h-96 max-w-6xl rounded-full bg-orange-200/30 blur-3xl" />
      <div className="mx-auto max-w-[1280px] space-y-7">
        <header className="relative overflow-hidden rounded-[40px] border border-white/70 bg-[linear-gradient(135deg,#07111f_0%,#102236_48%,#255068_100%)] p-7 text-white shadow-[0_34px_120px_rgba(15,23,42,0.20)] md:p-8">
          <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-orange-400/25 blur-3xl" />
          <div className="absolute bottom-0 right-8 h-40 w-72 rounded-full bg-cyan-300/10 blur-2xl" />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-orange-200">Возможности организации</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">Модули и пакеты</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200">
                Управляйте решениями как бизнес-наборами, а отдельные модули подключайте только там, где они дают самостоятельную ценность.
              </p>
            </div>

            <div className="relative flex items-center gap-3">
              <button
                type="button"
                onClick={() => void refresh()}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white shadow-sm backdrop-blur transition hover:bg-white/20"
              >
                <ArrowPathIcon className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                Обновить
              </button>
              <button
                type="button"
                onClick={() => setIsMoreOpen(value => !value)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white shadow-sm backdrop-blur transition hover:bg-white/20"
              >
                <EllipsisHorizontalIcon className="h-5 w-5" />
                Ещё
              </button>
              {isMoreOpen && (
                <div className="absolute right-0 top-14 z-20 w-64 rounded-3xl border border-slate-100 bg-white p-2 text-slate-900 shadow-2xl">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAdvancedOpen(true);
                      setIsMoreOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Расширенное управление
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <SummaryStrip overview={overview} />
        </header>

        {overview.warnings.length > 0 && (
          <div className="rounded-[28px] border border-amber-200/80 bg-[linear-gradient(135deg,#fff7dc,#fffdf7)] px-5 py-4 text-sm font-bold text-amber-900 shadow-[0_18px_60px_rgba(245,158,11,0.10)]">
            {overview.warnings.map(warning => warning.message).join('. ')}
          </div>
        )}

        <SolutionsSection
          solutions={overview.solutions}
          onManage={setManagedSolution}
        />

        <StandaloneModulesSection
          modules={overview.standalone_modules}
          onManage={setManagedModule}
          onActivate={(module) => void runAction(
            `activate-${module.slug}`,
            () => activateModule(module.slug),
            `Возможность «${module.name}» подключена`,
          )}
          actionLoading={actionLoading}
        />
      </div>

      <SolutionManageDrawer
        solution={managedSolution}
        actionLoading={actionLoading}
        onClose={() => setManagedSolution(null)}
        onSubscribe={(solution, tier) => void runAction(
          `solution-${solution.slug}-${tier.key}`,
          () => subscribeToPackage(solution.slug, tier.key),
          `Решение «${solution.name}» обновлено`,
        )}
        onUnsubscribe={(solution) => void runAction(
          `solution-${solution.slug}-unsubscribe`,
          () => unsubscribeFromPackage(solution.slug),
          `Решение «${solution.name}» отключено`,
        )}
      />

      <StandaloneModuleDrawer
        module={managedModule}
        actionLoading={actionLoading}
        onClose={() => setManagedModule(null)}
        onActivate={(module) => void runAction(
          `activate-${module.slug}`,
          () => activateModule(module.slug),
          `Возможность «${module.name}» подключена`,
        )}
        onDeactivate={(module) => void runAction(
          `deactivate-${module.slug}`,
          () => deactivateModule(module.slug),
          `Возможность «${module.name}» отключена`,
        )}
      />

      <AdvancedModulesDrawer
        isOpen={isAdvancedOpen}
        modules={overview.advanced_modules}
        actionLoading={actionLoading}
        onClose={() => setIsAdvancedOpen(false)}
        onActivate={(module) => void runAction(
          `activate-${module.slug}`,
          () => activateModule(module.slug),
          `Возможность «${module.name}» подключена`,
        )}
        onDeactivate={(module) => void runAction(
          `deactivate-${module.slug}`,
          () => deactivateModule(module.slug),
          `Возможность «${module.name}» отключена`,
        )}
        onRenew={(module) => void runAction(
          `renew-${module.slug}`,
          () => renewModule(module.slug),
          `Возможность «${module.name}» продлена`,
        )}
        onToggleAutoRenew={(module) => void runAction(
          `auto-renew-${module.slug}`,
          () => toggleAutoRenew(module.slug, !(module.activation?.is_auto_renew_enabled ?? false)),
          `Автопродление для «${module.name}» обновлено`,
        )}
      />
    </div>
  );
};

const SummaryStrip = ({ overview }: { overview: ModulesOverview }) => {
  const items = [
    { label: 'Решения активны', value: `${overview.summary.active_solutions_count} из ${overview.summary.total_solutions_count}` },
    { label: 'Отдельные возможности', value: overview.summary.active_standalone_count.toString() },
    { label: 'Ежемесячно', value: formatMoney(overview.summary.monthly_total) },
    { label: 'Требуют внимания', value: overview.summary.expiring_count.toString() },
  ];

  return (
    <div className="relative mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="rounded-[26px] border border-white/15 bg-white/10 px-5 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur"
        >
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-300">{item.label}</p>
          <p className="mt-2 text-2xl font-black text-white">{item.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

const SolutionsSection = ({
  solutions,
  onManage,
}: {
  solutions: ModulesOverviewSolution[];
  onManage: (solution: ModulesOverviewSolution) => void;
}) => (
  <section className="rounded-[36px] border border-white/80 bg-white/80 p-5 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur md:p-6">
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-600">Основной сценарий</p>
        <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Решения</h2>
        <p className="mt-1 text-sm text-slate-600">Пакеты возможностей, собранные под понятные рабочие контуры.</p>
      </div>
    </div>
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      {solutions.map((solution, index) => (
        <motion.article
          key={solution.slug}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.04 }}
          className="group relative flex min-h-[330px] flex-col overflow-hidden rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_50px_rgba(15,23,42,0.07)] transition duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_24px_80px_rgba(15,23,42,0.13)]"
        >
          <div className="absolute inset-x-0 top-0 h-1.5 opacity-90" style={{ backgroundColor: solution.color || '#f97316' }} />
          <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full opacity-10 blur-2xl transition group-hover:opacity-20" style={{ backgroundColor: solution.color || '#f97316' }} />
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-[0_12px_30px_rgba(15,23,42,0.16)]"
              style={{ backgroundColor: solution.color || '#f97316' }}
            >
              <SparklesIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h3 className="text-xl font-black leading-tight text-slate-950">{solution.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{solution.description}</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-[26px] border border-slate-100 bg-slate-50/80 p-2.5">
            <InfoPill label="Текущий тариф" value={tierText(solution.current_tier)} />
            <InfoPill label="Стоимость" value={formatMoney(solution.effective_monthly_price)} />
            <InfoPill label="Активно" value={`${solution.active_included_modules_count}/${solution.included_modules_count}`} />
            <InfoPill label="Изменение" value={solution.can_upgrade ? 'Есть апгрейд' : solution.can_downgrade ? 'Можно снизить' : 'Актуально'} />
          </div>

          <div className="mt-5 flex-1 space-y-2">
            {(solution.tiers.find(tier => tier.is_current)?.highlights ?? solution.tiers[0]?.highlights ?? []).slice(0, 4).map(item => (
              <div key={item} className="flex items-start gap-2 text-sm text-slate-600">
                <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onManage(solution)}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition hover:bg-orange-600"
          >
            Управлять
          </button>
        </motion.article>
      ))}
    </div>
  </section>
);

const StandaloneModulesSection = ({
  modules,
  onManage,
  onActivate,
  actionLoading,
}: {
  modules: ModulesOverviewModule[];
  onManage: (module: ModulesOverviewModule) => void;
  onActivate: (module: ModulesOverviewModule) => void;
  actionLoading: string | null;
}) => (
  <section className="rounded-[36px] border border-white/80 bg-white/65 p-5 pb-6 shadow-[0_20px_70px_rgba(15,23,42,0.06)] backdrop-blur md:p-6">
    <div className="mb-5">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">Точечные подключения</p>
      <h2 className="mt-1 text-3xl font-black tracking-tight text-slate-950">Отдельные возможности</h2>
      <p className="mt-1 text-sm text-slate-600">Модули вне пакетов, которые можно включать как самостоятельные сценарии.</p>
    </div>

    {modules.length === 0 ? (
      <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-8 text-center text-slate-600">
        Сейчас нет отдельных возможностей для подключения.
      </div>
    ) : (
      <div className="grid gap-4 lg:grid-cols-2">
        {modules.map(module => (
          <article key={module.slug} className="relative overflow-hidden rounded-[30px] border border-slate-200/80 bg-white p-5 shadow-[0_14px_44px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_70px_rgba(15,23,42,0.10)]">
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-cyan-50 to-transparent" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="relative inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                  {statusText(module.status)}
                </div>
                <h3 className="relative mt-3 text-xl font-black text-slate-950">{module.name}</h3>
                <p className="relative mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
              </div>
              <div className="relative text-left sm:text-right">
                <p className="text-sm text-slate-500">Стоимость</p>
                <p className="text-lg font-black text-slate-950">{formatMoney(module.price, module.currency)}</p>
              </div>
            </div>

            <div className="relative mt-5 flex flex-wrap gap-2">
              {(module.features ?? []).slice(0, 3).map(feature => (
                <span key={feature} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {feature}
                </span>
              ))}
            </div>

            <div className="relative mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onManage(module)}
                className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-orange-200 hover:text-orange-700"
              >
                Подробнее
              </button>
              {module.can_activate && (
                <button
                  type="button"
                  disabled={actionLoading === `activate-${module.slug}`}
                  onClick={() => onActivate(module)}
                  className="rounded-2xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
                >
                  Подключить
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    )}
  </section>
);

const InfoPill = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl bg-white px-3 py-2 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.65)]">
    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
  </div>
);

const DrawerShell = ({
  title,
  isOpen,
  onClose,
  children,
}: {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/35 p-3 backdrop-blur-sm" role="presentation">
      <motion.aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex h-full w-full max-w-3xl flex-col overflow-hidden rounded-[32px] bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <h2 className="text-2xl font-black text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:text-slate-900"
            aria-label="Закрыть"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </motion.aside>
    </div>
  );
};

const SolutionManageDrawer = ({
  solution,
  actionLoading,
  onClose,
  onSubscribe,
  onUnsubscribe,
}: {
  solution: ModulesOverviewSolution | null;
  actionLoading: string | null;
  onClose: () => void;
  onSubscribe: (solution: ModulesOverviewSolution, tier: ModulesOverviewTier) => void;
  onUnsubscribe: (solution: ModulesOverviewSolution) => void;
}) => (
  <DrawerShell title={solution?.name ?? 'Управление решением'} isOpen={Boolean(solution)} onClose={onClose}>
    {solution && (
      <div className="space-y-5">
        <p className="text-slate-600">{solution.description}</p>
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-500">Текущий тариф</p>
          <p className="mt-1 text-2xl font-black text-slate-950">{tierText(solution.current_tier)}</p>
        </div>
        <div className="space-y-3">
          {solution.tiers.map(tier => (
            <div key={tier.key} className="rounded-3xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-slate-950">{tier.label}</h3>
                    {tier.is_current && <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Активен</span>}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{tier.description}</p>
                  <p className="mt-3 text-sm font-semibold text-slate-500">{tier.active_modules_count}/{tier.included_modules_count} модулей активно</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl font-black text-slate-950">{formatMoney(tier.price)}</p>
                  {!tier.is_current && (
                    <button
                      type="button"
                      disabled={actionLoading === `solution-${solution.slug}-${tier.key}`}
                      onClick={() => onSubscribe(solution, tier)}
                      className="mt-3 rounded-2xl bg-orange-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
                    >
                      Выбрать тариф
                    </button>
                  )}
                </div>
              </div>
              {tier.highlights.length > 0 && (
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {tier.highlights.map(item => (
                    <div key={item} className="flex gap-2 text-sm text-slate-600">
                      <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-500" />
                      {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {solution.current_tier && (
          <div className="rounded-3xl border border-red-100 bg-red-50 p-4">
            <h3 className="font-black text-red-900">Отключение решения</h3>
            <p className="mt-1 text-sm text-red-700">Перед отключением проверьте, какие рабочие сценарии перестанут быть доступны.</p>
            <button
              type="button"
              disabled={actionLoading === `solution-${solution.slug}-unsubscribe`}
              onClick={() => onUnsubscribe(solution)}
              className="mt-4 rounded-2xl border border-red-200 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
            >
              Отключить пакет
            </button>
          </div>
        )}
      </div>
    )}
  </DrawerShell>
);

const StandaloneModuleDrawer = ({
  module,
  actionLoading,
  onClose,
  onActivate,
  onDeactivate,
}: {
  module: ModulesOverviewModule | null;
  actionLoading: string | null;
  onClose: () => void;
  onActivate: (module: ModulesOverviewModule) => void;
  onDeactivate: (module: ModulesOverviewModule) => void;
}) => (
  <DrawerShell title={module?.name ?? 'Возможность'} isOpen={Boolean(module)} onClose={onClose}>
    {module && (
      <div className="space-y-5">
        <p className="text-slate-600">{module.description}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <InfoPill label="Статус" value={statusText(module.status)} />
          <InfoPill label="Стоимость" value={formatMoney(module.price, module.currency)} />
          <InfoPill label="Автопродление" value={module.activation?.is_auto_renew_enabled ? 'Включено' : 'Выключено'} />
        </div>
        {(module.features ?? []).length > 0 && (
          <div className="rounded-3xl bg-slate-50 p-4">
            <h3 className="font-black text-slate-950">Что входит</h3>
            <div className="mt-3 space-y-2">
              {(module.features ?? []).map(feature => (
                <div key={feature} className="flex gap-2 text-sm text-slate-600">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-emerald-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          {module.can_activate && (
            <button
              type="button"
              disabled={actionLoading === `activate-${module.slug}`}
              onClick={() => onActivate(module)}
              className="rounded-2xl bg-orange-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
            >
              Подключить
            </button>
          )}
          {module.status === 'active' && module.can_deactivate && (
            <button
              type="button"
              disabled={actionLoading === `deactivate-${module.slug}`}
              onClick={() => onDeactivate(module)}
              className="rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
            >
              Отключить
            </button>
          )}
        </div>
      </div>
    )}
  </DrawerShell>
);

const AdvancedModulesDrawer = ({
  isOpen,
  modules,
  actionLoading,
  onClose,
  onActivate,
  onDeactivate,
  onRenew,
  onToggleAutoRenew,
}: {
  isOpen: boolean;
  modules: ModulesOverviewModule[];
  actionLoading: string | null;
  onClose: () => void;
  onActivate: (module: ModulesOverviewModule) => void;
  onDeactivate: (module: ModulesOverviewModule) => void;
  onRenew: (module: ModulesOverviewModule) => void;
  onToggleAutoRenew: (module: ModulesOverviewModule) => void;
}) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'standalone' | 'system' | 'expiring' | 'development'>('all');

  const filteredModules = useMemo(() => (
    modules.filter(module => {
      const matchesQuery = `${module.name} ${module.slug}`.toLowerCase().includes(query.toLowerCase());
      const expiresSoon = (module.activation?.days_until_expiration ?? 999) <= 7;
      const inDevelopment = module.development_status?.can_be_activated === false;
      const matchesFilter = filter === 'all'
        || (filter === 'active' && module.status === 'active')
        || (filter === 'standalone' && module.classification === 'standalone')
        || (filter === 'system' && (module.is_system || module.classification === 'system'))
        || (filter === 'expiring' && expiresSoon)
        || (filter === 'development' && inDevelopment);

      return matchesQuery && matchesFilter;
    })
  ), [filter, modules, query]);

  const filters = [
    ['all', 'Все'],
    ['active', 'Активные'],
    ['standalone', 'Отдельные'],
    ['system', 'Системные'],
    ['expiring', 'Истекают'],
    ['development', 'В разработке'],
  ] as const;

  return (
    <DrawerShell title="Расширенное управление" isOpen={isOpen} onClose={onClose}>
      <div className="space-y-5">
        <div className="rounded-3xl bg-slate-50 p-4">
          <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
            <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по модулю"
              className="w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {filters.map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  filter === key ? 'bg-slate-950 text-white' : 'bg-white text-slate-600 hover:text-slate-950'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {filteredModules.map(module => (
            <div key={module.slug} className="rounded-3xl border border-slate-200 p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-black text-slate-950">{module.name}</h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                      {classificationText(module)}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                      {statusText(module.status)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{module.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {module.can_activate && (
                    <button
                      type="button"
                      disabled={actionLoading === `activate-${module.slug}`}
                      onClick={() => onActivate(module)}
                      className="rounded-2xl bg-orange-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-orange-700 disabled:opacity-60"
                    >
                      Подключить
                    </button>
                  )}
                  {module.status === 'active' && (
                    <button
                      type="button"
                      disabled={actionLoading === `renew-${module.slug}`}
                      onClick={() => onRenew(module)}
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-orange-200 hover:text-orange-700 disabled:opacity-60"
                    >
                      Продлить
                    </button>
                  )}
                  {module.activation && (
                    <button
                      type="button"
                      disabled={actionLoading === `auto-renew-${module.slug}`}
                      onClick={() => onToggleAutoRenew(module)}
                      className="rounded-2xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-orange-200 hover:text-orange-700 disabled:opacity-60"
                    >
                      Автопродление
                    </button>
                  )}
                  {module.status === 'active' && module.can_deactivate && (
                    <button
                      type="button"
                      disabled={actionLoading === `deactivate-${module.slug}`}
                      onClick={() => onDeactivate(module)}
                      className="rounded-2xl border border-red-200 px-3 py-2 text-xs font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                    >
                      Отключить
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DrawerShell>
  );
};

export default ModulesPage;
