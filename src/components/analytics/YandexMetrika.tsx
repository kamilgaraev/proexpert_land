import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  COOKIE_CONSENT_EVENT,
  hasAnalyticsConsent,
} from '@/utils/marketingConsent';
import {
  isMarketingPublicPath,
  isPrimaryMarketingHost,
} from '@/utils/publicSite';
import { YANDEX_METRIKA_COUNTER_ID } from '@/config/analytics';

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

const SCRIPT_ID = 'prohelper-yandex-metrika';
const NOSCRIPT_ID = 'prohelper-yandex-metrika-noscript';

const canEnableMetrika = (pathname: string) => {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    hasAnalyticsConsent() &&
    isPrimaryMarketingHost(window.location.hostname) &&
    isMarketingPublicPath(pathname)
  );
};

const removeMetrikaNodes = () => {
  const script = document.getElementById(SCRIPT_ID);
  const noscript = document.getElementById(NOSCRIPT_ID);

  script?.remove();
  noscript?.remove();
};

const YandexMetrika = ({
  counterId,
  enableWebvisor = true,
  enableClickmap = true,
  enableTrackLinks = true,
  enableAccurateTrackBounce = true,
}: YandexMetrikaProps) => {
  const location = useLocation();
  const [enabled, setEnabled] = useState(() => canEnableMetrika(location.pathname));
  const previousUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const syncState = () => {
      setEnabled(canEnableMetrika(location.pathname));
    };

    syncState();
    window.addEventListener(COOKIE_CONSENT_EVENT, syncState as EventListener);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, syncState as EventListener);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!enabled) {
      removeMetrikaNodes();
      previousUrlRef.current = null;
      return;
    }

    const currentUrl = new URL(
      `${location.pathname}${location.search}${location.hash}`,
      window.location.origin,
    ).href;

    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = `
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
        m[i].l=1*new Date();
        for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js?id=${counterId}", "ym");

        ym(${counterId}, "init", {
          ssr:true,
          ${enableClickmap ? 'clickmap:true,' : ''}
          ${enableTrackLinks ? 'trackLinks:true,' : ''}
          ${enableAccurateTrackBounce ? 'accurateTrackBounce:true,' : ''}
          ${enableWebvisor ? 'webvisor:true,' : ''}
          ecommerce:"dataLayer",
          referrer:document.referrer,
          url:location.href
        });
      `;
      document.head.appendChild(script);
    }

    if (!document.getElementById(NOSCRIPT_ID)) {
      const noscript = document.createElement('noscript');
      noscript.id = NOSCRIPT_ID;
      noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${counterId}" style="position:absolute; left:-9999px;" alt="" /></div>`;
      document.body.appendChild(noscript);
    }

    const previousUrl = previousUrlRef.current;
    previousUrlRef.current = currentUrl;

    if (previousUrl === null || previousUrl === currentUrl) {
      return;
    }

    const hitTimer = window.setTimeout(() => {
      window.ym?.(counterId, 'hit', currentUrl, {
        title: document.title,
        referer: previousUrl,
      });
    }, 250);

    return () => {
      window.clearTimeout(hitTimer);
    };
  }, [
    counterId,
    enableAccurateTrackBounce,
    enableClickmap,
    enableTrackLinks,
    enableWebvisor,
    enabled,
    location.hash,
    location.pathname,
    location.search,
  ]);

  return null;
};

const isAnalyticsTrackingEnabled = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return canEnableMetrika(window.location.pathname);
};

export const trackYandexGoal = (goalName: string, params?: Record<string, unknown>) => {
  if (!isAnalyticsTrackingEnabled()) {
    return;
  }

  window.ym?.(YANDEX_METRIKA_COUNTER_ID, 'reachGoal', goalName, params);
};

export const trackYandexEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (!isAnalyticsTrackingEnabled()) {
    return;
  }

  window.ym?.(YANDEX_METRIKA_COUNTER_ID, 'hit', window.location.href, {
    title: document.title,
    referer: document.referrer,
    params: {
      event: eventName,
      ...params,
    },
  });
};

export default YandexMetrika;
