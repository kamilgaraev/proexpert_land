import type { PublicSitePayload } from '@/types/holding-site-builder';

export interface HoldingPublicPageState {
  pathname: string;
  search: string;
  status: number;
  payload?: PublicSitePayload;
  message?: string;
}

const normalizeHoldingLanguage = (value: unknown): string | undefined => {
  const locale = typeof value === 'string' ? value.replace(/_/g, '-') : '';
  return /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(locale) ? locale : undefined;
};

export function getHoldingPageLanguage(payload?: PublicSitePayload | null): string {
  return normalizeHoldingLanguage(payload?.runtime.locale)
    ?? normalizeHoldingLanguage(payload?.site.default_locale)
    ?? 'ru';
}

export function getHoldingCanonicalSearch(search: string, resolvedLocale?: string): string {
  const params = new URLSearchParams(search);
  const requestedLocale = normalizeHoldingLanguage(params.get('locale') ?? params.get('lang'));
  if (!requestedLocale) return '';
  return `?${new URLSearchParams({ locale: normalizeHoldingLanguage(resolvedLocale) ?? requestedLocale })}`;
}

export function hasHoldingPublicPage(payload: PublicSitePayload, pathname: string): boolean {
  const page = payload.current_page ?? payload.page;
  const normalize = (value: string) => `/${value.trim().replace(/^\/+|\/+$/g, '')}`;
  const path = normalize(pathname);
  const slug = normalize(page?.slug || '/');

  return Boolean(page && ((page.is_home && path === '/') || slug === path));
}
