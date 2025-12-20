import ReactDOMServer from 'react-dom/server';
// @ts-ignore vite-plugin-ssr может не предоставлять типы в версии 0.4.x
import { escapeInject, dangerouslySkipEscape, type PageContextServer } from 'vite-plugin-ssr';
// @ts-ignore типы для server-рендера есть в react-router-dom, могут конфликтовать с TS
import { StaticRouter } from 'react-router-dom/server';
import { PageShell } from './PageShell';


import {
  getPageSEOData,
  generateOrganizationSchema,
  generateSoftwareSchema,
  generateBreadcrumbSchema,
  type PageSEOData
} from '@utils/seo';

export async function render(pageContext: PageContextServer) {
  const { Page, pageProps, documentProps } = pageContext;

  const html = ReactDOMServer.renderToString(
    <StaticRouter location={pageContext.urlPathname || '/'}>
      <PageShell pageContext={pageContext}>
        <Page {...pageProps} />
      </PageShell>
    </StaticRouter>,
  );

  const slug = (pageContext.urlPathname || '/').replace(/^\/+|\/+$/g, '') || 'home';
  const baseSeo: PageSEOData = getPageSEOData(slug);
  
  const httpResponse = (pageContext as any).httpResponse;
  const statusCode = httpResponse?.statusCode || 200;

  const {
    title = baseSeo.title,
    description = baseSeo.description,
    keywords = baseSeo.keywords,
    canonicalUrl = baseSeo.canonicalUrl,
    ogImage = baseSeo.ogImage || 'https://prohelper.pro/logo.svg',
    type: ogType = 'website',
    structuredData
  } = (documentProps as Partial<PageSEOData & {
    ogImage?: string;
    type?: string;
    structuredData?: unknown;
  }>) || {};

  const allMeta = [
    `<meta name="description" content="${description}" />`,
    `<meta name="keywords" content="${keywords}" />`,
    `<meta name="yandex-verification" content="94e8b4142ec2a8e3" />`,
    `<meta name="document-state" content="dynamic" />`,
    `<meta name="revisit-after" content="7 days" />`,
    `<meta name="referrer" content="strict-origin-when-cross-origin" />`,
    `<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />`,
    `<meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large" />`,
    `<meta name="geo.region" content="RU" />`,
    `<meta name="geo.placename" content="Россия" />`,
    `<meta name="geo.position" content="55.751244;37.618423" />`,
    `<meta name="ICBM" content="55.751244, 37.618423" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:image" content="${ogImage}" />`,
    `<meta property="og:url" content="${canonicalUrl}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:site_name" content="ProHelper" />`,
    `<meta property="og:locale" content="ru_RU" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${ogImage}" />`
  ].join("\n");

  // Создаём схему хлебных крошек: Главная → Текущая страница (если не home)
  const breadcrumbItems = [
    { name: 'Главная', url: 'https://prohelper.pro/' }
  ];
  if (slug !== 'home') {
    breadcrumbItems.push({ name: title, url: canonicalUrl });
  }

  const structuredJson = JSON.stringify({
    "@graph": [
      generateOrganizationSchema(),
      generateSoftwareSchema(),
      generateBreadcrumbSchema(breadcrumbItems),
      structuredData || null
    ].filter(Boolean)
  });

  const structuredDataTag = `<script id="ld-json" type="application/ld+json">${structuredJson}</script>`;

  const faviconTags = [
    `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`,
    `<link rel="icon" type="image/x-icon" href="/favicon.ico" />`,
    `<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />`,
    `<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />`,
    `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />`,
    `<link rel="manifest" href="/site.webmanifest" />`,
    `<meta name="theme-color" content="#EA580C" />`,
    `<link rel="preconnect" href="https://fonts.googleapis.com" />`,
    `<link rel="dns-prefetch" href="https://api.prohelper.pro" />`
  ].join("\n");

  const documentHtml = escapeInject`<!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        ${escapeInject`<title>${title}</title>`}
        ${dangerouslySkipEscape(allMeta)}
        ${dangerouslySkipEscape(faviconTags)}
        <link rel="canonical" href="${canonicalUrl}" />
        ${dangerouslySkipEscape(structuredDataTag)}
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(html)}</div>
      </body>
    </html>`;

  return {
    documentHtml,
    pageContext: {
      httpResponse: {
        statusCode,
        contentType: 'text/html'
      }
    }
  };
}

export const passToClient = ['pageProps', 'documentProps']; 