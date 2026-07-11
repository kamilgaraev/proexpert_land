import { describe, expect, it } from 'vitest';
import { isMarketingPublicPath, isPrimaryMarketingHost } from './publicSite';

describe('isPrimaryMarketingHost', () => {
  it.each([
    '1мост.рф',
    'www.1мост.рф',
    'xn--1-xtbgmf.xn--p1ai',
    'www.xn--1-xtbgmf.xn--p1ai',
  ])(
    'разрешает основной маркетинговый хост %s',
    (hostname) => {
      expect(isPrimaryMarketingHost(hostname)).toBe(true);
    },
  );

  it.each([
    'lk.1мост.рф',
    'lk.xn--1-xtbgmf.xn--p1ai',
    'partner.1мост.рф',
    'localhost',
    '127.0.0.1',
  ])(
    'не включает Метрику на хосте %s',
    (hostname) => {
      expect(isPrimaryMarketingHost(hostname)).toBe(false);
    },
  );
});

describe('isMarketingPublicPath', () => {
  it.each(['/', '/features', '/solutions', '/blog/article']) (
    'разрешает публичный маркетинговый маршрут %s',
    (pathname) => {
      expect(isMarketingPublicPath(pathname)).toBe(true);
    },
  );

  it.each(['/login', '/register', '/dashboard', '/dashboard/projects']) (
    'не отслеживает внутренний маршрут %s',
    (pathname) => {
      expect(isMarketingPublicPath(pathname)).toBe(false);
    },
  );
});
