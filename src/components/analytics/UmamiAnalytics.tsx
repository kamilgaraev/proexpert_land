import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from '@/config/analytics';
import { isKnownMarketingPath, normalizeMarketingPath } from '@/data/marketing/siteIndex';
import { isMarketingPublicPath, isPrimaryMarketingHost } from '@/utils/publicSite';

interface UmamiPayload {
  website: string;
  hostname: string;
  language: string;
  screen: string;
  title: string;
  url: string;
  referrer: string;
}

declare global {
  interface Window {
    umami?: { track: (payload: UmamiPayload) => Promise<void> };
  }
}

const SCRIPT_ID = 'most-umami-analytics';
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

const publicTrackingPath = (pathname: string, publishedBlogPath?: string): boolean => {
  if (typeof window === 'undefined' || !isPrimaryMarketingHost(window.location.hostname)
    || !isMarketingPublicPath(pathname)) return false;
  const path = normalizeMarketingPath(pathname);
  if (path.startsWith('/blog/')) return Boolean(publishedBlogPath && path === normalizeMarketingPath(publishedBlogPath));
  return isKnownMarketingPath(path);
};

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
  title: url.split('?')[0],
  url,
  referrer,
});

interface UmamiAnalyticsProps {
  publishedBlogPath?: string;
}

function UmamiTracker({ publishedBlogPath }: UmamiAnalyticsProps) {
  const { pathname, search } = useLocation();
  const previousUrl = useRef<string | null>(null);
  const enabled = publicTrackingPath(pathname, publishedBlogPath);

  useEffect(() => {
    if (!enabled) {
      previousUrl.current = null;
      document.getElementById(SCRIPT_ID)?.remove();
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
      script.dataset.fetchCredentials = 'omit';
      script.referrerPolicy = 'no-referrer';
    }

    const trackerScript = script;
    const currentUrl = publishedBlogPath ? pathname : analyticsUrl(pathname, search);
    const sendPageview = () => {
      if (!publicTrackingPath(pathname, publishedBlogPath) || !window.umami || previousUrl.current === currentUrl) return;
      void window.umami.track(payload(currentUrl, previousUrl.current?.split('?')[0] ?? safeReferrer()))
        .catch(() => undefined);
      previousUrl.current = currentUrl;
    };
    const handleError = () => trackerScript.remove();
    trackerScript.addEventListener('load', sendPageview);
    trackerScript.addEventListener('error', handleError);
    if (isNew) document.head.appendChild(trackerScript);
    if (window.umami) sendPageview();

    return () => {
      trackerScript.removeEventListener('load', sendPageview);
      trackerScript.removeEventListener('error', handleError);
    };
  }, [enabled, pathname, search, publishedBlogPath]);

  return null;
}

export default function UmamiAnalytics(props: UmamiAnalyticsProps) {
  if (typeof window === 'undefined' || !isPrimaryMarketingHost(window.location.hostname)) return null;
  return <UmamiTracker {...props} />;
}
