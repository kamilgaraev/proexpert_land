import { resolveMarketingRedirectTarget } from '@/data/marketingRegistry';
import {
  generateBreadcrumbSchema,
  generateOrganizationSchema,
  generateSoftwareSchema,
  generateWebPageSchema,
  getPageSEOData,
  type PageSEOData,
} from '@utils/seo';

export interface ServerSeoPayload {
  statusCode: number;
  lang: string;
  title: string;
  canonicalUrl: string;
  allMeta: string;
  faviconTags: string;
  structuredDataTag: string;
  redirectTarget?: string;
}

const escapeHtmlAttribute = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const normalizeStructuredData = (value: unknown): unknown[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeStructuredData(item));
  }

  return [value];
};

const stripBrandSuffix = (title: string) => title.replace(/\s+\|\s+ProHelper$/, '').trim();

export const buildServerSeoPayload = (
  pathname: string,
  documentProps?: Partial<
    PageSEOData & {
      ogImage?: string;
      noIndex?: boolean;
      type?: 'website' | 'article' | 'product';
      structuredData?: unknown | unknown[];
      lang?: string;
    }
  >,
): ServerSeoPayload => {
  const redirectTarget = resolveMarketingRedirectTarget(pathname);

  if (redirectTarget) {
    return {
      statusCode: 301,
      lang: 'ru',
      title: '',
      canonicalUrl: '',
      allMeta: '',
      faviconTags: '',
      structuredDataTag: '',
      redirectTarget,
    };
  }

  const baseSeo = getPageSEOData(pathname);
  const resolvedDocumentProps = documentProps || {};

  const title = resolvedDocumentProps.title ?? baseSeo.title;
  const description = resolvedDocumentProps.description ?? baseSeo.description;
  const keywords = resolvedDocumentProps.keywords ?? baseSeo.keywords;
  const canonicalUrl = resolvedDocumentProps.canonicalUrl ?? baseSeo.canonicalUrl;
  const ogImage = resolvedDocumentProps.ogImage ?? baseSeo.ogImage;
  const noIndex = resolvedDocumentProps.noIndex ?? baseSeo.noIndex;
  const ogType = resolvedDocumentProps.type ?? baseSeo.type;
  const lang = resolvedDocumentProps.lang ?? baseSeo.lang;
  const structuredData = [
    ...baseSeo.structuredData,
    ...normalizeStructuredData(resolvedDocumentProps.structuredData),
  ];

  const robotsContent = noIndex
    ? 'noindex, nofollow, noarchive'
    : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';

  const googlebotContent = noIndex
    ? 'noindex, nofollow'
    : 'index, follow, max-snippet:-1, max-image-preview:large';

  const escapedTitle = escapeHtmlAttribute(title);
  const escapedDescription = escapeHtmlAttribute(description);
  const escapedKeywords = escapeHtmlAttribute(keywords);
  const escapedCanonicalUrl = escapeHtmlAttribute(canonicalUrl);
  const escapedOgImage = escapeHtmlAttribute(ogImage);

  const allMeta = [
    `<meta name="description" content="${escapedDescription}" />`,
    `<meta name="keywords" content="${escapedKeywords}" />`,
    `<meta name="yandex-verification" content="94e8b4142ec2a8e3" />`,
    `<meta name="document-state" content="dynamic" />`,
    `<meta name="revisit-after" content="7 days" />`,
    `<meta name="referrer" content="strict-origin-when-cross-origin" />`,
    `<meta name="robots" content="${robotsContent}" />`,
    `<meta name="googlebot" content="${googlebotContent}" />`,
    `<meta name="geo.region" content="RU" />`,
    `<meta name="geo.placename" content="Россия" />`,
    `<meta name="geo.position" content="55.751244;37.618423" />`,
    `<meta name="ICBM" content="55.751244, 37.618423" />`,
    `<meta property="og:title" content="${escapedTitle}" />`,
    `<meta property="og:description" content="${escapedDescription}" />`,
    `<meta property="og:image" content="${escapedOgImage}" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:url" content="${escapedCanonicalUrl}" />`,
    `<meta property="og:type" content="${ogType}" />`,
    `<meta property="og:site_name" content="ProHelper" />`,
    `<meta property="og:locale" content="ru_RU" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapedTitle}" />`,
    `<meta name="twitter:description" content="${escapedDescription}" />`,
    `<meta name="twitter:image" content="${escapedOgImage}" />`,
  ].join('\n');

  const breadcrumbItems = [{ name: 'Главная', url: 'https://prohelper.pro/' }];
  if (pathname !== '/') {
    breadcrumbItems.push({
      name: stripBrandSuffix(title),
      url: canonicalUrl,
    });
  }

  const structuredJson = JSON.stringify({
    '@graph': [
      generateOrganizationSchema(),
      generateSoftwareSchema(),
      generateBreadcrumbSchema(breadcrumbItems),
      generateWebPageSchema({
        name: title,
        description,
        url: canonicalUrl,
        breadcrumbs: breadcrumbItems,
      }),
      ...structuredData,
    ],
  }).replace(/</g, '\\u003c');

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
    `<link rel="dns-prefetch" href="https://api.prohelper.pro" />`,
  ].join('\n');

  return {
    statusCode: baseSeo.statusCode,
    lang,
    title,
    canonicalUrl: escapedCanonicalUrl,
    allMeta,
    faviconTags,
    structuredDataTag,
  };
};
