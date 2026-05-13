import { describe, expect, it } from 'vitest';
import {
  findMarketingSitemapRoute,
  isKnownMarketingPath,
  isMarketingNoIndexPath,
  normalizeMarketingPath,
  resolveMarketingRedirectTarget,
} from './siteIndex';

describe('marketing site index', () => {
  it('normalizes query strings, hashes, and trailing slashes', () => {
    expect(normalizeMarketingPath('/features/?utm_source=test#top')).toBe('/features');
    expect(normalizeMarketingPath('/')).toBe('/');
  });

  it('recognizes public sitemap routes', () => {
    expect(isKnownMarketingPath('/')).toBe(true);
    expect(isKnownMarketingPath('/features')).toBe(true);
    expect(findMarketingSitemapRoute('/features')?.pageKey).toBe('features');
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
