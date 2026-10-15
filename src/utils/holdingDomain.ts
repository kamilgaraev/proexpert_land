export const HOLDING_MAIN_DOMAIN = new URL('https://1мост.рф').hostname;

export function isHoldingHostname(hostname: string): boolean {
  const reserved = new Set(['lk', 'api', 'www']);

  return hostname.endsWith(`.${HOLDING_MAIN_DOMAIN}`)
    && !reserved.has(hostname.split('.')[0]);
}
