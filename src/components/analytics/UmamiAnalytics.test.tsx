import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { StrictMode, useEffect } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UMAMI_SCRIPT_URL, UMAMI_WEBSITE_ID } from '@/config/analytics';
import { useLegalManifest } from '@/hooks/useLegalManifest';
import { COOKIE_CONSENT_EVENT } from '@/utils/marketingConsent';

const host = vi.hoisted(() => ({ marketing: true }));
vi.mock('@/hooks/useLegalManifest', () => ({ useLegalManifest: vi.fn(() => ({ manifest: null, error: 'unavailable' })) }));
vi.mock('@/utils/publicSite', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/utils/publicSite')>(),
  isPrimaryMarketingHost: () => host.marketing,
}));

import UmamiAnalytics from './UmamiAnalytics';

function NavigateTo({ path }: { path: string }) {
  const navigate = useNavigate();
  useEffect(() => { navigate(path); }, [navigate, path]);
  return null;
}

const renderAnalytics = (path = '/', publishedBlogPath?: string) => render(
  <MemoryRouter initialEntries={[path]}><UmamiAnalytics publishedBlogPath={publishedBlogPath} /></MemoryRouter>,
);

const loadTracker = () => {
  const track = vi.fn().mockResolvedValue(undefined);
  window.umami = { track };
  fireEvent.load(document.getElementById('most-umami-analytics')!);
  return track;
};

describe('UmamiAnalytics', () => {
  beforeEach(() => {
    host.marketing = true;
    (window as unknown as { happyDOM: { settings: { handleDisabledFileLoadingAsSuccess: boolean } } })
      .happyDOM.settings.handleDisabledFileLoadingAsSuccess = true;
    window.history.replaceState(null, '', '/');
    document.head.innerHTML = '';
    window.localStorage.clear();
    delete window.umami;
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    delete window.umami;
  });

  it('считает посещение до выбора cookie и без доступного юридического manifest', () => {
    renderAnalytics();
    const track = loadTracker();
    expect(track).toHaveBeenCalledTimes(1);
    expect(useLegalManifest).not.toHaveBeenCalled();
    expect(window.localStorage.length).toBe(0);
  });

  it('считает посещение при отказе от аналитики и не меняет выбор для Метрики', () => {
    const refusal = JSON.stringify({ essential: true, analytics: false });
    window.localStorage.setItem('prohelper.cookie-consent', refusal);
    renderAnalytics();
    expect(loadTracker()).toHaveBeenCalledTimes(1);
    expect(window.localStorage.getItem('prohelper.cookie-consent')).toBe(refusal);
  });

  it.each(['/dashboard/projects/42', '/register?email=private@example.com', '/blog/preview/secret',
    '/blog/not-a-published-article', '/blog/private@example.com', '/blog/category/unknown-token', '/unknown/secret'])(
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

  it('отключает автоматический сбор и передачу HTTP referrer и cookie; учитывает Do Not Track', () => {
    renderAnalytics();
    const script = document.getElementById('most-umami-analytics') as HTMLScriptElement;
    expect(script.src).toBe(UMAMI_SCRIPT_URL);
    expect(script.dataset.websiteId).toBe(UMAMI_WEBSITE_ID);
    expect(script.dataset.autoTrack).toBe('false');
    expect(script.dataset.doNotTrack).toBe('true');
    expect(script.dataset.fetchCredentials).toBe('omit');
    expect(script.referrerPolicy).toBe('no-referrer');
    expect(loadTracker()).toHaveBeenCalledTimes(1);
  });

  it('отправляет только очищенные URL, рекламные метки и источник перехода', () => {
    vi.spyOn(document, 'referrer', 'get').mockReturnValue('https://search.example/path?email=private@example.com#secret');
    document.title = 'Результаты поиска private@example.com';
    renderAnalytics('/features?token=secret&email=private@example.com&utm_source=yandex&utm_campaign=private@example.com#token');
    const track = loadTracker();
    expect(track).toHaveBeenCalledWith(expect.objectContaining({
      website: UMAMI_WEBSITE_ID,
      url: '/features?utm_source=yandex',
      title: '/features',
      referrer: 'https://search.example',
    }));
    expect(track.mock.calls[0][0]).not.toHaveProperty('id');
    expect(track.mock.calls[0][0]).not.toHaveProperty('name');
    expect(track.mock.calls[0][0]).not.toHaveProperty('data');
    expect(JSON.stringify(track.mock.calls)).not.toContain('secret');
    expect(JSON.stringify(track.mock.calls)).not.toContain('private@example.com');
  });

  it('отправляет один просмотр на переход SPA', () => {
    const view = renderAnalytics('/features');
    const track = loadTracker();
    view.rerender(<MemoryRouter><UmamiAnalytics /><NavigateTo path="/pricing?source=menu#plans" /></MemoryRouter>);
    expect(track).toHaveBeenCalledTimes(2);
    expect(track).toHaveBeenLastCalledWith(expect.objectContaining({ url: '/pricing', referrer: '/features' }));
  });

  it('удаляет счётчик при переходе в личный кабинет', () => {
    const view = renderAnalytics('/features');
    const track = loadTracker();
    view.rerender(<MemoryRouter><UmamiAnalytics /><NavigateTo path="/dashboard?token=secret" /></MemoryRouter>);
    expect(track).toHaveBeenCalledTimes(1);
    expect(document.getElementById('most-umami-analytics')).toBeNull();
  });

  it('сохраняет учёт публичных просмотров после отзыва согласия на Метрику', () => {
    const view = renderAnalytics('/features');
    const track = loadTracker();
    act(() => {
      window.localStorage.setItem('prohelper.cookie-consent', JSON.stringify({ analytics: false }));
      window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
    });
    view.rerender(<MemoryRouter><UmamiAnalytics /><NavigateTo path="/pricing" /></MemoryRouter>);
    expect(track).toHaveBeenCalledTimes(2);
    expect(document.getElementById('most-umami-analytics')).not.toBeNull();
  });

  it('не отправляет устаревший URL, если скрипт загрузился после ухода со страницы', () => {
    const view = renderAnalytics('/features');
    const oldScript = document.getElementById('most-umami-analytics')!;
    view.unmount();
    window.umami = { track: vi.fn().mockResolvedValue(undefined) };
    fireEvent.load(oldScript);
    expect(window.umami.track).not.toHaveBeenCalled();
  });

  it('не дублирует просмотр при повторном эффекте StrictMode', () => {
    const track = vi.fn().mockResolvedValue(undefined);
    window.umami = { track };
    render(<StrictMode><MemoryRouter><UmamiAnalytics /></MemoryRouter></StrictMode>);
    expect(track).toHaveBeenCalledTimes(1);
  });

  it('учитывает подтверждённую опубликованную статью без query и hash', () => {
    renderAnalytics('/blog/published-article?token=secret&utm_source=yandex#private', '/blog/published-article');
    expect(loadTracker()).toHaveBeenCalledWith(expect.objectContaining({ url: '/blog/published-article' }));
  });

  it('не переносит подтверждение статьи на другой slug', () => {
    renderAnalytics('/blog/unknown-token', '/blog/published-article');
    expect(document.getElementById('most-umami-analytics')).toBeNull();
  });
});
