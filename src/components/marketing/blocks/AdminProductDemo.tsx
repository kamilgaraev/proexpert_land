import { useMemo, useState, type ComponentType } from 'react';
import {
  BanknotesIcon,
  BuildingOfficeIcon,
  CalculatorIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  TruckIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { SectionHeader } from '@/components/marketing/MarketingPrimitives';
import {
  adminProductDemoDisclaimer,
  adminProductDemoFlows,
  adminProductDemoModules,
  type AdminProductDemoModuleId,
  type AdminProductDemoTone,
} from '@/data/marketing/adminProductDemo';

const moduleIcons: Record<AdminProductDemoModuleId, ComponentType<{ className?: string }>> = {
  projects: BuildingOfficeIcon,
  schedule: CalendarDaysIcon,
  siteRequests: ClipboardDocumentListIcon,
  procurement: TruckIcon,
  warehouse: CubeIcon,
  estimates: CalculatorIcon,
  payments: BanknotesIcon,
  acts: ClipboardDocumentCheckIcon,
  contractors: UserGroupIcon,
  documentsAnalytics: ChartBarSquareIcon,
};

const toneClasses: Record<AdminProductDemoTone, string> = {
  neutral: 'border-steel-200 bg-white text-steel-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  danger: 'border-rose-200 bg-rose-50 text-rose-700',
};

const flowDotClasses = [
  'bg-construction-600',
  'bg-emerald-600',
  'bg-steel-700',
  'bg-amber-500',
];

const AdminProductDemo = () => {
  const [activeModuleId, setActiveModuleId] = useState<AdminProductDemoModuleId>(
    adminProductDemoModules[0].id,
  );

  const activeModule = useMemo(
    () =>
      adminProductDemoModules.find((module) => module.id === activeModuleId) ??
      adminProductDemoModules[0],
    [activeModuleId],
  );

  const activeFlow = useMemo(
    () =>
      adminProductDemoFlows.find((flow) => flow.modules.includes(activeModuleId)) ??
      adminProductDemoFlows[0],
    [activeModuleId],
  );

  const ActiveIcon = moduleIcons[activeModule.id];

  return (
    <section
      id="product-system"
      className="border-y border-steel-100 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_46%,#ffffff_100%)] py-16 lg:py-24"
    >
      <div className="container-custom">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] xl:items-end">
          <SectionHeader
            eyebrow="Платформа"
            title="Все ключевые контуры стройки в одном рабочем окне."
            description="Переключайтесь между модулями и смотрите, как заявка, материалы, деньги и документы проходят один связанный маршрут."
          />

          <div className="grid gap-3 rounded-[1.35rem] border border-steel-200 bg-white p-4 shadow-sm sm:grid-cols-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-steel-500">
                Модулей в витрине
              </div>
              <div className="mt-2 text-3xl font-bold text-steel-950">
                {adminProductDemoModules.length}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-steel-500">
                Связанных маршрутов
              </div>
              <div className="mt-2 text-3xl font-bold text-steel-950">
                {adminProductDemoFlows.length}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-steel-500">
                Основа
              </div>
              <div className="mt-2 text-lg font-bold leading-tight text-steel-950">
                Админка ProHelper
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-steel-200 bg-white shadow-[0_26px_80px_rgba(15,23,42,0.11)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel-100 bg-concrete-50 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
              </div>
              <div className="min-w-0 truncate text-sm font-semibold text-steel-600">
                prohelper.pro / {activeModule.contour}
              </div>
            </div>
            <div className="max-w-full rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {activeModule.notification}
            </div>
          </div>

          <div className="grid min-w-0 gap-0 xl:grid-cols-[290px_minmax(0,1fr)_330px]">
            <aside className="min-w-0 border-b border-steel-100 bg-white p-3 xl:border-b-0 xl:border-r xl:p-4">
              <div className="flex gap-2 overflow-x-auto pb-2 xl:grid xl:overflow-visible xl:pb-0">
                {adminProductDemoModules.map((module) => {
                  const Icon = moduleIcons[module.id];
                  const isActive = module.id === activeModule.id;

                  return (
                    <button
                      key={module.id}
                      type="button"
                      aria-pressed={isActive}
                      aria-controls="admin-product-demo-panel"
                      onClick={() => setActiveModuleId(module.id)}
                      className={`flex min-w-[156px] items-center gap-3 rounded-2xl border px-3 py-3 text-left transition xl:min-w-0 ${
                        isActive
                          ? 'border-steel-950 bg-steel-950 text-white shadow-lg shadow-steel-950/10'
                          : 'border-transparent bg-white text-steel-700 hover:border-steel-200 hover:bg-concrete-50'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          isActive ? 'bg-white/12 text-white' : 'bg-concrete-100 text-construction-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold">{module.shortTitle}</span>
                        <span
                          className={`mt-0.5 block truncate text-xs ${
                            isActive ? 'text-white/64' : 'text-steel-500'
                          }`}
                        >
                          {module.contour}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <div id="admin-product-demo-panel" className="min-w-0 bg-white p-4 sm:p-5 lg:p-6">
              <div className="flex flex-col gap-5 border-b border-steel-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-construction-100 text-construction-700">
                      <ActiveIcon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-steel-500">
                        {activeModule.adminRoute}
                      </div>
                      <h3 className="mt-1 text-2xl font-bold leading-tight text-steel-950 [overflow-wrap:anywhere]">
                        {activeModule.title}
                      </h3>
                    </div>
                  </div>
                  <p className="mt-4 max-w-3xl break-words text-sm leading-7 text-steel-600">
                    {activeModule.businessOutcome}
                  </p>
                </div>

                <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3 lg:w-[300px] lg:shrink-0">
                  {activeModule.stats.map((stat) => (
                    <div
                      key={`${activeModule.id}-${stat.label}`}
                      className={`rounded-2xl border p-3 ${toneClasses[stat.tone]}`}
                    >
                      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
                        {stat.label}
                      </div>
                      <div className="mt-2 text-lg font-bold">{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-full border border-steel-200 bg-concrete-50 p-1">
                  {['Обзор', activeModule.activeTab, 'Связи'].map((tab, index) => (
                    <span
                      key={`${activeModule.id}-${tab}`}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        index === 1 ? 'bg-white text-steel-950 shadow-sm' : 'text-steel-500'
                      }`}
                    >
                      {tab}
                    </span>
                  ))}
                </div>
                <div className="max-w-full break-all text-xs font-semibold text-steel-500">
                  Источник: {activeModule.adminSource}
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                {activeModule.rows.map((row) => (
                  <article
                    key={`${activeModule.id}-${row.title}`}
                    className="rounded-2xl border border-steel-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0">
                        <div className="break-words font-bold leading-tight text-steel-950">{row.title}</div>
                        <div className="mt-1 break-words text-sm leading-6 text-steel-500">{row.meta}</div>
                      </div>
                      <span className="inline-flex w-fit rounded-full border border-construction-200 bg-construction-50 px-3 py-1 text-xs font-semibold text-construction-700">
                        {row.status}
                      </span>
                    </div>

                    {typeof row.progress === 'number' ? (
                      <div className="mt-4 flex items-center gap-3">
                        <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-concrete-100">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#f97316,#0f766e)]"
                            style={{ width: `${row.progress}%` }}
                          />
                        </div>
                        <div className="w-10 text-right text-xs font-bold text-steel-600">
                          {row.progress}%
                        </div>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>

            <aside className="min-w-0 overflow-hidden border-t border-steel-100 bg-steel-950 p-4 text-white xl:border-l xl:border-t-0 xl:p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-200">
                Связи процесса
              </div>
              <h3 className="mt-3 text-2xl font-bold leading-tight [overflow-wrap:anywhere]">{activeFlow.title}</h3>
              <p className="mt-3 break-words text-sm leading-7 text-white/70">{activeFlow.description}</p>

              <div className="mt-6 grid gap-3">
                {adminProductDemoFlows.map((flow) => {
                  const isActive = flow.id === activeFlow.id;

                  return (
                    <button
                      key={flow.id}
                      type="button"
                      onClick={() => setActiveModuleId(flow.modules[0])}
                      className={`rounded-2xl border p-4 text-left transition ${
                        isActive
                          ? 'border-construction-300 bg-white text-steel-950'
                          : 'border-white/10 bg-white/[0.04] text-white hover:border-white/24'
                      }`}
                    >
                      <div className="text-sm font-bold">{flow.title}</div>
                      <div className={`mt-3 flex flex-wrap gap-1.5 ${isActive ? 'text-steel-600' : 'text-white/62'}`}>
                        {flow.modules.map((moduleId, index) => {
                          const module = adminProductDemoModules.find((item) => item.id === moduleId);

                          return (
                            <span key={`${flow.id}-${moduleId}`} className="inline-flex items-center gap-1.5 text-xs font-semibold">
                              <span className={`h-2 w-2 rounded-full ${flowDotClasses[index % flowDotClasses.length]}`} />
                              {module?.shortTitle}
                            </span>
                          );
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <p className="text-xs leading-6 text-white/68">{adminProductDemoDisclaimer}</p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminProductDemo;
