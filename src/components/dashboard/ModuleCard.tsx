import { motion } from 'framer-motion';
import { CheckCircleIcon, ArrowPathIcon, PlayIcon, XMarkIcon, CogIcon } from '@heroicons/react/24/outline';
import { Module } from '@utils/api';
import { getModuleIcon } from '@utils/moduleIconMapper';

interface ModuleCardProps {
    module: Module;
    isActive: boolean;
    isExpanded: boolean;
    statusText: { text: string };
    actionLoading: string | null;
    onActivate: (module: Module) => void;
    onTrial: (module: Module) => void;
    onDeactivate: (module: Module) => void;
    onRenew: (module: Module) => void;
    onToggleExpand: (slug: string) => void;
    onAutoRenewToggle: (module: Module, enabled: boolean) => void;
}

const ModuleCard = ({
    module,
    isActive,
    isExpanded,
    statusText,
    actionLoading,
    onActivate,
    onTrial,
    onDeactivate,
    onRenew,
    onToggleExpand,
    onAutoRenewToggle,
}: ModuleCardProps) => {
    const canActivate = module.development_status?.can_be_activated !== false;
    const isDisabled = !isActive && !canActivate;
    const actionInProgress = !!actionLoading?.includes(module.slug);
    const IconComponent = getModuleIcon(module.icon || 'puzzle-piece', module);

    const basePrice = module.pricing_config?.base_price || module.price || 0;
    const currency = module.pricing_config?.currency || module.currency || 'RUB';

    return (
        <div
            className={`relative bg-white rounded-3xl p-6 border transition-all duration-300 flex flex-col h-full ${isActive
                    ? 'border-orange-200 shadow-lg shadow-orange-100 ring-1 ring-orange-500/20'
                    : canActivate
                        ? 'border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200'
                        : 'border-slate-100 bg-slate-50/50 opacity-75'
                }`}
        >
            <div className="absolute top-6 right-6">
                {module.billing_model === 'free' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800">
                        Бесплатно
                    </span>
                ) : (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${isDisabled ? 'bg-slate-100 text-slate-500' : 'bg-slate-100 text-slate-700'}`}>
                        {basePrice.toLocaleString('ru-RU', { style: 'currency', currency, maximumFractionDigits: 0 })}
                    </span>
                )}
            </div>

            <div className="flex items-center space-x-4 mb-6">
                <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${isActive
                            ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white'
                            : canActivate
                                ? 'bg-white border border-slate-100 text-slate-500'
                                : 'bg-slate-100 text-slate-400'
                        }`}
                >
                    <IconComponent className="h-8 w-8" />
                </div>
                <div className="flex-1 pr-20">
                    <h3 className={`font-bold text-lg leading-tight mb-1 ${isDisabled ? 'text-slate-500' : 'text-slate-900'}`}>
                        {module.name}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-md flex items-center w-fit ${isActive
                                    ? 'text-green-600 bg-green-50'
                                    : statusText.text === 'Истекает скоро'
                                        ? 'text-yellow-600 bg-yellow-50'
                                        : 'text-slate-500 bg-slate-100'
                                }`}
                        >
                            {isActive && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                            {statusText.text}
                        </span>
                        {module.activation?.status === 'trial' && (
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">Trial</span>
                        )}
                    </div>
                </div>
            </div>

            <p className={`text-sm mb-6 line-clamp-2 flex-grow ${isDisabled ? 'text-slate-400' : 'text-slate-600'}`}>
                {module.description}
            </p>

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
                            onClick={() => onToggleExpand(module.slug)}
                            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center pl-5"
                        >
                            {isExpanded ? 'Скрыть' : `Ещё ${module.features.length - 2} функций`}
                        </button>
                    )}
                    {isExpanded && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2 pt-1">
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

            <div className="pt-4 mt-auto border-t border-slate-100">
                <div className="flex gap-2">
                    {isActive ? (
                        <>
                            {module.billing_model !== 'free' && (
                                <button
                                    onClick={() => onRenew(module)}
                                    disabled={actionInProgress}
                                    className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center"
                                >
                                    {actionLoading === `renew-${module.slug}` ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : 'Продлить'}
                                </button>
                            )}
                            <div className="relative">
                                <button className="p-2.5 border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                                    <CogIcon className="w-5 h-5" />
                                </button>
                            </div>
                            {module.can_deactivate !== false && (
                                <button
                                    onClick={() => onDeactivate(module)}
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
                                    onClick={() => onTrial(module)}
                                    disabled={actionInProgress}
                                    className="px-4 py-2.5 border-2 border-orange-100 text-orange-600 hover:bg-orange-50 hover:border-orange-200 rounded-xl text-sm font-bold transition-colors"
                                >
                                    Trial
                                </button>
                            )}
                            <button
                                onClick={() => onActivate(module)}
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

                {isActive && module.billing_model === 'subscription' && (
                    <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Автопродление</span>
                        <button
                            onClick={() => onAutoRenewToggle(module, !module.activation?.is_auto_renew_enabled)}
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
};

export default ModuleCard;
