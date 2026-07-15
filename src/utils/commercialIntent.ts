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
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const serializedIntent = serializeCommercialIntent(slugs);
    if (!serializedIntent) {
      window.sessionStorage.removeItem(commercialIntentStorageKey);
      return;
    }

    window.sessionStorage.setItem(commercialIntentStorageKey, serializedIntent);
  } catch {
    return;
  }
};

export const consumeCommercialIntent = (): CommercialIntentSlug[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const intent = parseCommercialIntent(window.sessionStorage.getItem(commercialIntentStorageKey));
    window.sessionStorage.removeItem(commercialIntentStorageKey);
    return intent;
  } catch {
    return [];
  }
};
