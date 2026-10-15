import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { render, passToClient } from './_default.page.server';
import { createPublicSitePayloadFixture } from '@/test/fixtures/holdingSiteBuilder';

vi.mock('vike', () => ({
  escapeInject: (parts: TemplateStringsArray, ...values: unknown[]) => parts.reduce((html, part, index) => html + part + (values[index] ?? ''), ''),
  dangerouslySkipEscape: (value: string) => value,
}));
vi.mock('@/components/analytics/SiteTracking', () => ({ default: () => null }));

afterEach(() => vi.unstubAllGlobals());

describe('holding SSR request', () => {
  it.each(['/', '/about'])('selects the holding app, providers, assets and canonical for %s without window', async (pathname) => {
    vi.stubGlobal('window', undefined);
    const host = 'company.xn--1-xtbgmf.xn--p1ai';
    const payload = createPublicSitePayloadFixture();
    payload.site.title = 'Опубликованный SSR холдинг';
    payload.runtime.path = pathname;
    payload.current_page!.slug = pathname;
    const result = await render({
      Page: App,
      requestHostname: host,
      urlPathname: pathname,
      urlOriginal: `${pathname}?source=test`,
      documentProps: { title: 'Опубликованный SSR холдинг', statusCode: 200, noIndex: false },
      pageProps: { initialHoldingPage: { pathname, search: '?source=test', status: 200, payload } },
    } as unknown as Parameters<typeof render>[0]);

    expect(result.documentHtml).toContain('Опубликованный SSR холдинг');
    expect(result.documentHtml).not.toContain('Загрузка сайта холдинга');
    expect(result.documentHtml).toContain(`href="https://${host}${pathname}"`);
    expect(result.documentHtml).not.toContain('id="ld-json"');
    expect(result.documentHtml).not.toContain('id="most-home-styles"');
    expect(result.injectFilter).toBeUndefined();
    expect(result.pageContext.pageProps.requestHostname).toBe(host);
    expect(passToClient).toContain('requestHostname');
  });
});
