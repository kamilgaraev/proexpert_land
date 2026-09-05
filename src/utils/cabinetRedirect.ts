import { isPrimaryMarketingHost } from './publicSite';

const CABINET_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/email-sent',
  '/invitations/accept',
]);

const CABINET_PREFIXES = ['/dashboard', '/landing/multi-organization'];

export const getCabinetRedirect = (
  hostname: string,
  pathname: string,
  search = '',
  hash = '',
): string | null => {
  if (!isPrimaryMarketingHost(hostname)) {
    return null;
  }

  const path = pathname.replace(/\/+$/, '').toLowerCase();
  const isCabinetPath = CABINET_PATHS.has(path)
    || CABINET_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

  return isCabinetPath
    ? `https://lk.xn--1-xtbgmf.xn--p1ai${pathname}${search}${hash}`
    : null;
};
