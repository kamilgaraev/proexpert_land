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

afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe('holding runtime navigation', () => {
  it('loads the requested path again when navigating between published pages', async () => {
    const home = createPublicSitePayloadFixture();
    home.site.title = 'Опубликованная главная';
    const about = createPublicSitePayloadFixture();
    about.site.title = 'Опубликованная компания';
    api.getSiteData.mockResolvedValueOnce(home).mockResolvedValueOnce(about);

    render(<MemoryRouter><NavigatePage /></MemoryRouter>);
    expect(await screen.findByText('Опубликованная главная')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'О компании' }));
    expect(await screen.findByText('Опубликованная компания')).toBeTruthy();
    await waitFor(() => expect(api.getSiteData).toHaveBeenLastCalledWith('/about', '?lang=ru'));
  });
});
