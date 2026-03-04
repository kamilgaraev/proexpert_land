import { useState, useCallback, useEffect, useRef } from 'react';
import { packagesService, Package } from '@utils/api';

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

            if (response.status === 200 && response.data?.success) {
                const data: Package[] = response.data?.data ?? [];
                setState({ packages: data, loading: false, error: null });
            } else {
                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: response.data?.message || 'Не удалось загрузить пакеты',
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

                if (response.status === 200 && response.data?.success) {
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

                if (response.status === 200 && response.data?.success) {
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
