import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPublicSitePayloadFixture } from '@/test/fixtures/holdingSiteBuilder';

const require = createRequire(import.meta.url);
const { respondWithHoldingDiscovery } = require('../../server/holding-discovery.cjs') as {
  respondWithHoldingDiscovery: (
    request: { url: string; headers: { host: string } },
    response: { writeHead: ReturnType<typeof vi.fn>; end: ReturnType<typeof vi.fn> },
    options: { fetchImpl: typeof fetch },
  ) => Promise<boolean>;
};
const host = 'company.xn--1-xtbgmf.xn--p1ai';
const request = (url: string, hostname = host) => ({ url, headers: { host: hostname } });
const response = () => ({ writeHead: vi.fn(), end: vi.fn() });
const fetchPayload = (data = createPublicSitePayloadFixture(), status = 200) =>
  vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ success: status === 200, data }), { status }));

afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('holding discovery HTTP responses', () => {
  it.each(['xn--1-xtbgmf.xn--p1ai', 'lk.xn--1-xtbgmf.xn--p1ai', 'api.xn--1-xtbgmf.xn--p1ai', 'www.xn--1-xtbgmf.xn--p1ai', 'company.example.test'])('keeps %s on its existing discovery handlers', async (hostname) => {
    const res = response();
    const fetchImpl = fetchPayload();
    expect(await respondWithHoldingDiscovery(request('/robots.txt', hostname), res, { fetchImpl })).toBe(false);
    expect(res.end).not.toHaveBeenCalled();
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('does not intercept normal holding pages', async () => {
    const fetchImpl = fetchPayload();
    expect(await respondWithHoldingDiscovery(request('/about'), response(), { fetchImpl })).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('advertises the tenant sitemap using only a public root request', async () => {
    const res = response();
    const fetchImpl = fetchPayload();
    expect(await respondWithHoldingDiscovery(request('/robots.txt?preview=true&token=private'), res, { fetchImpl })).toBe(true);
    expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({ 'Content-Type': 'text/plain; charset=utf-8' }));
    expect(res.end).toHaveBeenCalledWith(expect.stringContaining(`Sitemap: https://${host}/sitemap.xml`));
    expect(res.end.mock.calls[0][0]).not.toContain('Host:');
    const [input, init] = fetchImpl.mock.calls[0];
    const url = new URL(String(input));
    expect(url.searchParams.get('site_domain')).toBe(host);
    expect(url.searchParams.get('path')).toBe('/');
    expect(url.searchParams.has('preview')).toBe(false);
    expect(url.searchParams.has('token')).toBe(false);
    expect(init?.headers).toEqual({ Accept: 'application/json' });
  });

  it('lists only indexable published public pages on the tenant domain', async () => {
    const data = createPublicSitePayloadFixture();
    const home = data.current_page!;
    const page = (slug: string, extra = {}) => ({ ...home, slug, is_home: false, ...extra });
    data.pages = [home, page('/о-компании'), page('/hidden', { seo_meta: { noindex: true } }),
      page('/unlisted', { visibility: 'private' }), page('/inactive', { is_active: false }),
      page('/%64ashboard'), page('/login'), page('/projects/4'), page('/a&b'),
      page('/localized-noindex', { locale_content: { ru: { seo_meta: { noindex: true } } } })];
    const res = response();
    await respondWithHoldingDiscovery(request('/sitemap.xml'), res, { fetchImpl: fetchPayload(data) });
    expect(res.writeHead).toHaveBeenCalledWith(200, expect.objectContaining({ 'Content-Type': 'application/xml; charset=utf-8' }));
    const xml = res.end.mock.calls[0][0] as string;
    expect(xml).toContain(`<loc>https://${host}/</loc>`);
    expect(xml).toContain(`<loc>https://${host}/%D0%BE-%D0%BA%D0%BE%D0%BC%D0%BF%D0%B0%D0%BD%D0%B8%D0%B8</loc>`);
    expect(xml).toContain(`<loc>https://${host}/a&amp;b</loc>`);
    for (const denied of ['hidden', 'unlisted', 'inactive', 'dashboard', 'login', 'projects', 'localized-noindex', 'preview', 'token']) expect(xml).not.toContain(denied);
    expect(xml.match(/<url>/g)).toHaveLength(3);
  });

  it('supports a published legacy block-only root', async () => {
    const data = createPublicSitePayloadFixture();
    delete data.pages;
    delete data.current_page;
    delete data.page;
    const res = response();
    await respondWithHoldingDiscovery(request('/sitemap.xml'), res, { fetchImpl: fetchPayload(data) });
    expect(res.end).toHaveBeenCalledWith(expect.stringContaining(`<loc>https://${host}/</loc>`));
  });

  it.each([404, 503])('does not advertise a sitemap after upstream HTTP%s', async (status) => {
    for (const path of ['/robots.txt', '/sitemap.xml']) {
      const res = response();
      await respondWithHoldingDiscovery(request(path), res, { fetchImpl: fetchPayload(undefined, status) });
      expect(res.writeHead).toHaveBeenCalledWith(path === '/robots.txt' && status === 404 ? 200 : status, expect.objectContaining({ 'Cache-Control': 'no-store' }));
      expect(res.end.mock.calls[0][0]).not.toContain('<urlset');
      expect(res.end.mock.calls[0][0]).not.toContain('Sitemap:');
    }
  });

  it.each(['draft', 'noindex'])('disables discovery for %s sites', async (mode) => {
    const data = createPublicSitePayloadFixture();
    if (mode === 'draft') data.runtime.mode = 'draft';
    else data.site.seo_meta.noindex = true;
    const res = response();
    await respondWithHoldingDiscovery(request('/robots.txt'), res, { fetchImpl: fetchPayload(data) });
    expect(res.end).toHaveBeenCalledWith('User-agent: *\nDisallow: /\n');
    expect(res.writeHead).toHaveBeenCalledWith(mode === 'draft' ? 503 : 200, expect.objectContaining({ 'Cache-Control': 'no-store' }));
  });

  it('bounds an unresponsive public API request', async () => {
    vi.useFakeTimers();
    const fetchImpl = vi.fn<typeof fetch>().mockImplementation((_input, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener('abort', () => reject(new Error('aborted')));
    }));
    const res = response();
    const pending = respondWithHoldingDiscovery(request('/sitemap.xml'), res, { fetchImpl });
    await vi.advanceTimersByTimeAsync(5_000);
    await pending;
    expect(res.writeHead).toHaveBeenCalledWith(503, expect.objectContaining({ 'Cache-Control': 'no-store' }));
  });
});
