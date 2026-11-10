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

interface PendingEvent {
  payload: UmamiPayload;
  resolve: (delivered: boolean) => void;
}

const SCRIPT_ID = 'most-umami-funnel';
const FUNNEL_URL = '/conversion';
const LEAVE_TIMEOUT_MS = 1000;
const pending: PendingEvent[] = [];
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

const buildPayload = (name: FunnelEvent, data?: FunnelData): UmamiPayload => ({
  website: UMAMI_WEBSITE_ID,
  hostname: window.location.hostname,
  language: navigator.language,
  screen: `${window.screen.width}x${window.screen.height}`,
  title: name,
  url: FUNNEL_URL,
  referrer: '',
  name,
  data: cleanData(data),
});

const send = (payload: UmamiPayload): Promise<boolean> => {
  try {
    if (!window.umami) return Promise.resolve(false);
    return Promise.resolve(window.umami.track(payload)).then(() => true, () => false);
  } catch {
    return Promise.resolve(false);
  }
};

const flush = () => {
  if (!window.umami) {
    failPending();
    return;
  }
  while (pending.length) {
    const item = pending.shift()!;
    void send(item.payload).then(item.resolve);
  }
};

const failPending = () => {
  while (pending.length) pending.shift()!.resolve(false);
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
    failPending();
    script.remove();
  });
  document.head.appendChild(script);
};

const deliver = (name: FunnelEvent, data?: FunnelData): Promise<boolean> => {
  try {
    if (!canTrack()) return Promise.resolve(false);
    const payload = buildPayload(name, data);
    if (window.umami) return send(payload);
    return new Promise<boolean>((resolve) => {
      pending.push({ payload, resolve });
      ensureScript();
    });
  } catch {
    return Promise.resolve(false);
  }
};

export const preloadFunnelTracking = (): void => {
  try {
    if (canTrack() && !window.umami) ensureScript();
  } catch {
    return;
  }
};

export const trackFunnelEvent = (name: FunnelEvent, data?: FunnelData): boolean => {
  if (!canTrack()) return false;
  void deliver(name, data);
  return true;
};

export const trackFunnelEventBeforeLeave = (name: FunnelEvent, data?: FunnelData, timeoutMs = LEAVE_TIMEOUT_MS): Promise<void> => {
  if (!canTrack()) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const timer = window.setTimeout(resolve, timeoutMs);
    void deliver(name, data).then(() => {
      window.clearTimeout(timer);
      resolve();
    });
  });
};

export const trackFunnelEventOnce = (name: FunnelEvent, key: string, data?: FunnelData): boolean => {
  if (typeof window === 'undefined' || !key || !canTrack()) return false;
  const storageKey = `most.funnel.${name}.${key}`;
  if (sentInSession.has(storageKey)) return false;
  try {
    if (window.localStorage.getItem(storageKey)) return false;
  } catch {
    return false;
  }
  sentInSession.add(storageKey);
  void deliver(name, data).then((delivered) => {
    if (!delivered) {
      sentInSession.delete(storageKey);
      return;
    }
    try {
      window.localStorage.setItem(storageKey, '1');
    } catch {
      return;
    }
  });
  return true;
};
