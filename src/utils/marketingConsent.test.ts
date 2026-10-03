import { beforeEach, describe, expect, it, vi } from 'vitest';
const cookies = vi.hoisted(() => ({ value: null as string | null }));
vi.mock('./marketingCookies', () => ({
  readMarketingCookie: () => cookies.value,
  writeMarketingCookie: (_name: string, value: string) => { cookies.value = value; },
}));
import { clearCookieConsent, COOKIE_CONSENT_VERSION, getCookieConsent, hasAnalyticsConsent, saveCookieConsent } from './marketingConsent';

describe('shared analytics consent', () => {
  beforeEach(() => {
    cookies.value = null;
    window.localStorage.clear();
  });

  it('переносит выбор на домен кабинета без доступа к хранилищу основного сайта', () => {
    saveCookieConsent(true);
    window.localStorage.clear();
    expect(hasAnalyticsConsent()).toBe(true);
    expect(getCookieConsent()?.version).toBe(COOKIE_CONSENT_VERSION);
  });

  it('отзыв согласия имеет приоритет перед старым локальным разрешением', () => {
    const previous = saveCookieConsent(true);
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
    expect(saveCookieConsent(true)?.analytics).toBe(true);
    expect(hasAnalyticsConsent()).toBe(true);
  });
});
