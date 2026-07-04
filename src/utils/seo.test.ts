import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { marketingSitemapRoutes } from '@/data/marketingRegistry';
import { getPageSEOData, normalizeOgImageUrl } from '@/utils/seo';

const require = createRequire(import.meta.url);
const { renderSitemapXml } = require(path.resolve(process.cwd(), 'server/sitemap.cjs')) as {
  renderSitemapXml: (articles?: Array<{
    slug?: string;
    url?: string;
    published_at?: string;
    updated_at?: string;
  }>) => string;
};

describe('getPageSEOData', () => {
  it('returns 404 metadata for unknown routes', () => {
    const seoData = getPageSEOData('/unknown-page');

    expect(seoData.statusCode).toBe(404);
    expect(seoData.noIndex).toBe(true);
    expect(seoData.title).toBe('Страница не найдена | МОСТ');
    expect(seoData.canonicalUrl).toBe('https://1мост.рф/');
    expect(seoData.ogImage).toBe('https://1мост.рф/og/404.png');
  });

  it('marks preview pages as noindex and keeps canonical path', () => {
    const seoData = getPageSEOData('/blog/preview/42');

    expect(seoData.statusCode).toBe(200);
    expect(seoData.noIndex).toBe(true);
    expect(seoData.canonicalUrl).toBe('https://1мост.рф/blog/preview/42');
    expect(seoData.ogImage).toBe('https://1мост.рф/og/blog.png');
  });

  it('returns cluster structured data and route-specific og image', () => {
    const seoData = getPageSEOData('/construction-crm');

    expect(seoData.statusCode).toBe(200);
    expect(seoData.noIndex).toBe(false);
    expect(seoData.ogImage).toBe('https://1мост.рф/og/construction-crm.png');
    expect(seoData.structuredData).toHaveLength(4);
  });
});

describe('normalizeOgImageUrl', () => {
  it('converts static МОСТ OG svg images to png', () => {
    expect(normalizeOgImageUrl('https://1мост.рф/og/contractor-control.svg'))
      .toBe('https://1мост.рф/og/contractor-control.png');
    expect(normalizeOgImageUrl('/og/contractor-control.svg')).toBe('/og/contractor-control.png');
  });

  it('keeps external or already raster images unchanged', () => {
    expect(normalizeOgImageUrl('https://cdn.example.test/cover.svg')).toBe('https://cdn.example.test/cover.svg');
    expect(normalizeOgImageUrl('https://1мост.рф/og/contractor-control.png'))
      .toBe('https://1мост.рф/og/contractor-control.png');
  });
});

describe('sitemap sync', () => {
  it('contains every indexable marketing route from the registry', () => {
    const sitemapXml = renderSitemapXml();
    const sitemapUrls = Array.from(
      sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g),
      (match) => match[1],
    );

    const expectedUrls = marketingSitemapRoutes.map(
      (route) => `https://1мост.рф${route.path === '/' ? '/' : route.path}`,
    );

    expect([...sitemapUrls].sort()).toEqual([...expectedUrls].sort());
    expect(sitemapUrls).not.toContain('https://1мост.рф/privacy');
    expect(sitemapUrls).not.toContain('https://1мост.рф/offer');
    expect(sitemapUrls).not.toContain('https://1мост.рф/cookies');
  });

  it('has a generated raster OG image for every indexable marketing route', () => {
    const missingImages = marketingSitemapRoutes.flatMap((route) => {
      const seoData = getPageSEOData(route.path);
      const imageFileName = new URL(seoData.ogImage).pathname.match(/^\/og\/([^/?#]+\.png)$/)?.[1];

      if (imageFileName && fs.existsSync(path.resolve(process.cwd(), 'public', 'og', imageFileName))) {
        return [];
      }

      return [`${route.path}: ${seoData.ogImage}`];
    });

    expect(missingImages).toEqual([]);
  });

  it('adds published blog article URLs supplied by the public blog sitemap API', () => {
    const sitemapXml = renderSitemapXml([
      {
        slug: 'kak-kontrolirovat-podryadchikov',
        updated_at: '2026-05-27T08:00:00.000000Z',
      },
    ]);

    expect(sitemapXml).toContain('<loc>https://1мост.рф/blog/kak-kontrolirovat-podryadchikov</loc>');
    expect(sitemapXml).toContain('<lastmod>2026-05-27T08:00:00.000Z</lastmod>');
  });
});
