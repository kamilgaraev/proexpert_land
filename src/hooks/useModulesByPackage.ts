import { useMemo } from 'react';
import { Module } from '@utils/api';
import { Package } from '@/types/module';

interface PackageGroup {
    packageSlug: string;
    packageName: string;
    packageColor: string;
    packageIcon: string;
    activeTier: string | null;
    modules: Module[];
}

interface UseModulesByPackageProps {
    modules: Module[];
    packages: Package[];
}

export const useModulesByPackage = ({ modules, packages }: UseModulesByPackageProps) => {
    return useMemo(() => {
        const slugToPackage = new Map<string, Package>();

        for (const pkg of packages) {
            for (const tierData of Object.values(pkg.tiers)) {
                for (const slug of tierData.modules) {
                    if (!slugToPackage.has(slug)) {
                        slugToPackage.set(slug, pkg);
                    }
                }
            }
        }

        const groups = new Map<string, PackageGroup>();
        const ungrouped: Module[] = [];

        for (const module of modules) {
            const pkg = slugToPackage.get(module.slug);

            if (!pkg) {
                ungrouped.push(module);
                continue;
            }

            if (!groups.has(pkg.slug)) {
                groups.set(pkg.slug, {
                    packageSlug: pkg.slug,
                    packageName: pkg.name,
                    packageColor: pkg.color,
                    packageIcon: pkg.icon,
                    activeTier: pkg.active_tier,
                    modules: [],
                });
            }

            groups.get(pkg.slug)!.modules.push(module);
        }

        const ordered = packages
            .map(pkg => groups.get(pkg.slug))
            .filter((g): g is PackageGroup => Boolean(g));

        if (ungrouped.length > 0) {
            ordered.push({
                packageSlug: '__other__',
                packageName: 'Прочие модули',
                packageColor: '#94A3B8',
                packageIcon: 'puzzle-piece',
                activeTier: null,
                modules: ungrouped,
            });
        }

        return ordered;
    }, [modules, packages]);
};
