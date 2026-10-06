import { readMarketingCookie, writeMarketingCookie } from './marketingCookies';

export interface CookieConsentState {
  essential: true;
  analytics: boolean;
  version: string;
  decidedAt: string;
  receiptId?: string;
  visitorId?: string;
  documentHash?: string;
}

export const COOKIE_CONSENT_VERSION = '2026-10-06.1';
const COOKIE_CONSENT_STORAGE_KEY = 'prohelper.cookie-consent';
const CONSENT_COOKIE = 'most_analytics_consent';
export const COOKIE_CONSENT_EVENT = 'prohelper:cookie-consent-change';
let analyticsAvailable = false;
let analyticsDocumentHash = '';

export const setAnalyticsAvailability = (available: boolean, documentHash = ''): void => {
  if (analyticsAvailable === available && analyticsDocumentHash === documentHash) return;
  analyticsAvailable = available;
  analyticsDocumentHash = documentHash;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
};

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
    const decidedAt = Date.parse(parsed?.decidedAt);
    if (!parsed || parsed.version !== COOKIE_CONSENT_VERSION || typeof parsed.analytics !== 'boolean'
      || parsed.essential !== true || !Number.isFinite(decidedAt) || decidedAt > Date.now()
      || Date.now() - decidedAt >= 180 * 24 * 60 * 60 * 1000) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
};

export const saveCookieConsent = (analytics: boolean, proof?: { receiptId: string; visitorId: string; documentHash?: string }): CookieConsentState | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const consentState: CookieConsentState = {
    essential: true,
    analytics,
    version: COOKIE_CONSENT_VERSION,
    decidedAt: new Date().toISOString(),
    ...proof,
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

export const hasAnalyticsConsent = (): boolean => {
  const consent = getCookieConsent();
  return analyticsAvailable && consent?.analytics === true && typeof consent.receiptId === 'string' && typeof consent.visitorId === 'string'
    && consent.documentHash === analyticsDocumentHash && analyticsDocumentHash.length === 64;
};

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
