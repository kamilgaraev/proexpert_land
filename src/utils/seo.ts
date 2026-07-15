import {
  findMarketingSitemapRoute,
  isKnownMarketingPath,
  isMarketingNoIndexPath,
  marketingCapabilityMatrix,
  marketingCompany,
  marketingFaqs,
  freeFoundationOffer,
  fullSuiteOffer,
  marketingPackages,
  marketingPaths,
  marketingSeo,
  marketingSeoLandingPages,
  normalizeMarketingPath,
  resolveMarketingCanonicalPath,
  resolveMarketingSeoKey,
} from '@/data/marketingRegistry';

export interface PageSEOData {
  pageKey: string;
  pathname: string;
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage: string;
  noIndex: boolean;
  lang: string;
  statusCode: number;
  type: 'website' | 'article' | 'product';
  structuredData: unknown[];
}

export type StructuredDataNode = Record<string, unknown>;

export interface StructuredDataGraph {
  '@context': 'https://schema.org';
  '@graph': StructuredDataNode[];
}

export interface BuildStructuredDataGraphInput {
  pathname: string;
  title: string;
  description: string;
  canonicalUrl: string;
  noIndex: boolean;
  statusCode: number;
  structuredData?: unknown;
}

const BASE_URL = 'https://1мост.рф';
const OG_BASE_PATH = `${BASE_URL}/og`;
export const ROBOTS_INDEX_CONTENT = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
export const ROBOTS_NOINDEX_CONTENT = 'noindex, nofollow, noarchive';
export const GOOGLEBOT_INDEX_CONTENT = 'index, follow, max-snippet:-1, max-image-preview:large';
export const GOOGLEBOT_NOINDEX_CONTENT = 'noindex, nofollow';
const MARKETING_OG_IMAGE_PATTERN = /^(https?:\/\/(?:www\.)?(?:prohelper\.pro|1мост\.рф|xn--1-xtbgmf\.xn--p1ai))?\/og\/([^?#]+)\.svg([?#].*)?$/i;
const ARTICLE_TITLE_BRAND_SUFFIX = /\s*\|\s*(?:prohelper|мост)\s*$/i;

export const normalizeArticleTitleBrand = (title: string) => {
  const baseTitle = title.trim().replace(ARTICLE_TITLE_BRAND_SUFFIX, '').trim();

  return baseTitle ? `${baseTitle} | МОСТ` : 'МОСТ';
};

export const normalizeOgImageUrl = (image?: string | null) => {
  if (!image) {
    return undefined;
  }

  return image.replace(MARKETING_OG_IMAGE_PATTERN, '$1/og/$2.png$3');
};

const notFoundSeo = {
  title: 'Страница не найдена | МОСТ',
  description:
    'Запрошенная страница не найдена. Перейдите к решениям МОСТ для управления строительством, снабжением и финансами.',
  keywords: 'страница не найдена, 404, МОСТ',
};

const internalPageSeoByExactPath: Record<
  string,
  { title: string; description: string; keywords?: string }
> = {
  '/login': {
    title: 'Вход в МОСТ',
    description: 'Страница входа в личный кабинет МОСТ.',
    keywords: 'вход МОСТ, личный кабинет',
  },
  '/register': {
    title: 'Регистрация в МОСТ',
    description: 'Страница регистрации в МОСТ.',
    keywords: 'регистрация МОСТ',
  },
  '/forgot-password': {
    title: 'Восстановление доступа | МОСТ',
    description: 'Страница восстановления доступа к МОСТ.',
    keywords: 'восстановление пароля МОСТ',
  },
  '/verify-email': {
    title: 'Подтверждение email | МОСТ',
    description: 'Служебная страница подтверждения электронной почты в МОСТ.',
    keywords: 'подтверждение email МОСТ',
  },
  '/email-sent': {
    title: 'Письмо отправлено | МОСТ',
    description: 'Служебная страница подтверждения отправки письма в МОСТ.',
    keywords: 'письмо отправлено МОСТ',
  },
};

const internalPageSeoByPrefix = [
  {
    prefix: '/dashboard',
    title: 'Личный кабинет МОСТ',
    description: 'Рабочее пространство МОСТ для управления проектами и организациями.',
    keywords: 'личный кабинет МОСТ',
  },
  {
    prefix: '/landing/multi-organization',
    title: 'Группа компаний | МОСТ',
    description: 'Служебный контур управления группой компаний в МОСТ.',
    keywords: 'группа компаний МОСТ',
  },
  {
    prefix: '/blog/preview',
    title: 'Предпросмотр статьи | МОСТ',
    description: 'Служебный предпросмотр статьи блога МОСТ.',
    keywords: 'предпросмотр статьи МОСТ',
  },
];

const resolveOgImageKey = (pageKey: string) => {
  if (pageKey === '404') {
    return '404';
  }

  if (pageKey in marketingSeo || pageKey in marketingSeoLandingPages) {
    return pageKey;
  }

  return 'default';
};

const resolveGenericInternalSeo = (pathname: string) => {
  const exactMatch = internalPageSeoByExactPath[pathname];

  if (exactMatch) {
    return exactMatch;
  }

  return (
    internalPageSeoByPrefix.find((entry) => pathname.startsWith(entry.prefix)) ?? {
      title: 'Служебная страница | МОСТ',
      description: 'Служебная страница МОСТ.',
      keywords: 'служебная страница МОСТ',
    }
  );
};

const resolveClusterStructuredData = (pageKey: string, canonicalUrl: string) => {
  const clusterPage = marketingSeoLandingPages[pageKey];

  if (!clusterPage) {
    return [];
  }

  const trustProfile = clusterPage.trust ?? {
    description:
      'Собрали ориентиры, которые помогают быстро понять, подходит ли этот контур вашей команде и с чего разумно начать запуск.',
    firstStep: clusterPage.contactHighlights.slice(0, 3),
  };

  return [
    generateCommercialPageSchema({
      name: clusterPage.title,
      description: clusterPage.description,
      url: canonicalUrl,
      audience: clusterPage.audiences,
      keywords: clusterPage.supportingQueries,
    }),
    generateItemListSchema({
      name: `Связанные решения ${clusterPage.title}`,
      url: canonicalUrl,
      items: clusterPage.relatedLinks.map((link) => ({
        name: link.label,
        url: `${BASE_URL}${link.href}`,
        description: link.description,
      })),
    }),
    generateHowToSchema({
      name: `Как запускают ${clusterPage.title}`,
      description: trustProfile.description,
      url: canonicalUrl,
      steps: trustProfile.firstStep,
    }),
    generateFAQSchema(clusterPage.faq),
  ];
};

export const getPageSEOData = (page: string): PageSEOData => {
  const normalizedPath = normalizeMarketingPath(page);
  const pageKey = resolveMarketingSeoKey(normalizedPath);
  const resolvedCanonicalPath = resolveMarketingCanonicalPath(normalizedPath);
  const canonicalUrl =
    resolvedCanonicalPath === marketingPaths.home
      ? `${BASE_URL}/`
      : `${BASE_URL}${resolvedCanonicalPath}`;
  const hasKnownRoute = isKnownMarketingPath(normalizedPath);
  const sitemapRoute = findMarketingSitemapRoute(normalizedPath);

  if (!hasKnownRoute) {
    return {
      pageKey: '404',
      pathname: normalizedPath,
      title: notFoundSeo.title,
      description: notFoundSeo.description,
      keywords: notFoundSeo.keywords,
      canonicalUrl: `${BASE_URL}/`,
      ogImage: `${OG_BASE_PATH}/404.png`,
      noIndex: true,
      lang: 'ru',
      statusCode: 404,
      type: 'website',
      structuredData: [],
    };
  }

  const noIndex = sitemapRoute ? false : isMarketingNoIndexPath(normalizedPath);
  const pageMeta =
    marketingSeo[pageKey] ??
    (noIndex ? resolveGenericInternalSeo(normalizedPath) : marketingSeo.home);

  const structuredData =
    pageKey === 'home'
      ? [generateFAQSchema(marketingFaqs)]
      : pageKey === 'pricing'
        ? [generatePricingSchema()]
        : resolveClusterStructuredData(pageKey, canonicalUrl);

  return {
    pageKey,
    pathname: normalizedPath,
    title: pageMeta.title,
    description: pageMeta.description,
    keywords: pageMeta.keywords ?? '',
    canonicalUrl,
    ogImage: `${OG_BASE_PATH}/${resolveOgImageKey(pageKey)}.png`,
    noIndex,
    lang: 'ru',
    statusCode: 200,
    type: pageKey === 'pricing' ? 'product' : 'website',
    structuredData,
  };
};

export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: marketingCompany.brand,
  url: BASE_URL,
  email: marketingCompany.email,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: marketingCompany.email,
      availableLanguage: ['ru'],
      areaServed: 'RU',
    },
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Москва',
    addressRegion: 'Москва',
    addressCountry: 'RU',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Россия',
  },
  description: marketingSeo.home.description,
});

const buildPackageOffers = () => {
  const packageOffers = marketingPackages.flatMap((item) => {
    const isNonStablePackage = item.maturityNote
      ? /beta|alpha|early[_\s-]?access|coming[_\s-]?soon|бета|пилот|ранн(?:ий|яя|ее|ие|его|ему|им|их|ими|ем)|по мере готовности/i.test(item.maturityNote)
      : false;

    if (isNonStablePackage || item.price <= 0 || item.billingModel !== 'subscription') {
      return [];
    }

    const price = `${item.price}`;
    const offer: Record<string, string> = {
      '@type': 'Offer',
      name: item.name,
      availability: 'https://schema.org/InStock',
      category: item.name,
      description: item.description,
      price,
      priceCurrency: 'RUB',
    };

    return [{
      ...offer,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price,
        priceCurrency: 'RUB',
        billingDuration: 'P30D',
      },
    }];
  });

  const createOffer = (name: string, description: string, priceValue: number) => {
    const price = `${priceValue}`;
    return {
      '@type': 'Offer',
      name,
      availability: 'https://schema.org/InStock',
      category: 'Коммерческая модель МОСТ',
      description,
      price,
      priceCurrency: 'RUB',
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price,
        priceCurrency: 'RUB',
        billingDuration: 'P30D',
      },
    };
  };

  return [
    createOffer(freeFoundationOffer.name, freeFoundationOffer.description, freeFoundationOffer.price),
    ...packageOffers,
    createOffer(fullSuiteOffer.name, 'Все десять бизнес-пакетов МОСТ на 30 дней.', fullSuiteOffer.price),
  ];
};

export const generateWebSiteSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  name: marketingCompany.brand,
  url: `${BASE_URL}/`,
  description: marketingSeo.home.description,
  inLanguage: 'ru-RU',
});

export const generateSoftwareSchema = (includeOffers = false) => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: marketingCompany.brand,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android, iOS',
  url: BASE_URL,
  description: marketingSeo.home.description,
  featureList: marketingCapabilityMatrix.map((capability) => capability.title),
  ...(includeOffers ? { offers: buildPackageOffers() } : {}),
});

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const generateFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const generatePricingSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: `${marketingCompany.brand}: бесплатная база, пакеты и полный комплект`,
  description: marketingSeo.pricing.description,
  brand: {
    '@type': 'Brand',
    name: marketingCompany.brand,
  },
  offers: buildPackageOffers(),
});

export const generateCommercialPageSchema = (page: {
  name: string;
  description: string;
  url: string;
  audience: string[];
  keywords: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: page.name,
  description: page.description,
  url: page.url,
  areaServed: 'RU',
  provider: {
    '@type': 'Organization',
    name: marketingCompany.brand,
    url: BASE_URL,
  },
  audience: page.audience.map((item) => ({
    '@type': 'Audience',
    audienceType: item,
  })),
  serviceType: page.keywords.join(', '),
});

export const generateItemListSchema = (list: {
  name: string;
  url: string;
  items: Array<{ name: string; url: string; description?: string }>;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: list.name,
  url: list.url,
  itemListElement: list.items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    url: item.url,
    name: item.name,
    description: item.description,
  })),
});

export const generateHowToSchema = (guide: {
  name: string;
  description: string;
  url: string;
  steps: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: guide.name,
  description: guide.description,
  url: guide.url,
  inLanguage: 'ru-RU',
  step: guide.steps.map((step, index) => ({
    '@type': 'HowToStep',
    position: index + 1,
    name: `Шаг ${index + 1}`,
    text: step,
  })),
});

export const generateArticleSchema = (article: {
  title: string;
  description: string;
  author: string;
  publishedTime?: string;
  modifiedTime?: string;
  image?: string;
  category: string;
  tags?: string[];
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  headline: article.title,
  description: article.description,
  image: normalizeOgImageUrl(article.image) ?? `${OG_BASE_PATH}/blog.png`,
  author: {
    '@type': 'Person',
    name: /^prohelper$/i.test(article.author.trim()) ? marketingCompany.brand : article.author,
  },
  publisher: {
    '@type': 'Organization',
    name: marketingCompany.brand,
  },
  ...(article.publishedTime
    ? {
        datePublished: article.publishedTime,
        dateModified: article.modifiedTime ?? article.publishedTime,
      }
    : {}),
  articleSection: article.category,
  keywords: article.tags?.join(', ') ?? '',
  mainEntityOfPage: article.url,
});

export const generateWebPageSchema = (page: {
  name: string;
  description: string;
  url: string;
  breadcrumbs?: Array<{ name: string; url: string }>;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: page.name,
  description: page.description,
  url: page.url,
  isPartOf: {
    '@type': 'WebSite',
    name: marketingCompany.brand,
    url: BASE_URL,
  },
  breadcrumb: page.breadcrumbs
    ? generateBreadcrumbSchema(page.breadcrumbs)
    : undefined,
  inLanguage: 'ru-RU',
});

const generateCollectionPageSchema = (page: {
  name: string;
  description: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: page.name,
  description: page.description,
  url: page.url,
  isPartOf: {
    '@id': `${BASE_URL}/#website`,
  },
  inLanguage: 'ru-RU',
});

const normalizeStructuredDataNodes = (value: unknown): StructuredDataNode[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeStructuredDataNodes(item));
  }

  if (typeof value !== 'object') {
    return [];
  }

  const node = value as StructuredDataNode;
  if (Array.isArray(node['@graph'])) {
    return normalizeStructuredDataNodes(node['@graph']);
  }

  return [node];
};

const sanitizeStructuredDataValue = (value: unknown, allowOffers: boolean): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeStructuredDataValue(item, allowOffers));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as StructuredDataNode)
      .filter(([key]) => key !== '@context' && key !== 'aggregateRating' && (allowOffers || key !== 'offers'))
      .map(([key, item]) => [key, sanitizeStructuredDataValue(item, allowOffers)]),
  );
};

const stableSerialize = (value: unknown): string => {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(',')}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as StructuredDataNode)
      .filter(([, item]) => item !== undefined)
      .sort(([left], [right]) => left.localeCompare(right));

    return `{${entries.map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`).join(',')}}`;
  }

  return JSON.stringify(value) ?? 'undefined';
};

const deduplicateStructuredDataNodes = (nodes: StructuredDataNode[]) => {
  const seen = new Set<string>();
  const seenIds = new Set<string>();

  return nodes.filter((node) => {
    const id = node['@id'];
    if (typeof id === 'string') {
      if (seenIds.has(id)) {
        return false;
      }

      seenIds.add(id);
    }

    const serialized = stableSerialize(node);
    if (seen.has(serialized)) {
      return false;
    }

    seen.add(serialized);
    return true;
  });
};

const stripTitleBrand = (title: string) => title.replace(/\s+\|\s+(?:МОСТ|ProHelper)$/i, '').trim();

const stripUrlQuery = (url: string) => url.replace(/[?#].*$/, '');

export const buildStructuredDataGraph = ({
  pathname,
  title,
  description,
  canonicalUrl,
  noIndex,
  statusCode,
  structuredData,
}: BuildStructuredDataGraphInput): StructuredDataGraph => {
  if (noIndex || statusCode !== 200) {
    return {
      '@context': 'https://schema.org',
      '@graph': [],
    };
  }

  const normalizedPath = normalizeMarketingPath(pathname);
  const pageKey = resolveMarketingSeoKey(normalizedPath);
  const isBlogArticle = /^\/blog\/[^/]+$/.test(normalizedPath);
  const normalizedCanonicalUrl = stripUrlQuery(canonicalUrl);
  const currentPageName = stripTitleBrand(title);
  const breadcrumbItems = [
    { name: 'Главная', url: `${BASE_URL}/` },
    ...(normalizedPath === '/'
      ? []
      : normalizedPath.startsWith('/blog/')
        ? [
            { name: 'Блог', url: `${BASE_URL}/blog` },
            { name: currentPageName, url: normalizedCanonicalUrl },
          ]
        : [{ name: currentPageName, url: normalizedCanonicalUrl }]),
  ];
  const webPage = generateWebPageSchema({
    name: title,
    description,
    url: normalizedCanonicalUrl,
  });
  const nodes: unknown[] = [generateOrganizationSchema()];

  if (normalizedPath === marketingPaths.home) {
    nodes.push(
      generateWebSiteSchema(),
      generateSoftwareSchema(),
      webPage,
      generateFAQSchema(marketingFaqs),
    );
  } else if (normalizedPath === marketingPaths.pricing) {
    nodes.push(generateBreadcrumbSchema(breadcrumbItems), webPage, generatePricingSchema());
  } else if (pageKey in marketingSeoLandingPages) {
    nodes.push(
      generateBreadcrumbSchema(breadcrumbItems),
      webPage,
      ...resolveClusterStructuredData(pageKey, normalizedCanonicalUrl),
    );
  } else if (normalizedPath === marketingPaths.blog) {
    nodes.push(
      generateBreadcrumbSchema(breadcrumbItems),
      generateCollectionPageSchema({
        name: title,
        description,
        url: normalizedCanonicalUrl,
      }),
    );
  } else {
    nodes.push(generateBreadcrumbSchema(breadcrumbItems), webPage);
  }

  const customNodes = normalizeStructuredDataNodes(structuredData);
  nodes.push(
    ...(isBlogArticle
      ? customNodes.filter((node) => {
          const nodeType = node['@type'];
          return nodeType === 'BlogPosting' || (Array.isArray(nodeType) && nodeType.includes('BlogPosting'));
        }).slice(0, 1)
      : customNodes),
  );

  const allowOffers = normalizedPath === marketingPaths.pricing;
  const sanitizedNodes = normalizeStructuredDataNodes(nodes)
    .filter((node) => {
      const nodeType = node['@type'];
      return nodeType !== 'AggregateRating'
        && !(Array.isArray(nodeType) && nodeType.includes('AggregateRating'))
        && (allowOffers || nodeType !== 'Offer');
    })
    .map((node) => sanitizeStructuredDataValue(node, allowOffers) as StructuredDataNode);

  return {
    '@context': 'https://schema.org',
    '@graph': deduplicateStructuredDataNodes(sanitizedNodes),
  };
};

export const validateSEOLength = (title: string, description: string) => {
  const warnings: string[] = [];

  if (title.length > 60) {
    warnings.push(`Title слишком длинный: ${title.length}/60 символов`);
  }
  if (title.length < 30) {
    warnings.push(`Title слишком короткий: ${title.length}/30+ символов`);
  }
  if (description.length > 160) {
    warnings.push(`Description слишком длинный: ${description.length}/160 символов`);
  }
  if (description.length < 120) {
    warnings.push(`Description слишком короткий: ${description.length}/120+ символов`);
  }

  return warnings;
};

export const generateOGImage = (page: string, title?: string) => {
  void title;

  return getPageSEOData(page).ogImage;
};
