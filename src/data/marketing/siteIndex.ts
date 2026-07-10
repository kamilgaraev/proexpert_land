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

const marketingSitemapRouteFields = new Set([
  'path',
  'pageKey',
  'priority',
  'changefreq',
]);

const isCanonicalMarketingPath = (value: string) => value === '/'
  || /^\/[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/.test(value);

const isMarketingSitemapRoute = (route: unknown): route is MarketingSitemapRoute => {
  if (typeof route !== 'object' || route === null) {
    return false;
  }

  const candidate = route as Partial<MarketingSitemapRoute>;

  return Object.keys(route).length === marketingSitemapRouteFields.size
    && Object.keys(route).every((field) => marketingSitemapRouteFields.has(field))
    && typeof candidate.path === 'string'
    && isCanonicalMarketingPath(candidate.path)
    && typeof candidate.pageKey === 'string'
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate.pageKey)
    && typeof candidate.priority === 'number'
    && Number.isFinite(candidate.priority)
    && candidate.priority >= 0
    && candidate.priority <= 1
    && typeof candidate.changefreq === 'string'
    && marketingChangefreqs.has(candidate.changefreq as MarketingSitemapRoute['changefreq']);
};

export function assertMarketingSitemapRoutes(
  routes: unknown,
): asserts routes is MarketingSitemapRoute[] {
  if (!Array.isArray(routes) || !routes.every(isMarketingSitemapRoute)) {
    throw new Error('Invalid marketing sitemap route registry');
  }

  const paths = new Set<string>();
  const pageKeys = new Set<string>();

  for (const route of routes) {
    if (paths.has(route.path) || pageKeys.has(route.pageKey)) {
      throw new Error('Duplicate marketing sitemap route registry entry');
    }

    paths.add(route.path);
    pageKeys.add(route.pageKey);
  }
}

assertMarketingSitemapRoutes(sitemapRoutes);

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
