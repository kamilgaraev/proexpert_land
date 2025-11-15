import { useState } from 'react';
import { useModules } from '@hooks/useModules';
import { Module } from '@utils/api';
import { ProtectedComponent } from '@/components/permissions/ProtectedComponent';
import ModuleStatusBadge from '@components/dashboard/ModuleStatusBadge';
import TrialBadge from '@components/dashboard/TrialBadge';
import {
  PuzzlePieceIcon,
  CheckCircleIcon,
  XCircleIcon, 
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlayIcon,
  XMarkIcon,
  BoltIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BuildingOfficeIcon,
  UsersIcon,
  ShareIcon,
  ChartBarIcon,
  ChartPieIcon,
  DocumentChartBarIcon,
  CpuChipIcon,
  ServerIcon,
  BeakerIcon,
  CloudIcon,
  CogIcon,
  ShieldCheckIcon,
  BanknotesIcon,
  CalendarIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  GlobeAltIcon,
  KeyIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  WrenchScrewdriverIcon,
  FunnelIcon,
  Squares2X2Icon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { PageLoading } from '@components/common/PageLoading';
import NotificationService from '@components/shared/NotificationService';

// Категории модулей
const MODULE_CATEGORIES = {
  'all': { name: 'Все модули', icon: Squares2X2Icon, color: 'text-gray-600' },
  'core': { name: 'Базовые', icon: BuildingOfficeIcon, color: 'text-blue-600' },
  'reports': { name: 'Отчеты', icon: ChartBarIcon, color: 'text-green-600' },
  'management': { name: 'Управление', icon: CogIcon, color: 'text-purple-600' },
  'workflow': { name: 'Процессы', icon: ArrowPathIcon, color: 'text-indigo-600' },
  'finance': { name: 'Финансы', icon: BanknotesIcon, color: 'text-emerald-600' },
  'documents': { name: 'Документы', icon: DocumentChartBarIcon, color: 'text-amber-600' },
  'hr': { name: 'HR', icon: UsersIcon, color: 'text-pink-600' },
  'analytics': { name: 'Аналитика', icon: ChartPieIcon, color: 'text-cyan-600' },
  'planning': { name: 'Планирование', icon: CalendarIcon, color: 'text-rose-600' },
  'collaboration': { name: 'Сотрудничество', icon: ShareIcon, color: 'text-orange-600' },
  'storage': { name: 'Хранилище', icon: ServerIcon, color: 'text-slate-600' },
  'monitoring': { name: 'Мониторинг', icon: MagnifyingGlassIcon, color: 'text-teal-600' },
  'tools': { name: 'Инструменты', icon: WrenchScrewdriverIcon, color: 'text-stone-600' },
  'dashboard': { name: 'Дашборды', icon: Squares2X2Icon, color: 'text-violet-600' }
} as const;

type ModuleCategory = keyof typeof MODULE_CATEGORIES;

interface ModuleActivationModalProps {
  module: Module | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (durationDays: number) => void;
  isLoading: boolean;
  previewData?: any;
}

interface ModuleDeactivationPreviewModalProps {
  module: Module | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
  previewData?: any;
}

interface DevelopmentWarningModalProps {
  module: Module | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
                {(module.pricing_config?.base_price || module.price || 0).toLocaleString('ru-RU', { 
                  style: 'currency', 
                  currency: module.pricing_config?.currency || module.currency || 'RUB'
                })} / {module.pricing_config?.duration_days || module.duration_days} дней
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
                  30 дней ({(module.pricing_config?.base_price || module.price || 0).toLocaleString('ru-RU', { 
                    style: 'currency', 
                    currency: module.pricing_config?.currency || module.currency || 'RUB'
                  })})
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={durationDays === 90}
                    onChange={() => setDurationDays(90)}
                    className="mr-2"
                  />
                  90 дней ({((module.pricing_config?.base_price || module.price || 0) * 3 * 0.95).toLocaleString('ru-RU', { 
                    style: 'currency', 
                    currency: module.pricing_config?.currency || module.currency || 'RUB'
                  })})
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
                  365 дней ({((module.pricing_config?.base_price || module.price || 0) * 12 * 0.85).toLocaleString('ru-RU', { 
                    style: 'currency', 
                    currency: module.pricing_config?.currency || module.currency || 'RUB'
                  })})
                  <span className="ml-1 text-xs text-green-600">-15%</span>
                </label>
              </div>
            </div>
          </div>

          {/* Предпросмотр если есть */}
          {previewData && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Информация об активации</h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                {/* Информация о модуле */}
                {previewData.module && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Стоимость:</span>
                      <span className="font-semibold">
                        {previewData.module.pricing_config?.base_price?.toLocaleString('ru-RU', { 
                          style: 'currency', 
                          currency: previewData.module.pricing_config?.currency || 'RUB' 
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Модель биллинга:</span>
                      <span className="capitalize">
                        {previewData.module.billing_model === 'one_time' ? 'Разовый платеж' : 
                         previewData.module.billing_model === 'subscription' ? 'Подписка' : 
                         previewData.module.billing_model === 'free' ? 'Бесплатно' : 
                         previewData.module.billing_model}
                      </span>
                    </div>
                    {previewData.module.pricing_config?.duration_days > 0 && (
                      <div className="flex justify-between">
                        <span>Период:</span>
                        <span>{previewData.module.pricing_config.duration_days} дней</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Проверки */}
                {previewData.checks && (
                  <div className="space-y-3">
                    {/* Проверка средств */}
                    {!previewData.checks.can_afford && (
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <div className="text-red-800 text-xs font-medium">
                          ⚠️ Недостаточно средств на балансе
                        </div>
                      </div>
                    )}
                    
                    {/* Недостающие зависимости */}
                    {previewData.checks.missing_dependencies?.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                        <div className="text-yellow-800 text-xs">
                          <div className="font-medium mb-1">⚠️ Недостающие зависимости:</div>
                          <ul className="list-disc list-inside space-y-0.5">
                            {previewData.checks.missing_dependencies.map((dep: string, index: number) => (
                              <li key={index} className="text-yellow-700">
                                {dep === 'organizations' ? 'Организации' : 
                                 dep === 'users' ? 'Пользователи' : 
                                 dep === 'basic-reports' ? 'Базовые отчеты' : 
                                 dep === 'projects' ? 'Проекты' : dep}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 text-xs text-yellow-700 bg-yellow-100 rounded p-2">
                            <div className="font-medium mb-1">Что нужно сделать:</div>
                            <div>Активируйте указанные модули-зависимости, а затем повторите попытку активации этого модуля.</div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Конфликты */}
                    {previewData.checks.conflicts?.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded p-2">
                        <div className="text-red-800 text-xs">
                          <div className="font-medium mb-1">⚠️ Конфликты:</div>
                          <ul className="list-disc list-inside">
                            {previewData.checks.conflicts.map((conflict: string, index: number) => (
                              <li key={index}>{conflict}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {/* Уже активен */}
                    {previewData.checks.is_already_active && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-2">
                        <div className="text-blue-800 text-xs font-medium">
                          ℹ️ Модуль уже активирован
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Информация о функциях модуля */}
                {previewData.module?.features?.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="text-xs font-medium text-gray-700 mb-2">Возможности модуля:</div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {previewData.module.features.slice(0, 3).map((feature: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                      {previewData.module.features.length > 3 && (
                        <li className="text-gray-500 text-xs">
                          И еще {previewData.module.features.length - 3} возможностей...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Ограничения модуля */}
                {previewData.module?.limits && Object.keys(previewData.module.limits).length > 0 && (
                  <div className="border-t pt-3">
                    <div className="text-xs font-medium text-gray-700 mb-2">Ограничения:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      {previewData.module.limits.max_templates && (
                        <div>Шаблонов: до {previewData.module.limits.max_templates}</div>
                      )}
                      {previewData.module.limits.max_template_size_mb && (
                        <div>Размер файла: до {previewData.module.limits.max_template_size_mb} МБ</div>
                      )}
                      {previewData.module.limits.version_history_count && (
                        <div>История версий: {previewData.module.limits.version_history_count}</div>
                      )}
                    </div>
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
              disabled={isLoading || (previewData && !previewData.can_activate)}
              className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-60 font-medium"
            >
              {isLoading ? 'Активация...' : 
               (previewData && !previewData.can_activate) ? 'Невозможно активировать' : 'Активировать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DevelopmentWarningModal = ({ module, isOpen, onClose, onConfirm }: DevelopmentWarningModalProps) => {
  if (!module || !isOpen || !module.development_status) return null;

  const { development_status } = module;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center mb-4">
          <ExclamationTriangleIcon className={`h-8 w-8 mr-3 text-${development_status.color}-500`} />
          <h2 className="text-xl font-bold">Активировать {module.name}?</h2>
        </div>
        
        <div className="mb-4">
          <ModuleStatusBadge developmentStatus={development_status} />
        </div>
        
        <p className="text-gray-700 mb-6">
          {development_status.warning_message}
        </p>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Отмена
          </button>
          <button 
            onClick={onConfirm} 
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
          >
            Продолжить
          </button>
        </div>
      </div>
    </div>
  );
};

const ModuleDeactivationPreviewModal = ({ module, isOpen, onClose, onConfirm, isLoading, previewData }: ModuleDeactivationPreviewModalProps) => {
  if (!module || !isOpen) return null;

  const getWarningIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'info':
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getWarningBgColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const getWarningTextColor = (severity: string) => {
    switch (severity) {
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
      default:
        return 'text-blue-800';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'RUB') => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-6 text-red-900">
          Вы действительно хотите отключить модуль "{module.name}"?
        </h3>
        
        <div className="space-y-6">
          {/* Финансовая информация */}
          {previewData?.financial_impact && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Финансовая информация
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700">Возврат средств:</span>
                    <span className="font-semibold text-green-800">
                      {formatCurrency(previewData.financial_impact.refund_amount, previewData.financial_impact.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Текущий баланс:</span>
                    <span className="font-semibold text-green-800">
                      {formatCurrency(previewData.financial_impact.current_balance, previewData.financial_impact.currency)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-700">Баланс после возврата:</span>
                    <span className="font-bold text-green-900">
                      {formatCurrency(previewData.financial_impact.balance_after_refund, previewData.financial_impact.currency)}
                    </span>
                  </div>
                  {previewData.activation && (
                    <div className="text-xs text-green-600">
                      Использовано {Math.round(previewData.activation.days_used)} из {Math.round(previewData.activation.days_used + (previewData.activation.days_remaining || 0))} дней
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Что вы потеряете */}
          {previewData?.what_you_lose && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                Что вы потеряете
              </h4>
              <div className="space-y-3">
                {previewData.what_you_lose.features && previewData.what_you_lose.features.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-orange-800 mb-1">Возможности:</div>
                    <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                      {previewData.what_you_lose.features.map((feature: string, index: number) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {previewData.what_you_lose.functionality && previewData.what_you_lose.functionality.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-orange-800 mb-1">Функциональность:</div>
                    <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                      {previewData.what_you_lose.functionality.map((func: string, index: number) => (
                        <li key={index}>{func}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Зависимые модули */}
          {previewData?.dependent_modules && previewData.dependent_modules.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                <XCircleIcon className="h-5 w-5 mr-2" />
                Зависимые модули
              </h4>
              <div className="space-y-2">
                {previewData.dependent_modules.map((dep: any, index: number) => (
                  <div key={index} className="bg-red-100 rounded p-2">
                    <div className="font-medium text-red-900">{dep.name}</div>
                    <div className="text-sm text-red-700">{dep.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Предупреждения */}
          {previewData?.warnings && previewData.warnings.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <InformationCircleIcon className="h-5 w-5 mr-2" />
                Предупреждения
              </h4>
              <div className="space-y-2">
                {previewData.warnings
                  .sort((a: any, b: any) => {
                    const severityOrder = { 'error': 0, 'warning': 1, 'info': 2 };
                    return severityOrder[a.severity as keyof typeof severityOrder] - severityOrder[b.severity as keyof typeof severityOrder];
                  })
                  .map((warning: any, index: number) => (
                  <div key={index} className={`border rounded p-3 flex items-start ${getWarningBgColor(warning.severity)}`}>
                    <div className="mr-3 mt-0.5">
                      {getWarningIcon(warning.severity)}
                    </div>
                    <div className={`text-sm ${getWarningTextColor(warning.severity)}`}>
                      {warning.message}
                    </div>
                  </div>
                ))}
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
            
            {previewData?.can_proceed ? (
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 font-medium"
              >
                {isLoading ? 'Отключение...' : 'Да, отключить'}
              </button>
            ) : previewData?.dependent_modules && previewData.dependent_modules.length > 0 ? (
              <button
                disabled
                className="flex-1 py-3 px-4 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed"
              >
                Сначала отключите зависимые модули
              </button>
            ) : (
              <button
                disabled
                className="flex-1 py-3 px-4 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed"
              >
                Невозможно отключить
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


// Умный маппинг иконок модулей
const getModuleIcon = (iconName: string | null | undefined, module?: Module) => {
  // Все доступные иконки из библиотеки
  const availableIcons: { [key: string]: any } = {
    'building': BuildingOfficeIcon,
    'building-office': BuildingOfficeIcon,
    'office': BuildingOfficeIcon,
    'organization': BuildingOfficeIcon,
    'company': BuildingOfficeIcon,
    
    'users': UsersIcon,
    'user': UsersIcon,
    'people': UsersIcon,
    'team': UsersIcon,
    
    'sitemap': ShareIcon,
    'share': ShareIcon,
    'network': ShareIcon,
    'multi': ShareIcon,
    'hierarchy': ShareIcon,
    
    'chart-bar': ChartBarIcon,
    'chart': ChartBarIcon,
    'bar': ChartBarIcon,
    'analytics': ChartBarIcon,
    'stats': ChartBarIcon,
    
    'chart-line': ChartPieIcon,
    'chart-pie': ChartPieIcon,
    'pie': ChartPieIcon,
    'advanced': ChartPieIcon,
    
    'document-chart': DocumentChartBarIcon,
    'document': DocumentChartBarIcon,
    'report': DocumentChartBarIcon,
    'reports': DocumentChartBarIcon,
    
    'cpu-chip': CpuChipIcon,
    'cpu': CpuChipIcon,
    'chip': CpuChipIcon,
    'processing': CpuChipIcon,
    
    'server': ServerIcon,
    'database': ServerIcon,
    'storage': ServerIcon,
    
    'beaker': BeakerIcon,
    'experiment': BeakerIcon,
    'test': BeakerIcon,
    'lab': BeakerIcon,
    
    'cloud': CloudIcon,
    'api': CloudIcon,
    'service': CloudIcon,
    
    'puzzle': PuzzlePieceIcon,
    'puzzle-piece': PuzzlePieceIcon,
    'module': PuzzlePieceIcon,
    'addon': PuzzlePieceIcon,
    'plugin': PuzzlePieceIcon,
    
    'cog': CogIcon,
    'settings': CogIcon,
    'config': CogIcon,
    'configuration': CogIcon,
    'gear': CogIcon,
    
    'shield': ShieldCheckIcon,
    'shield-check': ShieldCheckIcon,
    'security': ShieldCheckIcon,
    'protection': ShieldCheckIcon,
    'auth': ShieldCheckIcon,
    'authentication': ShieldCheckIcon,
    'permissions': ShieldCheckIcon,
    
    'banknotes': BanknotesIcon,
    'money': BanknotesIcon,
    'finance': BanknotesIcon,
    'financial': BanknotesIcon,
    'billing': BanknotesIcon,
    'payment': BanknotesIcon,
    'invoice': BanknotesIcon,
    
    'calendar': CalendarIcon,
    'schedule': CalendarIcon,
    'time': CalendarIcon,
    'date': CalendarIcon,
    'planning': CalendarIcon,
    
    'clock': ClockIcon,
    'timer': ClockIcon,
    'history': ClockIcon,
    'tracking': ClockIcon,
    
    'document-duplicate': DocumentDuplicateIcon,
    'copy': DocumentDuplicateIcon,
    'duplicate': DocumentDuplicateIcon,
    'backup': DocumentDuplicateIcon,
    'export': DocumentDuplicateIcon,
    'import': DocumentDuplicateIcon,
    
    'globe': GlobeAltIcon,
    'globe-alt': GlobeAltIcon,
    'web': GlobeAltIcon,
    'website': GlobeAltIcon,
    'internet': GlobeAltIcon,
    'integration': GlobeAltIcon,
    'external': GlobeAltIcon,
    
    'key': KeyIcon,
    'password': KeyIcon,
    'access': KeyIcon,
    'credential': KeyIcon,
    'token': KeyIcon,
    
    'lock': LockClosedIcon,
    'lock-closed': LockClosedIcon,
    'locked': LockClosedIcon,
    'private': LockClosedIcon,
    'secure': LockClosedIcon,
    'encrypted': LockClosedIcon,
    
    'magnifying-glass': MagnifyingGlassIcon,
    'search': MagnifyingGlassIcon,
    'find': MagnifyingGlassIcon,
    'lookup': MagnifyingGlassIcon,
    'filter': MagnifyingGlassIcon,
    
    'paper-airplane': PaperAirplaneIcon,
    'send': PaperAirplaneIcon,
    'message': PaperAirplaneIcon,
    'notification': PaperAirplaneIcon,
    'email': PaperAirplaneIcon,
    'mail': PaperAirplaneIcon,
    
    'wrench-screwdriver': WrenchScrewdriverIcon,
    'tools': WrenchScrewdriverIcon,
    'maintenance': WrenchScrewdriverIcon,
    'repair': WrenchScrewdriverIcon,
    'fix': WrenchScrewdriverIcon,
    'utility': WrenchScrewdriverIcon
  };

  // Функция для попытки найти иконку
  const findIcon = (searchTerm: string): any => {
    if (!searchTerm) return null;
    
    // Прямое совпадение
    if (availableIcons[searchTerm.toLowerCase()]) {
      return availableIcons[searchTerm.toLowerCase()];
    }
    
    // Поиск по частичному совпадению
    const partial = Object.keys(availableIcons).find(key => 
      key.includes(searchTerm.toLowerCase()) || searchTerm.toLowerCase().includes(key)
    );
    if (partial) {
      return availableIcons[partial];
    }
    
    return null;
  };

  // 1. Пробуем прямой поиск по названию иконки
  let IconComponent = iconName ? findIcon(iconName as string) : null;
  
  // 2. Если не найдено, пробуем по категории модуля
  if (!IconComponent && module?.category) {
    IconComponent = findIcon(module.category);
  }
  
  // 3. Если не найдено, пробуем по типу модуля
  if (!IconComponent && module?.type) {
    IconComponent = findIcon(module.type);
  }
  
  // 4. Если не найдено, пробуем найти по ключевым словам в названии модуля
  if (!IconComponent && module?.name) {
    const nameWords = module.name.toLowerCase().split(/\s+/);
    for (const word of nameWords) {
      IconComponent = findIcon(word);
      if (IconComponent) break;
    }
  }
  
  // 5. Категорийный fallback
  if (!IconComponent && module) {
    const categoryFallbacks: { [key: string]: any } = {
      'core': BuildingOfficeIcon,
      'reports': ChartBarIcon,
      'analytics': ChartPieIcon,
      'addon': PuzzlePieceIcon,
      'premium': CpuChipIcon,
      'feature': BeakerIcon
    };
    IconComponent = categoryFallbacks[module.category] || categoryFallbacks[module.type];
  }
  
  // 6. Общий fallback
  if (!IconComponent) {
    console.log(`🎨 Icon not found for: "${iconName}". Using fallback.`, { 
      module: module?.name, 
      category: module?.category, 
      type: module?.type 
    });
    IconComponent = PuzzlePieceIcon;
  }
  
  return IconComponent;
};

// Определение цвета иконки на основе статуса модуля
const getModuleIconColor = (module: Module, isModuleActive: (slug: string) => boolean, isExpiringSoon: (module: Module) => boolean) => {
  const active = isModuleActive(module.slug);
  const expiring = isExpiringSoon(module);
  
  if (!active) {
    return 'text-gray-400';
  } else if (expiring) {
    return 'text-yellow-500';
  } else {
    return 'text-green-500';
  }
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
    getDeactivationPreview,
    checkTrialAvailability,
    activateTrial,
    hasExpiring
  } = useModules({ 
    autoRefresh: true, 
    refreshInterval: 900000,
    onError: (errorMessage: string) => {
      // Показываем уведомление пользователю при ошибке
      NotificationService.show({
        type: 'error',
        title: 'Ошибка',
        message: errorMessage
      });
    }
  });

  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [showDeactivationPreviewModal, setShowDeactivationPreviewModal] = useState(false);
  const [showDevelopmentWarning, setShowDevelopmentWarning] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [deactivationPreviewData, setDeactivationPreviewData] = useState<any>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<ModuleCategory>('all');

  // Фильтрация модулей по выбранной категории
  const filteredModules = selectedCategory === 'all' 
    ? allModules 
    : allModules.filter(module => module.category === selectedCategory);

  // Статистика по категориям
  const categoryStats = allModules.reduce((acc, module) => {
    const category = module.category as ModuleCategory;
    if (!acc[category]) {
      acc[category] = { total: 0, active: 0 };
    }
    acc[category].total += 1;
    if (isModuleActive(module.slug)) {
      acc[category].active += 1;
    }
    return acc;
  }, {} as Record<ModuleCategory, { total: number; active: number }>);

  // Доступные категории (только те, которые есть в модулях)
  const availableCategories = ['all', ...new Set(allModules.map(m => m.category))] as ModuleCategory[];

  const toggleModuleExpanded = (moduleSlug: string) => {
    setExpandedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleSlug)) {
        newSet.delete(moduleSlug);
      } else {
        newSet.add(moduleSlug);
      }
      return newSet;
    });
  };

  const handleActivateClick = async (module: Module) => {
    // Проверяем статус разработки
    if (module.development_status && !module.development_status.can_be_activated) {
      NotificationService.show({
        type: 'warning',
        title: 'Модуль недоступен',
        message: `Модуль "${module.name}" недоступен для активации: ${module.development_status.description}`
      });
      return;
    }

    setSelectedModule(module);
    setActionLoading(`preview-${module.slug}`);
    
    try {
      const preview = await getActivationPreview(module.slug);
      setPreviewData(preview);
    } catch (error: any) {
      console.error('Ошибка получения предпросмотра:', error);
    } finally {
      setActionLoading(null);
      
      // Показываем предупреждение если нужно
      if (module.development_status?.should_show_warning) {
        setShowDevelopmentWarning(true);
      } else {
        setShowActivationModal(true);
      }
    }
  };

  const handleDevelopmentWarningConfirm = () => {
    setShowDevelopmentWarning(false);
    setShowActivationModal(true);
  };

  const handleTrialClick = async (module: Module) => {
    // Проверяем статус разработки
    if (module.development_status && !module.development_status.can_be_activated) {
      NotificationService.show({
        type: 'warning',
        title: 'Модуль недоступен',
        message: `Модуль "${module.name}" недоступен для активации trial: ${module.development_status.description}`
      });
      return;
    }

    setSelectedModule(module);
    setActionLoading(`trial-check-${module.slug}`);
    
    try {
      const availability = await checkTrialAvailability(module.slug);
      
      if (!availability.can_activate_trial) {
        let message = 'Trial период недоступен';
        
        switch (availability.reason) {
          case 'TRIAL_ALREADY_USED':
            message = 'Вы уже использовали trial период для этого модуля. Активируйте полную версию.';
            break;
          case 'MODULE_ALREADY_ACTIVE':
            message = 'Модуль уже активирован';
            break;
          case 'TRIAL_NOT_AVAILABLE_FOR_FREE':
            message = 'Trial период недоступен для бесплатных модулей';
            break;
          case 'MODULE_STATUS_NOT_READY':
            message = availability.development_status?.description || 'Модуль находится в разработке';
            break;
        }
        
        NotificationService.show({
          type: 'info',
          title: 'Trial недоступен',
          message
        });
        
        setSelectedModule(null);
        return;
      }
      
      // Показываем предупреждение если нужно
      if (module.development_status?.should_show_warning) {
        setShowDevelopmentWarning(true);
      } else {
        // Сразу активируем trial
        await handleTrialActivate(module.slug);
      }
    } catch (error: any) {
      NotificationService.show({
        type: 'error',
        title: 'Ошибка',
        message: error.message || 'Не удалось проверить доступность trial'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleTrialActivate = async (moduleSlug: string) => {
    setActionLoading(`trial-activate-${moduleSlug}`);
    
    try {
      const success = await activateTrial(moduleSlug);
      if (success) {
        NotificationService.show({
          type: 'success',
          title: 'Trial активирован',
          message: `Trial период успешно активирован!`
        });
        setShowDevelopmentWarning(false);
        setSelectedModule(null);
      }
    } catch (error: any) {
      NotificationService.show({
        type: 'error',
        title: 'Ошибка активации trial',
        message: error.message || 'Не удалось активировать trial период'
      });
    } finally {
      setActionLoading(null);
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

  const handleDeactivateClick = async (module: Module) => {
    setSelectedModule(module);
    setActionLoading(`deactivation-preview-${module.slug}`);
    
    try {
      const preview = await getDeactivationPreview(module.slug);
      setDeactivationPreviewData(preview);
      setShowDeactivationPreviewModal(true);
    } catch (error: any) {
      NotificationService.show({
        type: 'error',
        title: 'Ошибка',
        message: error.message || 'Не удалось получить информацию о деактивации'
      });
    } finally {
      setActionLoading(null);
    }
  };


  const handleDeactivatePreviewConfirm = async () => {
    if (!selectedModule) return;
    
    setActionLoading(`deactivate-${selectedModule.slug}`);
    
    try {
      const success = await deactivateModule(selectedModule.slug);
      if (success) {
        setShowDeactivationPreviewModal(false);
        setSelectedModule(null);
        setDeactivationPreviewData(null);
        
        NotificationService.show({
          type: 'success',
          title: 'Модуль отключен',
          message: `Модуль "${selectedModule.name}" успешно отключен${deactivationPreviewData?.financial_impact?.refund_amount ? ` с возвратом ${deactivationPreviewData.financial_impact.refund_amount} ₽` : ''}`
        });
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

  const getModuleExpiresAt = (module: Module) => {
    return module.activation?.expires_at || null;
  };

  const isExpiringSoon = (module: Module) => {
    // Бесплатные модули никогда не истекают
    if (module.billing_model === 'free') return false;
    
    const expiresAt = getModuleExpiresAt(module);
    if (!expiresAt) return false;
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  };


  const getModuleStatusText = (module: Module) => {
    const active = isModuleActive(module.slug);
    const expiring = isExpiringSoon(module);
    
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

      {/* Фильтр по категориям */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-steel-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-steel-600" />
            <h2 className="text-lg font-semibold text-steel-900">Категории модулей</h2>
          </div>
          <div className="text-sm text-steel-600">
            Показано: {filteredModules.length} из {allModules.length}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((category) => {
            const categoryInfo = MODULE_CATEGORIES[category];
            const stats = category === 'all' 
              ? { total: allModules.length, active: filteredModules.filter(m => isModuleActive(m.slug)).length }
              : categoryStats[category] || { total: 0, active: 0 };
            const IconComponent = categoryInfo?.icon || Squares2X2Icon;
            const isSelected = selectedCategory === category;
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  isSelected
                    ? 'bg-orange-50 border-orange-200 text-orange-700 ring-1 ring-orange-500'
                    : 'bg-white border-steel-200 text-steel-700 hover:bg-steel-50 hover:border-steel-300'
                }`}
              >
                <IconComponent className={`h-4 w-4 mr-2 ${isSelected ? 'text-orange-600' : categoryInfo?.color || 'text-gray-600'}`} />
                <span>{categoryInfo?.name || 'Неизвестная категория'}</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  isSelected 
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-steel-100 text-steel-600'
                }`}>
                  {stats.active}/{stats.total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Сводка */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-steel-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Сводка модулей
            {selectedCategory !== 'all' && (
              <span className="ml-2 text-base font-normal text-steel-600">
                ({MODULE_CATEGORIES[selectedCategory]?.name || 'Неизвестная категория'})
              </span>
            )}
          </h2>
          {selectedCategory !== 'all' && (
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Показать все
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-construction-600">
              {filteredModules.filter(m => isModuleActive(m.slug)).length}
            </div>
            <div className="text-sm text-steel-600">Активных модулей</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {filteredModules
                .filter(m => isModuleActive(m.slug))
                .reduce((sum, m) => sum + (m.billing_model !== 'free' ? (m.pricing_config?.base_price || m.price || 0) : 0), 0)
                .toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' })}
            </div>
            <div className="text-sm text-steel-600">Месячная стоимость</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {filteredModules.filter(m => expiringModules.some(exp => exp.slug === m.slug)).length}
            </div>
            <div className="text-sm text-steel-600">Истекает в 7 днях</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-steel-600">{filteredModules.length}</div>
            <div className="text-sm text-steel-600">
              {selectedCategory === 'all' ? 'Всего доступно' : 'В категории'}
            </div>
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
                  <div key={module.slug} className="text-sm text-yellow-700">
                    <span className="font-medium">{module.name}</span> — истекает {formatDate(getModuleExpiresAt(module))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Список модулей */}
      <div className="bg-white shadow-lg rounded-2xl p-6 border border-steel-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">
            {selectedCategory === 'all' ? 'Все модули' : MODULE_CATEGORIES[selectedCategory]?.name || 'Неизвестная категория'}
          </h2>
          {filteredModules.length === 0 && selectedCategory !== 'all' && (
            <div className="text-sm text-steel-500">
              В этой категории модули отсутствуют
            </div>
          )}
        </div>
        
        {filteredModules.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredModules.map((module) => {
                const active = isModuleActive(module.slug);
                const status = getModuleStatusText(module);
                const ModuleIconComponent = getModuleIcon(module.icon || 'puzzle-piece', module);
                const iconColor = getModuleIconColor(module, isModuleActive, isExpiringSoon);
            const actionInProgress = actionLoading?.includes(module.slug);

                // Определяем, можно ли активировать модуль
                const canActivate = module.development_status?.can_be_activated !== false;
                const isDisabled = !active && !canActivate;
                
                return (
              <div
                key={module.slug}
                className={`relative border rounded-xl p-6 transition-all duration-200 ${
                  active 
                    ? 'border-orange-200 bg-orange-50 ring-1 ring-orange-500' 
                    : canActivate 
                      ? 'border-steel-200 bg-white hover:border-construction-300 hover:shadow-md'
                      : 'border-gray-200 bg-gray-50 opacity-75'
                }`}
                  >
                    {/* Overlay для недоступных модулей */}
                    {isDisabled && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-medium">
                          Недоступен
                        </div>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      active ? 'bg-orange-100' : 
                      canActivate ? 'bg-steel-100' : 'bg-gray-200'
                    }`}>
                      <ModuleIconComponent className={`h-6 w-6 ${
                        active ? 'text-orange-600' : 
                        canActivate ? 'text-steel-600' : 'text-gray-400'
                      }`} />
                        </div>
                        <div>
                      <h3 className={`font-semibold ${isDisabled ? 'text-gray-500' : 'text-steel-900'}`}>
                        {module.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <ModuleIconComponent className={`h-5 w-5 ${iconColor}`} />
                        <span className={`text-sm font-medium ${status.className}`}>
                          {status.text}
                          </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                      {module.development_status && (
                          <ModuleStatusBadge developmentStatus={module.development_status} />
                      )}
                      {module.activation && (
                          <TrialBadge activation={module.activation} />
                      )}
                      </div>
                      </div>
                    </div>

                  <div className="text-right">
                    {module.billing_model === 'free' ? (
                      <div className={`text-lg font-bold ${isDisabled ? 'text-gray-400' : 'text-green-600'}`}>
                        Бесплатно
                      </div>
                    ) : (
                      <>
                        <div className={`text-lg font-bold ${isDisabled ? 'text-gray-400' : 'text-construction-600'}`}>
                          {(module.pricing_config?.base_price || module.price || 0).toLocaleString('ru-RU', { 
                            style: 'currency', 
                            currency: module.pricing_config?.currency || module.currency || 'RUB'
                          })}
                        </div>
                        <div className={`text-xs ${isDisabled ? 'text-gray-400' : 'text-steel-500'}`}>
                          за {module.pricing_config?.duration_days || module.duration_days} дней
                        </div>
                      </>
                    )}
                  </div>
                    </div>

                <p className={`text-sm mb-4 ${isDisabled ? 'text-gray-400' : 'text-steel-600'}`}>
                  {module.description}
                </p>

                {/* Блок информации для недоступных модулей */}
                {isDisabled && module.development_status && (
                  <div className="mb-4 p-3 bg-gray-100 border border-gray-300 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <InformationCircleIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          Модуль недоступен для активации
                        </div>
                        <div className="text-xs text-gray-600">
                          {module.development_status.description}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {module.features.length > 0 && (
                      <div className="mb-4">
                    <div className={`text-xs font-medium mb-2 ${isDisabled ? 'text-gray-500' : 'text-steel-700'}`}>
                      Возможности:
                    </div>
                    <div className="space-y-1">
                      {(() => {
                        const isExpanded = expandedModules.has(module.slug);
                        const featuresToShow = isExpanded ? module.features : module.features.slice(0, 3);
                        
                        return (
                          <>
                            {featuresToShow.map((feature, index) => (
                              <div key={index} className={`flex items-start text-xs ${isDisabled ? 'text-gray-400' : 'text-steel-600'}`}>
                                <CheckCircleIcon className={`h-3 w-3 mr-2 mt-0.5 flex-shrink-0 ${isDisabled ? 'text-gray-400' : 'text-green-500'}`} />
                              {feature}
                              </div>
                            ))}
                            {module.features.length > 3 && !isDisabled && (
                              <button
                                onClick={() => toggleModuleExpanded(module.slug)}
                                className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center mt-1 transition-colors"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUpIcon className="h-3 w-3 mr-1" />
                                    <span>Скрыть</span>
                                  </>
                                ) : (
                                  <>
                                    <ChevronDownIcon className="h-3 w-3 mr-1" />
                                    <span>+{module.features.length - 3} возможностей — показать все</span>
                                  </>
                                )}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>
                      </div>
                    )}

                {/* Предупреждение об истечении trial */}
                {active && module.activation?.status === 'trial' && module.activation.days_until_expiration !== null && (
                  <div className={`mb-4 p-3 rounded-lg border ${
                    module.activation.days_until_expiration <= 3 
                      ? 'bg-red-50 border-red-200' 
                      : module.activation.days_until_expiration <= 7
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-start space-x-2">
                      <ClockIcon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        module.activation.days_until_expiration <= 3 
                          ? 'text-red-500' 
                          : module.activation.days_until_expiration <= 7
                            ? 'text-yellow-500'
                            : 'text-blue-500'
                      }`} />
                      <div>
                        <div className={`text-sm font-medium ${
                          module.activation.days_until_expiration <= 3 
                            ? 'text-red-800' 
                            : module.activation.days_until_expiration <= 7
                              ? 'text-yellow-800'
                              : 'text-blue-800'
                        }`}>
                          Trial период истекает через {module.activation.days_until_expiration} {
                            module.activation.days_until_expiration === 1 ? 'день' : 
                            module.activation.days_until_expiration < 5 ? 'дня' : 'дней'
                          }
                        </div>
                        <div className={`text-xs mt-1 ${
                          module.activation.days_until_expiration <= 3 
                            ? 'text-red-600' 
                            : module.activation.days_until_expiration <= 7
                              ? 'text-yellow-600'
                              : 'text-blue-600'
                        }`}>
                          Активируйте полную версию, чтобы продолжить использование
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Информация о сроке активации */}
                {active && getModuleExpiresAt(module) && module.billing_model !== 'free' && module.activation?.status !== 'trial' && (
                  <div className="mb-4 p-3 bg-white rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-steel-600">Активен до:</span>
                      <span className="font-medium text-steel-900">{formatDate(getModuleExpiresAt(module))}</span>
                        </div>
                      </div>
                    )}

                <div className="space-y-3">
                  {active ? (
                    <>
                      {/* Автопродление для subscription модулей */}
                      {module.billing_model === 'subscription' && module.activation?.status !== 'trial' && (
                        <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <ArrowPathIcon className="h-4 w-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-900">Автопродление</span>
                            </div>
                            <p className="text-xs text-orange-700">
                              Автоматическое списание за день до истечения срока
                            </p>
                          </div>
                          <button
                            className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 hover:bg-orange-700"
                            title="Включено (работает автоматически)"
                            disabled
                          >
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6 shadow-sm" />
                          </button>
                        </div>
                      )}

                      <div className="flex items-center space-x-2">
                      {module.billing_model === 'free' ? (
                        // Для бесплатных модулей показываем информационный блок вместо кнопки продления
                        <div className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium rounded-lg">
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Постоянно активен
                        </div>
                      ) : (
                            <ProtectedComponent
                              permission="modules.renew"
                              role="organization_owner"
                              requireAll={false}
                              fallback={
                                <div className="flex-1 px-4 py-2 bg-gray-200 text-gray-500 text-sm font-medium rounded-lg text-center">
                                  Нет прав на продление
                                </div>
                              }
                            >
                            <button
                            onClick={() => handleRenewModule(module)}
                            disabled={actionInProgress}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
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
                            </ProtectedComponent>
                          )}
                      {module.can_deactivate !== false && (
                        <ProtectedComponent
                          permission="modules.deactivate"
                          role="organization_owner"
                          requireAll={false}
                          showFallback={false}
                        >
                          <button
                            onClick={() => handleDeactivateClick(module)}
                            disabled={actionInProgress}
                            className="px-4 py-2 border border-red-300 text-red-700 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center transition-colors"
                            title="Отменить модуль"
                          >
                            {actionLoading === `deactivation-preview-${module.slug}` || actionLoading === `deactivate-${module.slug}` ? (
                              <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            ) : (
                              <XMarkIcon className="h-4 w-4" />
                            )}
                          </button>
                        </ProtectedComponent>
                          )}
                        </div>
                        </>
                      ) : isDisabled ? (
                        // Кнопка для недоступных модулей
                        <button
                          disabled
                          className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-300 text-gray-500 text-sm font-medium rounded-lg cursor-not-allowed"
                          title={module.development_status?.description}
                        >
                          <XCircleIcon className="h-4 w-4 mr-2" />
                          {module.development_status?.status === 'coming_soon' ? 'Скоро доступен' : 
                           module.development_status?.status === 'development' ? 'В разработке' :
                           module.development_status?.status === 'deprecated' ? 'Устарел' : 'Недоступен'}
                        </button>
                      ) : (
                        <ProtectedComponent
                          permission="modules.activate"
                          role="organization_owner"
                          requireAll={false}
                          fallback={
                            <div className="w-full px-4 py-2 bg-gray-200 text-gray-500 text-sm font-medium rounded-lg text-center">
                              Нет прав на активацию
                        </div>
                          }
                        >
                        <div className="w-full space-y-2">
                          <div className="flex items-center space-x-2">
                            {/* Кнопка Пробного периода (только для платных модулей) */}
                            {module.billing_model !== 'free' && canActivate && (
                              <button
                                onClick={() => handleTrialClick(module)}
                                disabled={actionInProgress}
                                className="flex-1 inline-flex items-center justify-center px-4 py-2 border-2 border-orange-600 text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Попробовать бесплатно"
                              >
                                {actionLoading === `trial-check-${module.slug}` || actionLoading === `trial-activate-${module.slug}` ? (
                                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                ) : (
                                  <>
                                    <SparklesIcon className="h-4 w-4 mr-2" />
                                    Попробовать
                                  </>
                                )}
                              </button>
                            )}
                            
                            {/* Кнопка полной активации */}
                            <button
                              onClick={() => handleActivateClick(module)}
                              disabled={actionInProgress}
                              className={`${module.billing_model !== 'free' && canActivate ? 'flex-1' : 'w-full'} inline-flex items-center justify-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors`}
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
                          </div>
                        </div>
                        </ProtectedComponent>
                      )}
                </div>
              </div>
                );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-steel-400 mb-4">
              <PuzzlePieceIcon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-steel-900 mb-2">
              Модули не найдены
            </h3>
            <p className="text-steel-600">
              {selectedCategory === 'all' 
                ? 'Нет доступных модулей для организации!'
                : `В категории "${MODULE_CATEGORIES[selectedCategory]?.name || 'Неизвестная категория'}" модули отсутствуют`
              }
            </p>
          </div>
        )}
      </div>

      {/* Модальные окна */}
      <DevelopmentWarningModal
        module={selectedModule}
        isOpen={showDevelopmentWarning}
        onClose={() => {
          setShowDevelopmentWarning(false);
          setSelectedModule(null);
          setPreviewData(null);
        }}
        onConfirm={handleDevelopmentWarningConfirm}
      />

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

      <ModuleDeactivationPreviewModal
        module={selectedModule}
        isOpen={showDeactivationPreviewModal}
        onClose={() => {
          setShowDeactivationPreviewModal(false);
          setSelectedModule(null);
          setDeactivationPreviewData(null);
        }}
        onConfirm={handleDeactivatePreviewConfirm}
        isLoading={actionLoading?.startsWith('deactivate-') || false}
        previewData={deactivationPreviewData}
      />

    </div>
  );
};

export default ModulesPage; 