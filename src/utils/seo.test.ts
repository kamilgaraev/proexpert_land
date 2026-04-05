import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { marketingSitemapRoutes } from '@/data/marketingRegistry';
import { getPageSEOData } from '@/utils/seo';

describe('getPageSEOData', () => {
  it('returns 404 metadata for unknown routes', () => {
    const seoData = getPageSEOData('/unknown-page');

    expect(seoData.statusCode).toBe(404);
    expect(seoData.noIndex).toBe(true);
    expect(seoData.title).toBe('Страница не найдена | ProHelper');
    expect(seoData.canonicalUrl).toBe('https://prohelper.pro/unknown-page');
    expect(seoData.ogImage).toBe('https://prohelper.pro/og/404.svg');
  });

  it('marks preview pages as noindex and keeps canonical path', () => {
    const seoData = getPageSEOData('/blog/preview/42');

    expect(seoData.statusCode).toBe(200);
    expect(seoData.noIndex).toBe(true);
    expect(seoData.canonicalUrl).toBe('https://prohelper.pro/blog/preview/42');
    expect(seoData.ogImage).toBe('https://prohelper.pro/og/blog.svg');
  });

  it('returns cluster structured data and route-specific og image', () => {
    const seoData = getPageSEOData('/construction-crm');

    expect(seoData.statusCode).toBe(200);
    expect(seoData.noIndex).toBe(false);
    expect(seoData.ogImage).toBe('https://prohelper.pro/og/construction-crm.svg');
    expect(seoData.structuredData).toHaveLength(4);
  });
});

describe('sitemap sync', () => {
  it('contains every indexable marketing route from the registry', () => {
    const sitemapPath = path.resolve(process.cwd(), 'public', 'sitemap.xml');
    const sitemapXml = readFileSync(sitemapPath, 'utf-8');
    const sitemapUrls = Array.from(
      sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g),
      (match) => match[1],
    );

    const expectedUrls = marketingSitemapRoutes.map(
      (route) => `https://prohelper.pro${route.path === '/' ? '/' : route.path}`,
    );

    expect([...sitemapUrls].sort()).toEqual([...expectedUrls].sort());
    expect(sitemapUrls).not.toContain('https://prohelper.pro/privacy');
    expect(sitemapUrls).not.toContain('https://prohelper.pro/offer');
    expect(sitemapUrls).not.toContain('https://prohelper.pro/cookies');
  });
});
