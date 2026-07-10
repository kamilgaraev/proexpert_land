import { describe, expect, it } from 'vitest';

import { resolveServerRouterLocation } from './serverRouterLocation';

describe('server router location', () => {
  it.each([
    '/blog?search=x',
    '/blog?category=management',
    '/blog?page=4',
  ])('preserves the full request URL for %s', (urlOriginal) => {
    expect(resolveServerRouterLocation({ urlOriginal, urlPathname: '/blog' })).toBe(urlOriginal);
  });

  it('falls back to the pathname when the original URL is unavailable', () => {
    expect(resolveServerRouterLocation({ urlPathname: '/blog' })).toBe('/blog');
  });
});
