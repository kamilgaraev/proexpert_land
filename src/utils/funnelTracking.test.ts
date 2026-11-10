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

const captureScript = () => vi.spyOn(document.head, 'appendChild').mockImplementation((node) => node);
const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('воронка в Umami', () => {
  beforeEach(() => {
    site.cabinet = true;
    site.marketing = false;
    site.conversion = false;
    window.localStorage.clear();
    delete window.umami;
  });

  afterEach(() => {
    delete window.umami;
    vi.useRealTimers();
  });

  it('не отправляет события вне кабинета и страниц регистрации и оплаты', async () => {
    site.cabinet = false;
    site.marketing = true;
    const append = captureScript();
    const { trackFunnelEvent, preloadFunnelTracking } = await load();
    preloadFunnelTracking();
    expect(trackFunnelEvent('trial_started')).toBe(false);
    expect(append).not.toHaveBeenCalled();
  });

  it('на основном сайте отправляет только со страниц регистрации и оплаты', async () => {
    site.cabinet = false;
    site.marketing = true;
    site.conversion = true;
    captureScript();
    const { trackFunnelEvent } = await load();
    expect(trackFunnelEvent('registration_started')).toBe(true);
  });

  it('загружает счётчик заранее, без автоматических просмотров', async () => {
    const append = captureScript();
    const { preloadFunnelTracking } = await load();
    preloadFunnelTracking();
    const script = append.mock.calls[0][0] as HTMLScriptElement;
    expect(script.id).toBe('most-umami-funnel');
    expect(script.dataset.autoTrack).toBe('false');
    expect(script.dataset.doNotTrack).toBe('true');
    expect(script.dataset.fetchCredentials).toBe('omit');
  });

  it('отправляет событие из очереди после загрузки счётчика', async () => {
    const append = captureScript();
    const { trackFunnelEvent } = await load();
    expect(trackFunnelEvent('trial_started', { package: 'working-entry', empty: null, extra: undefined })).toBe(true);

    const track = vi.fn().mockResolvedValue(undefined);
    window.umami = { track };
    (append.mock.calls[0][0] as HTMLScriptElement).dispatchEvent(new Event('load'));

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

  it('считает событие с ключом один раз после доставки', async () => {
    const track = vi.fn().mockResolvedValue(undefined);
    window.umami = { track };
    const { trackFunnelEventOnce } = await load();
    expect(trackFunnelEventOnce('registration_completed', 'key-1')).toBe(true);
    expect(trackFunnelEventOnce('registration_completed', 'key-1')).toBe(false);
    await flushPromises();
    expect(window.localStorage.getItem('most.funnel.registration_completed.key-1')).toBe('1');
    expect(track).toHaveBeenCalledOnce();
  });

  it('не запоминает событие, если счётчик не загрузился, и позволяет повторить', async () => {
    const append = captureScript();
    const { trackFunnelEventOnce } = await load();
    expect(trackFunnelEventOnce('purchase', 'order-1')).toBe(true);
    (append.mock.calls[0][0] as HTMLScriptElement).dispatchEvent(new Event('error'));
    await flushPromises();
    expect(window.localStorage.getItem('most.funnel.purchase.order-1')).toBeNull();

    const track = vi.fn().mockResolvedValue(undefined);
    window.umami = { track };
    expect(trackFunnelEventOnce('purchase', 'order-1')).toBe(true);
    await flushPromises();
    expect(track).toHaveBeenCalledOnce();
    expect(window.localStorage.getItem('most.funnel.purchase.order-1')).toBe('1');
  });

  it('не запоминает событие при отказе отправки', async () => {
    window.umami = { track: vi.fn().mockRejectedValue(new Error('offline')) };
    const { trackFunnelEventOnce } = await load();
    expect(trackFunnelEventOnce('email_verified', 'user-1')).toBe(true);
    await flushPromises();
    expect(window.localStorage.getItem('most.funnel.email_verified.user-1')).toBeNull();
  });

  it('перед уходом на оплату ждёт отправки', async () => {
    let finish: () => void = () => undefined;
    const track = vi.fn(() => new Promise<void>((resolve) => { finish = resolve; }));
    window.umami = { track };
    const { trackFunnelEventBeforeLeave } = await load();
    let left = false;
    const leaving = trackFunnelEventBeforeLeave('payment_started').then(() => { left = true; });
    await flushPromises();
    expect(left).toBe(false);
    finish();
    await leaving;
    expect(track).toHaveBeenCalledOnce();
  });

  it('не задерживает оплату дольше таймаута, если счётчик не отвечает', async () => {
    vi.useFakeTimers();
    captureScript();
    const { trackFunnelEventBeforeLeave } = await load();
    let left = false;
    const leaving = trackFunnelEventBeforeLeave('payment_started', undefined, 1000).then(() => { left = true; });
    await vi.advanceTimersByTimeAsync(999);
    expect(left).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await leaving;
    expect(left).toBe(true);
  });

  it('сбой счётчика не прерывает работу кабинета', async () => {
    window.umami = { track: vi.fn(() => { throw new Error('unavailable'); }) };
    const { trackFunnelEvent, trackFunnelEventBeforeLeave } = await load();
    expect(() => trackFunnelEvent('payment_started')).not.toThrow();
    await expect(trackFunnelEventBeforeLeave('payment_started')).resolves.toBeUndefined();
  });
});
