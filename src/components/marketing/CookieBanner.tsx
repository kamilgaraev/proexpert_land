import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import {
  COOKIE_CONSENT_EVENT,
  getCookieConsent,
  saveCookieConsent,
} from '@/utils/marketingConsent';
import { marketingPaths } from '@/data/marketingRegistry';

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
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-steel-200 bg-white/95 backdrop-blur-xl">
      <div className="container-custom py-4">
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-steel-200 bg-white p-5 shadow-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-construction-50 text-construction-700">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-base font-semibold text-steel-950">
                Управление cookies и аналитикой
              </div>
              <p className="mt-1 text-sm leading-6 text-steel-600">
                Обязательные cookies нужны для работы сайта. Аналитика включается
                только после вашего согласия. Подробнее в{' '}
                <Link
                  to={marketingPaths.cookies}
                  className="font-semibold text-construction-700 hover:text-construction-800"
                >
                  политике cookies
                </Link>{' '}
                и{' '}
                <Link
                  to={marketingPaths.privacy}
                  className="font-semibold text-construction-700 hover:text-construction-800"
                >
                  политике конфиденциальности
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => saveCookieConsent(false)}
              className="inline-flex items-center justify-center rounded-2xl border border-steel-300 bg-white px-5 py-3 text-sm font-semibold text-steel-900 transition hover:border-steel-500"
            >
              Только обязательные
            </button>
            <button
              type="button"
              onClick={() => saveCookieConsent(true)}
              className="inline-flex items-center justify-center rounded-2xl bg-steel-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-steel-900"
            >
              Разрешить аналитику
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
