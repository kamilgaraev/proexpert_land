import { afterEach, describe, expect, it, vi } from 'vitest';
import { Page as IndexPage } from '@/pages/index.page';
import { Page as CatchAllPage } from '@/pages/catch-all.page';
import { render, passToClient } from './_default.page.server';
import { createPublicSitePayloadFixture } from '@/test/fixtures/holdingSiteBuilder';

vi.mock('vike', () => ({
  escapeInject: (parts: TemplateStringsArray, ...values: unknown[]) => parts.reduce((html, part, index) => html + part + (values[index] ?? ''), ''),
  dangerouslySkipEscape: (value: string) => value,
}));
vi.mock('@/components/analytics/SiteTracking', () => ({ default: () => null }));

afterEach(() => vi.unstubAllGlobals());

describe('holding SSR request', () => {
  it.each([{ pathname: '/', Page: IndexPage }, { pathname: '/about', Page: CatchAllPage }])('renders the actual Vike entry for $pathname without window', async ({ pathname, Page }) => {
    vi.stubGlobal('window', undefined);
    const host = 'company.xn--1-xtbgmf.xn--p1ai';
    const payload = createPublicSitePayloadFixture();
    payload.site.title = 'Опубликованный SSR холдинг';
    payload.runtime.path = pathname;
    payload.runtime.locale = 'en';
    payload.current_page!.slug = pathname;
    const result = await render({
      Page,
      requestHostname: host,
      urlPathname: pathname,
      urlOriginal: `${pathname}?locale=en`,
      documentProps: { title: 'Опубликованный SSR холдинг', statusCode: 200, noIndex: false, lang: 'en' },
      pageProps: { initialHoldingPage: { pathname, search: '?locale=en', status: 200, payload } },
    } as unknown as Parameters<typeof render>[0]);

    expect(result.documentHtml).toContain('Опубликованный SSR холдинг');
    expect(result.documentHtml).toContain('<html lang="en"');
    expect(result.documentHtml).toContain('/?locale=en');
    expect(result.documentHtml).not.toContain('Загрузка сайта холдинга');
    expect(result.documentHtml).toContain(`href="https://${host}${pathname}"`);
    expect(result.documentHtml).not.toContain('id="ld-json"');
    expect(result.documentHtml).not.toContain('id="most-home-styles"');
    expect(result.injectFilter).toBeUndefined();
    expect(result.pageContext.pageProps.requestHostname).toBe(host);
    expect(passToClient).toContain('requestHostname');
  });
});
