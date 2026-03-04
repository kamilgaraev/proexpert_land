import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePackages } from '@hooks/usePackages';
import { Package, PackageTierKey } from '@/types/module';
import {
    CheckCircleIcon,
    ArrowPathIcon,
    SparklesIcon,
    ClipboardDocumentListIcon,
    BanknotesIcon,
    CubeIcon,
    ChartBarIcon,
    CpuChipIcon,
    GlobeAltIcon,
    BuildingOffice2Icon,
} from '@heroicons/react/24/outline';
import { PageLoading } from '@components/common/PageLoading';
import NotificationService from '@components/shared/NotificationService';

const PACKAGE_ICONS: Record<string, React.ElementType> = {
    'clipboard-document-list': ClipboardDocumentListIcon,
    'banknotes': BanknotesIcon,
    'cube': CubeIcon,
    'chart-bar': ChartBarIcon,
    'cpu-chip': CpuChipIcon,
    'globe-alt': GlobeAltIcon,
    'building-office-2': BuildingOffice2Icon,
};

const TIER_ORDER: PackageTierKey[] = ['base', 'pro', 'enterprise'];

const TIER_LABELS: Record<PackageTierKey, string> = {
    base: 'Базовый',
    pro: 'Профессиональный',
    enterprise: 'Enterprise',
};

const TIER_COLORS: Record<PackageTierKey, { bg: string; text: string; border: string; btn: string }> = {
    base: {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        btn: 'bg-slate-900 text-white hover:bg-slate-700',
    },
    pro: {
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        btn: 'bg-orange-600 text-white hover:bg-orange-700',
    },
    enterprise: {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        btn: 'bg-indigo-600 text-white hover:bg-indigo-700',
    },
};

interface PackageCardProps {
    pkg: Package;
    onSubscribe: (slug: string, tier: PackageTierKey) => void;
    onUnsubscribe: (slug: string) => void;
    loading: boolean;
}

const PackageCard = ({ pkg, onSubscribe, onUnsubscribe, loading }: PackageCardProps) => {
    const IconComponent = PACKAGE_ICONS[pkg.icon] ?? CpuChipIcon;
    const availableTiers = TIER_ORDER.filter(t => pkg.tiers[t]);
    const activeTier = pkg.active_tier;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
        >
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                    <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: pkg.color + '20' }}
                    >
                        <IconComponent className="w-7 h-7" style={{ color: pkg.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{pkg.name}</h3>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{pkg.description}</p>
                    </div>
                    {activeTier && (
                        <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200">
                            <CheckCircleIcon className="w-3.5 h-3.5" />
                            {TIER_LABELS[activeTier]}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex flex-col flex-grow divide-y divide-slate-100">
                {availableTiers.map(tierKey => {
                    const tier = pkg.tiers[tierKey]!;
                    const colors = TIER_COLORS[tierKey];
                    const isActive = activeTier === tierKey;
                    const isHigherTier = activeTier && TIER_ORDER.indexOf(tierKey) > TIER_ORDER.indexOf(activeTier);
                    const isLowerTier = activeTier && TIER_ORDER.indexOf(tierKey) < TIER_ORDER.indexOf(activeTier);

                    return (
                        <div key={tierKey} className={`p-5 ${isActive ? colors.bg : 'bg-white'}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <span className={`text-sm font-bold ${isActive ? colors.text : 'text-slate-700'}`}>
                                        {TIER_LABELS[tierKey]}
                                    </span>
                                    {tier.price === 0 ? (
                                        <span className="ml-2 text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                            Бесплатно
                                        </span>
                                    ) : (
                                        <span className="ml-2 text-xs text-slate-500">
                                            {tier.price.toLocaleString('ru-RU')} ₽/мес
                                        </span>
                                    )}
                                </div>
                                {isActive && (
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                                        Активен
                                    </span>
                                )}
                            </div>

                            <ul className="space-y-1.5 mb-4">
                                {tier.highlights.slice(0, 4).map((h, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                        <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-1">{h}</span>
                                    </li>
                                ))}
                            </ul>

                            {isActive ? (
                                tierKey !== 'base' && (
                                    <button
                                        onClick={() => onUnsubscribe(pkg.slug)}
                                        disabled={loading}
                                        className="w-full py-2 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                                    >
                                        {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin mx-auto" /> : 'Отключить'}
                                    </button>
                                )
                            ) : isLowerTier ? (
                                <div className="w-full py-2 text-center text-xs text-slate-400">
                                    Включён в ваш тариф
                                </div>
                            ) : (
                                <button
                                    onClick={() => onSubscribe(pkg.slug, tierKey)}
                                    disabled={loading}
                                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md disabled:opacity-50 ${colors.btn}`}
                                >
                                    {loading ? (
                                        <ArrowPathIcon className="w-4 h-4 animate-spin mx-auto" />
                                    ) : isHigherTier ? (
                                        'Улучшить'
                                    ) : tier.price === 0 ? (
                                        'Подключить бесплатно'
                                    ) : (
                                        'Подключить'
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

const PackagesView = () => {
    const { packages, loading, error, refresh, subscribeToPackage, unsubscribeFromPackage } = usePackages();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const handleSubscribe = async (slug: string, tier: PackageTierKey) => {
        setActionLoading(slug);
        try {
            const success = await subscribeToPackage(slug, tier);
            if (success) {
                NotificationService.show({ type: 'success', title: 'Готово', message: 'Пакет успешно подключён' });
            } else {
                NotificationService.show({ type: 'error', title: 'Ошибка', message: 'Не удалось подключить пакет' });
            }
        } finally {
            setActionLoading(null);
        }
    };

    const handleUnsubscribe = async (slug: string) => {
        const confirmed = window.confirm('Отключить пакет? Все входящие в него платные модули будут деактивированы.');
        if (!confirmed) return;

        setActionLoading(slug);
        try {
            const success = await unsubscribeFromPackage(slug);
            if (success) {
                NotificationService.show({ type: 'success', title: 'Готово', message: 'Пакет отключён' });
            } else {
                NotificationService.show({ type: 'error', title: 'Ошибка', message: 'Не удалось отключить пакет' });
            }
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) return <PageLoading message="Загрузка пакетов..." />;

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                <p className="text-red-700 font-medium">{error}</p>
                <button onClick={refresh} className="mt-3 text-sm text-red-600 hover:underline">
                    Повторить
                </button>
            </div>
        );
    }

    const activeCount = packages.filter(p => p.active_tier !== null).length;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-xl">
                        <SparklesIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">
                            Активно <strong className="text-slate-800">{activeCount}</strong> из{' '}
                            <strong className="text-slate-800">{packages.length}</strong> пакетов
                        </p>
                    </div>
                </div>
                <button
                    onClick={refresh}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Обновить
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {packages.map(pkg => (
                    <PackageCard
                        key={pkg.slug}
                        pkg={pkg}
                        onSubscribe={handleSubscribe}
                        onUnsubscribe={handleUnsubscribe}
                        loading={actionLoading === pkg.slug}
                    />
                ))}
            </div>
        </div>
    );
};

export default PackagesView;
