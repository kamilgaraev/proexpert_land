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
  const path = (payload.runtime.path || '/').replace(/\/+$/, '') || '/';
  const slug = (page?.slug || '/').replace(/\/+$/, '') || '/';

  return Boolean(page && ((page.is_home && path === '/') || slug === path));
}
