export interface MarketingSitemapRoute {
  path: string;
  pageKey: string;
  priority: number;
  changefreq: 'daily' | 'weekly' | 'monthly';
}

export const marketingSitemapRoutes: MarketingSitemapRoute[] = [
  { path: '/', pageKey: 'home', priority: 1, changefreq: 'weekly' },
  { path: '/solutions', pageKey: 'solutions', priority: 0.95, changefreq: 'weekly' },
  { path: '/features', pageKey: 'features', priority: 0.92, changefreq: 'weekly' },
  { path: '/pricing', pageKey: 'pricing', priority: 0.86, changefreq: 'monthly' },
  { path: '/integrations', pageKey: 'integrations', priority: 0.8, changefreq: 'monthly' },
  { path: '/contractors', pageKey: 'contractors', priority: 0.84, changefreq: 'monthly' },
  { path: '/developers', pageKey: 'developers', priority: 0.82, changefreq: 'monthly' },
  { path: '/enterprise', pageKey: 'enterprise', priority: 0.83, changefreq: 'monthly' },
  { path: '/about', pageKey: 'about', priority: 0.62, changefreq: 'monthly' },
  { path: '/security', pageKey: 'security', priority: 0.66, changefreq: 'monthly' },
  { path: '/contact', pageKey: 'contact', priority: 0.78, changefreq: 'monthly' },
  { path: '/blog', pageKey: 'blog', priority: 0.72, changefreq: 'weekly' },
  { path: '/foreman-software', pageKey: 'foreman-software', priority: 0.9, changefreq: 'weekly' },
  { path: '/construction-crm', pageKey: 'construction-crm', priority: 0.9, changefreq: 'weekly' },
  { path: '/construction-erp', pageKey: 'construction-erp', priority: 0.9, changefreq: 'weekly' },
  { path: '/material-accounting', pageKey: 'material-accounting', priority: 0.89, changefreq: 'weekly' },
  { path: '/pto-software', pageKey: 'pto-software', priority: 0.88, changefreq: 'weekly' },
  { path: '/contractor-control', pageKey: 'contractor-control', priority: 0.88, changefreq: 'weekly' },
  { path: '/construction-documents', pageKey: 'construction-documents', priority: 0.87, changefreq: 'weekly' },
  { path: '/construction-budget-control', pageKey: 'construction-budget-control', priority: 0.89, changefreq: 'weekly' },
  { path: '/mobile-app', pageKey: 'mobile-app', priority: 0.87, changefreq: 'weekly' },
  { path: '/ai-estimates', pageKey: 'ai-estimates', priority: 0.84, changefreq: 'weekly' },
];

export const marketingNoIndexPaths = new Set(['/privacy', '/offer', '/cookies']);

export const marketingNoIndexPrefixes = [
  '/dashboard',
  '/admin',
  '/landing/multi-organization',
  '/blog/tag',
];

export const marketingNoIndexExactPaths = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/verify-email',
  '/email-sent',
]);

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

export const isMarketingNoIndexPath = (pathname: string) => {
  const normalizedPath = normalizeMarketingPath(pathname);

  if (marketingNoIndexPaths.has(normalizedPath) || marketingNoIndexExactPaths.has(normalizedPath)) {
    return true;
  }

  return marketingNoIndexPrefixes.some((prefix) => normalizedPath.startsWith(prefix));
};
