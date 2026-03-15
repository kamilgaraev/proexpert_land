import { useState } from 'react';
import { motion } from 'framer-motion';
import { useModules } from '@hooks/useModules';
import { usePackages } from '@hooks/usePackages';
import { useModulesByPackage } from '@hooks/useModulesByPackage';
import { Module } from '@utils/api';
import PackagesView from '@components/dashboard/PackagesView';
import ModuleCard from '@components/dashboard/ModuleCard';
import {
  ModuleActivationModal,
  ModuleDetailsModal,
  DevelopmentWarningModal,
  ModuleDeactivationPreviewModal,
} from '@components/dashboard/ModuleModals';
import { getCatalogModules, getModuleAddonCount, getModuleAddonPreviews } from '@utils/moduleAddons';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  XMarkIcon,
  BanknotesIcon,
  ClockIcon,
  Squares2X2Icon,
  RectangleGroupIcon,
} from '@heroicons/react/24/outline';
import { PageLoading } from '@components/common/PageLoading';
import NotificationService from '@components/shared/NotificationService';

const ModulesPage = () => {
  const [activeTab, setActiveTab] = useState<'packages' | 'modules'>('packages');

  const {
    allModules,
    expiringModules,
    loading,
    error,
    refresh,
    activateModule,
    deactivateModule,
    renewModule,
    isModuleActive,
    getActivationPreview,
    getDeactivationPreview,
    checkTrialAvailability,
    activateTrial,
    toggleAutoRenew,
    bulkToggleAutoRenew,
    hasExpiring,
  } = useModules({
    autoRefresh: true,
    refreshInterval: 900000,
    onError: (msg: string) => NotificationService.show({ type: 'error', title: 'Ошибка', message: msg }),
  });

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeactivationPreviewModal, setShowDeactivationPreviewModal] = useState(false);
  const [showDevelopmentWarning, setShowDevelopmentWarning] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [deactivationPreviewData, setDeactivationPreviewData] = useState<any>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const { packages } = usePackages();
  const catalogModules = getCatalogModules(allModules);
  const moduleGroups = useModulesByPackage({ modules: catalogModules, packages });

  const toggleModuleExpanded = (slug: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  };

  const handleActivateClick = async (module: Module) => {
    if (module.development_status && !module.development_status.can_be_activated) {
      NotificationService.show({ type: 'warning', title: 'Модуль недоступен', message: `«${module.name}» недоступен для активации: ${module.development_status.description}` });
      return;
    }
    setSelectedModule(module);
    setActionLoading(`preview-${module.slug}`);
    try {
      setPreviewData(await getActivationPreview(module.slug));
    } finally {
      setActionLoading(null);
      module.development_status?.should_show_warning ? setShowDevelopmentWarning(true) : setShowActivationModal(true);
    }
  };

  const handleDevelopmentWarningConfirm = () => {
    setShowDevelopmentWarning(false);
    setShowActivationModal(true);
  };

  const handleOpenDetails = (module: Module) => {
    setSelectedModule(module);
    setShowDetailsModal(true);
  };

  const handleTrialClick = async (module: Module) => {
    if (module.development_status && !module.development_status.can_be_activated) {
      NotificationService.show({ type: 'warning', title: 'Модуль недоступен', message: `«${module.name}» недоступен для trial: ${module.development_status.description}` });
      return;
    }
    setSelectedModule(module);
    setActionLoading(`trial-check-${module.slug}`);
    try {
      const availability = await checkTrialAvailability(module.slug);
      if (!availability.can_activate_trial) {
        const msgs: Record<string, string> = {
          TRIAL_ALREADY_USED: 'Вы уже использовали trial. Активируйте полную версию.',
          MODULE_ALREADY_ACTIVE: 'Модуль уже активирован',
          TRIAL_NOT_AVAILABLE_FOR_FREE: 'Trial недоступен для бесплатных модулей',
          MODULE_STATUS_NOT_READY: availability.development_status?.description || 'Модуль в разработке',
        };
        NotificationService.show({ type: 'info', title: 'Trial недоступен', message: msgs[availability.reason] || 'Trial период недоступен' });
        setSelectedModule(null);
        return;
      }
      module.development_status?.should_show_warning ? setShowDevelopmentWarning(true) : await handleTrialActivate(module.slug);
    } catch (e: any) {
      NotificationService.show({ type: 'error', title: 'Ошибка', message: e.message || 'Не удалось проверить доступность trial' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTrialActivate = async (slug: string) => {
    setActionLoading(`trial-activate-${slug}`);
    try {
      if (await activateTrial(slug)) {
        NotificationService.show({ type: 'success', title: 'Trial активирован', message: 'Trial период успешно активирован!' });
        setShowDevelopmentWarning(false);
        setSelectedModule(null);
      }
    } catch (e: any) {
      NotificationService.show({ type: 'error', title: 'Ошибка активации trial', message: e.message || 'Не удалось активировать trial' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAutoRenewToggle = async (module: Module, enabled: boolean) => {
    if (module.billing_model === 'free') {
      NotificationService.show({ type: 'info', title: 'Автопродление недоступно', message: 'Бесплатные модули не требуют продления' });
      return;
    }
    if (module.activation?.is_bundled_with_plan) {
      NotificationService.show({ type: 'info', title: 'Управление через подписку', message: 'Управляйте автопродлением через настройки подписки.' });
      return;
    }
    if (!enabled) {
      const expiresDate = module.activation?.expires_at ? new Date(module.activation.expires_at).toLocaleDateString('ru-RU') : 'истечения срока';
      if (!window.confirm(`Отключить автопродление?\n\nМодуль будет деактивирован после ${expiresDate}`)) return;
    }
    setActionLoading(`auto-renew-${module.slug}`);
    try {
      if (await toggleAutoRenew(module.slug, enabled)) {
        NotificationService.show({ type: 'success', title: enabled ? 'Автопродление включено' : 'Автопродление выключено', message: enabled ? 'Модуль будет продлён автоматически' : 'Модуль не будет продлён автоматически' });
      }
    } catch (e: any) {
      NotificationService.show({ type: 'error', title: 'Ошибка', message: e.message || 'Не удалось изменить автопродление' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAutoRenew = async (enabled: boolean) => {
    const count = allModules.filter(m => isModuleActive(m.slug) && m.billing_model !== 'free').length;
    if (count === 0) { NotificationService.show({ type: 'info', title: 'Нет активных модулей', message: 'Нет модулей для изменения.' }); return; }
    if (!window.confirm(`${enabled ? 'Включить' : 'Выключить'} автопродление для ${count} модулей?`)) return;
    setActionLoading('bulk-auto-renew');
    try {
      await bulkToggleAutoRenew(enabled);
      NotificationService.show({ type: 'success', title: 'Готово', message: `Автопродление ${enabled ? 'включено' : 'выключено'} для всех активных модулей` });
    } catch (e: any) {
      NotificationService.show({ type: 'error', title: 'Ошибка', message: e.message || 'Не удалось изменить настройки' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleActivateConfirm = async (durationDays: number) => {
    if (!selectedModule) return;
    setActionLoading(`activate-${selectedModule.slug}`);
    try {
      await activateModule(selectedModule.slug, durationDays);
      NotificationService.show({ type: 'success', title: 'Модуль активирован', message: `«${selectedModule.name}» успешно активирован!` });
      setShowActivationModal(false);
      setSelectedModule(null);
      setPreviewData(null);
    } catch (e: any) {
      NotificationService.show({ type: 'error', title: 'Ошибка активации', message: e.message || 'Не удалось активировать модуль' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivateClick = async (module: Module) => {
    setSelectedModule(module);
    setActionLoading(`deactivate-preview-${module.slug}`);
    try {
      setDeactivationPreviewData(await getDeactivationPreview(module.slug));
      setShowDeactivationPreviewModal(true);
    } catch {
      setShowDeactivationPreviewModal(true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivatePreviewConfirm = async () => {
    if (!selectedModule) return;
    setActionLoading(`deactivate-${selectedModule.slug}`);
    try {
      await deactivateModule(selectedModule.slug);
      NotificationService.show({ type: 'success', title: 'Модуль отключён', message: `«${selectedModule.name}» отключён. Средства возвращены на баланс.` });
      setShowDeactivationPreviewModal(false);
      setSelectedModule(null);
      setDeactivationPreviewData(null);
    } catch (e: any) {
      NotificationService.show({ type: 'error', title: 'Ошибка отключения', message: e.message || 'Не удалось отключить модуль' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRenewModule = async (module: Module) => {
    setActionLoading(`renew-${module.slug}`);
    try {
      await renewModule(module.slug);
      NotificationService.show({ type: 'success', title: 'Продлено', message: `«${module.name}» продлён на 30 дней` });
    } catch (e: any) {
      NotificationService.show({ type: 'error', title: 'Ошибка продления', message: e.message || 'Не удалось продлить модуль' });
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Не ограничен';
    return new Date(dateString).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getModuleExpiresAt = (module: Module): string | null =>
    module.activation?.expires_at ?? null;

  const getModuleStatusText = (module: Module): { text: string } => {
    if (isModuleActive(module.slug)) {
      const expiresAt = getModuleExpiresAt(module);
      if (expiresAt) {
        const daysLeft = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 7) return { text: 'Истекает скоро' };
      }
      return { text: module.billing_model === 'free' ? 'Бесплатный' : 'Активен' };
    }
    if (module.development_status && !module.development_status.can_be_activated) return { text: module.development_status.label };
    return { text: 'Не активен' };
  };

  const activeCount = catalogModules.filter(m => isModuleActive(m.slug)).length;
  const monthlyTotal = allModules
    .filter(m => isModuleActive(m.slug) && m.billing_model !== 'free')
    .reduce((sum, m) => sum + (m.pricing_config?.base_price || m.price || 0), 0);
  const expiringCount = catalogModules.filter(m => expiringModules.some(e => e.slug === m.slug)).length;

  if (loading && activeTab === 'modules') return <PageLoading message="Загрузка модулей..." />;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Модули и пакеты</h1>
            <p className="text-slate-500 text-lg">Расширяйте возможности вашей организации</p>
          </div>
        </div>

        <div className="bg-white inline-flex rounded-2xl border border-slate-200 shadow-sm p-1 gap-1">
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'packages' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <RectangleGroupIcon className="w-4 h-4" />
            Пакеты
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'modules' ? 'bg-orange-600 text-white shadow-lg shadow-orange-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
          >
            <Squares2X2Icon className="w-4 h-4" />
            Все модули
          </button>
        </div>

        {activeTab === 'packages' && <PackagesView />}

        {activeTab === 'modules' && (
          <>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Модули</h2>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200">{catalogModules.length} доступно</span>
                </div>
                <p className="text-slate-500 text-lg">Расширяйте возможности с помощью дополнительных модулей</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  <button onClick={() => handleBulkAutoRenew(true)} disabled={loading || !!actionLoading?.startsWith('bulk-auto-renew')} className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 disabled:opacity-50 transition-colors">
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    Вкл. автопродление
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1" />
                  <button onClick={() => handleBulkAutoRenew(false)} disabled={loading || !!actionLoading?.startsWith('bulk-auto-renew')} className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors">
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Выкл.
                  </button>
                </div>
                <button onClick={refresh} disabled={loading} className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 disabled:opacity-50 transition-colors shadow-sm">
                  <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Обновить
                </button>
              </div>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <XCircleIcon className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-900">Ошибка загрузки</h3>
                  <p className="text-red-800 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { bg: 'green', icon: <CheckCircleIcon className="w-6 h-6" />, label: 'Активные', value: activeCount, sub: 'модулей используется' },
                { bg: 'orange', icon: <BanknotesIcon className="w-6 h-6" />, label: 'Стоимость', value: monthlyTotal.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }), sub: 'в месяц' },
                { bg: 'yellow', icon: <ClockIcon className="w-6 h-6" />, label: 'Внимание', value: expiringCount, sub: 'истекают скоро' },
                { bg: 'blue', icon: <Squares2X2Icon className="w-6 h-6" />, label: 'Всего', value: catalogModules.length, sub: 'доступных модулей' },
              ].map(({ bg, icon, label, value, sub }) => (
                <div key={label} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                  <div className={`absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-${bg}-50 rounded-full transition-transform group-hover:scale-150 duration-500`} />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 bg-${bg}-50 rounded-2xl text-${bg}-600`}>{icon}</div>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
                    </div>
                    <p className="text-3xl font-bold text-slate-900">{value}</p>
                    <p className="text-sm text-slate-500 mt-1">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {hasExpiring && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600 mt-1">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-yellow-900 text-lg">Требуется внимание</div>
                    <div className="text-yellow-800 mt-1 mb-3">У следующих модулей истекает срок действия в ближайшие 7 дней:</div>
                    <div className="flex flex-wrap gap-2">
                      {expiringModules.map(m => (
                        <div key={m.slug} className="inline-flex items-center bg-white border border-yellow-200 rounded-xl px-3 py-1.5 shadow-sm">
                          <span className="font-bold text-yellow-900 mr-2">{m.name}</span>
                          <span className="text-yellow-600 text-sm">до {formatDate(getModuleExpiresAt(m))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-10">
              {moduleGroups.map(group => (
                <div key={group.packageSlug}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: group.packageColor + '20' }}>
                      <span style={{ color: group.packageColor }} className="font-bold text-sm">
                        {group.modules.filter(m => isModuleActive(m.slug)).length}/{group.modules.length}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{group.packageName}</h2>
                      <p className="text-xs text-slate-400">
                        {group.modules.filter(m => isModuleActive(m.slug)).length} из {group.modules.length} активно
                        {group.activeTier && <span className="ml-2 text-green-600 font-bold">• пакет подключён</span>}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {group.modules.map(module => (
                      <ModuleCard
                        key={module.slug}
                        module={module}
                        isActive={isModuleActive(module.slug)}
                        isExpanded={expandedModules.has(module.slug)}
                        statusText={getModuleStatusText(module)}
                        actionLoading={actionLoading}
                        onActivate={handleActivateClick}
                        onTrial={handleTrialClick}
                        onDeactivate={handleDeactivateClick}
                        onRenew={handleRenewModule}
                        onToggleExpand={toggleModuleExpanded}
                        onAutoRenewToggle={handleAutoRenewToggle}
                        onOpenDetails={handleOpenDetails}
                        addonCount={getModuleAddonCount(module.slug)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <DevelopmentWarningModal
        module={selectedModule}
        isOpen={showDevelopmentWarning}
        onClose={() => { setShowDevelopmentWarning(false); setSelectedModule(null); setPreviewData(null); }}
        onConfirm={handleDevelopmentWarningConfirm}
      />
      <ModuleDetailsModal
        module={selectedModule}
        isOpen={showDetailsModal}
        onClose={() => { setShowDetailsModal(false); setSelectedModule(null); }}
        addonPreviews={selectedModule ? getModuleAddonPreviews(selectedModule.slug, allModules) : []}
      />
      <ModuleActivationModal
        module={selectedModule}
        isOpen={showActivationModal}
        onClose={() => { setShowActivationModal(false); setSelectedModule(null); setPreviewData(null); }}
        onConfirm={handleActivateConfirm}
        isLoading={actionLoading?.startsWith('activate-') || false}
        previewData={previewData}
      />
      <ModuleDeactivationPreviewModal
        module={selectedModule}
        isOpen={showDeactivationPreviewModal}
        onClose={() => { setShowDeactivationPreviewModal(false); setSelectedModule(null); setDeactivationPreviewData(null); }}
        onConfirm={handleDeactivatePreviewConfirm}
        isLoading={actionLoading?.startsWith('deactivate-') || false}
        previewData={deactivationPreviewData}
      />
    </div>
  );
};

export default ModulesPage;
