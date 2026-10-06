import { beforeEach, describe, expect, it } from 'vitest';
import { captureMarketingAttribution, clearMarketingAttribution, getMarketingAttribution } from './marketingAttribution';
import { saveCookieConsent, setAnalyticsAvailability } from './marketingConsent';
import { analyticsProofFixture } from '@/test/legalFixture';

describe('marketing attribution', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    clearMarketingAttribution();
    setAnalyticsAvailability(true, analyticsProofFixture.documentHash);
  });

  it('сохраняет источник после перехода на страницу без меток', () => {
    saveCookieConsent(true, analyticsProofFixture);
    captureMarketingAttribution('?utm_source=yandex&utm_campaign=materials');
    captureMarketingAttribution('');
    expect(getMarketingAttribution()).toEqual({ utm_source: 'yandex', utm_campaign: 'materials' });
  });

  it('не сохраняет и не передаёт источник без согласия; получает метки только после подтверждения', () => {
    captureMarketingAttribution('?utm_source=partner&email=private@example.com&signature=secret');
    captureMarketingAttribution('');
    expect(getMarketingAttribution()).toEqual({});
    expect(window.sessionStorage.length).toBe(0);
    saveCookieConsent(true, analyticsProofFixture);
    captureMarketingAttribution('?utm_source=partner&email=private@example.com&signature=secret');
    expect(window.sessionStorage.length).toBe(1);
    expect(window.sessionStorage.getItem('most.marketing-attribution')).not.toContain('private');
  });

  it('заменяет предыдущую кампанию и ограничивает длину значений', () => {
    saveCookieConsent(true, analyticsProofFixture);
    captureMarketingAttribution('?utm_source=old&utm_medium=email');
    captureMarketingAttribution(`?utm_source=${'x'.repeat(400)}`);
    expect(getMarketingAttribution()).toEqual({ utm_source: 'x'.repeat(160) });
  });
});
