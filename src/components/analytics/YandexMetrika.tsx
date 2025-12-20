import { useEffect } from 'react';

declare global {
  interface Window {
    ym: (id: number, method: string, ...args: any[]) => void;
  }
}

interface YandexMetrikaProps {
  counterId: number;
  enableWebvisor?: boolean;
  enableClickmap?: boolean;
  enableTrackLinks?: boolean;
  enableAccurateTrackBounce?: boolean;
}

const shouldEnableMetrika = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  
  const hostname = window.location.hostname;
  
  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return false;
  }
  
  if (hostname.startsWith('lk.')) {
    return false;
  }
  
  return true;
};

const YandexMetrika = ({
  counterId,
  enableWebvisor = true,
  enableClickmap = true,
  enableTrackLinks = true,
  enableAccurateTrackBounce = true
}: YandexMetrikaProps) => {
  useEffect(() => {
    if (!shouldEnableMetrika()) {
      return;
    }

    const script = document.createElement('script');
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
        ${enableWebvisor ? 'webvisor:true' : ''}
      });
    `;
    
    document.head.appendChild(script);

    const noscript = document.createElement('noscript');
    noscript.innerHTML = `<div><img src="https://mc.yandex.ru/watch/${counterId}" style="position:absolute; left:-9999px;" alt="" /></div>`;
    document.body.appendChild(noscript);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      if (document.body.contains(noscript)) {
        document.body.removeChild(noscript);
      }
    };
  }, [counterId, enableWebvisor, enableClickmap, enableTrackLinks, enableAccurateTrackBounce]);

  return null;
};

export const trackYandexGoal = (goalName: string, params?: Record<string, any>) => {
  if (!shouldEnableMetrika()) {
    return;
  }
  
  if (typeof window !== 'undefined' && window.ym) {
    const counterId = 102888970;
    window.ym(counterId, 'reachGoal', goalName, params);
  }
};

export const trackYandexEvent = (eventName: string, params?: Record<string, any>) => {
  if (!shouldEnableMetrika()) {
    return;
  }
  
  if (typeof window !== 'undefined' && window.ym) {
    const counterId = 102888970;
    window.ym(counterId, 'hit', window.location.href, {
      title: document.title,
      referer: document.referrer,
      params: {
        event: eventName,
        ...params
      }
    });
  }
};

export default YandexMetrika; 