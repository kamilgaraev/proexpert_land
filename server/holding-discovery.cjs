const MAIN_DOMAIN = new URL('https://1мост.рф').hostname;

const holdingHostname = (host) => {
  try {
    const url = new URL(`https://${host || ''}`);
    const hostname = url.hostname.toLowerCase();
    if (url.username || url.password || url.pathname !== '/' || url.search || url.hash
      || !hostname.endsWith(`.${MAIN_DOMAIN}`) || ['lk', 'api', 'www'].includes(hostname.split('.')[0])) return null;
    return hostname;
  } catch {
    return null;
  }
};

const publicPath = (slug) => `/${String(slug || '').trim().replace(/^\/+|\/+$/g, '')}`;
const privatePath = (pathname) => {
  let path = pathname;
  try {
    path = pathname.split('/').map((segment) => decodeURIComponent(segment).replace(/\//g, '%2F')).join('/');
  } catch {
    path = pathname;
  }
  path = path.toLowerCase().replace(/\/+$/, '') || '/';
  return ['/login', '/dashboard', '/organizations', '/reports', '/projects', '/landing/editor', '/settings'].includes(path)
    || /^\/reports\/[^/]+$/.test(path) || /^\/projects\/[^/]+$/.test(path)
    || /^\/projects\/contracts\/[^/]+$/.test(path) || /^\/holding\/[^/]+\/landing\/edit$/.test(path);
};
const escapeXml = (value) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

async function respondWithHoldingDiscovery(request, response, options = {}) {
  const path = (request.url || '').split('?')[0];
  if (!['/robots.txt', '/sitemap.xml'].includes(path)) return false;
  const hostname = holdingHostname(request.headers.host);
  if (!hostname) return false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  let status = 503;
  let payload;
  try {
    const base = (options.apiBase || process.env.VITE_API_BASE || process.env.API_BASE_URL || 'https://api.1мост.рф').replace(/\/+$/, '');
    const query = new URLSearchParams({ site_domain: hostname, path: '/' });
    const upstream = await (options.fetchImpl || fetch)(`${base}/api/v1/landing/holding/public/site-data?${query}`, {
      headers: { Accept: 'application/json' }, signal: controller.signal,
    });
    if (upstream.status === 404) status = 404;
    else if (upstream.ok) {
      const envelope = await upstream.json();
      if (envelope?.success === true && envelope.data?.site?.seo_meta && envelope.data?.site?.theme_config
        && Array.isArray(envelope.data.blocks) && envelope.data?.runtime?.mode === 'published') {
        payload = envelope.data;
        status = payload.site.seo_meta?.noindex === true ? 404 : 200;
      }
    }
  } catch {
    status = 503;
  } finally {
    clearTimeout(timeout);
  }

  if (path === '/robots.txt') {
    const indexable = status === 200;
    response.writeHead(status === 503 ? 503 : 200, {
      'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': indexable ? 'public, max-age=300' : 'no-store',
    });
    response.end(indexable
      ? `User-agent: *\nAllow: /\nDisallow: /*?*preview=\nDisallow: /*?*token=\nDisallow: /login\nDisallow: /dashboard\nDisallow: /organizations\nDisallow: /reports\nDisallow: /projects\nDisallow: /landing/editor\nDisallow: /settings\nDisallow: /holding/\nSitemap: https://${hostname}/sitemap.xml\n`
      : 'User-agent: *\nDisallow: /\n');
    return true;
  }
  if (status !== 200) {
    response.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' });
    response.end(status === 404 ? 'Not found' : 'Sitemap unavailable');
    return true;
  }

  const pages = Array.isArray(payload.pages) && payload.pages.length
    ? payload.pages
    : payload.current_page || payload.page ? [payload.current_page || payload.page]
      : [{ slug: '/', is_active: true, visibility: 'public', seo_meta: {} }];
  const locations = new Set();
  for (const page of pages) {
    const localeSeo = page?.locale_content?.[payload.runtime.locale || payload.site.default_locale]?.seo_meta;
    const seo = { ...page?.seo_meta, ...localeSeo };
    if (!page || page.is_active !== true || page.visibility !== 'public' || seo.noindex === true
      || (!page.is_home && typeof page.slug !== 'string')) continue;
    const pathname = publicPath(page.is_home ? '/' : page.slug);
    if (privatePath(pathname)) continue;
    const url = new URL(`https://${hostname}`);
    url.pathname = pathname;
    locations.add(url.toString());
  }
  response.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=300' });
  response.end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[...locations].map((url) => `<url><loc>${escapeXml(url)}</loc></url>`).join('')}</urlset>`);
  return true;
}

module.exports = { respondWithHoldingDiscovery };
