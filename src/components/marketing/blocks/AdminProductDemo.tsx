import { useMemo, useState, type ComponentType } from 'react';
import {
  AdjustmentsHorizontalIcon,
  BanknotesIcon,
  BellAlertIcon,
  BuildingOfficeIcon,
  CalculatorIcon,
  CalendarDaysIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  TruckIcon,
  UserCircleIcon,
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

type WorkspaceTab = 'registry' | 'workflow' | 'links';

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
  neutral: 'border-steel-200 bg-white text-steel-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-800',
  danger: 'border-rose-200 bg-rose-50 text-rose-800',
};

const tabs: Array<{ id: WorkspaceTab; label: string }> = [
  { id: 'registry', label: 'Реестр' },
  { id: 'workflow', label: 'Процесс' },
  { id: 'links', label: 'Связи' },
];

const AdminProductDemo = () => {
  const [activeModuleId, setActiveModuleId] = useState<AdminProductDemoModuleId>(
    adminProductDemoModules[0].id,
  );
  const [activeRowIndex, setActiveRowIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('registry');

  const activeModule = useMemo(
    () =>
      adminProductDemoModules.find((module) => module.id === activeModuleId) ??
      adminProductDemoModules[0],
    [activeModuleId],
  );

  const activeRow = activeModule.rows[activeRowIndex] ?? activeModule.rows[0];
  const activeFlow =
    adminProductDemoFlows.find((flow) => flow.modules.includes(activeModuleId)) ??
    adminProductDemoFlows[0];
  const ActiveIcon = moduleIcons[activeModule.id];

  const activateModule = (moduleId: AdminProductDemoModuleId, nextTab: WorkspaceTab = activeTab) => {
    setActiveModuleId(moduleId);
    setActiveRowIndex(0);
    setActiveTab(nextTab);
  };

  return (
    <section id="product-system" className="border-y border-steel-100 bg-white py-16 lg:py-24">
      <div className="container-custom">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.74fr)_minmax(0,1.26fr)] xl:items-end">
          <SectionHeader
            eyebrow="Платформа"
            title="Все ключевые контуры стройки в интерфейсе админки."
            description="Не слайды и не абстрактные карточки: рабочая зона с меню, реестром, статусами, деталями записи и связями между модулями."
          />

          <div className="grid gap-3 rounded-lg border border-steel-200 bg-concrete-50 p-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => activateModule(adminProductDemoModules[0].id, 'registry')}
              className="rounded-md border border-steel-200 bg-white px-4 py-3 text-left transition hover:border-construction-300"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-steel-500">
                Модулей
              </div>
              <div className="mt-1 text-2xl font-bold text-steel-950">{adminProductDemoModules.length}</div>
            </button>
            <button
              type="button"
              onClick={() => activateModule(activeFlow.modules[0], 'workflow')}
              className="rounded-md border border-steel-200 bg-white px-4 py-3 text-left transition hover:border-construction-300"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-steel-500">
                Маршрутов
              </div>
              <div className="mt-1 text-2xl font-bold text-steel-950">{adminProductDemoFlows.length}</div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('links')}
              className="rounded-md border border-steel-200 bg-white px-4 py-3 text-left transition hover:border-construction-300"
            >
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-steel-500">
                Основа
              </div>
              <div className="mt-1 text-base font-bold text-steel-950">Админка ProHelper</div>
            </button>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-lg border border-steel-200 bg-[#f4f6f9] shadow-[0_28px_90px_rgba(15,23,42,0.14)]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel-200 bg-white px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-steel-950 text-sm font-bold text-white">
                PH
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-steel-950">ProHelper Admin</div>
                <div className="truncate text-xs text-steel-500">Демо-организация / Производственный контур</div>
              </div>
            </div>

            <div className="hidden min-w-[260px] max-w-md flex-1 items-center gap-2 rounded-md border border-steel-200 bg-concrete-50 px-3 py-2 text-sm text-steel-500 md:flex">
              <MagnifyingGlassIcon className="h-4 w-4" />
              Поиск по объектам, заявкам и документам
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('workflow')}
                className="rounded-md border border-steel-200 bg-white p-2 text-steel-600 transition hover:border-construction-300 hover:text-construction-700"
                aria-label="Показать процесс"
              >
                <BellAlertIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('registry')}
                className="rounded-md bg-steel-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-steel-800"
              >
                <span className="inline-flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Создать
                </span>
              </button>
              <UserCircleIcon className="h-8 w-8 text-steel-400" />
            </div>
          </div>

          <div className="border-b border-steel-200 bg-sky-50/80 px-5 py-3 text-xs leading-5 text-steel-700 sm:px-6">
            <span className="font-semibold text-steel-950">Демонстрационная версия. </span>
            {adminProductDemoDisclaimer}
          </div>

          <div className="grid min-w-0 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_320px]">
            <aside className="min-w-0 border-b border-steel-200 bg-white lg:border-b-0 lg:border-r">
              <div className="border-b border-steel-100 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-steel-500">
                  Модули
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto p-3 lg:grid lg:overflow-visible">
                {adminProductDemoModules.map((module) => {
                  const Icon = moduleIcons[module.id];
                  const isActive = module.id === activeModule.id;

                  return (
                    <button
                      key={module.id}
                      type="button"
                      aria-label={`Открыть модуль ${module.title}`}
                      aria-pressed={isActive}
                      onClick={() => activateModule(module.id)}
                      className={`flex min-w-[172px] items-center gap-3 rounded-md border px-3 py-3 text-left transition lg:min-w-0 ${
                        isActive
                          ? 'border-steel-950 bg-steel-950 text-white'
                          : 'border-transparent bg-white text-steel-700 hover:border-steel-200 hover:bg-concrete-50'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${
                          isActive ? 'bg-white/12 text-white' : 'bg-concrete-100 text-construction-700'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold">{module.shortTitle}</span>
                        <span className={`block truncate text-xs ${isActive ? 'text-white/64' : 'text-steel-500'}`}>
                          {module.contour}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </aside>

            <main className="min-w-0 bg-white">
              <div className="border-b border-steel-200 px-4 py-4 lg:px-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-steel-500">
                      Главная / {activeModule.contour} / {activeModule.adminRoute}
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-construction-100 text-construction-700">
                        <ActiveIcon className="h-6 w-6" />
                      </span>
                      <h3 className="text-2xl font-bold leading-tight text-steel-950 [overflow-wrap:anywhere]">
                        {activeModule.title}
                      </h3>
                    </div>
                    <p className="mt-3 max-w-3xl text-sm leading-7 text-steel-600">
                      {activeModule.businessOutcome}
                    </p>
                  </div>

                  <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3 xl:w-[330px] xl:shrink-0">
                    {activeModule.stats.map((stat, index) => (
                      <button
                        key={`${activeModule.id}-${stat.label}`}
                        type="button"
                        onClick={() => {
                          setActiveRowIndex(index % activeModule.rows.length);
                          setActiveTab('registry');
                        }}
                        className={`rounded-md border p-3 text-left transition hover:scale-[1.01] ${toneClasses[stat.tone]}`}
                      >
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-70">
                          {stat.label}
                        </div>
                        <div className="mt-2 text-lg font-bold">{stat.value}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-b border-steel-100 bg-concrete-50 px-4 py-3 lg:px-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex gap-2 overflow-x-auto">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        aria-pressed={activeTab === tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${
                          activeTab === tab.id
                            ? 'border-steel-950 bg-white text-steel-950'
                            : 'border-steel-200 bg-white text-steel-600 hover:border-construction-300'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('registry')}
                      className="inline-flex items-center gap-2 rounded-md border border-steel-200 bg-white px-3 py-2 text-sm font-semibold text-steel-600 transition hover:border-construction-300"
                    >
                      <AdjustmentsHorizontalIcon className="h-4 w-4" />
                      Фильтры
                    </button>
                    <span className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
                      {activeModule.notification}
                    </span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <div className="min-w-[720px]">
                  <div className="grid grid-cols-[minmax(240px,1.35fr)_minmax(180px,1fr)_130px_170px] border-b border-steel-200 bg-white px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-steel-500">
                    <div>Запись</div>
                    <div>Контекст</div>
                    <div>Статус</div>
                    <div>Прогресс</div>
                  </div>
                  {activeModule.rows.map((row, index) => (
                    <button
                      key={`${activeModule.id}-${row.title}`}
                      type="button"
                      aria-pressed={activeRow.title === row.title}
                      onClick={() => {
                        setActiveRowIndex(index);
                        setActiveTab('registry');
                      }}
                      className={`grid w-full grid-cols-[minmax(240px,1.35fr)_minmax(180px,1fr)_130px_170px] items-center border-b border-steel-100 px-5 py-4 text-left transition hover:bg-concrete-50 ${
                        activeRow.title === row.title ? 'bg-construction-50/60' : 'bg-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-steel-950">{row.title}</div>
                        <div className="mt-1 text-xs text-steel-500">ID {activeModule.id}-{index + 1}</div>
                      </div>
                      <div className="min-w-0 truncate text-sm text-steel-600">{row.meta}</div>
                      <div>
                        <span className="inline-flex rounded-full border border-construction-200 bg-white px-3 py-1 text-xs font-semibold text-construction-700">
                          {row.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-steel-100">
                          <div
                            className="h-full rounded-full bg-[linear-gradient(90deg,#f97316,#0f766e)]"
                            style={{ width: `${row.progress ?? 0}%` }}
                          />
                        </div>
                        <span className="w-9 text-right text-xs font-bold text-steel-700">{row.progress ?? 0}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 border-t border-steel-200 bg-white p-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:p-5">
                <div className="rounded-md border border-steel-200 bg-concrete-50 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-steel-500">
                    Выбранная запись
                  </div>
                  <div className="mt-2 text-lg font-bold text-steel-950">{activeRow.title}</div>
                  <p className="mt-2 text-sm leading-6 text-steel-600">{activeRow.meta}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {activeRow.linkedTo.map((moduleId) => {
                      const module = adminProductDemoModules.find((item) => item.id === moduleId);
                      if (!module) {
                        return null;
                      }

                      return (
                        <button
                          key={`${activeRow.title}-${moduleId}`}
                          type="button"
                          onClick={() => activateModule(moduleId, 'links')}
                          className="rounded-full border border-steel-200 bg-white px-3 py-1.5 text-xs font-semibold text-steel-700 transition hover:border-construction-300 hover:text-construction-700"
                        >
                          {module.shortTitle}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-md border border-steel-200 bg-white p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-steel-500">
                    Источник
                  </div>
                  <div className="mt-2 break-all text-sm font-semibold leading-6 text-steel-700">
                    {activeModule.adminSource}
                  </div>
                </div>
              </div>
            </main>

            <aside className="min-w-0 border-t border-steel-200 bg-[#0b1020] p-4 text-white xl:border-l xl:border-t-0 xl:p-5">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-construction-200">
                Связи процесса
              </div>
              <h3 className="mt-3 text-2xl font-bold leading-tight">{activeFlow.title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/70">{activeFlow.description}</p>

              <div className="mt-6 grid gap-3">
                {adminProductDemoFlows.map((flow) => {
                  const isActive = flow.id === activeFlow.id;

                  return (
                    <button
                      key={flow.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() => activateModule(flow.modules[0], 'workflow')}
                      className={`rounded-md border p-4 text-left transition ${
                        isActive
                          ? 'border-construction-300 bg-white text-steel-950'
                          : 'border-white/10 bg-white/[0.04] text-white hover:border-white/24'
                      }`}
                    >
                      <div className="text-sm font-bold">{flow.title}</div>
                      <div className={`mt-3 flex flex-wrap gap-1.5 ${isActive ? 'text-steel-600' : 'text-white/64'}`}>
                        {flow.modules.map((moduleId) => {
                          const module = adminProductDemoModules.find((item) => item.id === moduleId);
                          if (!module) {
                            return null;
                          }

                          return (
                            <span key={`${flow.id}-${moduleId}`} className="inline-flex items-center gap-1.5 text-xs font-semibold">
                              <span className="h-2 w-2 rounded-full bg-construction-500" />
                              {module.shortTitle}
                            </span>
                          );
                        })}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 rounded-md border border-white/10 bg-white/[0.05] p-4">
                <div className="flex items-start gap-3">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <p className="text-xs leading-6 text-white/70">{adminProductDemoDisclaimer}</p>
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
