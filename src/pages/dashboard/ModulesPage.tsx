import { useState } from 'react';
import { motion } from 'framer-motion';
import { useModules } from '@hooks/useModules';
import { Module } from '@utils/api';
import ModuleStatusBadge from '@components/dashboard/ModuleStatusBadge';
import PackagesView from '@components/dashboard/PackagesView';
import {
  PuzzlePieceIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PlayIcon,
  XMarkIcon,
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
  Squares2X2Icon,
  InformationCircleIcon,
  RectangleGroupIcon,
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

  const handleAutoRenewToggle = async (module: Module, enabled: boolean) => {
    // Проверка на бесплатный модуль
    if (module.billing_model === 'free') {
      NotificationService.show({
        type: 'info',
        title: 'Автопродление недоступно',
        message: 'Бесплатные модули не требуют продления'
      });
      return;
    }

    // Проверка на модуль в подписке
    if (module.activation?.is_bundled_with_plan) {
      NotificationService.show({
        type: 'info',
        title: 'Управление через подписку',
        message: 'Этот модуль входит в подписку. Управляйте автопродлением подписки.'
      });
      return;
    }

    // Подтверждение при отключении
    if (!enabled) {
      const expiresDate = module.activation?.expires_at
        ? new Date(module.activation.expires_at).toLocaleDateString('ru-RU')
        : 'истечения срока';

      const confirmed = window.confirm(
        `Отключить автопродление?\n\nМодуль будет деактивирован после ${expiresDate}`
      );

      if (!confirmed) return;
    }

    setActionLoading(`auto-renew-${module.slug}`);

    try {
      const success = await toggleAutoRenew(module.slug, enabled);
      if (success) {
        NotificationService.show({
          type: 'success',
          title: enabled ? 'Автопродление включено' : 'Автопродление выключено',
          message: enabled
            ? 'Модуль будет автоматически продлен'
            : 'Модуль не будет продлен автоматически'
        });
      }
    } catch (error: any) {
      NotificationService.show({
        type: 'error',
        title: 'Ошибка',
        message: error.message || 'Не удалось изменить автопродление'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAutoRenew = async (enabled: boolean) => {
    const action = enabled ? 'включить' : 'выключить';
    const confirmed = window.confirm(
      `${enabled ? 'Включить' : 'Выключить'} автопродление для всех модулей?\n\nЭто действие затронет только активные платные модули.`
    );

    if (!confirmed) return;

    setActionLoading(`bulk-auto-renew-${enabled}`);

    try {
      const success = await bulkToggleAutoRenew(enabled);
      if (success) {
        NotificationService.show({
          type: 'success',
          title: 'Выполнено',
          message: `Автопродление ${enabled ? 'включено' : 'выключено'} для всех модулей`
        });
      }
    } catch (error: any) {
      NotificationService.show({
        type: 'error',
        title: 'Ошибка',
        message: error.message || `Не удалось ${action} автопродление`
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

  if (loading && activeTab === 'modules') return <PageLoading message="Загрузка модулей..." />;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 pb-20">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Модули и пакеты</h1>
            <p className="text-slate-500 text-lg">
              Расширяйте возможности вашей организации
            </p>
          </div>
        </div>

        {/* Переключатель вкладок */}
        <div className="bg-white inline-flex rounded-2xl border border-slate-200 shadow-sm p-1 gap-1">
          <button
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'packages'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
          >
            <RectangleGroupIcon className="w-4 h-4" />
            Пакеты
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'modules'
              ? 'bg-orange-600 text-white shadow-lg shadow-orange-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
              }`}
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
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Модули</h1>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold border border-orange-200">
                    {allModules.length} доступно
                  </span>
                </div>
                <p className="text-slate-500 text-lg">
                  Расширяйте возможности вашей организации с помощью дополнительных модулей
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Кнопки массового управления автопродлением */}
                <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  <button
                    onClick={() => handleBulkAutoRenew(true)}
                    disabled={loading || actionLoading?.startsWith('bulk-auto-renew')}
                    className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 disabled:opacity-50 transition-colors"
                    title="Включить автопродление для всех активных модулей"
                  >
                    <ArrowPathIcon className="h-4 w-4 mr-1" />
                    Вкл. автопродление
                  </button>
                  <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  <button
                    onClick={() => handleBulkAutoRenew(false)}
                    disabled={loading || actionLoading?.startsWith('bulk-auto-renew')}
                    className="inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    title="Выключить автопродление для всех активных модулей"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Выкл.
                  </button>
                </div>

                <button
                  onClick={refresh}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 disabled:opacity-50 transition-colors shadow-sm"
                >
                  <ArrowPathIcon className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Обновить
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3"
              >
                <XCircleIcon className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-red-900">Ошибка загрузки</h3>
                  <p className="text-red-800 mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Сводка */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-50 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                      <CheckCircleIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Активные</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {filteredModules.filter(m => isModuleActive(m.slug)).length}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">модулей используется</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-orange-50 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
                      <BanknotesIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Стоимость</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {filteredModules
                      .filter(m => isModuleActive(m.slug))
                      .reduce((sum, m) => sum + (m.billing_model !== 'free' ? (m.pricing_config?.base_price || m.price || 0) : 0), 0)
                      .toLocaleString('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 })}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">в месяц</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-yellow-50 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-yellow-50 rounded-2xl text-yellow-600">
                      <ClockIcon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Внимание</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {filteredModules.filter(m => expiringModules.some(exp => exp.slug === m.slug)).length}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">истекают скоро</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full transition-transform group-hover:scale-150 duration-500"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                      <Squares2X2Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Всего</span>
                  </div>
                  <p className="text-3xl font-bold text-slate-900">
                    {filteredModules.length}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">доступных модулей</p>
                </div>
              </div>
            </div>

            {/* Фильтр по категориям */}
            <div className="bg-white shadow-sm rounded-3xl p-2 border border-slate-200 inline-flex flex-wrap gap-1">
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
                    className={`flex items-center px-4 py-2.5 rounded-2xl text-sm font-bold transition-all border ${isSelected
                      ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-200'
                      : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                  >
                    <IconComponent className={`h-4 w-4 mr-2 ${isSelected ? 'text-white' : ''}`} />
                    <span>{categoryInfo?.name || 'Категория'}</span>
                    {isSelected && (
                      <span className="ml-2 bg-white/20 px-1.5 py-0.5 rounded-md text-xs text-white">
                        {stats.total}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Уведомления об истекающих модулях */}
            {hasExpiring && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-yellow-100 rounded-xl text-yellow-600 mt-1">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-bold text-yellow-900 text-lg">Требуется внимание</div>
                    <div className="text-yellow-800 mt-1 mb-3">
                      У следующих модулей истекает срок действия в ближайшие 7 дней:
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {expiringModules.map((module) => (
                        <div key={module.slug} className="inline-flex items-center bg-white border border-yellow-200 rounded-xl px-3 py-1.5 shadow-sm">
                          <span className="font-bold text-yellow-900 mr-2">{module.name}</span>
                          <span className="text-yellow-600 text-sm">до {formatDate(getModuleExpiresAt(module))}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Список модулей */}
            {filteredModules.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredModules.map((module) => {
                  const active = isModuleActive(module.slug);
                  const status = getModuleStatusText(module);
                  const ModuleIconComponent = getModuleIcon(module.icon || 'puzzle-piece', module);
                  const actionInProgress = actionLoading?.includes(module.slug);
                  const canActivate = module.development_status?.can_be_activated !== false;
                  const isDisabled = !active && !canActivate;

                  return (
                    <div
                      key={module.slug}
                      className={`relative bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col h-full ${active
                        ? 'border-orange-200 shadow-lg shadow-orange-100 ring-1 ring-orange-500/20'
                        : canActivate
                          ? 'border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200'
                          : 'border-slate-100 bg-slate-50/50 opacity-75'
                        }`}
                    >
                      {/* Status Badge */}
                      <div className="absolute top-6 right-6">
                        {module.billing_model === 'free' ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                            Бесплатно
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${isDisabled ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-700'
                            }`}>
                            {(module.pricing_config?.base_price || module.price || 0).toLocaleString('ru-RU', {
                              style: 'currency',
                              currency: module.pricing_config?.currency || module.currency || 'RUB',
                              maximumFractionDigits: 0
                            })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 mb-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${active ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white' :
                          canActivate ? 'bg-white border border-slate-100 text-slate-500 group-hover:text-orange-500 group-hover:border-orange-100' : 'bg-slate-100 text-slate-400'
                          }`}>
                          <ModuleIconComponent className="h-8 w-8" />
                        </div>
                        <div className="flex-1 pr-20">
                          <h3 className={`font-bold text-lg leading-tight mb-1 ${isDisabled ? 'text-slate-500' : 'text-slate-900'}`}>
                            {module.name}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <div className="flex items-center space-x-1">
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center w-fit ${active ? 'text-green-600 bg-green-50' :
                                status.text === 'Истекает скоро' ? 'text-yellow-600 bg-yellow-50' : 'text-slate-500 bg-slate-100'
                                }`}>
                                {active && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                                {status.text}
                              </span>
                            </div>

                            {!active && (
                              <span className="text-xs font-medium text-slate-500 px-2 py-0.5 bg-slate-50 rounded-md border border-slate-100">
                                {module.category ? MODULE_CATEGORIES[module.category as ModuleCategory]?.name : 'Модуль'}
                              </span>
                            )}

                            {module.activation?.status === 'trial' && (
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md flex items-center w-fit">
                                Trial
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <p className={`text-sm mb-6 line-clamp-2 flex-grow ${isDisabled ? 'text-slate-400' : 'text-slate-600'}`}>
                        {module.description}
                      </p>

                      {/* Features Preview */}
                      {module.features.length > 0 && !isDisabled && (
                        <div className="mb-6 space-y-2 bg-slate-50/50 rounded-xl p-3">
                          {module.features.slice(0, 2).map((feature, idx) => (
                            <div key={idx} className="flex items-start text-xs text-slate-600">
                              <CheckCircleIcon className="w-3.5 h-3.5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span className="line-clamp-1">{feature}</span>
                            </div>
                          ))}
                          {module.features.length > 2 && (
                            <button
                              onClick={() => toggleModuleExpanded(module.slug)}
                              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center pl-5"
                            >
                              {expandedModules.has(module.slug) ? 'Скрыть' : `Еще ${module.features.length - 2} функций`}
                            </button>
                          )}

                          {expandedModules.has(module.slug) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="space-y-2 pt-1"
                            >
                              {module.features.slice(2).map((feature, idx) => (
                                <div key={idx} className="flex items-start text-xs text-slate-600">
                                  <CheckCircleIcon className="w-3.5 h-3.5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="pt-4 mt-auto border-t border-slate-100">
                        <div className="flex gap-2">
                          {active ? (
                            <>
                              {module.billing_model !== 'free' && (
                                <button
                                  onClick={() => handleRenewModule(module)}
                                  disabled={actionInProgress}
                                  className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center"
                                >
                                  {actionLoading === `renew-${module.slug}` ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Продлить'}
                                </button>
                              )}

                              <div className="relative group/settings">
                                <button className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                                  <CogIcon className="w-5 h-5" />
                                </button>
                                {/* Settings dropdown could go here */}
                              </div>

                              {module.can_deactivate !== false && (
                                <button
                                  onClick={() => handleDeactivateClick(module)}
                                  disabled={actionInProgress}
                                  className="p-2.5 border border-red-100 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                  title="Отключить"
                                >
                                  <XMarkIcon className="w-5 h-5" />
                                </button>
                              )}
                            </>
                          ) : isDisabled ? (
                            <button disabled className="w-full py-2.5 bg-slate-100 text-slate-400 rounded-xl text-sm font-bold cursor-not-allowed">
                              Недоступен
                            </button>
                          ) : (
                            <>
                              {module.billing_model !== 'free' && canActivate && (
                                <button
                                  onClick={() => handleTrialClick(module)}
                                  disabled={actionInProgress}
                                  className="px-4 py-2.5 border-2 border-orange-100 text-orange-600 hover:bg-orange-50 hover:border-orange-200 rounded-xl text-sm font-bold transition-colors"
                                >
                                  Trial
                                </button>
                              )}
                              <button
                                onClick={() => handleActivateClick(module)}
                                disabled={actionInProgress}
                                className="flex-1 py-2.5 bg-slate-900 text-white hover:bg-orange-600 hover:shadow-lg hover:shadow-orange-200 rounded-xl text-sm font-bold transition-all flex items-center justify-center"
                              >
                                {actionLoading?.includes(module.slug) ? (
                                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                                ) : (
                                  <>
                                    <PlayIcon className="w-4 h-4 mr-2" />
                                    Активировать
                                  </>
                                )}
                              </button>
                            </>
                          )}
                        </div>

                        {/* Auto-renew info */}
                        {active && module.billing_model === 'subscription' && (
                          <div className="mt-3 flex items-center justify-between text-xs">
                            <span className="text-slate-400">Автопродление</span>
                            <button
                              onClick={() => handleAutoRenewToggle(module, !module.activation?.is_auto_renew_enabled)}
                              disabled={module.activation?.is_bundled_with_plan}
                              className={`font-bold ${module.activation?.is_auto_renew_enabled ? 'text-green-600' : 'text-slate-400'}`}
                            >
                              {module.activation?.is_auto_renew_enabled ? 'ВКЛЮЧЕНО' : 'ВЫКЛЮЧЕНО'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <PuzzlePieceIcon className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Модули не найдены
                </h3>
                <p className="text-slate-500 max-w-md mx-auto">
                  {selectedCategory === 'all'
                    ? 'Нет доступных модулей для организации. Попробуйте обновить страницу.'
                    : `В категории "${MODULE_CATEGORIES[selectedCategory]?.name || 'Неизвестная категория'}" модули пока отсутствуют.`
                  }
                </p>
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="mt-6 px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Показать все модули
                </button>
              </div>
            )}
          </>
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