import sitemapRoutes from './sitemapRoutes.json';

export interface MarketingSitemapRoute {
  path: string;
  pageKey: string;
  priority: number;
  changefreq: 'daily' | 'weekly' | 'monthly';
}

export interface MarketingRedirectRoute {
  path: string;
  target: string;
}

const marketingChangefreqs = new Set<MarketingSitemapRoute['changefreq']>([
  'daily',
  'weekly',
  'monthly',
]);

const isMarketingSitemapRoute = (route: unknown): route is MarketingSitemapRoute => {
  if (typeof route !== 'object' || route === null) {
    return false;
  }

  const candidate = route as Partial<MarketingSitemapRoute>;

  return typeof candidate.path === 'string'
    && candidate.path.startsWith('/')
    && typeof candidate.pageKey === 'string'
    && candidate.pageKey.length > 0
    && typeof candidate.priority === 'number'
    && candidate.priority >= 0
    && candidate.priority <= 1
    && typeof candidate.changefreq === 'string'
    && marketingChangefreqs.has(candidate.changefreq as MarketingSitemapRoute['changefreq']);
};

if (!sitemapRoutes.every(isMarketingSitemapRoute)) {
  throw new Error('Invalid marketing sitemap route registry');
}

export const marketingSitemapRoutes: MarketingSitemapRoute[] = sitemapRoutes;

export const marketingNoIndexPaths = new Set(['/privacy', '/offer', '/cookies']);

export const marketingNoIndexPrefixes = [
  '/dashboard',
  '/landing/multi-organization',
  '/blog/tag',
  '/blog/preview',
];

export const marketingNoIndexExactPaths = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/email-sent',
]);

export const marketingRedirectRoutes: MarketingRedirectRoute[] = [
  { path: '/docs', target: '/features' },
  { path: '/help', target: '/contact' },
  { path: '/terms', target: '/offer' },
  { path: '/press', target: '/about' },
  { path: '/partners', target: '/contact' },
];

const marketingSitemapRouteMap = new Map(
  marketingSitemapRoutes.map((route) => [route.path, route]),
);

const marketingRedirectRouteMap = new Map(
  marketingRedirectRoutes.map((route) => [route.path, route.target]),
);

const marketingDynamicPublicPrefixes = [
  '/blog/',
  '/dashboard/',
  '/landing/multi-organization/',
];

export const normalizeMarketingPath = (pathname: string) => {
  const [rawPath] = pathname.split('?');
  const [cleanPath] = rawPath.split('#');
  const normalizedPath = cleanPath.replace(/\/+$/, '');

  return normalizedPath || '/';
};

export const resolveMarketingSeoKey = (pathname: string) => {
  const normalizedPath = normalizeMarketingPath(pathname);

  if (normalizedPath === '/') {
    return 'home';
  }

  if (normalizedPath.startsWith('/blog')) {
    return 'blog';
  }

  return normalizedPath.slice(1);
};

export const findMarketingSitemapRoute = (pathname: string) => {
  const normalizedPath = normalizeMarketingPath(pathname);

  return marketingSitemapRouteMap.get(normalizedPath);
};

export const resolveMarketingRedirectTarget = (pathname: string) => {
  const normalizedPath = normalizeMarketingPath(pathname);

  return marketingRedirectRouteMap.get(normalizedPath);
};

export const resolveMarketingCanonicalPath = (pathname: string) => {
  const normalizedPath = normalizeMarketingPath(pathname);
  const redirectTarget = marketingRedirectRouteMap.get(normalizedPath);

  if (redirectTarget) {
    return redirectTarget;
  }

  return isKnownMarketingPath(normalizedPath) ? normalizedPath : '/';
};

export const isKnownMarketingPath = (pathname: string) => {
  const normalizedPath = normalizeMarketingPath(pathname);

  if (
    marketingSitemapRouteMap.has(normalizedPath) ||
    marketingNoIndexPaths.has(normalizedPath) ||
    marketingNoIndexExactPaths.has(normalizedPath) ||
    marketingRedirectRouteMap.has(normalizedPath)
  ) {
    return true;
  }

  return marketingDynamicPublicPrefixes.some((prefix) => normalizedPath.startsWith(prefix));
};

export const isMarketingNoIndexPath = (pathname: string) => {
  const normalizedPath = normalizeMarketingPath(pathname);

  if (marketingNoIndexPaths.has(normalizedPath) || marketingNoIndexExactPaths.has(normalizedPath)) {
    return true;
  }

  return marketingNoIndexPrefixes.some((prefix) => normalizedPath.startsWith(prefix));
};
