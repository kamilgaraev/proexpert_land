import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  COOKIE_CONSENT_EVENT,
  hasAnalyticsConsent,
} from '@/utils/marketingConsent';
import {
  isMarketingPublicPath,
  isPrimaryMarketingHost,
} from '@/utils/publicSite';

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
      return;
    }

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
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        ym(${counterId}, "init", {
          ${enableClickmap ? 'clickmap:true,' : ''}
          ${enableTrackLinks ? 'trackLinks:true,' : ''}
          ${enableAccurateTrackBounce ? 'accurateTrackBounce:true,' : ''}
          ${enableWebvisor ? 'webvisor:true,' : ''}
          trackHash:true
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

    const hitTimer = window.setTimeout(() => {
      window.ym?.(counterId, 'hit', window.location.href, {
        title: document.title,
        referer: document.referrer,
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

  window.ym?.(102888970, 'reachGoal', goalName, params);
};

export const trackYandexEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (!isAnalyticsTrackingEnabled()) {
    return;
  }

  window.ym?.(102888970, 'hit', window.location.href, {
    title: document.title,
    referer: document.referrer,
    params: {
      event: eventName,
      ...params,
    },
  });
};

export default YandexMetrika;
