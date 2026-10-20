import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { analyticsProofFixture, legalFixture } from '@/test/legalFixture';
import { UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from '@/config/analytics';
import { COOKIE_CONSENT_EVENT, COOKIE_CONSENT_VERSION, setAnalyticsAvailability } from '@/utils/marketingConsent';

const host = vi.hoisted(() => ({ marketing: true }));
vi.mock('@/hooks/useLegalManifest', () => ({ useLegalManifest: () => ({ manifest: legalFixture, error: null }) }));
vi.mock('@/utils/publicSite', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/utils/publicSite')>(),
  isPrimaryMarketingHost: () => host.marketing,
}));

import UmamiAnalytics, { trackUmamiEvent } from './UmamiAnalytics';

function NavigateTo({ path }: { path: string }) {
  const navigate = useNavigate();
  useEffect(() => { navigate(path); }, [navigate, path]);
  return null;
}

const renderAnalytics = (path = '/') => render(
  <MemoryRouter initialEntries={[path]}><UmamiAnalytics /></MemoryRouter>,
);

const loadTracker = () => {
  const track = vi.fn().mockResolvedValue(undefined);
  window.umami = { track };
  fireEvent.load(document.getElementById('most-umami-analytics')!);
  act(() => { vi.advanceTimersByTime(250); });
  return track;
};

describe('UmamiAnalytics', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    host.marketing = true;
    (window as unknown as { happyDOM: { settings: { handleDisabledFileLoadingAsSuccess: boolean } } })
      .happyDOM.settings.handleDisabledFileLoadingAsSuccess = true;
    window.history.replaceState(null, '', '/');
    document.head.innerHTML = '';
    window.localStorage.clear();
    delete window.umami;
    setAnalyticsAvailability(true, analyticsProofFixture.documentHash);
    window.localStorage.setItem('prohelper.cookie-consent', JSON.stringify({
      essential: true,
      analytics: true,
      version: COOKIE_CONSENT_VERSION,
      decidedAt: new Date().toISOString(),
      ...analyticsProofFixture,
    }));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    delete window.umami;
  });

  it('не загружает счётчик без подтверждённого согласия', () => {
    window.localStorage.clear();
    renderAnalytics();
    expect(document.getElementById('most-umami-analytics')).toBeNull();
  });

  it.each(['/dashboard/projects/42', '/register?email=private@example.com', '/blog/preview/secret', '/unknown/secret'])(
    'не загружает счётчик для %s', (path) => {
      renderAnalytics(path);
      expect(document.getElementById('most-umami-analytics')).toBeNull();
    },
  );

  it('не загружает счётчик на домене личного кабинета или холдинга', () => {
    host.marketing = false;
    renderAnalytics('/features');
    expect(document.getElementById('most-umami-analytics')).toBeNull();
  });

  it('загружает собственный счётчик без автоматических просмотров и HTTP referrer', () => {
    renderAnalytics();
    const script = document.getElementById('most-umami-analytics') as HTMLScriptElement;
    expect(script.src).toBe(UMAMI_SCRIPT_URL);
    expect(script.dataset.websiteId).toBe(UMAMI_WEBSITE_ID);
    expect(script.dataset.autoTrack).toBe('false');
    expect(script.referrerPolicy).toBe('no-referrer');
    const track = loadTracker();
    expect(track).toHaveBeenCalledTimes(1);
  });

  it('отправляет только разрешённые рекламные метки и очищенный источник перехода', () => {
    vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://search.example/path?email=private@example.com#secret');
    renderAnalytics('/features?token=secret&email=private@example.com&utm_source=yandex&utm_campaign=private@example.com#token');
    const track = loadTracker();
    expect(track).toHaveBeenCalledWith(expect.objectContaining({
      website: UMAMI_WEBSITE_ID,
      url: '/features?utm_source=yandex',
      referrer: 'https://search.example',
    }));
    expect(JSON.stringify(track.mock.calls)).not.toContain('secret');
    expect(JSON.stringify(track.mock.calls)).not.toContain('private@example.com');
  });

  it('отправляет один просмотр на переход SPA', () => {
    const view = renderAnalytics('/features');
    const track = loadTracker();
    view.rerender(<MemoryRouter><UmamiAnalytics /><NavigateTo path="/pricing?source=menu#plans" /></MemoryRouter>);
    act(() => { vi.advanceTimersByTime(250); });
    expect(track).toHaveBeenCalledTimes(2);
    expect(track).toHaveBeenLastCalledWith(expect.objectContaining({ url: '/pricing', referrer: '/features' }));
  });

  it('отменяет ожидающий просмотр при переходе в личный кабинет', () => {
    const view = renderAnalytics('/features');
    window.umami = { track: vi.fn().mockResolvedValue(undefined) };
    fireEvent.load(document.getElementById('most-umami-analytics')!);
    view.rerender(<MemoryRouter><UmamiAnalytics /><NavigateTo path="/dashboard?token=secret" /></MemoryRouter>);
    act(() => { vi.advanceTimersByTime(250); });
    expect(window.umami.track).not.toHaveBeenCalled();
    expect(document.getElementById('most-umami-analytics')).toBeNull();
  });

  it('останавливает будущие события сразу после отзыва согласия', () => {
    renderAnalytics();
    const track = loadTracker();
    act(() => {
      window.localStorage.clear();
      window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
    });
    trackUmamiEvent('contact_form');
    expect(track).toHaveBeenCalledTimes(1);
    expect(document.getElementById('most-umami-analytics')).toBeNull();
  });

  it('отправляет только публичные события без данных формы и не отправляет события кабинета', () => {
    renderAnalytics();
    const track = loadTracker();
    trackUmamiEvent('contact_form');
    trackUmamiEvent('pricing_view');
    trackUmamiEvent('registration');
    trackUmamiEvent('page_view');
    expect(track).toHaveBeenCalledTimes(3);
    expect(track).toHaveBeenCalledWith(expect.objectContaining({ name: 'contact_form' }));
    expect(track.mock.calls[1][0]).not.toHaveProperty('data');
    window.history.replaceState(null, '', '/dashboard');
    trackUmamiEvent('contact_form');
    expect(track).toHaveBeenCalledTimes(3);
  });

  it('не отправляет устаревший URL, если скрипт загрузился после ухода со страницы', () => {
    const view = renderAnalytics('/features');
    const oldScript = document.getElementById('most-umami-analytics')!;
    view.unmount();
    window.umami = { track: vi.fn().mockResolvedValue(undefined) };
    fireEvent.load(oldScript);
    act(() => { vi.advanceTimersByTime(250); });
    expect(window.umami.track).not.toHaveBeenCalled();
  });
});
