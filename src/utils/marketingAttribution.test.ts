import { beforeEach, describe, expect, it } from 'vitest';
import { captureMarketingAttribution, clearMarketingAttribution, getMarketingAttribution } from './marketingAttribution';
import { saveCookieConsent } from './marketingConsent';

describe('marketing attribution', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    clearMarketingAttribution();
  });

  it('сохраняет источник после перехода на страницу без меток', () => {
    saveCookieConsent(true);
    captureMarketingAttribution('?utm_source=yandex&utm_campaign=materials');
    captureMarketingAttribution('');
    expect(getMarketingAttribution()).toEqual({ utm_source: 'yandex', utm_campaign: 'materials' });
  });

  it('не теряет источник до выбора согласия и не сохраняет его без согласия', () => {
    captureMarketingAttribution('?utm_source=partner&email=private@example.com&signature=secret');
    captureMarketingAttribution('');
    expect(getMarketingAttribution()).toEqual({ utm_source: 'partner' });
    expect(window.sessionStorage.length).toBe(0);
    saveCookieConsent(true);
    captureMarketingAttribution('');
    expect(window.sessionStorage.length).toBe(1);
    expect(window.sessionStorage.getItem('most.marketing-attribution')).not.toContain('private');
  });

  it('заменяет предыдущую кампанию и ограничивает длину значений', () => {
    captureMarketingAttribution('?utm_source=old&utm_medium=email');
    captureMarketingAttribution(`?utm_source=${'x'.repeat(400)}`);
    expect(getMarketingAttribution()).toEqual({ utm_source: 'x'.repeat(160) });
  });
});
