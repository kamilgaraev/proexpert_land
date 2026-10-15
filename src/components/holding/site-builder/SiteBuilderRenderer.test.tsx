// @vitest-environment happy-dom

import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createPublicSitePayloadFixture } from '@/test/fixtures/holdingSiteBuilder';
import SiteBuilderRenderer from './SiteBuilderRenderer';

describe('SiteBuilderRenderer', () => {
  afterEach(cleanup);
  beforeEach(() => {
    window.history.replaceState({}, '', '/services?preview=true&token=preview-token');
  });

  it.each(['locale=en', 'lang=en', 'locale=en&lang=en'])('сохраняет публичную локаль %s без закрытого токена', (query) => {
    const payload = createPublicSitePayloadFixture();
    render(<MemoryRouter initialEntries={[`/about?${query}&tracking=discard&token=private-token`]}><SiteBuilderRenderer
      site={payload.site}
      blocks={[]}
      navigation={[{ id: 100, slug: '/', label: 'Главная', page_type: 'home', is_home: true }]}
    /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Главная' })).toHaveAttribute('href', `/?${query}`);
    expect(screen.getByRole('link', { name: new RegExp(payload.site.domain) }).getAttribute('href')).toBe(`/?${query}`);
  });

  it('сохраняет язык префикса при переходе по меню', () => {
    const payload = createPublicSitePayloadFixture();
    render(<MemoryRouter initialEntries={['/en/services?lang=ru&token=private']}><SiteBuilderRenderer
      site={payload.site}
      blocks={[]}
      navigation={[{ id: 100, slug: '/', label: 'Главная', page_type: 'home', is_home: true }]}
    /></MemoryRouter>);
    expect(screen.getByRole('link', { name: 'Главная' })).toHaveAttribute('href', '/?locale=en');
  });

  it('рендерит публичную навигацию и сохраняет preview query string в ссылках', () => {
    const payload = createPublicSitePayloadFixture();
    const currentPage = {
      ...payload.current_page!,
      id: 101,
      slug: 'services',
      page_type: 'services' as const,
      title: 'Услуги',
      navigation_label: 'Услуги',
      is_home: false,
    };

    render(
      <MemoryRouter initialEntries={['/services?preview=true&token=preview-token']}>
        <SiteBuilderRenderer
          blocks={currentPage.sections}
          mode="public"
          navigation={[
            {
              id: 100,
              slug: '/',
              label: 'Главная',
              page_type: 'home',
              is_home: true,
            },
            {
              id: currentPage.id,
              slug: currentPage.slug,
              label: currentPage.navigation_label ?? currentPage.title,
              page_type: currentPage.page_type,
              is_home: currentPage.is_home,
            },
          ]}
          page={currentPage}
          site={payload.site}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText(payload.site.domain)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Главная' })).toHaveAttribute(
      'href',
      '/?preview=true&token=preview-token',
    );
    expect(screen.getByRole('link', { name: 'Услуги' })).toHaveAttribute(
      'href',
      '/services?preview=true&token=preview-token',
    );
  });
});
