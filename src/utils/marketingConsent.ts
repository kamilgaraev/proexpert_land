import { readMarketingCookie, writeMarketingCookie } from './marketingCookies';

export interface CookieConsentState {
  essential: true;
  analytics: boolean;
  version: string;
  decidedAt: string;
}

export const COOKIE_CONSENT_VERSION = '2026-03-25-public-site-v1';
const COOKIE_CONSENT_STORAGE_KEY = 'prohelper.cookie-consent';
const CONSENT_COOKIE = 'most_analytics_consent';
export const COOKIE_CONSENT_EVENT = 'prohelper:cookie-consent-change';

export const getCookieConsent = (): CookieConsentState | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  let rawValue = readMarketingCookie(CONSENT_COOKIE);
  try {
    if (rawValue === null) rawValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as CookieConsentState;
    if (!parsed || parsed.version !== COOKIE_CONSENT_VERSION || typeof parsed.analytics !== 'boolean') {
      return null;
    }

    writeMarketingCookie(CONSENT_COOKIE, rawValue, 60 * 60 * 24 * 180);
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

  writeMarketingCookie(CONSENT_COOKIE, JSON.stringify(consentState), 60 * 60 * 24 * 180);
  try {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consentState));
  } catch {
    return consentState;
  } finally {
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: consentState }));
  }

  return consentState;
};

export const hasAnalyticsConsent = (): boolean => getCookieConsent()?.analytics === true;

export const clearCookieConsent = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  writeMarketingCookie(CONSENT_COOKIE, 'null', 60 * 60 * 24 * 180);
  try {
    window.localStorage.removeItem(COOKIE_CONSENT_STORAGE_KEY);
  } catch {
    return;
  } finally {
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: null }));
  }
};
