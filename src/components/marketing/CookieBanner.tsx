import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  COOKIE_CONSENT_EVENT,
  getCookieConsent,
  saveCookieConsent,
  setAnalyticsAvailability,
} from "@/utils/marketingConsent";
import { marketingPaths } from "@/data/marketingRegistry";
import { useLegalManifest } from '@/hooks/useLegalManifest';
import { recordAnalyticsChoice } from '@/services/legalService';
import { clearMarketingAttribution } from '@/utils/marketingAttribution';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);
  const { manifest } = useLegalManifest();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const choose = async (analytics: boolean) => {
    const previous = getCookieConsent();
    const visitorId = previous?.visitorId ?? crypto.randomUUID();
    setError(null);
    if (!analytics) {
      setAnalyticsAvailability(false);
      saveCookieConsent(false, previous?.receiptId ? { receiptId: previous.receiptId, visitorId } : undefined);
      clearMarketingAttribution();
      for (const entry of document.cookie.split(';')) {
        const name = entry.trim().split('=')[0];
        if (!name.startsWith('_ym_')) continue;
        document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax; Secure`;
        document.cookie = `${name}=; Domain=xn--1-xtbgmf.xn--p1ai; Path=/; Max-Age=0; SameSite=Lax; Secure`;
      }
      if (!previous?.receiptId) { setVisible(false); return; }
    } else if (!manifest) return;
    setBusy(true);
    try {
      const receiptId = await recordAnalyticsChoice(analytics, manifest, visitorId, previous?.receiptId);
      setAnalyticsAvailability(analytics, manifest?.documents.cookies.sha256);
      saveCookieConsent(analytics, { receiptId, visitorId, documentHash: manifest?.documents.cookies.sha256 });
      setVisible(false);
    } catch (cause) {
      setVisible(true);
      setError(cause instanceof Error ? cause.message : 'Не удалось сохранить выбор.');
    } finally { setBusy(false); }
  };

  useEffect(() => {
    const needsChoice = () => {
      const consent = getCookieConsent();
      return consent === null || (consent.analytics && Boolean(manifest?.documents.cookies.sha256) && consent.documentHash !== manifest?.documents.cookies.sha256);
    };
    setVisible(needsChoice());

    const handleConsentChange = () => {
      setVisible(needsChoice());
    };

    window.addEventListener(
      COOKIE_CONSENT_EVENT,
      handleConsentChange as EventListener,
    );
    const openSettings = () => setVisible(true);
    window.addEventListener('most:cookie-settings', openSettings);

    return () => {
      window.removeEventListener('most:cookie-settings', openSettings);
      window.removeEventListener(
        COOKIE_CONSENT_EVENT,
        handleConsentChange as EventListener,
      );
    };
  }, [manifest]);

  if (!visible) {
    return null;
  }

  return (
    <section className="most-cookie-notice" aria-label="Настройки cookie">
      <div className="most-container most-cookie-layout">
        <p>
          Обязательные cookie нужны для работы сайта. Аналитика включается с
          вашего согласия. Подробнее — в{" "}
          <Link to={marketingPaths.cookies}>политике cookie</Link> и{" "}
          <Link to={marketingPaths.privacy}>политике конфиденциальности</Link>.
        </p>
        <div className="most-cookie-actions">
          <button
            type="button"
            onClick={() => void choose(false)}
            disabled={busy}
            className="most-button"
          >
            Только обязательные
          </button>
          <button
            type="button"
            onClick={() => void choose(true)}
            disabled={busy || !manifest}
            className="most-button"
          >
            Разрешить аналитику
          </button>
        </div>
        {error && <p role="alert">{error}</p>}
      </div>
    </section>
  );
};

export default CookieBanner;
