import { useState, useCallback, useEffect, useRef } from 'react';
import { packagesService, Package, PackageTierConfig } from '@utils/api';

interface UsePackagesState {
    packages: Package[];
    loading: boolean;
    error: string | null;
}

interface UsePackagesReturn extends UsePackagesState {
    refresh: () => void;
    subscribeToPackage: (slug: string, tier: string, durationDays?: number) => Promise<boolean>;
    unsubscribeFromPackage: (slug: string) => Promise<boolean>;
    getPackage: (slug: string) => Package | undefined;
    isPackageActive: (slug: string) => boolean;
    getActiveTier: (slug: string) => string | null;
}

type ApiResponseLike = {
    data?: unknown;
    status?: number;
};

const BUSINESS_LABELS: Record<string, string> = {
    'objects-execution': 'Объекты и исполнение',
    'supply-warehouse': 'Снабжение и склад',
    'finance-acts': 'Финансы и акты',
    'estimates-pto': 'Сметы и ПТО',
    'holding-analytics': 'Холдинг и аналитика',
    'ai-contour': 'AI-контур',
    'project-management': 'Управление проектами',
    'schedule-management': 'График работ',
    'time-tracking': 'Учёт времени',
    'site-requests': 'Заявки с объекта',
    'basic-warehouse': 'Складской учёт',
    'video-monitoring': 'Видео с площадки',
    users: 'Пользователи',
    organizations: 'Организации',
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
    Boolean(value) && typeof value === 'object' && !Array.isArray(value)
);

const arrayOrEmpty = <T,>(value: unknown): T[] => (
    Array.isArray(value) ? value as T[] : []
);

const unwrapResponsePayload = (response: ApiResponseLike): unknown => {
    const root = response?.data;

    if (isRecord(root) && isRecord(root.data) && isRecord(root.data.data)) {
        return root.data.data;
    }

    if (isRecord(root) && root.data !== undefined) {
        return root.data;
    }

    return root;
};

const normalizeTier = (tier: PackageTierConfig | undefined): PackageTierConfig | undefined => {
    if (!tier) {
        return undefined;
    }

    const modules = arrayOrEmpty<string>(tier.modules);
    const includedModules = arrayOrEmpty<string>(tier.included_modules);

    return {
        ...tier,
        modules,
        included_modules: includedModules.length > 0 ? includedModules : modules,
        highlights: arrayOrEmpty<string>(tier.highlights).map(item => BUSINESS_LABELS[item] ?? item),
    };
};

const normalizeLinkedItem = <T extends { label?: string; module_slug?: string; package_slug?: string }>(item: T): T => ({
    ...item,
    label: item.label || BUSINESS_LABELS[item.module_slug ?? ''] || BUSINESS_LABELS[item.package_slug ?? ''] || 'Возможность',
});

const normalizePackage = (item: Package): Package => ({
    ...item,
    name: item.name || BUSINESS_LABELS[item.slug] || 'Решение',
    foundation_modules: arrayOrEmpty<string>(item.foundation_modules),
    integrations: arrayOrEmpty<Package['integrations'][number]>(item.integrations).map(normalizeLinkedItem),
    recommended_addons: arrayOrEmpty<Package['recommended_addons'][number]>(item.recommended_addons).map(normalizeLinkedItem),
    business_outcomes: arrayOrEmpty<string>(item.business_outcomes),
    data_sources: arrayOrEmpty<Package['data_sources'][number]>(item.data_sources).map(normalizeLinkedItem),
    capabilities: arrayOrEmpty<Package['capabilities'][number]>(item.capabilities).map(normalizeLinkedItem),
    tiers: {
        base: normalizeTier(item.tiers?.base),
        pro: normalizeTier(item.tiers?.pro),
        enterprise: normalizeTier(item.tiers?.enterprise),
    },
});

const extractPackages = (response: ApiResponseLike): Package[] => {
    const payload = unwrapResponsePayload(response);

    if (Array.isArray(payload)) {
        return payload.map(item => normalizePackage(item as Package));
    }

    if (isRecord(payload) && Array.isArray(payload.packages)) {
        return payload.packages.map(item => normalizePackage(item as Package));
    }

    return [];
};

const getResponseMessage = (response: ApiResponseLike, fallback: string): string => {
    const data = isRecord(response.data) ? response.data : null;

    return typeof data?.message === 'string' ? data.message : fallback;
};

export const usePackages = (): UsePackagesReturn => {
    const [state, setState] = useState<UsePackagesState>({
        packages: [],
        loading: true,
        error: null,
    });

    const isLoadingRef = useRef(false);

    const fetchPackages = useCallback(async () => {
        if (isLoadingRef.current) return;

        try {
            isLoadingRef.current = true;
            setState(prev => ({ ...prev, loading: true, error: null }));

            const response = await packagesService.getPackages();

            if (response.status === 200 && response.data?.success !== false) {
                setState({ packages: extractPackages(response), loading: false, error: null });
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: getResponseMessage(response, 'Не удалось загрузить пакеты'),
                }));
            }
        } catch (err: any) {
            setState(prev => ({
                ...prev,
                loading: false,
                error: err.message || 'Ошибка загрузки пакетов',
            }));
        } finally {
            isLoadingRef.current = false;
        }
    }, []);

    useEffect(() => {
        fetchPackages();
    }, [fetchPackages]);

    const refresh = useCallback(() => {
        if (!isLoadingRef.current) {
            fetchPackages();
        }
    }, [fetchPackages]);

    const subscribeToPackage = useCallback(
        async (slug: string, tier: string, durationDays = 30): Promise<boolean> => {
            try {
                const response = await packagesService.subscribe(slug, tier, durationDays);

                if (response.status === 200 && response.data?.success !== false) {
                    await fetchPackages();
                    return true;
                }

                return false;
            } catch {
                return false;
            }
        },
        [fetchPackages]
    );

    const unsubscribeFromPackage = useCallback(
        async (slug: string): Promise<boolean> => {
            try {
                const response = await packagesService.unsubscribe(slug);

                if (response.status === 200 && response.data?.success !== false) {
                    await fetchPackages();
                    return true;
                }

                return false;
            } catch {
                return false;
            }
        },
        [fetchPackages]
    );

    const getPackage = useCallback(
        (slug: string) => state.packages.find(p => p.slug === slug),
        [state.packages]
    );

    const isPackageActive = useCallback(
        (slug: string) => {
            const pkg = state.packages.find(p => p.slug === slug);
            return pkg?.active_tier !== null && pkg?.active_tier !== undefined;
        },
        [state.packages]
    );

    const getActiveTier = useCallback(
        (slug: string) => state.packages.find(p => p.slug === slug)?.active_tier ?? null,
        [state.packages]
    );

    return {
        ...state,
        refresh,
        subscribeToPackage,
        unsubscribeFromPackage,
        getPackage,
        isPackageActive,
        getActiveTier,
    };
};
