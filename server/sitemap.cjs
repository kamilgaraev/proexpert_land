const fs = require('node:fs');
const path = require('node:path');

const BASE_URL = 'https://1мост.рф';

const sitemapRoutePaths = [
  path.resolve(__dirname, 'sitemapRoutes.json'),
  path.resolve(__dirname, '../src/data/marketing/sitemapRoutes.json'),
];
const sitemapRoutePath = sitemapRoutePaths.find((candidate) => fs.existsSync(candidate));

if (!sitemapRoutePath) {
  throw new Error('Marketing sitemap route registry not found');
}

const STATIC_MARKETING_SITEMAP_ROUTES = JSON.parse(fs.readFileSync(sitemapRoutePath, 'utf8'));

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const normalizeApiBase = (apiBase) => (apiBase || 'https://api.1мост.рф').replace(/\/+$/, '');

const normalizeLastmod = (value) => {
  const date = value ? new Date(value) : null;

  if (!date || Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

const renderUrl = ({ loc, lastmod, changefreq, priority }) => [
  '  <url>',
  `    <loc>${escapeXml(loc)}</loc>`,
  ...(lastmod ? [`    <lastmod>${escapeXml(lastmod)}</lastmod>`] : []),
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
