import { useState } from 'react';
import { useModules } from '@hooks/useModules';
import { Module } from '@utils/api';
import { 
  PuzzlePieceIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import ConfirmActionModal from '@components/shared/ConfirmActionModal';
import { PageLoading } from '@components/common/PageLoading';

interface ModuleActivationModalProps {
  module: Module | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (durationDays: number) => void;
  isLoading: boolean;
  previewData?: any;
}

const ModuleActivationModal = ({ module, isOpen, onClose, onConfirm, isLoading, previewData }: ModuleActivationModalProps) => {
  const [durationDays, setDurationDays] = useState(30);

  if (!module || !isOpen) return null;

  const handleConfirm = () => {
    onConfirm(durationDays);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-6">Активация модуля</h3>
        
        <div className="space-y-6">
          {/* Информация о модуле */}
          <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
            <h4 className="font-semibold text-orange-900 mb-3">{module.name}</h4>
            <div className="space-y-2 text-sm">
              <div className="text-orange-700">
                {module.price.toLocaleString('ru-RU', { style: 'currency', currency: module.currency })} / {module.duration_days} дней
              </div>
              <div className="text-orange-600">{module.description}</div>
              <div className="space-y-1">
                <div className="font-medium text-orange-800">Возможности:</div>
                <ul className="list-disc list-inside text-orange-700 space-y-1">
                  {module.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Настройки активации */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Период активации</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={durationDays === 30}
                    onChange={() => setDurationDays(30)}
                    className="mr-2"
                  />
                  30 дней ({module.price.toLocaleString('ru-RU', { style: 'currency', currency: module.currency })})
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={durationDays === 90}
                    onChange={() => setDurationDays(90)}
                    className="mr-2"
                  />
                  90 дней ({(module.price * 3 * 0.95).toLocaleString('ru-RU', { style: 'currency', currency: module.currency })})
                  <span className="ml-1 text-xs text-green-600">-5%</span>
                </label>
              </div>
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={durationDays === 365}
                    onChange={() => setDurationDays(365)}
                    className="mr-2"
                  />
                  365 дней ({(module.price * 12 * 0.85).toLocaleString('ru-RU', { style: 'currency', currency: module.currency })})
                  <span className="ml-1 text-xs text-green-600">-15%</span>
                </label>
              </div>
            </div>
          </div>

          {/* Предпросмотр если есть */}
          {previewData && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Информация об активации</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Стоимость:</span>
                  <span>{previewData.cost_breakdown?.total?.toLocaleString('ru-RU', { style: 'currency', currency: module.currency })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Баланс организации:</span>
                  <span className={previewData.can_afford ? 'text-green-600' : 'text-red-600'}>
                    {previewData.organization_balance?.toLocaleString('ru-RU', { style: 'currency', currency: module.currency })}
                  </span>
                </div>
                {!previewData.can_afford && (
                  <div className="text-red-600 text-xs">
                    ⚠️ Недостаточно средств на балансе
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Отменить
            </button>
            
            <button
              onClick={handleConfirm}
              disabled={isLoading || (previewData && !previewData.can_afford)}
              className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-60 font-medium"
            >
              {isLoading ? 'Активация...' : 'Активировать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ModulesPage = () => {
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
    hasExpiring,
    totalMonthlyCost,
    activeModulesCount
  } = useModules({ autoRefresh: true, refreshInterval: 300000 });

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showDeactivationModal, setShowDeactivationModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);

  const handleActivateClick = async (module: Module) => {
    setSelectedModule(module);
    setActionLoading(`preview-${module.slug}`);
    
    try {
      const preview = await getActivationPreview(module.slug);
      setPreviewData(preview);
    } catch (error: any) {
      console.error('Ошибка получения предпросмотра:', error);
    } finally {
      setActionLoading(null);
      setShowActivationModal(true);
    }
  };

  const handleActivateConfirm = async (durationDays: number) => {
    if (!selectedModule) return;
    
    setActionLoading(`activate-${selectedModule.slug}`);
    
    try {
      const success = await activateModule(selectedModule.slug, durationDays);
      if (success) {
        setShowActivationModal(false);
        setSelectedModule(null);
        setPreviewData(null);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivateClick = (module: Module) => {
    setSelectedModule(module);
    setShowDeactivationModal(true);
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedModule) return;
    
    setActionLoading(`deactivate-${selectedModule.slug}`);
    
    try {
      const success = await deactivateModule(selectedModule.slug);
      if (success) {
        setShowDeactivationModal(false);
        setSelectedModule(null);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRenewModule = async (module: Module) => {
    setActionLoading(`renew-${module.slug}`);
    
    try {
      await renewModule(module.slug, 30);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const isExpiringSoon = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };

  const getModuleStatusIcon = (module: Module) => {
    const active = isModuleActive(module.slug);
    const expiring = isExpiringSoon(module.expires_at);
    
    if (!active) {
      return <XCircleIcon className="h-5 w-5 text-gray-400" />;
    } else if (expiring) {
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    } else {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
  };

  const getModuleStatusText = (module: Module) => {
    const active = isModuleActive(module.slug);
    const expiring = isExpiringSoon(module.expires_at);
    
    if (!active) {
      return { text: 'Неактивен', className: 'text-gray-600' };
    } else if (expiring) {
      return { text: 'Истекает скоро', className: 'text-yellow-600' };
    } else {
      return { text: 'Активен', className: 'text-green-600' };
    }
  };

  if (loading) return <PageLoading message="Загрузка модулей..." />;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-steel-900">Модули организации</h1>
        <button
          onClick={refresh}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-steel-300 rounded-lg text-sm font-medium text-steel-700 bg-white hover:bg-steel-50 disabled:opacity-50"
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Обновить
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <div className="text-red-800">{error}</div>
          </div>
        </div>
      )}

      {/* Сводка */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-steel-200">
        <h2 className="text-xl font-semibold mb-4">Сводка модулей</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-construction-600">{activeModulesCount}</div>
            <div className="text-sm text-steel-600">Активных модулей</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {totalMonthlyCost.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
            </div>
            <div className="text-sm text-steel-600">Месячная стоимость</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{expiringModules.length}</div>
            <div className="text-sm text-steel-600">Истекает в 7 днях</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-steel-600">{allModules.length}</div>
            <div className="text-sm text-steel-600">Всего доступно</div>
          </div>
        </div>
      </div>

      {/* Уведомления об истекающих модулях */}
      {hasExpiring && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <div>
              <div className="font-medium text-yellow-800">Модули с истекающим сроком</div>
              <div className="text-yellow-700 text-sm mt-1">
                У вас есть модули, срок действия которых истекает в ближайшие 7 дней:
              </div>
              <div className="mt-2 space-y-1">
                {expiringModules.map((module) => (
                  <div key={module.id} className="text-sm text-yellow-700">
                    <span className="font-medium">{module.name}</span> — истекает {formatDate(module.expires_at)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Список модулей */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-steel-200">
        <h2 className="text-xl font-semibold mb-6">Все модули</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {allModules.map((module) => {
            const active = isModuleActive(module.slug);
            const status = getModuleStatusText(module);
            const actionInProgress = actionLoading?.includes(module.slug);
            
            return (
              <div
                key={module.id}
                className={`relative border rounded-xl p-6 transition-all duration-200 hover:shadow-md ${
                  active 
                    ? 'border-orange-200 bg-orange-50 ring-1 ring-orange-500' 
                    : 'border-steel-200 bg-white hover:border-construction-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      active ? 'bg-orange-100' : 'bg-steel-100'
                    }`}>
                      <PuzzlePieceIcon className={`h-6 w-6 ${
                        active ? 'text-orange-600' : 'text-steel-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-steel-900">{module.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getModuleStatusIcon(module)}
                        <span className={`text-sm font-medium ${status.className}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-construction-600">
                      {module.price.toLocaleString('ru-RU', { style: 'currency', currency: module.currency })}
                    </div>
                    <div className="text-xs text-steel-500">за {module.duration_days} дней</div>
                  </div>
                </div>

                <p className="text-steel-600 text-sm mb-4">{module.description}</p>

                {module.features.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-medium text-steel-700 mb-2">Возможности:</div>
                    <div className="space-y-1">
                      {module.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-start text-xs text-steel-600">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {feature}
                        </div>
                      ))}
                      {module.features.length > 3 && (
                        <div className="text-xs text-steel-500">
                          +{module.features.length - 3} возможностей
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {active && module.expires_at && (
                  <div className="mb-4 p-3 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-steel-600">Активен до:</span>
                      <span className="font-medium text-steel-900">{formatDate(module.expires_at)}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  {active ? (
                    <>
                      <button
                        onClick={() => handleRenewModule(module)}
                        disabled={actionInProgress}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading === `renew-${module.slug}` ? (
                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <BoltIcon className="h-4 w-4 mr-2" />
                            Продлить
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDeactivateClick(module)}
                        disabled={actionInProgress}
                        className="px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50"
                      >
                        {actionLoading === `deactivate-${module.slug}` ? (
                          <ArrowPathIcon className="h-4 w-4 animate-spin" />
                        ) : (
                          <StopIcon className="h-4 w-4" />
                        )}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleActivateClick(module)}
                      disabled={actionInProgress}
                      className="w-full inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50"
                    >
                      {actionLoading === `activate-${module.slug}` || actionLoading === `preview-${module.slug}` ? (
                        <ArrowPathIcon className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <PlayIcon className="h-4 w-4 mr-2" />
                          Активировать
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Модальные окна */}
      <ModuleActivationModal
        module={selectedModule}
        isOpen={showActivationModal}
        onClose={() => {
          setShowActivationModal(false);
          setSelectedModule(null);
          setPreviewData(null);
        }}
        onConfirm={handleActivateConfirm}
        isLoading={actionLoading?.startsWith('activate-') || false}
        previewData={previewData}
      />

      <ConfirmActionModal
        isOpen={showDeactivationModal}
        onClose={() => {
          setShowDeactivationModal(false);
          setSelectedModule(null);
        }}
        onConfirm={handleDeactivateConfirm}
        title="Деактивировать модуль?"
        message={`Вы действительно хотите деактивировать модуль "${selectedModule?.name}"? Все связанные функции станут недоступны.`}
        confirmLabel="Деактивировать"
        confirmColorClass="red"
        isLoading={actionLoading?.startsWith('deactivate-') || false}
      />
    </div>
  );
};

export default ModulesPage;