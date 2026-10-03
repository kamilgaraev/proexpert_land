import { hasAnalyticsConsent } from './marketingConsent';
import { readMarketingCookie, writeMarketingCookie } from './marketingCookies';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const;
type Attribution = Partial<Record<typeof UTM_KEYS[number], string>>;
const STORAGE_KEY = 'most.marketing-attribution';
const COOKIE_NAME = 'most_marketing_attribution';
const MAX_AGE = 60 * 60 * 24 * 30;
let current: Attribution = {};

const sanitize = (value: unknown): Attribution => {
  if (!value || typeof value !== 'object') return {};
  return Object.fromEntries(UTM_KEYS.flatMap((key) => {
    const item = (value as Record<string, unknown>)[key];
    return typeof item === 'string' && item.trim() ? [[key, item.trim().slice(0, 160)]] : [];
  }));
};

const storedAttribution = (): Attribution => {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return {};
  try {
    const raw = readMarketingCookie(COOKIE_NAME) ?? window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const record = JSON.parse(raw) as { values: unknown; expiresAt: number };
    return record.expiresAt > Date.now() ? sanitize(record.values) : {};
  } catch {
    return {};
  }
};

export const clearMarketingAttribution = (): void => {
  current = {};
  if (typeof window === 'undefined') return;
  writeMarketingCookie(COOKIE_NAME, '', 0);
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    return;
  }
};

export const captureMarketingAttribution = (search: string): void => {
  if (typeof window === 'undefined') return;
  const values = sanitize(Object.fromEntries(new URLSearchParams(search)));
  current = Object.keys(values).length ? values : Object.keys(current).length ? current : storedAttribution();
  if (!hasAnalyticsConsent() || !Object.keys(current).length) return;
  const serialized = JSON.stringify({ values: current, expiresAt: Date.now() + MAX_AGE * 1000 });
  if (encodeURIComponent(serialized).length <= 3600) writeMarketingCookie(COOKIE_NAME, serialized, MAX_AGE);
  try {
    window.sessionStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    return;
  }
};

export const getMarketingAttribution = (): Attribution => {
  if (typeof window === 'undefined') return {};
  captureMarketingAttribution(window.location.search);
  return { ...current };
};
