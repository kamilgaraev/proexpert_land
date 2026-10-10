const INTERNAL_PREFIXES = [
  '/dashboard',
  '/landing/multi-organization',
  '/invitations',
  '/project-invitations',
  '/supplier-requests',
  '/blog/preview',
  '/contractor-invitations',
];

const INTERNAL_EXACT_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email',
  '/email-sent',
]);

const PRIMARY_MARKETING_HOSTS = new Set([
  '1мост.рф',
  'www.1мост.рф',
  'xn--1-xtbgmf.xn--p1ai',
  'www.xn--1-xtbgmf.xn--p1ai',
]);

export const isMarketingPublicPath = (pathname: string): boolean => {
  if (!pathname) {
    return false;
  }

  if (INTERNAL_EXACT_PATHS.has(pathname)) {
    return false;
  }

  return !INTERNAL_PREFIXES.some((prefix) => pathname.startsWith(prefix));
};

export const isPrimaryMarketingHost = (hostname: string): boolean => {
  if (!hostname) {
    return false;
  }

  return PRIMARY_MARKETING_HOSTS.has(hostname.toLowerCase());
};

export const isCabinetHost = (hostname: string): boolean =>
  ['lk.1мост.рф', 'lk.xn--1-xtbgmf.xn--p1ai'].includes(hostname.toLowerCase());

export const isConversionPath = (pathname: string): boolean =>
  ['/register', '/email-sent', '/verify-email', '/dashboard/billing'].includes(pathname.replace(/\/+$/, ''));
