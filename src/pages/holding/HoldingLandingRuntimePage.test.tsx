import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPublicSitePayloadFixture } from '@/test/fixtures/holdingSiteBuilder';
import type { PublicSite } from '@/types/holding-site-builder';
import HoldingLandingRuntimePage from './HoldingLandingRuntimePage';

const api = vi.hoisted(() => ({ getSiteData: vi.fn(), submitLead: vi.fn() }));
const seo = vi.hoisted(() => vi.fn());
const renderPage = vi.hoisted(() => vi.fn());
vi.mock('@/services/holdingSiteBuilderService', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/services/holdingSiteBuilderService')>(),
  publicHoldingSiteService: api,
}));
vi.mock('@components/shared/SEOHead', () => ({ SEOHead: (props: unknown) => { seo(props); return null; } }));
vi.mock('@/components/holding/site-builder/SiteBuilderRenderer', () => ({
  default: ({ site }: { site: PublicSite }) => { renderPage(site.title); return <div>{site.title}</div>; },
}));

function NavigatePage() {
  const navigate = useNavigate();
  return <><button onClick={() => navigate('/about?lang=ru')}>О компании</button><HoldingLandingRuntimePage /></>;
}

function NavigatePublicPage({ target }: { target: string }) {
  const navigate = useNavigate();
  return <><button onClick={() => navigate(target)}>Другая страница</button><HoldingLandingRuntimePage /></>;
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
  it.each(['/services', '/about?lang=en'])('does not render the previous page under the new URL %s', async (target) => {
    const about = createPublicSitePayloadFixture();
    about.site.title = 'Прежняя страница';
    about.runtime.path = '/about';
    about.current_page!.slug = '/about';
    about.current_page!.seo_meta.title = 'Прежние SEO';
    const next = createPublicSitePayloadFixture();
    next.site.title = 'Новая страница';
    next.runtime.path = target.split('?')[0];
    next.current_page!.slug = next.runtime.path;
    next.current_page!.seo_meta.title = 'Новые SEO';
    api.getSiteData.mockResolvedValueOnce(about).mockResolvedValueOnce(next);
    render(<MemoryRouter initialEntries={['/about']}><NavigatePublicPage target={target} /></MemoryRouter>);
    expect(await screen.findByText('Прежняя страница')).toBeTruthy();
    renderPage.mockClear();
    seo.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Другая страница' }));
    expect(await screen.findByText('Новая страница')).toBeTruthy();
    expect(renderPage).not.toHaveBeenCalledWith('Прежняя страница');
    expect(seo).not.toHaveBeenCalledWith(expect.objectContaining({ title: about.current_page!.seo_meta.title }));
  });
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

  it('renders a successful legacy root from blocks without a page object', async () => {
    const payload = createPublicSitePayloadFixture();
    payload.site.title = 'Прежняя опубликованная главная';
    delete payload.current_page;
    delete payload.page;
    api.getSiteData.mockResolvedValue(payload);
    render(<MemoryRouter><HoldingLandingRuntimePage /></MemoryRouter>);
    expect(await screen.findByText('Прежняя опубликованная главная')).toBeTruthy();
  });

  it('renders locale-prefixed content and keeps its canonical and language consistent', async () => {
    const payload = createPublicSitePayloadFixture();
    payload.site.title = 'English services';
    payload.runtime.locale = 'en';
    payload.current_page!.slug = '/services';
    payload.current_page!.is_home = false;
    api.getSiteData.mockResolvedValue(payload);
    render(<MemoryRouter initialEntries={['/en/services?lang=ru']}><HoldingLandingRuntimePage /></MemoryRouter>);
    expect(await screen.findByText('English services')).toBeTruthy();
    expect(seo).toHaveBeenLastCalledWith(expect.objectContaining({ lang: 'en', canonicalUrl: `${window.location.origin}/services?locale=en` }));
  });

  it('renders a requested additional page without optional runtime.path', async () => {
    const payload = createPublicSitePayloadFixture();
    payload.site.title = 'Дополнительная страница без runtime.path';
    payload.current_page!.slug = '/services';
    payload.current_page!.is_home = false;
    delete payload.runtime.path;
    api.getSiteData.mockResolvedValue(payload);
    render(<MemoryRouter initialEntries={['/services']}><HoldingLandingRuntimePage /></MemoryRouter>);
    expect(await screen.findByText('Дополнительная страница без runtime.path')).toBeTruthy();
    expect(api.getSiteData).toHaveBeenCalledWith('/services', '');
  });

  it('keeps an unpublished root at 404 without loading legacy public branding', () => {
    render(<MemoryRouter><HoldingLandingRuntimePage initialPage={{ pathname: '/', search: '', status: 404, message: 'Страница не найдена.' }} /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: '404' })).toBeTruthy();
    expect(api.getSiteData).not.toHaveBeenCalled();
  });

  it('recovers from a transient SSR failure with a client request', async () => {
    const payload = createPublicSitePayloadFixture();
    payload.site.title = 'Сайт после восстановления API';
    api.getSiteData.mockResolvedValue(payload);
    render(<MemoryRouter><HoldingLandingRuntimePage initialPage={{ pathname: '/', search: '', status: 503, message: 'API недоступен' }} /></MemoryRouter>);
    expect(await screen.findByText('Сайт после восстановления API')).toBeTruthy();
    expect(api.getSiteData).toHaveBeenCalledTimes(1);
    expect(api.getSiteData).toHaveBeenCalledWith('/', '');
  });

  it('keeps a failed client recovery unavailable and unindexed without a retry loop', async () => {
    api.getSiteData.mockRejectedValue(new Error('API по-прежнему недоступен'));
    render(<MemoryRouter><HoldingLandingRuntimePage initialPage={{ pathname: '/', search: '', status: 503 }} /></MemoryRouter>);
    expect(await screen.findByRole('heading', { name: 'Публичный сайт недоступен' })).toBeTruthy();
    expect(seo).toHaveBeenLastCalledWith(expect.objectContaining({ noIndex: true }));
    expect(api.getSiteData).toHaveBeenCalledTimes(1);
  });

  it.each(['current_page', 'page'] as const)('preserves page SEO from %s after hydration', (key) => {
    const payload = createPublicSitePayloadFixture();
    const page = payload.current_page!;
    page.seo_meta = { title: 'SEO страницы', noindex: true, keywords: 'страница', og_image: 'https://images.example/page.jpg' };
    payload.runtime.locale = 'en';
    payload.site.seo_meta.noindex = false;
    if (key === 'page') { payload.page = page; payload.current_page = null; }
    render(<MemoryRouter><HoldingLandingRuntimePage initialPage={{ pathname: '/', search: '', status: 200, payload }} /></MemoryRouter>);
    expect(seo).toHaveBeenLastCalledWith(expect.objectContaining({ lang: 'en', noIndex: true, title: 'SEO страницы', keywords: 'страница', ogImage: 'https://images.example/page.jpg' }));
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
