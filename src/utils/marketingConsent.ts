export interface CookieConsentState {
  essential: true;
  analytics: boolean;
  version: string;
  decidedAt: string;
}

export const COOKIE_CONSENT_VERSION = '2026-03-25-public-site-v1';
const COOKIE_CONSENT_STORAGE_KEY = 'prohelper.cookie-consent';
export const COOKIE_CONSENT_EVENT = 'prohelper:cookie-consent-change';

export const getCookieConsent = (): CookieConsentState | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as CookieConsentState;
    if (!parsed.version || parsed.version !== COOKIE_CONSENT_VERSION) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const saveCookieConsent = (analytics: boolean): CookieConsentState | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const consentState: CookieConsentState = {
    essential: true,
    analytics,
    version: COOKIE_CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
  };

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consentState));
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: consentState }));

  return consentState;
};

export const hasAnalyticsConsent = (): boolean => getCookieConsent()?.analytics === true;

export const clearCookieConsent = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: null }));
};
