export const HOLDING_MAIN_DOMAIN = new URL('https://1мост.рф').hostname;

export function isHoldingHostname(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase();
  const reserved = new Set(['lk', 'api', 'www']);

  return normalizedHostname.endsWith(`.${HOLDING_MAIN_DOMAIN}`)
    && !reserved.has(normalizedHostname.split('.')[0]);
}

export function decodeHoldingPathname(pathname: string): string {
  try {
    return pathname.split('/').map((segment) => decodeURIComponent(segment).replace(/\//g, '%2F')).join('/');
  } catch {
    return pathname;
  }
}

export function isHoldingPrivatePath(pathname: string): boolean {
  const path = decodeHoldingPathname(pathname).toLowerCase().replace(/\/+$/, '') || '/';
  return ['/login', '/dashboard', '/organizations', '/reports', '/projects', '/landing/editor', '/settings'].includes(path)
    || /^\/reports\/[^/]+$/.test(path)
    || /^\/projects\/[^/]+$/.test(path)
    || /^\/projects\/contracts\/[^/]+$/.test(path)
    || /^\/holding\/[^/]+\/landing\/edit$/.test(path);
}
