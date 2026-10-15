import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { createPublicSitePayloadFixture } from '@/test/fixtures/holdingSiteBuilder';
import { onBeforeRender } from './catch-all.page.server';
import { onBeforeRender as renderIndex, doNotPrerender } from './index.page.server';

const host = 'company.xn--1-xtbgmf.xn--p1ai';
const endpoint = 'https://api.xn--1-xtbgmf.xn--p1ai/api/v1/landing/holding/public/site-data';
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { server.resetHandlers(); vi.restoreAllMocks(); });
afterAll(() => server.close());

const context = (pathname: string, search = '') => ({ requestHostname: host, urlPathname: pathname, urlOriginal: pathname + search });

describe('holding public SSR data', () => {
  it.each(['/о-компании', '/%D0%BE-%D0%BA%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8'])('loads the encoded public address for slug %s', async (slug) => {
    const pathname = '/%D0%BE-%D0%BA%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8';
    const payload = createPublicSitePayloadFixture();
    payload.current_page!.slug = slug;
    payload.current_page!.is_home = false;
    server.use(http.get(endpoint, ({ request }) => {
      expect(new URL(request.url).searchParams.get('path')).toBe('/о-компании');
      return HttpResponse.json({ success: true, data: payload });
    }));
    const { pageContext } = await onBeforeRender(context(pathname));
    expect(pageContext.routeStatusCode).toBe(200);
    expect(pageContext.documentProps?.canonicalUrl).toBe(`https://${host}${pathname}`);
  });

  it('loads the holding root through the actual index server hook', async () => {
    const payload = createPublicSitePayloadFixture();
    server.use(http.get(endpoint, () => HttpResponse.json({ success: true, data: payload })));
    const { pageContext } = await renderIndex(context('/'));
    expect(pageContext).toMatchObject({ routeStatusCode: 200, documentProps: { canonicalUrl: `https://${host}/` }, pageProps: { initialHoldingPage: { payload: { site: { title: payload.site.title }, blocks: payload.blocks } } } });
    expect(doNotPrerender).toBe(true);
  });

  it('keeps marketing root rendering independent of the holding API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    expect(await renderIndex({ requestHostname: 'xn--1-xtbgmf.xn--p1ai', urlOriginal: '/' })).toEqual({ pageContext: {} });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each(['locale=en', 'lang=en', 'locale=en_US', 'locale=en&lang=ru'])('keeps the API locale in the canonical for %s', async (query) => {
    const payload = createPublicSitePayloadFixture();
    payload.runtime.locale = query.endsWith('en_US') ? 'en_US' : 'en';
    server.use(http.get(endpoint, ({ request }) => {
      const params = new URL(request.url).searchParams;
      expect(params.get('locale')).toBe(payload.runtime.locale);
      expect(params.has('lang')).toBe(false);
      expect(params.has('token')).toBe(false);
      return HttpResponse.json({ success: true, data: payload });
    }));
    const { pageContext } = await renderIndex(context('/', `?${query}&token=private&tracking=discard`));
    const locale = query.endsWith('en_US') ? 'en_US' : 'en';
    expect(pageContext).toMatchObject({ documentProps: { canonicalUrl: `https://${host}/?locale=${locale}` } });
  });

  it.each([['en', 'en'], ['en-US', 'en-US'], ['en_US', 'en-US'], ['invalid"><tag', 'ru'], ['', 'ru']])('uses a validated runtime locale %s as html language %s', async (locale, expected) => {
    const payload = createPublicSitePayloadFixture();
    payload.runtime.locale = locale;
    server.use(http.get(endpoint, () => HttpResponse.json({ success: true, data: payload })));
    const { pageContext } = await renderIndex(context('/', '?locale=en'));
    expect(pageContext).toMatchObject({ documentProps: { lang: expected } });
  });

  it.each(['current_page', 'page'] as const)('uses the SEO of %s in the server response', async (key) => {
    const payload = createPublicSitePayloadFixture();
    const page = payload.current_page!;
    page.seo_meta = { title: 'SEO страницы', noindex: true, keywords: 'страница', og_image: 'https://images.example/page.jpg' };
    payload.site.seo_meta.noindex = false;
    if (key === 'page') { payload.page = page; payload.current_page = null; }
    server.use(http.get(endpoint, () => HttpResponse.json({ success: true, data: payload })));
    const { pageContext } = await renderIndex(context('/'));
    expect(pageContext).toMatchObject({ documentProps: { noIndex: true, title: 'SEO страницы', keywords: 'страница', ogImage: 'https://images.example/page.jpg' } });
  });

  it.each(['services', '/services', '/services/'])('accepts the published slug %s', async (slug) => {
    const payload = createPublicSitePayloadFixture();
    payload.current_page!.slug = slug;
    payload.runtime.path = '/services';
    server.use(http.get(endpoint, () => HttpResponse.json({ success: true, data: payload })));
    const { pageContext } = await onBeforeRender(context('/services'));
    expect(pageContext.routeStatusCode).toBe(200);
  });

  it('loads tenant blog data and metadata without using the marketing blog API', async () => {
    const payload = createPublicSitePayloadFixture();
    payload.runtime.path = '/blog';
    payload.current_page!.slug = '/blog';
    payload.current_page!.seo_meta.title = 'Блог опубликованного холдинга';
    Object.assign(payload.site, { preview_url: 'PRIVATE-CAPABILITY' });
    server.use(http.get(endpoint, ({ request }) => {
      const url = new URL(request.url);
      expect(url.searchParams.get('site_domain')).toBe(host);
      expect(url.searchParams.get('path')).toBe('/blog');
      expect(request.headers.has('authorization')).toBe(false);
      expect(request.headers.has('cookie')).toBe(false);
      return HttpResponse.json({ success: true, data: payload });
    }));

    const { pageContext } = await onBeforeRender(context('/blog'));
    expect(pageContext.routeStatusCode).toBe(200);
    expect(pageContext.documentProps?.title).toBe('Блог опубликованного холдинга');
    expect(pageContext.documentProps?.canonicalUrl).toBe(`https://${host}/blog`);
    expect(pageContext.documentProps?.noIndex).toBe(false);
    expect(JSON.stringify(pageContext.pageProps)).not.toContain('PRIVATE-CAPABILITY');
  });

  it.each(['/never-published', '/'])('returns a real 404 for a home fallback regardless of runtime.path %s', async (runtimePath) => {
    const payload = createPublicSitePayloadFixture();
    payload.runtime.path = runtimePath;
    server.use(http.get(endpoint, () => HttpResponse.json({ success: true, data: payload })));
    const { pageContext } = await onBeforeRender(context('/never-published'));
    expect(pageContext.routeStatusCode).toBe(404);
    expect(pageContext.documentProps?.noIndex).toBe(true);
  });

  it('accepts a published additional page without optional runtime.path', async () => {
    const payload = createPublicSitePayloadFixture();
    delete payload.runtime.path;
    payload.current_page!.slug = '/services';
    payload.current_page!.is_home = false;
    server.use(http.get(endpoint, () => HttpResponse.json({ success: true, data: payload })));
    const { pageContext } = await onBeforeRender(context('/services'));
    expect(pageContext.routeStatusCode).toBe(200);
  });

  it('accepts a locale-prefixed published page and canonicalizes it to the locale query', async () => {
    const payload = createPublicSitePayloadFixture();
    payload.runtime.locale = 'en';
    payload.current_page!.slug = '/about';
    payload.current_page!.is_home = false;
    server.use(http.get(endpoint, () => HttpResponse.json({ success: true, data: payload })));
    const { pageContext } = await onBeforeRender(context('/en/about'));
    expect(pageContext).toMatchObject({ routeStatusCode: 200, documentProps: { lang: 'en', canonicalUrl: `https://${host}/about?locale=en` } });
  });

  it('keeps the API locale code usable when following a canonical URL', async () => {
    server.use(http.get(endpoint, ({ request }) => {
      const payload = createPublicSitePayloadFixture();
      payload.site.enabled_locales = ['ru', 'en_US'];
      payload.runtime.locale = new URL(request.url).searchParams.get('locale') === 'en_US' ? 'en_US' : 'ru';
      return HttpResponse.json({ success: true, data: payload });
    }));
    const first = await onBeforeRender(context('/', '?lang=en_US'));
    expect(first.pageContext.documentProps?.canonicalUrl).toBe(`https://${host}/?locale=en_US`);
    const second = await onBeforeRender(context('/', new URL(first.pageContext.documentProps!.canonicalUrl!).search));
    expect(second.pageContext.documentProps?.lang).toBe('en-US');
  });

  it('canonicalizes a fallback to the actual default locale', async () => {
    const payload = createPublicSitePayloadFixture();
    payload.runtime.locale = 'ru';
    server.use(http.get(endpoint, () => HttpResponse.json({ success: true, data: payload })));
    const { pageContext } = await onBeforeRender(context('/', '?locale=de'));
    expect(pageContext.documentProps?.canonicalUrl).toBe(`https://${host}/`);
  });

  it.each([['/', 200], ['/services', 404]] as const)('supports block-only legacy root without enabling extra path %s', async (pathname, status) => {
    const payload = createPublicSitePayloadFixture();
    delete payload.current_page;
    delete payload.page;
    server.use(http.get(endpoint, () => HttpResponse.json({ success: true, data: payload })));
    const { pageContext } = await onBeforeRender(context(pathname));
    expect(pageContext.routeStatusCode).toBe(status);
  });

  it.each(['/services', '/services/'])('uses one canonical for the published URL %s', async (pathname) => {
    const payload = createPublicSitePayloadFixture();
    payload.current_page!.slug = '/services';
    server.use(http.get(endpoint, () => HttpResponse.json({ success: true, data: payload })));
    const { pageContext } = await onBeforeRender(context(pathname));
    expect(pageContext.documentProps?.canonicalUrl).toBe(`https://${host}/services`);
    expect(pageContext.routeStatusCode).toBe(200);
  });

  it.each(['/dashboard/unknown', '/landing/editor/unknown'])('resolves the unknown panel subpath %s through the public 404 boundary', async (pathname) => {
    let calls = 0;
    server.use(http.get(endpoint, ({ request }) => {
      expect(new URL(request.url).searchParams.get('path')).toBe(pathname);
      calls++;
      return HttpResponse.json({ success: false }, { status: 404 });
    }));
    const { pageContext } = await onBeforeRender(context(pathname));
    expect(calls).toBe(1);
    expect(pageContext.routeStatusCode).toBe(404);
    expect(pageContext.documentProps?.noIndex).toBe(true);
  });

  it.each([404, 503])('preserves unavailable API status %s without indexing', async (status) => {
    server.use(http.get(endpoint, () => HttpResponse.json({ success: false }, { status })));
    const { pageContext } = await onBeforeRender(context('/about'));
    expect(pageContext.routeStatusCode).toBe(status);
    expect(pageContext.documentProps?.noIndex).toBe(true);
  });

  it.each(['/login', '/dashboard', '/reports/contracts', '/landing/editor', '/holding/7/landing/edit', '/Dashboard', '/REPORTS/Contracts', '/Landing/Editor', '/HOLDING/7/Landing/Edit', '/%64ashboard', '/landing/%65ditor'])(
    'does not fetch public data or index the protected path %s', async (pathname) => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');
      const { pageContext } = await onBeforeRender(context(pathname));
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(pageContext.documentProps?.noIndex).toBe(true);
      expect(pageContext.routeStatusCode).toBe(200);
    },
  );

  it('keeps preview content out of SSR and marks the preview as noindex', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    const { pageContext } = await onBeforeRender(context('/', '?preview=true&token=fixture-secret'));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(pageContext.documentProps?.noIndex).toBe(true);
    expect(JSON.stringify(pageContext)).not.toContain('"payload"');
    expect(JSON.stringify(pageContext)).not.toContain('fixture-secret');
  });

  it('bounds a stalled API request and returns unavailable metadata', async () => {
    server.use(http.get(endpoint, async () => { await delay('infinite'); return HttpResponse.json({}); }));
    const { pageContext } = await onBeforeRender(context('/about'));
    expect(pageContext.routeStatusCode).toBe(503);
    expect(pageContext.documentProps?.noIndex).toBe(true);
  }, 10_000);
});
