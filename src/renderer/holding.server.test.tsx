import { afterEach, describe, expect, it, vi } from 'vitest';
import App from '@/App';
import { render, passToClient } from './_default.page.server';

vi.mock('vike', () => ({
  escapeInject: (parts: TemplateStringsArray, ...values: unknown[]) => parts.reduce((html, part, index) => html + part + (values[index] ?? ''), ''),
  dangerouslySkipEscape: (value: string) => value,
}));
vi.mock('@/components/analytics/SiteTracking', () => ({ default: () => null }));
vi.mock('@components/common/AppLoadingFallback', () => ({ AppLoadingFallback: () => <div>Holding route loading</div> }));

afterEach(() => vi.unstubAllGlobals());

describe('holding SSR request', () => {
  it.each(['/', '/about'])('selects the holding app, providers, assets and canonical for %s without window', async (pathname) => {
    vi.stubGlobal('window', undefined);
    const host = 'company.xn--1-xtbgmf.xn--p1ai';
    const result = await render({
      Page: App,
      requestHostname: host,
      urlPathname: pathname,
      urlOriginal: `${pathname}?source=test`,
      pageProps: {},
    } as unknown as Parameters<typeof render>[0]);

    expect(result.documentHtml).toContain('Holding route loading');
    expect(result.documentHtml).toContain(`href="https://${host}${pathname}"`);
    expect(result.documentHtml).not.toContain('id="ld-json"');
    expect(result.documentHtml).not.toContain('id="most-home-styles"');
    expect(result.injectFilter).toBeUndefined();
    expect(result.pageContext.pageProps.requestHostname).toBe(host);
    expect(passToClient).toContain('requestHostname');
  });
});
