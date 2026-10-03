import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import YandexMetrika from './YandexMetrika';
import { YANDEX_METRIKA_COUNTER_ID } from '@/config/analytics';
import { captureMarketingAttribution, clearMarketingAttribution } from '@/utils/marketingAttribution';
import { COOKIE_CONSENT_EVENT, hasAnalyticsConsent } from '@/utils/marketingConsent';
import { isCabinetHost, isMarketingPublicPath, isPrimaryMarketingHost } from '@/utils/publicSite';
import { initSEOTracking } from '@/utils/seoTracking';

export default function SiteTracking() {
  const { search } = useLocation();

  useEffect(() => {
    if (isPrimaryMarketingHost(window.location.hostname) && isMarketingPublicPath(window.location.pathname)) initSEOTracking();
  }, []);

  useEffect(() => {
    if (!isPrimaryMarketingHost(window.location.hostname) && !isCabinetHost(window.location.hostname)) return;
    captureMarketingAttribution(search);
    const syncAttribution = () => {
      if (hasAnalyticsConsent()) captureMarketingAttribution(search);
      else clearMarketingAttribution();
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, syncAttribution);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, syncAttribution);
  }, [search]);

  return <YandexMetrika counterId={YANDEX_METRIKA_COUNTER_ID} />;
}
