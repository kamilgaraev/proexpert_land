import type { PublicSitePayload } from '@/types/holding-site-builder';
import { decodeHoldingPathname, isHoldingPrivatePath } from '@/utils/holdingDomain';
import { getHoldingCanonicalUrl, getHoldingPageLanguage, getHoldingRequestLocale, hasHoldingPublicPage, normalizeHoldingPublicPath, type HoldingPublicPageState } from '@/utils/holdingPublicPage';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export async function loadHoldingPageContext(hostname: string, pathname: string, search: string) {
  const canonicalUrl = getHoldingCanonicalUrl(`https://${hostname}`, pathname, search);
  if (isHoldingPrivatePath(pathname)) {
    return { routeStatusCode: 200, documentProps: { title: 'Панель холдинга', canonicalUrl, noIndex: true, statusCode: 200 }, pageProps: {} };
  }

  const initialHoldingPage: HoldingPublicPageState = { pathname, search, status: 200 };
  const params = new URLSearchParams(search);
  const preview = params.get('preview') === 'true';
  if (!preview) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5_000);
    try {
      const base = (process.env.VITE_API_BASE ?? process.env.API_BASE_URL ?? 'https://api.1мост.рф').replace(/\/+$/, '');
      const query = new URLSearchParams({ site_domain: hostname, path: normalizeHoldingPublicPath(decodeHoldingPathname(pathname)) });
      const locale = getHoldingRequestLocale(search);
      if (locale !== null) query.set('locale', locale);
      const response = await fetch(`${base}/api/v1/landing/holding/public/site-data?${query}`, {
        headers: { Accept: 'application/json' }, signal: controller.signal,
      });
      if (response.status === 404) {
        initialHoldingPage.status = 404;
      } else if (!response.ok) {
        initialHoldingPage.status = 503;
      } else {
        const envelope: unknown = await response.json();
        const data = isRecord(envelope) && envelope.success === true ? envelope.data : null;
        if (!isRecord(data) || !isRecord(data.site) || !isRecord(data.site.seo_meta)
          || !isRecord(data.site.theme_config) || !isRecord(data.runtime) || !Array.isArray(data.blocks)) {
          initialHoldingPage.status = 503;
        } else {
          const site = { ...data.site };
          delete site.preview_url;
          const payload = { ...data, site } as unknown as PublicSitePayload;
          if (hasHoldingPublicPage(payload, pathname)) initialHoldingPage.payload = payload;
          else initialHoldingPage.status = 404;
        }
      }
    } catch {
      initialHoldingPage.status = 503;
    } finally {
      clearTimeout(timeout);
    }
  }

  const { status, payload } = initialHoldingPage;
  const page = payload?.current_page ?? payload?.page;
  if (status !== 200) initialHoldingPage.message = status === 404 ? 'Страница не найдена.' : 'Не удалось загрузить опубликованный сайт.';
  return {
    routeStatusCode: status,
    documentProps: {
      lang: getHoldingPageLanguage(payload),
      title: page?.seo_meta.title || payload?.site.seo_meta.title || payload?.site.title || 'Сайт холдинга',
      description: page?.seo_meta.description || payload?.site.seo_meta.description || payload?.site.description || '',
      keywords: page?.seo_meta.keywords || payload?.site.seo_meta.keywords || '',
      ogImage: page?.seo_meta.og_image || payload?.site.seo_meta.og_image || undefined,
      canonicalUrl: getHoldingCanonicalUrl(`https://${hostname}`, pathname, search, payload),
      noIndex: preview || status !== 200 || Boolean(page?.seo_meta.noindex || payload?.site.seo_meta.noindex),
      statusCode: status,
    },
    pageProps: preview ? {} : { initialHoldingPage },
  };
}
