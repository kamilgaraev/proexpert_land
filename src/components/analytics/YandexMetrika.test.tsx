import { act, render } from '@testing-library/react';
import { useEffect } from 'react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { COOKIE_CONSENT_VERSION } from '@/utils/marketingConsent';

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
    vi.useFakeTimers();
    document.head.innerHTML = '';
    document.body.innerHTML = '';
    window.localStorage.clear();
    window.localStorage.setItem(
      'prohelper.cookie-consent',
      JSON.stringify({
        essential: true,
        analytics: true,
        version: COOKIE_CONSENT_VERSION,
        decidedAt: '2026-07-11T00:00:00.000Z',
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
      'hit',
      window.location.href,
      expect.objectContaining({ params: { event: 'cta_clicked', location: 'hero' } }),
    );
  });

  it('инициализирует параметры нового счетчика без trackHash', () => {
    renderMetrika();

    const script = document.querySelector('#prohelper-yandex-metrika');
    const source = script?.textContent ?? '';

    expect(source).toContain('ym(110599591, "init"');
    expect(source).toContain('ssr:true');
    expect(source).toContain('ecommerce:"dataLayer"');
    expect(source).not.toContain('trackHash');
  });

  it('не дублирует первичный просмотр ручным hit', () => {
    renderMetrika('/features');

    act(() => {
      vi.runAllTimers();
    });

    expect(window.ym).not.toHaveBeenCalledWith(
      110599591,
      'hit',
      expect.any(String),
      expect.any(Object),
    );
  });

  it('отправляет один hit на новый SPA URL и не дублирует тот же URL', () => {
    const view = renderMetrika('/');

    view.rerender(
      <MemoryRouter initialEntries={['/']}>
        <YandexMetrika counterId={YANDEX_METRIKA_COUNTER_ID} />
        <NavigateTo path="/features?source=menu#details" />
      </MemoryRouter>,
    );

    act(() => {
      vi.runAllTimers();
    });

    expect(window.ym).toHaveBeenCalledTimes(1);
    expect(window.ym).toHaveBeenCalledWith(
      110599591,
      'hit',
      expect.stringMatching(/\/features\?source=menu#details$/),
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

    expect(window.ym).toHaveBeenCalledTimes(1);
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

    expect(window.ym).not.toHaveBeenCalled();
    expect(document.querySelector('#prohelper-yandex-metrika')).toBeNull();
    expect(document.querySelector('#prohelper-yandex-metrika-noscript')).toBeNull();
  });
});
