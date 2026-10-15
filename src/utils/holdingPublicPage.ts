import type { PublicSitePayload } from '@/types/holding-site-builder';

export interface HoldingPublicPageState {
  pathname: string;
  search: string;
  status: number;
  payload?: PublicSitePayload;
  message?: string;
}

export function hasHoldingPublicPage(payload: PublicSitePayload): boolean {
  const page = payload.current_page ?? payload.page;
  const normalize = (value: string) => `/${value.trim().replace(/^\/+|\/+$/g, '')}`;
  const path = normalize(payload.runtime.path || '/');
  const slug = normalize(page?.slug || '/');

  return Boolean(page && ((page.is_home && path === '/') || slug === path));
}
