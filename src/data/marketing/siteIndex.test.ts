import { describe, expect, it } from 'vitest';
import sitemapRoutes from './sitemapRoutes.json';
import {
  assertMarketingSitemapRoutes,
  findMarketingSitemapRoute,
  isKnownMarketingPath,
  isMarketingNoIndexPath,
  marketingSitemapRoutes,
  normalizeMarketingPath,
  resolveMarketingRedirectTarget,
} from './siteIndex';

describe('marketing site index', () => {
  it('uses the shared sitemap route registry', () => {
    expect(marketingSitemapRoutes).toEqual(sitemapRoutes);
  });

  it('rejects malformed or duplicate sitemap registry entries', () => {
    const route = {
      path: '/features',
      pageKey: 'features',
      priority: 0.9,
      changefreq: 'weekly',
    };
    const invalidRegistries = [
      null,
      {},
      [{ ...route, path: 'features' }],
      [{ ...route, path: '/features/' }],
      [{ ...route, pageKey: '' }],
      [{ ...route, priority: 1.1 }],
      [{ ...route, changefreq: 'yearly' }],
      [{ ...route, unexpected: true }],
      [route, { ...route, pageKey: 'features-copy' }],
      [route, { ...route, path: '/features-copy' }],
    ];

    expect(typeof assertMarketingSitemapRoutes).toBe('function');

    for (const registry of invalidRegistries) {
      expect(() => assertMarketingSitemapRoutes(registry)).toThrow();
    }
  });

  it('normalizes query strings, hashes, and trailing slashes', () => {
    expect(normalizeMarketingPath('/features/?utm_source=test#top')).toBe('/features');
    expect(normalizeMarketingPath('/')).toBe('/');
  });

  it('recognizes public sitemap routes', () => {
    expect(isKnownMarketingPath('/')).toBe(true);
    expect(isKnownMarketingPath('/features')).toBe(true);
    expect(findMarketingSitemapRoute('/features')?.pageKey).toBe('features');
  });

  it('publishes new construction module routes as indexable sitemap routes', () => {
    const expectedRoutes = [
      ['/pir-project-documentation', 'pir-project-documentation'],
      ['/construction-safety', 'construction-safety'],
      ['/construction-quality-control', 'construction-quality-control'],
      ['/handover-acceptance', 'handover-acceptance'],
      ['/machinery-and-labor', 'machinery-and-labor'],
      ['/change-control', 'change-control'],
    ] as const;

    for (const [path, pageKey] of expectedRoutes) {
      expect(isKnownMarketingPath(path)).toBe(true);
      expect(isMarketingNoIndexPath(path)).toBe(false);
      expect(findMarketingSitemapRoute(path)).toMatchObject({
        pageKey,
        changefreq: 'weekly',
      });
    }
  });

  it('recognizes noindex service routes', () => {
    expect(isKnownMarketingPath('/login')).toBe(true);
    expect(isMarketingNoIndexPath('/login')).toBe(true);
    expect(isMarketingNoIndexPath('/blog/tag/test')).toBe(true);
  });

  it('resolves legacy marketing redirects', () => {
    expect(resolveMarketingRedirectTarget('/docs')).toBe('/features');
    expect(resolveMarketingRedirectTarget('/terms')).toBe('/offer');
    expect(resolveMarketingRedirectTarget('/partners')).toBe('/contact');
  });

  it('does not treat random unknown routes as known', () => {
    expect(isKnownMarketingPath('/non-existing-test-codex')).toBe(false);
    expect(findMarketingSitemapRoute('/non-existing-test-codex')).toBeUndefined();
  });
});
