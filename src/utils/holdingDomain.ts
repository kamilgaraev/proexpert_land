export const HOLDING_MAIN_DOMAIN = new URL('https://1мост.рф').hostname;

export function isHoldingHostname(hostname: string): boolean {
  const reserved = new Set(['lk', 'api', 'www']);

  return hostname.endsWith(`.${HOLDING_MAIN_DOMAIN}`)
    && !reserved.has(hostname.split('.')[0]);
}

export function isHoldingPrivatePath(pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/';
  return ['/login', '/dashboard', '/organizations', '/reports', '/projects', '/landing/editor', '/settings'].includes(path)
    || /^\/reports\/[^/]+$/.test(path)
    || /^\/projects\/[^/]+$/.test(path)
    || /^\/projects\/contracts\/[^/]+$/.test(path)
    || /^\/holding\/[^/]+\/landing\/edit$/.test(path);
}
