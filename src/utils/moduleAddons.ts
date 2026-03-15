import type { Module } from '@utils/api';

export type ModuleAddonAvailability = 'planned' | 'available' | 'active';

export interface ModuleAddonDefinition {
  slug: string;
  name: string;
  description: string;
  badge?: string;
  pricingHint?: string;
}

export interface ModuleAddonPreview extends ModuleAddonDefinition {
  availability: ModuleAddonAvailability;
  module?: Module;
}

const MODULE_ADDON_REGISTRY: Record<string, ModuleAddonDefinition[]> = {
  'video-monitoring': [
    {
      slug: 'video-archive',
      name: 'Видеоархив',
      description: 'Запись, хранение и просмотр архива по камерам и объектам.',
      badge: 'Архив',
      pricingHint: 'Платное расширение',
    },
    {
      slug: 'video-wall',
      name: 'Видеостена',
      description: 'Одновременный просмотр нескольких камер в диспетчерском режиме.',
      badge: 'Multi-view',
      pricingHint: 'Платное расширение',
    },
    {
      slug: 'video-low-latency',
      name: 'Низкая задержка',
      description: 'Почти realtime-просмотр потока для оперативного контроля объекта.',
      badge: 'Low latency',
      pricingHint: 'Премиум',
    },
    {
      slug: 'video-analytics',
      name: 'Видеоаналитика',
      description: 'События, уведомления и будущие AI-сценарии поверх видеопотока.',
      badge: 'AI / Events',
      pricingHint: 'Скоро',
    },
  ],
};

const ADDON_SLUGS = new Set(
  Object.values(MODULE_ADDON_REGISTRY).flat().map((addon) => addon.slug),
);

export const getCatalogModules = (modules: Module[]): Module[] =>
  modules.filter((module) => !ADDON_SLUGS.has(module.slug));

export const getModuleAddonCount = (moduleSlug: string): number =>
  MODULE_ADDON_REGISTRY[moduleSlug]?.length ?? 0;

export const getModuleAddonPreviews = (
  moduleSlug: string,
  modules: Module[],
): ModuleAddonPreview[] => {
  const definitions = MODULE_ADDON_REGISTRY[moduleSlug] ?? [];

  return definitions.map((definition) => {
    const addonModule = modules.find((module) => module.slug === definition.slug);

    if (!addonModule) {
      return {
        ...definition,
        availability: 'planned',
      };
    }

    return {
      ...definition,
      module: addonModule,
      availability: addonModule.activation ? 'active' : 'available',
    };
  });
};
