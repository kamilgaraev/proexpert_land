const INTERNAL_PREFIXES = [
  '/dashboard',
  '/admin',
  '/landing/multi-organization',
];

const INTERNAL_EXACT_PATHS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/email-sent',
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

  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return false;
  }

  return hostname === 'prohelper.pro' || hostname === 'www.prohelper.pro';
};
