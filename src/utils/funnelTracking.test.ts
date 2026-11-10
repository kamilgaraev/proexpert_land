import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const site = vi.hoisted(() => ({ cabinet: true, marketing: false, conversion: false }));
vi.mock('@/utils/publicSite', () => ({
  isCabinetHost: () => site.cabinet,
  isPrimaryMarketingHost: () => site.marketing,
  isConversionPath: () => site.conversion,
}));

const load = async () => {
  vi.resetModules();
  return import('./funnelTracking');
};

describe('воронка в Umami', () => {
  beforeEach(() => {
    site.cabinet = true;
    site.marketing = false;
    site.conversion = false;
    window.localStorage.clear();
    delete window.umami;
    document.getElementById('most-umami-funnel')?.remove();
  });

  afterEach(() => {
    delete window.umami;
  });

  it('не отправляет события вне кабинета и страниц регистрации и оплаты', async () => {
    site.cabinet = false;
    site.marketing = true;
    const { trackFunnelEvent } = await load();
    expect(trackFunnelEvent('trial_started')).toBe(false);
    expect(document.getElementById('most-umami-funnel')).toBeNull();
  });

  it('на основном сайте отправляет только со страниц регистрации и оплаты', async () => {
    site.cabinet = false;
    site.marketing = true;
    site.conversion = true;
    const { trackFunnelEvent } = await load();
    expect(trackFunnelEvent('registration_started')).toBe(true);
  });

  it('загружает счётчик без автоматических просмотров и отправляет событие после загрузки', async () => {
    const append = vi.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
    const { trackFunnelEvent } = await load();
    expect(trackFunnelEvent('trial_started', { package: 'working-entry', empty: null, extra: undefined })).toBe(true);

    const script = append.mock.calls[0][0] as HTMLScriptElement;
    expect(script.id).toBe('most-umami-funnel');
    expect(script.dataset.autoTrack).toBe('false');
    expect(script.dataset.doNotTrack).toBe('true');
    expect(script.dataset.fetchCredentials).toBe('omit');

    const track = vi.fn().mockResolvedValue(undefined);
    window.umami = { track };
    script.dispatchEvent(new Event('load'));

    expect(track).toHaveBeenCalledOnce();
    expect(track.mock.calls[0][0]).toMatchObject({
      name: 'trial_started',
      url: '/conversion',
      referrer: '',
      data: { package: 'working-entry' },
    });
  });

  it('не передаёт адрес страницы и обрезает длинные значения', async () => {
    const track = vi.fn().mockResolvedValue(undefined);
    window.umami = { track };
    const { trackFunnelEvent } = await load();
    trackFunnelEvent('invoice_created', { kind: 'x'.repeat(300) });
    const payload = track.mock.calls[0][0];
    expect(payload.url).toBe('/conversion');
    expect(payload.data.kind).toHaveLength(100);
  });

  it('считает событие с ключом один раз', async () => {
    const track = vi.fn().mockResolvedValue(undefined);
    window.umami = { track };
    const { trackFunnelEventOnce } = await load();
    expect(trackFunnelEventOnce('registration_completed', 'key-1')).toBe(true);
    expect(trackFunnelEventOnce('registration_completed', 'key-1')).toBe(false);
    expect(track).toHaveBeenCalledOnce();
  });

  it('сбой счётчика не прерывает работу кабинета', async () => {
    window.umami = { track: vi.fn(() => { throw new Error('unavailable'); }) };
    const { trackFunnelEvent } = await load();
    expect(() => trackFunnelEvent('payment_started')).not.toThrow();
  });
});
