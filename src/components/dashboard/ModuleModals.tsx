import { useState } from 'react';
import {
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    BanknotesIcon,
    PuzzlePieceIcon,
    LockClosedIcon,
} from '@heroicons/react/24/outline';
import { Module } from '@utils/api';
import ModuleStatusBadge from '@components/dashboard/ModuleStatusBadge';
import type { ModuleAddonPreview } from '@utils/moduleAddons';

interface ActivationModalProps {
    module: Module | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (durationDays: number) => void;
    isLoading: boolean;
    previewData?: any;
}

interface DeactivationPreviewModalProps {
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

interface DetailsModalProps {
    module: Module | null;
    isOpen: boolean;
    onClose: () => void;
    addonPreviews: ModuleAddonPreview[];
}

export const ModuleActivationModal = ({
    module, isOpen, onClose, onConfirm, isLoading, previewData,
}: ActivationModalProps) => {
    const [durationDays, setDurationDays] = useState(30);

    if (!module || !isOpen) return null;

    const basePrice = module.pricing_config?.base_price || module.price || 0;
    const currency = module.pricing_config?.currency || module.currency || 'RUB';
    const fmt = (amount: number) => amount.toLocaleString('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-6">Активация модуля</h3>

                <div className="space-y-6">
                    <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-3">{module.name}</h4>
                        <div className="space-y-2 text-sm">
                            <div className="text-orange-700">
                                {fmt(basePrice)} / {module.pricing_config?.duration_days || module.duration_days} дней
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

                    <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Период активации</h4>
                        <div className="space-y-3">
                            <label className="flex items-center">
                                <input type="radio" checked={durationDays === 30} onChange={() => setDurationDays(30)} className="mr-2" />
                                30 дней ({fmt(basePrice)})
                            </label>
                            <label className="flex items-center">
                                <input type="radio" checked={durationDays === 90} onChange={() => setDurationDays(90)} className="mr-2" />
                                90 дней ({fmt(basePrice * 3 * 0.95)})
                                <span className="ml-1 text-xs text-green-600">-5%</span>
                            </label>
                            <label className="flex items-center">
                                <input type="radio" checked={durationDays === 365} onChange={() => setDurationDays(365)} className="mr-2" />
                                365 дней ({fmt(basePrice * 12 * 0.85)})
                                <span className="ml-1 text-xs text-green-600">-15%</span>
                            </label>
                        </div>
                    </div>

                    {previewData && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Информация об активации</h4>
                            <div className="bg-gray-50 rounded-lg p-4 space-y-3 text-sm">
                                {previewData.checks && (
                                    <div className="space-y-3">
                                        {!previewData.checks.can_afford && (
                                            <div className="bg-red-50 border border-red-200 rounded p-2 text-red-800 text-xs font-medium">
                                                ⚠️ Недостаточно средств на балансе
                                            </div>
                                        )}
                                        {previewData.checks.missing_dependencies?.length > 0 && (
                                            <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-yellow-800 text-xs">
                                                <div className="font-medium mb-1">⚠️ Недостающие зависимости:</div>
                                                <ul className="list-disc list-inside space-y-0.5">
                                                    {previewData.checks.missing_dependencies.map((dep: string, i: number) => (
                                                        <li key={i} className="text-yellow-700">{dep}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {previewData.checks.conflicts?.length > 0 && (
                                            <div className="bg-red-50 border border-red-200 rounded p-2 text-red-800 text-xs">
                                                <div className="font-medium mb-1">⚠️ Конфликты:</div>
                                                <ul className="list-disc list-inside">
                                                    {previewData.checks.conflicts.map((c: string, i: number) => <li key={i}>{c}</li>)}
                                                </ul>
                                            </div>
                                        )}
                                        {previewData.checks.is_already_active && (
                                            <div className="bg-blue-50 border border-blue-200 rounded p-2 text-blue-800 text-xs font-medium">
                                                ℹ️ Модуль уже активирован
                                            </div>
                                        )}
                                    </div>
                                )}
                                {previewData.module?.features?.length > 0 && (
                                    <div className="border-t pt-3">
                                        <div className="text-xs font-medium text-gray-700 mb-2">Возможности модуля:</div>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                            {previewData.module.features.slice(0, 3).map((feature: string, i: number) => (
                                                <li key={i} className="flex items-start">
                                                    <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                                                    {feature}
                                                </li>
                                            ))}
                                            {previewData.module.features.length > 3 && (
                                                <li className="text-gray-500 text-xs">И ещё {previewData.module.features.length - 3} возможностей...</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button onClick={onClose} className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                            Отменить
                        </button>
                        <button
                            onClick={() => onConfirm(durationDays)}
                            disabled={isLoading || (previewData && !previewData.can_activate)}
                            className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-60 font-medium"
                        >
                            {isLoading ? 'Активация...' : (previewData && !previewData.can_activate) ? 'Невозможно активировать' : 'Активировать'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ModuleDetailsModal = ({
    module,
    isOpen,
    onClose,
    addonPreviews,
}: DetailsModalProps) => {
    if (!module || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">Модуль «{module.name}»</h3>
                        <p className="text-sm text-slate-500 mt-1">{module.description}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50"
                    >
                        Закрыть
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <div className="text-sm font-semibold text-slate-900 mb-3">Что входит в базовый модуль</div>
                        <ul className="space-y-2">
                            {module.features.map((feature, index) => (
                                <li key={index} className="flex items-start text-sm text-slate-700">
                                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {addonPreviews.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <PuzzlePieceIcon className="h-5 w-5 text-orange-600" />
                                <h4 className="text-lg font-semibold text-slate-900">Расширения</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {addonPreviews.map((addon) => {
                                    const isActive = addon.availability === 'active';
                                    const isAvailable = addon.availability === 'available';

                                    return (
                                        <div key={addon.slug} className="rounded-2xl border border-slate-200 p-4 bg-white">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div>
                                                    <div className="text-sm font-bold text-slate-900">{addon.name}</div>
                                                    {addon.badge && (
                                                        <div className="mt-1 inline-flex rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                                                            {addon.badge}
                                                        </div>
                                                    )}
                                                </div>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                                                        isActive
                                                            ? 'bg-green-100 text-green-700'
                                                            : isAvailable
                                                                ? 'bg-blue-100 text-blue-700'
                                                                : 'bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {isActive ? 'Активно' : isAvailable ? 'Доступно' : 'Скоро'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600 mb-3">{addon.description}</p>
                                            <div className="flex items-center justify-between gap-3 text-xs">
                                                <span className="text-slate-500">
                                                    {addon.module?.pricing_config?.base_price
                                                        ? `${addon.module.pricing_config.base_price.toLocaleString('ru-RU')} ₽ / ${addon.module.pricing_config.duration_days} дн.`
                                                        : addon.pricingHint || 'Детали тарифа появятся позже'}
                                                </span>
                                                <span className="inline-flex items-center text-slate-500">
                                                    {!module.activation && <LockClosedIcon className="h-3.5 w-3.5 mr-1" />}
                                                    {module.activation
                                                        ? isActive
                                                            ? 'Управление позже'
                                                            : 'Подключение позже'
                                                        : 'Доступно после активации модуля'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const DevelopmentWarningModal = ({ module, isOpen, onClose, onConfirm }: DevelopmentWarningModalProps) => {
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
                <p className="text-gray-700 mb-6">{development_status.warning_message}</p>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                        Отмена
                    </button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium">
                        Продолжить
                    </button>
                </div>
            </div>
        </div>
    );
};

const getWarningIcon = (severity: string) => {
    if (severity === 'error') return <XCircleIcon className="h-5 w-5 text-red-500" />;
    if (severity === 'warning') return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
    return <InformationCircleIcon className="h-5 w-5 text-blue-500" />;
};

const getWarningBgColor = (severity: string) => {
    if (severity === 'error') return 'bg-red-50 border-red-200';
    if (severity === 'warning') return 'bg-yellow-50 border-yellow-200';
    return 'bg-blue-50 border-blue-200';
};

const getWarningTextColor = (severity: string) => {
    if (severity === 'error') return 'text-red-800';
    if (severity === 'warning') return 'text-yellow-800';
    return 'text-blue-800';
};

const formatCurrency = (amount: number, currency = 'RUB') =>
    new Intl.NumberFormat('ru-RU', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);

export const ModuleDeactivationPreviewModal = ({
    module, isOpen, onClose, onConfirm, isLoading, previewData,
}: DeactivationPreviewModalProps) => {
    if (!module || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-6 text-red-900">
                    Вы действительно хотите отключить модуль «{module.name}»?
                </h3>

                <div className="space-y-6">
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
                                            Использовано {Math.round(previewData.activation.days_used)} из{' '}
                                            {Math.round(previewData.activation.days_used + (previewData.activation.days_remaining || 0))} дней
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {previewData?.what_you_lose && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h4 className="font-semibold text-orange-900 mb-3 flex items-center">
                                <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                Что вы потеряете
                            </h4>
                            <div className="space-y-3">
                                {previewData.what_you_lose.features?.length > 0 && (
                                    <div>
                                        <div className="text-sm font-medium text-orange-800 mb-1">Возможности:</div>
                                        <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                                            {previewData.what_you_lose.features.map((f: string, i: number) => <li key={i}>{f}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {previewData.what_you_lose.functionality?.length > 0 && (
                                    <div>
                                        <div className="text-sm font-medium text-orange-800 mb-1">Функциональность:</div>
                                        <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                                            {previewData.what_you_lose.functionality.map((f: string, i: number) => <li key={i}>{f}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {previewData?.dependent_modules?.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                                <XCircleIcon className="h-5 w-5 mr-2" />
                                Зависимые модули
                            </h4>
                            <div className="space-y-2">
                                {previewData.dependent_modules.map((dep: any, i: number) => (
                                    <div key={i} className="bg-red-100 rounded p-2">
                                        <div className="font-medium text-red-900">{dep.name}</div>
                                        <div className="text-sm text-red-700">{dep.description}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {previewData?.warnings?.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <InformationCircleIcon className="h-5 w-5 mr-2" />
                                Предупреждения
                            </h4>
                            <div className="space-y-2">
                                {[...previewData.warnings]
                                    .sort((a: any, b: any) => {
                                        const order: Record<string, number> = { error: 0, warning: 1, info: 2 };
                                        return order[a.severity] - order[b.severity];
                                    })
                                    .map((w: any, i: number) => (
                                        <div key={i} className={`border rounded p-3 flex items-start ${getWarningBgColor(w.severity)}`}>
                                            <div className="mr-3 mt-0.5">{getWarningIcon(w.severity)}</div>
                                            <div className={`text-sm ${getWarningTextColor(w.severity)}`}>{w.message}</div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button onClick={onClose} className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
                            Отменить
                        </button>
                        {previewData?.can_proceed ? (
                            <button onClick={onConfirm} disabled={isLoading} className="flex-1 py-3 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 font-medium">
                                {isLoading ? 'Отключение...' : 'Да, отключить'}
                            </button>
                        ) : previewData?.dependent_modules?.length > 0 ? (
                            <button disabled className="flex-1 py-3 px-4 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed">
                                Сначала отключите зависимые модули
                            </button>
                        ) : (
                            <button disabled className="flex-1 py-3 px-4 bg-gray-400 text-white rounded-lg font-medium cursor-not-allowed">
                                Невозможно отключить
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
