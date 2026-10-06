import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { COOKIE_CONSENT_EVENT, hasAnalyticsConsent } from '@/utils/marketingConsent';
import { isCabinetHost, isConversionPath, isMarketingPublicPath, isPrimaryMarketingHost } from '@/utils/publicSite';
import { YANDEX_METRIKA_COUNTER_ID } from '@/config/analytics';
import { useLegalManifest } from '@/hooks/useLegalManifest';
import { isKnownMarketingPath } from '@/data/marketing/siteIndex';

export { YANDEX_METRIKA_COUNTER_ID } from '@/config/analytics';

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
  }
}

interface YandexMetrikaProps {
  counterId: number;
  enableWebvisor?: boolean;
  enableClickmap?: boolean;
  enableTrackLinks?: boolean;
  enableAccurateTrackBounce?: boolean;
}

type TrackingMode = 'marketing' | 'conversion' | null;
const SCRIPT_ID = 'prohelper-yandex-metrika';
const CONVERSION_GOALS = new Set(['registration', 'email_verified', 'purchase']);
const analyticsUrl = (input: string): string => {
  const url = new URL(input, window.location.origin);
  const query = new URLSearchParams();
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
    const value = url.searchParams.get(key);
    if (value) query.set(key, value.slice(0, 160));
  }
  return url.origin + url.pathname + (query.size ? `?${query}` : '');
};
const safeReferrer = () => {
  try { return document.referrer ? new URL(document.referrer).origin : ''; } catch { return ''; }
};

const trackingMode = (pathname: string): TrackingMode => {
  if (typeof window === 'undefined' || !hasAnalyticsConsent()) return null;
  const hostname = window.location.hostname;
  if (isConversionPath(pathname) && (isPrimaryMarketingHost(hostname) || isCabinetHost(hostname))) return 'conversion';
  return isPrimaryMarketingHost(hostname) && isMarketingPublicPath(pathname) && isKnownMarketingPath(pathname) ? 'marketing' : null;
};

const loadMetrika = () => {
  if (!window.ym) {
    const commands: unknown[][] = [];
    window.ym = Object.assign((...args: unknown[]) => { commands.push(args); }, { a: commands, l: Date.now() });
  }
  if (document.getElementById(SCRIPT_ID)) return;
  const script = document.createElement('script');
  script.id = SCRIPT_ID;
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.appendChild(script);
};

const YandexMetrika = ({ counterId, enableWebvisor = false, enableClickmap = false,
  enableTrackLinks = true, enableAccurateTrackBounce = true }: YandexMetrikaProps) => {
  const location = useLocation();
  const { manifest } = useLegalManifest();
  const [consent, setConsent] = useState(hasAnalyticsConsent);
  const previousUrlRef = useRef<string | null>(null);
  const mode = consent && manifest?.analytics_ready ? trackingMode(location.pathname) : null;

  useEffect(() => {
    const syncConsent = () => setConsent(hasAnalyticsConsent());
    window.addEventListener(COOKIE_CONSENT_EVENT, syncConsent);
    window.addEventListener('focus', syncConsent);
    window.addEventListener('storage', syncConsent);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, syncConsent);
      window.removeEventListener('focus', syncConsent);
      window.removeEventListener('storage', syncConsent);
    };
  }, []);

  useEffect(() => {
    previousUrlRef.current = null;
    if (!mode) return;
    loadMetrika();
    const marketing = mode === 'marketing';
    window.ym?.(counterId, 'init', {
      ssr: true, defer: true,
      clickmap: marketing && enableClickmap,
      trackLinks: false,
      accurateTrackBounce: marketing && enableAccurateTrackBounce,
      webvisor: false,
      ecommerce: false,
      sendTitle: marketing,
      url: marketing ? analyticsUrl(window.location.href) : window.location.origin + '/conversion',
      referrer: marketing ? safeReferrer() : '',
    });
    return () => { window.ym?.(counterId, 'destruct'); };
  }, [counterId, mode, enableWebvisor, enableClickmap, enableTrackLinks, enableAccurateTrackBounce]);

  useEffect(() => {
    if (mode !== 'marketing') return;
    const currentUrl = analyticsUrl(location.pathname + location.search);
    const previousUrl = previousUrlRef.current;
    if (previousUrl === currentUrl) return;
    previousUrlRef.current = currentUrl;
    const timer = window.setTimeout(() => {
      window.ym?.(counterId, 'hit', currentUrl, { title: document.title, referer: previousUrl ?? safeReferrer() });
    }, 250);
    return () => window.clearTimeout(timer);
  }, [counterId, mode, location.pathname, location.search, location.hash]);

  return null;
};

export const trackYandexGoal = (goalName: string, params?: Record<string, unknown>): boolean => {
  const mode = typeof window === 'undefined' ? null : trackingMode(window.location.pathname);
  if (!mode || (mode === 'conversion' && !CONVERSION_GOALS.has(goalName))) return false;
  loadMetrika();
  window.ym?.(YANDEX_METRIKA_COUNTER_ID, 'reachGoal', goalName, params);
  return true;
};

export const trackYandexEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined' || trackingMode(window.location.pathname) !== 'marketing') return;
  loadMetrika();
  window.ym?.(YANDEX_METRIKA_COUNTER_ID, 'params', { event: eventName, ...params });
};

export default YandexMetrika;
