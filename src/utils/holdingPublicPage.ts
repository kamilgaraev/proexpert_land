import type { PublicSitePayload } from '@/types/holding-site-builder';

export interface HoldingPublicPageState {
  pathname: string;
  search: string;
  status: number;
  payload?: PublicSitePayload;
  message?: string;
}

export function getHoldingPageLanguage(payload?: PublicSitePayload | null): string {
  for (const value of [payload?.runtime.locale, payload?.site.default_locale]) {
    const locale = typeof value === 'string' ? value.replace(/_/g, '-') : '';
    if (/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(locale)) return locale;
  }
  return 'ru';
}

export function hasHoldingPublicPage(payload: PublicSitePayload): boolean {
  const page = payload.current_page ?? payload.page;
  const normalize = (value: string) => `/${value.trim().replace(/^\/+|\/+$/g, '')}`;
  const path = normalize(payload.runtime.path || '/');
  const slug = normalize(page?.slug || '/');

  return Boolean(page && ((page.is_home && path === '/') || slug === path));
}
