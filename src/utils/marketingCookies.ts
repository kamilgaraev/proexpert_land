const SITE_DOMAIN = 'xn--1-xtbgmf.xn--p1ai';

const isSiteHost = () => typeof window !== 'undefined' &&
  [SITE_DOMAIN, `www.${SITE_DOMAIN}`, `lk.${SITE_DOMAIN}`, '1мост.рф', 'www.1мост.рф', 'lk.1мост.рф'].includes(window.location.hostname.toLowerCase());

export const readMarketingCookie = (name: string): string | null => {
  if (!isSiteHost()) return null;
  try {
    const value = document.cookie.split('; ').find((entry) => entry.startsWith(`${name}=`));
    return value ? decodeURIComponent(value.slice(name.length + 1)) : null;
  } catch {
    return null;
  }
};

export const writeMarketingCookie = (name: string, value: string, maxAge: number): void => {
  if (!isSiteHost()) return;
  try {
    document.cookie = `${name}=${encodeURIComponent(value)}; Domain=${SITE_DOMAIN}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`;
  } catch {
    return;
  }
};
