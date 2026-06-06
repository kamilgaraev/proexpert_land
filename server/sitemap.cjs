const BASE_URL = 'https://prohelper.pro';

const STATIC_MARKETING_SITEMAP_ROUTES = [
  { path: '/', lastmod: '2026-04-05', changefreq: 'weekly', priority: '1.0' },
  { path: '/solutions', lastmod: '2026-04-05', changefreq: 'weekly', priority: '0.95' },
  { path: '/features', lastmod: '2026-04-05', changefreq: 'weekly', priority: '0.92' },
  { path: '/foreman-software', lastmod: '2026-04-05', changefreq: 'weekly', priority: '0.90' },
  { path: '/construction-crm', lastmod: '2026-04-05', changefreq: 'weekly', priority: '0.90' },
  { path: '/construction-erp', lastmod: '2026-04-05', changefreq: 'weekly', priority: '0.90' },
  { path: '/material-accounting', lastmod: '2026-04-05', changefreq: 'weekly', priority: '0.89' },
  { path: '/construction-budget-control', lastmod: '2026-04-05', changefreq: 'weekly', priority: '0.89' },
  { path: '/pir-project-documentation', lastmod: '2026-06-06', changefreq: 'weekly', priority: '0.88' },
  { path: '/construction-quality-control', lastmod: '2026-06-06', changefreq: 'weekly', priority: '0.88' },
  { path: '/pto-software', lastmod: '2026-04-05', changefreq: 'weekly', priority: '0.88' },
  { path: '/contractor-control', lastmod: '2026-04-05', changefreq: 'weekly', priority: '0.88' },
  { path: '/construction-safety', lastmod: '2026-06-06', changefreq: 'weekly', priority: '0.87' },
  { path: '/mobile-app', lastmod: '2026-04-05', changefreq: 'weekly', priority: '0.87' },
  { path: '/construction-documents', lastmod: '2026-04-05', changefreq: 'weekly', priority: '0.87' },
  { path: '/pricing', lastmod: '2026-04-05', changefreq: 'monthly', priority: '0.86' },
  { path: '/handover-acceptance', lastmod: '2026-06-06', changefreq: 'weekly', priority: '0.86' },
  { path: '/machinery-and-labor', lastmod: '2026-06-06', changefreq: 'weekly', priority: '0.86' },
  { path: '/change-control', lastmod: '2026-06-06', changefreq: 'weekly', priority: '0.86' },
  { path: '/contractors', lastmod: '2026-04-05', changefreq: 'monthly', priority: '0.84' },
  { path: '/ai-estimates', lastmod: '2026-04-05', changefreq: 'weekly', priority: '0.84' },
  { path: '/enterprise', lastmod: '2026-04-05', changefreq: 'monthly', priority: '0.83' },
  { path: '/developers', lastmod: '2026-04-05', changefreq: 'monthly', priority: '0.82' },
  { path: '/integrations', lastmod: '2026-04-05', changefreq: 'monthly', priority: '0.80' },
  { path: '/contact', lastmod: '2026-04-05', changefreq: 'monthly', priority: '0.78' },
  { path: '/blog', lastmod: '2026-04-05', changefreq: 'weekly', priority: '0.72' },
  { path: '/security', lastmod: '2026-04-05', changefreq: 'monthly', priority: '0.66' },
  { path: '/about', lastmod: '2026-04-05', changefreq: 'monthly', priority: '0.62' },
];

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const normalizeApiBase = (apiBase) => (apiBase || 'https://api.prohelper.pro').replace(/\/+$/, '');

const normalizeLastmod = (value) => {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }

  return date.toISOString();
};

const renderUrl = ({ loc, lastmod, changefreq, priority }) => [
  '  <url>',
  `    <loc>${escapeXml(loc)}</loc>`,
  `    <lastmod>${escapeXml(lastmod)}</lastmod>`,
  `    <changefreq>${escapeXml(changefreq)}</changefreq>`,
  `    <priority>${escapeXml(priority)}</priority>`,
  '  </url>',
].join('\n');

const normalizeArticlePath = (article) => {
  if (article.url && String(article.url).startsWith('/blog/')) {
    return String(article.url);
  }

  return article.slug ? `/blog/${article.slug}` : null;
};

const renderSitemapXml = (articles = []) => {
  const staticUrls = STATIC_MARKETING_SITEMAP_ROUTES.map((route) => ({
    loc: route.path === '/' ? `${BASE_URL}/` : `${BASE_URL}${route.path}`,
    lastmod: route.lastmod,
    changefreq: route.changefreq,
    priority: route.priority,
  }));

  const articleUrls = articles
    .map((article) => {
      const path = normalizeArticlePath(article);

      if (!path) {
        return null;
      }

      return {
        loc: `${BASE_URL}${path}`,
        lastmod: normalizeLastmod(article.updated_at || article.published_at),
        changefreq: 'monthly',
        priority: '0.64',
      };
    })
    .filter(Boolean);

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...[...staticUrls, ...articleUrls].map(renderUrl),
    '</urlset>',
    '',
  ].join('\n');
};

const fetchBlogSitemapArticles = async ({ apiBase, fetchImpl = globalThis.fetch } = {}) => {
  if (typeof fetchImpl !== 'function') {
    return [];
  }

  const response = await fetchImpl(`${normalizeApiBase(apiBase)}/api/v1/blog/sitemap`, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Blog sitemap API returned ${response.status}`);
  }

  const payload = await response.json();

  return Array.isArray(payload.data) ? payload.data : [];
};

const createSitemapXml = async ({ apiBase, fetchImpl } = {}) => {
  try {
    const articles = await fetchBlogSitemapArticles({ apiBase, fetchImpl });

    return renderSitemapXml(articles);
  } catch (error) {
    console.error('Failed to load blog sitemap articles', error);

    return renderSitemapXml([]);
  }
};

module.exports = {
  STATIC_MARKETING_SITEMAP_ROUTES,
  createSitemapXml,
  fetchBlogSitemapArticles,
  renderSitemapXml,
};
