import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPublicSitePayloadFixture } from '@/test/fixtures/holdingSiteBuilder';
import type { PublicSite } from '@/types/holding-site-builder';
import HoldingLandingRuntimePage from './HoldingLandingRuntimePage';

const api = vi.hoisted(() => ({ getSiteData: vi.fn(), submitLead: vi.fn() }));
vi.mock('@/services/holdingSiteBuilderService', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/services/holdingSiteBuilderService')>(),
  publicHoldingSiteService: api,
}));
vi.mock('@components/shared/SEOHead', () => ({ SEOHead: () => null }));
vi.mock('@/components/holding/site-builder/SiteBuilderRenderer', () => ({
  default: ({ site }: { site: PublicSite }) => <div>{site.title}</div>,
}));

function NavigatePage() {
  const navigate = useNavigate();
  return <><button onClick={() => navigate('/about?lang=ru')}>О компании</button><HoldingLandingRuntimePage /></>;
}

function HydratedNavigation() {
  const navigate = useNavigate();
  const payload = createPublicSitePayloadFixture();
  payload.site.title = 'Главная из SSR';
  const initialPage = { pathname: '/', search: '', status: 200, payload };
  return <><button onClick={() => navigate('/about')}>Далее</button><button onClick={() => navigate('/')}>Назад</button><HoldingLandingRuntimePage initialPage={initialPage} /></>;
}

afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe('holding runtime navigation', () => {
  it('loads the requested path again when navigating between published pages', async () => {
    const home = createPublicSitePayloadFixture();
    home.site.title = 'Опубликованная главная';
    const about = createPublicSitePayloadFixture();
    about.site.title = 'Опубликованная компания';
    about.runtime.path = '/about';
    about.current_page!.slug = '/about';
    api.getSiteData.mockResolvedValueOnce(home).mockResolvedValueOnce(about);

    render(<MemoryRouter><NavigatePage /></MemoryRouter>);
    expect(await screen.findByText('Опубликованная главная')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'О компании' }));
    expect(await screen.findByText('Опубликованная компания')).toBeTruthy();
    await waitFor(() => expect(api.getSiteData).toHaveBeenLastCalledWith('/about', '?lang=ru'));
  });

  it('uses the SSR payload for hydration without fetching it again', async () => {
    const payload = createPublicSitePayloadFixture();
    payload.site.title = 'Сохранённый SSR сайт';
    render(<MemoryRouter><HoldingLandingRuntimePage initialPage={{ pathname: '/', search: '', status: 200, payload }} /></MemoryRouter>);
    expect(screen.getByText('Сохранённый SSR сайт')).toBeTruthy();
    expect(api.getSiteData).not.toHaveBeenCalled();
  });

  it('restores the initial page after navigating away and back', async () => {
    const about = createPublicSitePayloadFixture();
    about.site.title = 'Компания после перехода';
    about.runtime.path = '/about';
    about.current_page!.slug = '/about';
    api.getSiteData.mockResolvedValue(about);
    render(<MemoryRouter><HydratedNavigation /></MemoryRouter>);
    expect(screen.getByText('Главная из SSR')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    expect(await screen.findByText('Компания после перехода')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Назад' }));
    expect(await screen.findByText('Главная из SSR')).toBeTruthy();
    expect(api.getSiteData).toHaveBeenCalledTimes(1);
  });
});
