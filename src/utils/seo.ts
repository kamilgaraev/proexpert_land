import {
  isMarketingNoIndexPath,
  marketingCapabilityMatrix,
  marketingCompany,
  marketingPackages,
  marketingPaths,
  marketingSeo,
  normalizeMarketingPath,
  resolveMarketingSeoKey,
} from '@/data/marketingRegistry';

export interface PageSEOData {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage?: string;
  noIndex?: boolean;
}

const BASE_URL = 'https://prohelper.pro';
const DEFAULT_OG_IMAGE = `${BASE_URL}/logo.svg`;

export const getPageSEOData = (page: string): PageSEOData => {
  const normalizedPath = normalizeMarketingPath(page);
  const pageKey = resolveMarketingSeoKey(normalizedPath);
  const pageMeta = marketingSeo[pageKey] ?? marketingSeo.home;
  const canonicalPath = normalizedPath === marketingPaths.home ? '' : normalizedPath;
  const noIndex = pageMeta.noIndex ?? isMarketingNoIndexPath(normalizedPath);

  return {
    title: pageMeta.title,
    description: pageMeta.description,
    keywords: pageMeta.keywords ?? '',
    canonicalUrl: `${BASE_URL}${canonicalPath}`,
    ogImage: DEFAULT_OG_IMAGE,
    noIndex,
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
  areaServed: 'RU',
  description: marketingSeo.home.description,
});

const buildPackageOffers = () => {
  return marketingPackages.flatMap((item) =>
    item.tiers.map((tier) => ({
      '@type': 'Offer',
      name: `${item.name} ${tier.label}`,
      price: `${tier.price}`,
      priceCurrency: 'RUB',
      availability: 'https://schema.org/InStock',
      category: item.name,
      description: tier.description,
    })),
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
  image: article.image ?? DEFAULT_OG_IMAGE,
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
  void page;
  void title;

  return DEFAULT_OG_IMAGE;
};
