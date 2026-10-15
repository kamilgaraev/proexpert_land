import type { PublicSite, PublicSitePayload } from '@/types/holding-site-builder';

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

const getLocaleCode = (value: unknown): string | undefined =>
  typeof value === 'string' && normalizeHoldingLanguage(value) ? value : undefined;

export function getHoldingRequestLocale(search: string): string | null {
  const params = new URLSearchParams(search);
  return params.get('locale') ?? params.get('lang');
}

export function getHoldingLocalePrefix(pathname: string, site?: PublicSite): string | undefined {
  const prefix = normalizeHoldingPublicPath(pathname).split('/')[1];
  return Array.isArray(site?.enabled_locales) && site.enabled_locales.includes(prefix) ? getLocaleCode(prefix) : undefined;
}

export function getHoldingCanonicalSearch(search: string, resolvedLocale?: string, pathLocale?: string): string {
  const requestedLocale = getLocaleCode(pathLocale ?? getHoldingRequestLocale(search));
  if (!requestedLocale) return '';
  return `?${new URLSearchParams({ locale: getLocaleCode(resolvedLocale) ?? requestedLocale })}`;
}

export const normalizeHoldingPublicPath = (value: string): string =>
  `/${value.trim().replace(/^\/+|\/+$/g, '')}`;

const getHoldingContentPath = (payload: PublicSitePayload, pathname: string): string => {
  const path = normalizeHoldingPublicPath(pathname);
  return getHoldingLocalePrefix(path, payload.site)
    ? normalizeHoldingPublicPath(path.split('/').slice(2).join('/'))
    : path;
};

export function getHoldingCanonicalUrl(origin: string, pathname: string, search: string, payload?: PublicSitePayload | null): string {
  const path = payload ? getHoldingContentPath(payload, pathname) : normalizeHoldingPublicPath(pathname);
  const prefix = getHoldingLocalePrefix(pathname, payload?.site);
  const query = getHoldingCanonicalSearch(search, payload?.runtime.locale, prefix);
  const isDefaultLocale = payload && new URLSearchParams(query).get('locale') === getLocaleCode(payload.site.default_locale);
  return `${origin}${path}${isDefaultLocale ? '' : query}`;
}

export function hasHoldingPublicPage(payload: PublicSitePayload, pathname: string): boolean {
  const page = payload.current_page ?? payload.page;
  const path = getHoldingContentPath(payload, pathname);
  if (!page) return path === '/' && Array.isArray(payload.blocks);
  const slug = normalizeHoldingPublicPath(page.slug || '/');

  return (page.is_home && path === '/') || slug === path;
}
