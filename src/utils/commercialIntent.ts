import { commercialPackages, type CommercialPackageSlug } from '@/data/marketing/packages';

export const commercialIntentStorageKey = 'most:commercial-package-intent';
export type CommercialIntentSlug = CommercialPackageSlug | 'full-suite';

const allowedIntents = new Set<CommercialIntentSlug>([
  ...commercialPackages.map((item) => item.slug),
  'full-suite',
]);

export const parseCommercialIntent = (value: string | null): CommercialIntentSlug[] => {
  if (!value) {
    return [];
  }

  const unique = new Set(
    value
      .split(',')
      .map((item) => item.trim())
      .filter((item): item is CommercialIntentSlug => allowedIntents.has(item as CommercialIntentSlug)),
  );

  if (unique.has('full-suite')) {
    return ['full-suite'];
  }

  return Array.from(unique);
};

export const serializeCommercialIntent = (slugs: readonly CommercialIntentSlug[]): string => (
  parseCommercialIntent(slugs.join(',')).join(',')
);

export const rememberCommercialIntent = (slugs: readonly CommercialIntentSlug[]): void => {
  if (typeof window === 'undefined' || slugs.length === 0) {
    return;
  }

  try {
    window.sessionStorage.setItem(commercialIntentStorageKey, serializeCommercialIntent(slugs));
  } catch {
    return;
  }
};
