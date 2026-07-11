const INTERNAL_PREFIXES = [
  '/dashboard',
  '/landing/multi-organization',
];

const INTERNAL_EXACT_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
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
