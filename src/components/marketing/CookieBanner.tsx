import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  COOKIE_CONSENT_EVENT,
  getCookieConsent,
  saveCookieConsent,
} from "@/utils/marketingConsent";
import { marketingPaths } from "@/data/marketingRegistry";

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);

    const handleConsentChange = () => {
      setVisible(getCookieConsent() === null);
    };

    window.addEventListener(
      COOKIE_CONSENT_EVENT,
      handleConsentChange as EventListener,
    );

    return () => {
      window.removeEventListener(
        COOKIE_CONSENT_EVENT,
        handleConsentChange as EventListener,
      );
    };
  }, []);

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
            onClick={() => saveCookieConsent(false)}
            className="most-button"
          >
            Только обязательные
          </button>
          <button
            type="button"
            onClick={() => saveCookieConsent(true)}
            className="most-button"
          >
            Разрешить аналитику
          </button>
        </div>
      </div>
    </section>
  );
};

export default CookieBanner;
