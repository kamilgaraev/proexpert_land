import {
  findMarketingSitemapRoute,
  isKnownMarketingPath,
  isMarketingNoIndexPath,
  marketingCapabilityMatrix,
  marketingCompany,
  marketingFaqs,
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

const BASE_URL = 'https://1мост.рф';
const OG_BASE_PATH = `${BASE_URL}/og`;
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
  return marketingPackages.flatMap((item) =>
    item.tiers.map((tier) => {
      const offer: Record<string, string> = {
        '@type': 'Offer',
        name: `${item.name} ${tier.label}`,
        availability: 'https://schema.org/InStock',
        category: item.name,
        description: tier.description,
      };

      if (tier.price > 0) {
        offer.price = `${tier.price}`;
        offer.priceCurrency = 'RUB';
      }

      return offer;
    }),
  );
};

export const generateSoftwareSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: marketingCompany.brand,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android, iOS',
  url: BASE_URL,
  description: marketingSeo.home.description,
  featureList: marketingCapabilityMatrix.map((capability) => capability.title),
  offers: buildPackageOffers(),
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
  name: `${marketingCompany.brand} package catalog`,
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
  publishedTime: string;
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
    name: article.author,
  },
  publisher: {
    '@type': 'Organization',
    name: marketingCompany.brand,
  },
  datePublished: article.publishedTime,
  dateModified: article.modifiedTime ?? article.publishedTime,
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
