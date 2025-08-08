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

  // Derive base SEO data from URL slug ("/integrations" => "integrations")
  const slug = (pageContext.urlPathname || '/').replace(/^\/+|\/+$/g, '') || 'home';
  const baseSeo: PageSEOData = getPageSEOData(slug);

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
    `<meta name="robots" content="index, follow" />`,
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

  return escapeInject`<!DOCTYPE html>
    <html lang="ru">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        ${escapeInject`<title>${title}</title>`}
        ${dangerouslySkipEscape(allMeta)}
        <link rel="canonical" href="${canonicalUrl}" />
        ${dangerouslySkipEscape(structuredDataTag)}
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(html)}</div>
      </body>
    </html>`;
}

export const passToClient = ['pageProps', 'documentProps']; 