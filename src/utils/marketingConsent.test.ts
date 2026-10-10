import { beforeEach, describe, expect, it, vi } from 'vitest';
const cookies = vi.hoisted(() => ({ value: null as string | null }));
vi.mock('./marketingCookies', () => ({
  readMarketingCookie: () => cookies.value,
  writeMarketingCookie: (_name: string, value: string) => { cookies.value = value; },
}));
import { clearCookieConsent, COOKIE_CONSENT_VERSION, getCookieConsent, hasAnalyticsConsent, saveCookieConsent, setAnalyticsAvailability } from './marketingConsent';
import { analyticsProofFixture } from '@/test/legalFixture';

describe('shared analytics consent', () => {
  beforeEach(() => {
    cookies.value = null;
    window.localStorage.clear();
    setAnalyticsAvailability(true, analyticsProofFixture.documentHash);
  });

  it('переносит выбор на домен кабинета без доступа к хранилищу основного сайта', () => {
    saveCookieConsent(true, analyticsProofFixture);
    window.localStorage.clear();
    expect(hasAnalyticsConsent()).toBe(true);
    expect(getCookieConsent()?.version).toBe(COOKIE_CONSENT_VERSION);
  });

  it('отзыв согласия имеет приоритет перед старым локальным разрешением', () => {
    const previous = saveCookieConsent(true, analyticsProofFixture);
    saveCookieConsent(false);
    window.localStorage.setItem('prohelper.cookie-consent', JSON.stringify(previous));
    expect(hasAnalyticsConsent()).toBe(false);
    clearCookieConsent();
    window.localStorage.setItem('prohelper.cookie-consent', JSON.stringify(previous));
    expect(getCookieConsent()).toBeNull();
  });

  it('не принимает повреждённые или устаревшие разрешения', () => {
    cookies.value = '{invalid';
    expect(hasAnalyticsConsent()).toBe(false);
    cookies.value = JSON.stringify({ version: 'old', analytics: true });
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('сохраняет выбор при блокировке localStorage', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('storage blocked'); });
    expect(saveCookieConsent(true, analyticsProofFixture)?.analytics).toBe(true);
    expect(hasAnalyticsConsent()).toBe(true);
  });

  it('не разрешает аналитику без серверного доказательства или при новой идентификации оператора', () => {
    saveCookieConsent(true);
    expect(hasAnalyticsConsent()).toBe(false);
    saveCookieConsent(true, analyticsProofFixture);
    expect(hasAnalyticsConsent()).toBe(true);
    setAnalyticsAvailability(true, 'b'.repeat(64));
    expect(hasAnalyticsConsent()).toBe(false);
  });

  it('не продлевает 180 дней при повторном чтении выбора', () => {
    cookies.value = JSON.stringify({ essential: true, analytics: true, version: COOKIE_CONSENT_VERSION,
      decidedAt: new Date(Date.now() - 181 * 24 * 60 * 60 * 1000).toISOString(), ...analyticsProofFixture });
    expect(getCookieConsent()).toBeNull();
  });
});
