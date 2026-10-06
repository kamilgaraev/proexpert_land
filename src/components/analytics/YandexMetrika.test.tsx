import { legalFixture, analyticsProofFixture } from '@/test/legalFixture';
vi.mock('@/hooks/useLegalManifest', () => ({ useLegalManifest: () => ({ manifest: legalFixture, error: null }) }));
import { act, render } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { COOKIE_CONSENT_VERSION, setAnalyticsAvailability } from '@/utils/marketingConsent';

vi.mock('@/utils/publicSite', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/utils/publicSite')>();

  return {
    ...original,
    isPrimaryMarketingHost: () => true,
  };
});

import YandexMetrika, {
  trackYandexEvent,
  trackYandexGoal,
  YANDEX_METRIKA_COUNTER_ID,
} from './YandexMetrika';

const NavigateTo = ({ path }: { path: string }) => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(path);
  }, [navigate, path]);

  return null;
};

const renderMetrika = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <YandexMetrika counterId={YANDEX_METRIKA_COUNTER_ID} />
    </MemoryRouter>,
  );

describe('YandexMetrika', () => {
  beforeEach(() => {
    (window as unknown as { happyDOM: { settings: { handleDisabledFileLoadingAsSuccess: boolean } } }).happyDOM.settings.handleDisabledFileLoadingAsSuccess = true;
    vi.useFakeTimers();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    window.localStorage.clear();
    setAnalyticsAvailability(true, analyticsProofFixture.documentHash);
    window.localStorage.setItem(
      'prohelper.cookie-consent',
      JSON.stringify({
        essential: true,
        analytics: true,
        version: COOKIE_CONSENT_VERSION,
        decidedAt: new Date().toISOString(),
        ...analyticsProofFixture,
      }),
    );
    window.ym = vi.fn();
  });

  it('использует новый идентификатор для целей и событий', () => {
    expect(YANDEX_METRIKA_COUNTER_ID).toBe(110599591);

    trackYandexGoal('demo_requested', { source: 'hero' });
    trackYandexEvent('cta_clicked', { location: 'hero' });

    expect(window.ym).toHaveBeenNthCalledWith(
      1,
      110599591,
      'reachGoal',
      'demo_requested',
      { source: 'hero' },
    );
    expect(window.ym).toHaveBeenNthCalledWith(
      2,
      110599591,
      'params',
      { event: 'cta_clicked', location: 'hero' },
    );
  });

  it('не отправляет события и цели без согласия на аналитику', () => {
    window.localStorage.clear();
    trackYandexEvent('cta_clicked', { location: 'hero' });
    trackYandexGoal('contact_form');
    expect(window.ym).not.toHaveBeenCalled();
  });

  it('инициализирует параметры нового счетчика без trackHash', () => {
    renderMetrika();

    const script = document.querySelector('#prohelper-yandex-metrika');
    expect(script?.getAttribute('src')).toBe('https://mc.yandex.ru/metrika/tag.js');
    expect(window.ym).toHaveBeenCalledWith(110599591, 'init', expect.objectContaining({ ssr: true, defer: true, ecommerce: false, webvisor: false, trackLinks: false }));
    expect(vi.mocked(window.ym!).mock.calls[0][2]).not.toHaveProperty('trackHash');
  });

  it('учитывает регистрацию без записи формы и приватного URL', () => {
    renderMetrika('/register?email=private@example.com&signature=secret');
    expect(window.ym).toHaveBeenCalledWith(110599591, 'init', expect.objectContaining({
      defer: true, webvisor: false, clickmap: false, trackLinks: false, sendTitle: false,
      url: expect.not.stringContaining('private'),
    }));
  });

  it('отправляет один первичный просмотр при отключённой автоматической отправке', () => {
    renderMetrika('/features');

    act(() => {
      vi.runAllTimers();
    });

    expect(window.ym).toHaveBeenCalledWith(
      110599591,
      'hit',
      expect.any(String),
      expect.any(Object),
    );
    expect(vi.mocked(window.ym!).mock.calls.filter((call) => call[1] === 'hit')).toHaveLength(1);
  });

  it('отправляет один hit на новый SPA URL и не дублирует тот же URL', () => {
    const view = renderMetrika('/');
    act(() => { vi.runAllTimers(); });

    view.rerender(
      <MemoryRouter initialEntries={['/']}>
        <YandexMetrika counterId={YANDEX_METRIKA_COUNTER_ID} />
        <NavigateTo path="/features?source=menu#details" />
      </MemoryRouter>,
    );

    act(() => {
      vi.runAllTimers();
    });

    expect(vi.mocked(window.ym!).mock.calls.filter((call) => call[1] === 'hit')).toHaveLength(2);
    expect(window.ym).toHaveBeenCalledWith(
      110599591,
      'hit',
      expect.stringMatching(/\/features$/),
      expect.objectContaining({ referer: expect.stringMatching(/\/$/) }),
    );

    view.rerender(
      <MemoryRouter initialEntries={['/features?source=menu#details']}>
        <YandexMetrika counterId={YANDEX_METRIKA_COUNTER_ID} />
      </MemoryRouter>,
    );

    act(() => {
      vi.runAllTimers();
    });

    expect(vi.mocked(window.ym!).mock.calls.filter((call) => call[1] === 'hit')).toHaveLength(2);
  });

  it('не отправляет внутренний маршрут после ухода с маркетинговой страницы', () => {
    const view = renderMetrika('/features');

    view.rerender(
      <MemoryRouter initialEntries={['/features']}>
        <YandexMetrika counterId={YANDEX_METRIKA_COUNTER_ID} />
        <NavigateTo path="/dashboard" />
      </MemoryRouter>,
    );

    act(() => {
      vi.runAllTimers();
    });

    expect(window.ym).toHaveBeenCalledWith(110599591, 'destruct');
    expect(vi.mocked(window.ym!).mock.calls.some((call) => call[1] === 'hit')).toBe(false);
    expect(document.querySelector('#prohelper-yandex-metrika-noscript')).toBeNull();
  });
});
