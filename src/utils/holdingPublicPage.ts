import type { PublicSite, PublicSitePayload } from '@/types/holding-site-builder';
import { decodeHoldingPathname } from '@/utils/holdingDomain';

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

const getLocalePrefixForPath = (path: string, site?: PublicSite): string | undefined => {
  const prefix = path.split('/')[1];
  return Array.isArray(site?.enabled_locales) && site.enabled_locales.includes(prefix) ? getLocaleCode(prefix) : undefined;
};

export function getHoldingLocalePrefix(pathname: string, site?: PublicSite): string | undefined {
  return getLocalePrefixForPath(normalizeHoldingPublicPath(decodeHoldingPathname(pathname)), site);
}

export function getHoldingCanonicalSearch(search: string, resolvedLocale?: string, pathLocale?: string): string {
  const requestedLocale = getLocaleCode(pathLocale ?? getHoldingRequestLocale(search));
  if (!requestedLocale) return '';
  return `?${new URLSearchParams({ locale: getLocaleCode(resolvedLocale) ?? requestedLocale })}`;
}

export const normalizeHoldingPublicPath = (value: string): string =>
  `/${value.trim().replace(/^\/+|\/+$/g, '')}`;

export const getHoldingContentPath = (pathname: string, site?: PublicSite): string => {
  const path = normalizeHoldingPublicPath(decodeHoldingPathname(pathname));
  return getLocalePrefixForPath(path, site)
    ? normalizeHoldingPublicPath(path.split('/').slice(2).join('/'))
    : path;
};

export function getHoldingCanonicalUrl(origin: string, pathname: string, search: string, payload?: PublicSitePayload | null): string {
  const path = getHoldingContentPath(pathname, payload?.site);
  const prefix = getHoldingLocalePrefix(pathname, payload?.site);
  const query = getHoldingCanonicalSearch(search, payload?.runtime.locale, prefix);
  const isDefaultLocale = payload && new URLSearchParams(query).get('locale') === getLocaleCode(payload.site.default_locale);
  const url = new URL(origin);
  url.pathname = path;
  url.search = isDefaultLocale ? '' : query;
  return url.toString();
}

export function hasHoldingPublicPage(payload: PublicSitePayload, pathname: string): boolean {
  const page = payload.current_page ?? payload.page;
  const path = getHoldingContentPath(pathname, payload.site);
  if (!page) return path === '/' && Array.isArray(payload.blocks);
  const slug = normalizeHoldingPublicPath(decodeHoldingPathname(page.slug || '/'));

  return (page.is_home && path === '/') || slug === path;
}
