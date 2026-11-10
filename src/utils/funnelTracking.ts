import { UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from '@/config/analytics';
import type { UmamiPayload } from '@/components/analytics/UmamiAnalytics';
import { isCabinetHost, isConversionPath, isPrimaryMarketingHost } from '@/utils/publicSite';

export type FunnelEvent =
  | 'registration_started'
  | 'registration_step_2'
  | 'registration_completed'
  | 'email_verified'
  | 'trial_started'
  | 'invoice_created'
  | 'payment_started'
  | 'purchase';

type FunnelData = Record<string, string | number | boolean | null | undefined>;

const SCRIPT_ID = 'most-umami-funnel';
const FUNNEL_URL = '/conversion';
const pending: UmamiPayload[] = [];
const sentInSession = new Set<string>();

const canTrack = (): boolean => {
  if (typeof window === 'undefined') return false;
  const { hostname, pathname } = window.location;
  return isCabinetHost(hostname) || (isPrimaryMarketingHost(hostname) && isConversionPath(pathname));
};

const cleanData = (data?: FunnelData): UmamiPayload['data'] => {
  if (!data) return undefined;
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value) result[key] = value.slice(0, 100);
    else if (typeof value === 'number' && Number.isFinite(value)) result[key] = value;
    else if (typeof value === 'boolean') result[key] = value;
  }
  return Object.keys(result).length ? result : undefined;
};

const send = (payload: UmamiPayload) => {
  try {
    void window.umami?.track(payload).catch(() => undefined);
  } catch {
    return;
  }
};

const flush = () => {
  if (!window.umami) return;
  while (pending.length) send(pending.shift()!);
};

const ensureScript = () => {
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = UMAMI_SCRIPT_URL;
  script.dataset.websiteId = UMAMI_WEBSITE_ID;
  script.dataset.autoTrack = 'false';
  script.dataset.excludeHash = 'true';
  script.dataset.doNotTrack = 'true';
  script.dataset.fetchCredentials = 'omit';
  script.referrerPolicy = 'no-referrer';
  script.addEventListener('load', flush);
  script.addEventListener('error', () => {
    pending.length = 0;
    script.remove();
  });
  document.head.appendChild(script);
};

export const trackFunnelEvent = (name: FunnelEvent, data?: FunnelData): boolean => {
  try {
    if (!canTrack()) return false;
    const payload: UmamiPayload = {
      website: UMAMI_WEBSITE_ID,
      hostname: window.location.hostname,
      language: navigator.language,
      screen: `${window.screen.width}x${window.screen.height}`,
      title: name,
      url: FUNNEL_URL,
      referrer: '',
      name,
      data: cleanData(data),
    };
    if (window.umami) send(payload);
    else {
      pending.push(payload);
      ensureScript();
    }
    return true;
  } catch {
    return false;
  }
};

export const trackFunnelEventOnce = (name: FunnelEvent, key: string, data?: FunnelData): boolean => {
  if (typeof window === 'undefined' || !key) return false;
  const storageKey = `most.funnel.${name}.${key}`;
  try {
    if (sentInSession.has(storageKey) || window.localStorage.getItem(storageKey)) return false;
  } catch {
    if (sentInSession.has(storageKey)) return false;
  }
  if (!trackFunnelEvent(name, data)) return false;
  sentInSession.add(storageKey);
  try {
    window.localStorage.setItem(storageKey, '1');
  } catch {
    return true;
  }
  return true;
};
