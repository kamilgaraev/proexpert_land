import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from '@/config/analytics';
import { isKnownMarketingPath, normalizeMarketingPath } from '@/data/marketing/siteIndex';
import { useLegalManifest } from '@/hooks/useLegalManifest';
import { COOKIE_CONSENT_EVENT, getCookieConsent, hasAnalyticsConsent } from '@/utils/marketingConsent';
import { isMarketingPublicPath, isPrimaryMarketingHost } from '@/utils/publicSite';

interface UmamiPayload {
  website: string;
  hostname: string;
  language: string;
  screen: string;
  title: string;
  url: string;
  referrer: string;
  name?: string;
}

declare global {
  interface Window {
    umami?: { track: (payload: UmamiPayload) => Promise<void> };
  }
}

const SCRIPT_ID = 'most-umami-analytics';
const PUBLIC_EVENTS = new Set(['pricing_view', 'contact_form']);
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
const pendingEvents: Array<{ payload: UmamiPayload; receiptId: string; documentHash: string; createdAt: number }> = [];

const publicTrackingPath = (pathname: string, publishedBlogPath?: string): boolean => {
  if (typeof window === 'undefined' || !isPrimaryMarketingHost(window.location.hostname)
    || !isMarketingPublicPath(pathname)) return false;
  const path = normalizeMarketingPath(pathname);
  if (path.startsWith('/blog/')) return Boolean(publishedBlogPath && path === normalizeMarketingPath(publishedBlogPath));
  return isKnownMarketingPath(path);
};

const trackingAllowed = (pathname: string, publishedBlogPath?: string): boolean =>
  hasAnalyticsConsent() && publicTrackingPath(pathname, publishedBlogPath);

const analyticsUrl = (pathname: string, search: string): string => {
  const source = new URLSearchParams(search);
  const query = new URLSearchParams();
  for (const key of UTM_KEYS) {
    const value = source.get(key);
    if (value && /^[\p{L}\p{N}_.+\- ]{1,160}$/u.test(value)) query.set(key, value);
  }
  return pathname + (query.size ? `?${query}` : '');
};

const safeReferrer = (): string => {
  try {
    return document.referrer ? new URL(document.referrer).origin : '';
  } catch {
    return '';
  }
};

const payload = (url: string, referrer: string): UmamiPayload => ({
  website: UMAMI_WEBSITE_ID,
  hostname: window.location.hostname,
  language: navigator.language,
  screen: `${window.screen.width}x${window.screen.height}`,
  title: document.title,
  url,
  referrer,
});

const flushPendingEvents = (): void => {
  if (!window.umami || !trackingAllowed(window.location.pathname)) return;
  const consent = getCookieConsent();
  if (!consent) return;
  for (const event of pendingEvents.splice(0)) {
    if (event.receiptId !== consent?.receiptId || event.documentHash !== consent.documentHash
      || Date.now() - event.createdAt > 60_000) continue;
    void window.umami.track(event.payload).catch(() => undefined);
  }
};

export const trackUmamiEvent = (name: string): void => {
  if (typeof window === 'undefined' || !PUBLIC_EVENTS.has(name) || !publicTrackingPath(window.location.pathname)) return;
  const consent = getCookieConsent();
  if (!consent?.analytics || !consent.receiptId || !consent.documentHash) return;
  pendingEvents.push({
    payload: { ...payload(analyticsUrl(window.location.pathname, window.location.search), safeReferrer()), name },
    receiptId: consent.receiptId,
    documentHash: consent.documentHash,
    createdAt: Date.now(),
  });
  if (pendingEvents.length > 20) pendingEvents.shift();
  flushPendingEvents();
};

interface UmamiAnalyticsProps {
  publishedBlogPath?: string;
}

function UmamiTracker({ publishedBlogPath }: UmamiAnalyticsProps) {
  const { pathname, search } = useLocation();
  const { manifest } = useLegalManifest();
  const [consent, setConsent] = useState(hasAnalyticsConsent);
  const previousUrl = useRef<string | null>(null);
  const enabled = consent && Boolean(manifest) && trackingAllowed(pathname, publishedBlogPath);

  useEffect(() => () => { pendingEvents.length = 0; }, []);

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
    if (!enabled) {
      previousUrl.current = null;
      document.getElementById(SCRIPT_ID)?.remove();
      if (!getCookieConsent()?.analytics || !publicTrackingPath(pathname, publishedBlogPath)) pendingEvents.length = 0;
      return;
    }

    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const isNew = !script;
    if (!script) {
      script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = UMAMI_SCRIPT_URL;
      script.dataset.websiteId = UMAMI_WEBSITE_ID;
      script.dataset.autoTrack = 'false';
      script.dataset.excludeHash = 'true';
      script.dataset.doNotTrack = 'true';
      script.referrerPolicy = 'no-referrer';
    }

    const trackerScript = script;
    const currentUrl = publishedBlogPath ? pathname : analyticsUrl(pathname, search);
    let timer: number | undefined;
    const schedulePageview = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!trackingAllowed(pathname, publishedBlogPath) || !window.umami || previousUrl.current === currentUrl) return;
        void window.umami.track(payload(currentUrl, previousUrl.current?.split('?')[0] ?? safeReferrer()))
          .catch(() => undefined);
        previousUrl.current = currentUrl;
        flushPendingEvents();
      }, 250);
    };
    const handleError = () => trackerScript.remove();
    trackerScript.addEventListener('load', schedulePageview);
    trackerScript.addEventListener('error', handleError);
    if (isNew) document.head.appendChild(trackerScript);
    if (window.umami) schedulePageview();

    return () => {
      window.clearTimeout(timer);
      trackerScript.removeEventListener('load', schedulePageview);
      trackerScript.removeEventListener('error', handleError);
    };
  }, [enabled, pathname, search, publishedBlogPath]);

  return null;
}

export default function UmamiAnalytics(props: UmamiAnalyticsProps) {
  if (typeof window === 'undefined' || !isPrimaryMarketingHost(window.location.hostname)) return null;
  return <UmamiTracker {...props} />;
}
