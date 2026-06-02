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
  ChevronRightIcon,
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

const moduleGroups: Array<{ title: string; ids: AdminProductDemoModuleId[] }> = [
  { title: 'Основное', ids: ['projects', 'documentsAnalytics'] },
  { title: 'Управление проектом', ids: ['estimates', 'schedule', 'siteRequests', 'acts'] },
  { title: 'Операции', ids: ['procurement', 'warehouse', 'payments'] },
  { title: 'Команда', ids: ['contractors'] },
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
            title="Так выглядит рабочий контур в админке ProHelper."
            description="Показываем не личный кабинет и не рекламную картинку, а упрощенную витрину реальной админской логики: меню, проектный контекст, статистику, фильтры, реестр и связанные действия."
          />

          <div className="grid gap-3 rounded-[18px] border border-steel-200 bg-[#f7f8fb] p-3 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => activateModule(adminProductDemoModules[0].id, 'registry')}
              className="rounded-xl border border-steel-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-construction-300"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-steel-500">
                Разделов в меню
              </div>
              <div className="mt-2 text-3xl font-bold leading-none text-steel-950">
                {adminProductDemoModules.length}
              </div>
            </button>
            <button
              type="button"
              onClick={() => activateModule(activeFlow.modules[0], 'workflow')}
              className="rounded-xl border border-steel-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-construction-300"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-steel-500">
                Связанных процессов
              </div>
              <div className="mt-2 text-3xl font-bold leading-none text-steel-950">
                {adminProductDemoFlows.length}
              </div>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('links')}
              className="rounded-xl border border-steel-200 bg-white px-4 py-3 text-left shadow-sm transition hover:border-construction-300"
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-steel-500">
                Основа
              </div>
              <div className="mt-2 text-base font-bold leading-tight text-steel-950">
                Рабочая админка
              </div>
            </button>
          </div>
        </div>

        <div className="mt-10 overflow-hidden rounded-[22px] border border-steel-200 bg-[#f3f5f8] shadow-[0_28px_90px_rgba(15,23,42,0.14)]">
          <div className="grid min-h-[760px] bg-[#f5f7fb] xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="border-b border-steel-200 bg-white xl:border-b-0 xl:border-r">
              <div className="flex min-h-[64px] items-center justify-between gap-3 border-b border-steel-200 px-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-sm font-black text-steel-950 shadow-sm ring-1 ring-steel-200">
                    PH
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-steel-950">ProHelper</div>
                    <div className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-steel-500">
                      Admin
                    </div>
                  </div>
                </div>
              </div>

              <nav className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-4 xl:block xl:space-y-4 xl:p-4">
                {moduleGroups.map((group) => (
                  <div key={group.title} className="min-w-0">
                    <div className="mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-steel-500">
                      {group.title}
                    </div>
                    <div className="space-y-1">
                      {group.ids.map((moduleId) => {
                        const module = adminProductDemoModules.find((item) => item.id === moduleId);
                        if (!module) {
                          return null;
                        }

                        const Icon = moduleIcons[module.id];
                        const isActive = module.id === activeModule.id;

                        return (
                          <button
                            key={module.id}
                            type="button"
                            aria-label={`Открыть раздел ${module.title}`}
                            aria-pressed={isActive}
                            onClick={() => activateModule(module.id)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition ${
                              isActive
                                ? 'bg-construction-50 text-construction-700 ring-1 ring-construction-100'
                                : 'text-steel-700 hover:bg-steel-50'
                            }`}
                          >
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                isActive ? 'bg-construction-100' : 'bg-steel-100 text-steel-500'
                              }`}
                            >
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-semibold">{module.shortTitle}</span>
                              <span className="block truncate text-xs text-steel-500">{module.contour}</span>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </aside>

            <div className="min-w-0">
              <header className="flex min-h-[64px] flex-wrap items-center justify-between gap-3 border-b border-steel-200 bg-white/95 px-4 backdrop-blur md:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('registry')}
                    aria-label="Открыть меню админки"
                    className="rounded-lg border border-steel-200 bg-white p-2 text-steel-600 shadow-sm transition hover:border-construction-300"
                  >
                    <AdjustmentsHorizontalIcon className="h-5 w-5" />
                  </button>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-steel-950">Панель управления</div>
                    <div className="truncate text-xs text-steel-500">Проект: ЖК “Северный”</div>
                  </div>
                </div>

                <div className="hidden min-w-[260px] max-w-md flex-1 items-center gap-2 rounded-lg border border-steel-200 bg-white px-3 py-2 text-sm text-steel-500 md:flex">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  Поиск по объектам, заявкам, складу и документам
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('workflow')}
                    className="rounded-lg border border-steel-200 bg-white p-2 text-steel-600 shadow-sm transition hover:border-construction-300"
                    aria-label="Показать уведомления процесса"
                  >
                    <BellAlertIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('registry')}
                    className="inline-flex items-center gap-2 rounded-lg bg-construction-600 px-3 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-construction-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Создать
                  </button>
                  <UserCircleIcon className="h-9 w-9 text-steel-400" />
                </div>
              </header>

              <main className="min-w-0 p-4 md:p-5">
                <div className="rounded-[18px] border border-steel-200 bg-white/94 p-5 shadow-[0_20px_44px_rgba(15,23,42,0.06)] backdrop-blur">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-steel-500">
                        <span>Главная</span>
                        <ChevronRightIcon className="h-3 w-3" />
                        <span>{activeModule.contour}</span>
                        <ChevronRightIcon className="h-3 w-3" />
                        <span className="text-steel-800">{activeModule.title}</span>
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-construction-100 bg-construction-50 text-construction-700">
                          <ActiveIcon className="h-6 w-6" />
                        </span>
                        <div className="min-w-0">
                          <h3 className="text-2xl font-bold leading-tight text-steel-950 [overflow-wrap:anywhere]">
                            {activeModule.title}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-steel-600">
                            {activeModule.businessOutcome}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('registry')}
                        className="rounded-lg border border-steel-200 bg-white px-3 py-2 text-sm font-bold text-steel-700 transition hover:border-construction-300"
                      >
                        Экспорт
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('links')}
                        className="rounded-lg bg-construction-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-construction-700"
                      >
                        Открыть раздел
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm leading-6 text-steel-700">
                  <span className="font-bold text-steel-950">Демонстрационная версия. </span>
                  {adminProductDemoDisclaimer}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {activeModule.stats.map((stat, index) => (
                    <button
                      key={`${activeModule.id}-${stat.label}`}
                      type="button"
                      onClick={() => {
                        setActiveRowIndex(index % activeModule.rows.length);
                        setActiveTab('registry');
                      }}
                      className={`rounded-[18px] border p-4 text-left shadow-[0_18px_38px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 ${toneClasses[stat.tone]}`}
                    >
                      <div className="text-sm font-semibold opacity-80">{stat.label}</div>
                      <div className="mt-5 border-t border-dashed border-current/20 pt-4 text-2xl font-bold">
                        {stat.value}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-[18px] border border-steel-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-lg font-bold text-steel-950">Фильтры и рабочая область</div>
                      <div className="text-sm text-steel-500">Поиск и переключение по текущему состоянию раздела</div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          type="button"
                          aria-pressed={activeTab === tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
                            activeTab === tab.id
                              ? 'border-construction-600 bg-construction-600 text-white'
                              : 'border-steel-200 bg-white text-steel-700 hover:border-construction-300'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <label className="flex min-w-0 items-center gap-2 rounded-lg border border-steel-200 bg-white px-3 py-2 text-sm text-steel-500">
                      <MagnifyingGlassIcon className="h-4 w-4" />
                      <span className="truncate">Поиск: {activeRow.title}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('registry')}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-steel-200 bg-white px-3 py-2 text-sm font-bold text-steel-700 transition hover:border-construction-300"
                    >
                      <AdjustmentsHorizontalIcon className="h-4 w-4" />
                      Применить фильтры
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                  <div className="min-w-0 overflow-hidden rounded-[18px] border border-steel-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel-200 px-4 py-3">
                      <div>
                        <div className="text-lg font-bold text-steel-950">Реестр</div>
                        <div className="text-sm text-steel-500">{activeModule.notification}</div>
                      </div>
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                        Данные обновлены
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <div className="min-w-[760px]">
                        <div className="grid grid-cols-[minmax(240px,1.35fr)_minmax(190px,1fr)_150px_150px] border-b border-steel-200 bg-steel-50 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-steel-500">
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
                            className={`grid w-full grid-cols-[minmax(240px,1.35fr)_minmax(190px,1fr)_150px_150px] items-center border-b border-steel-100 px-4 py-4 text-left transition hover:bg-construction-50/45 ${
                              activeRow.title === row.title ? 'bg-construction-50/70' : 'bg-white'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="truncate text-sm font-bold text-steel-950">{row.title}</div>
                              <div className="mt-1 text-xs text-steel-500">
                                {activeModule.contour} · №{index + 1}
                              </div>
                            </div>
                            <div className="min-w-0 truncate text-sm text-steel-600">{row.meta}</div>
                            <div>
                              <span className="inline-flex rounded-full border border-construction-200 bg-white px-3 py-1 text-xs font-bold text-construction-700">
                                {row.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-steel-100">
                                <div
                                  className="h-full rounded-full bg-construction-600"
                                  style={{ width: `${row.progress ?? 0}%` }}
                                />
                              </div>
                              <span className="w-9 text-right text-xs font-bold text-steel-700">
                                {row.progress ?? 0}%
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <aside className="grid gap-4">
                    <div className="rounded-[18px] border border-steel-200 bg-white p-4 shadow-sm">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-steel-500">
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
                              className="rounded-full border border-steel-200 bg-white px-3 py-1.5 text-xs font-bold text-steel-700 transition hover:border-construction-300 hover:text-construction-700"
                            >
                              {module.shortTitle}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-steel-200 bg-white p-4 shadow-sm">
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-steel-500">
                        Связанные процессы
                      </div>
                      <div className="mt-2 text-lg font-bold text-steel-950">{activeFlow.title}</div>
                      <p className="mt-2 text-sm leading-6 text-steel-600">{activeFlow.description}</p>
                      <div className="mt-4 grid gap-2">
                        {adminProductDemoFlows.map((flow) => {
                          const isActive = flow.id === activeFlow.id;

                          return (
                            <button
                              key={flow.id}
                              type="button"
                              aria-pressed={isActive}
                              onClick={() => activateModule(flow.modules[0], 'workflow')}
                              className={`rounded-xl border px-3 py-2 text-left transition ${
                                isActive
                                  ? 'border-construction-200 bg-construction-50 text-construction-800'
                                  : 'border-steel-200 bg-white text-steel-700 hover:border-construction-300'
                              }`}
                            >
                              <div className="text-sm font-bold">{flow.title}</div>
                              <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-steel-500">
                                {flow.modules.map((moduleId) => {
                                  const module = adminProductDemoModules.find((item) => item.id === moduleId);
                                  if (!module) {
                                    return null;
                                  }

                                  return <span key={`${flow.id}-${moduleId}`}>{module.shortTitle}</span>;
                                })}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-[18px] border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                        <p className="text-xs leading-6 text-emerald-900">{adminProductDemoDisclaimer}</p>
                      </div>
                    </div>
                  </aside>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminProductDemo;
