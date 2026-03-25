import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  generateOrganizationSchema,
  generateSoftwareSchema,
  generateWebPageSchema,
  getPageSEOData,
} from '@/utils/seo';

const isBrowser = typeof document !== 'undefined';
const BASE_URL = 'https://prohelper.pro';

interface UseSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: unknown;
  noIndex?: boolean;
}

export const useSEO = (props: UseSEOProps = {}) => {
  if (!isBrowser) {
    const noop = () => {};

    return {
      updateSEO: noop,
      addBreadcrumbSchema: noop,
      addFAQSchema: noop,
      addProductSchema: noop,
      setMetaTag: noop,
      setLinkTag: noop,
      setStructuredData: noop,
    } as const;
  }

  const location = useLocation();

  const setMetaTag = useCallback((name: string, content: string, property = false) => {
    const attribute = property ? 'property' : 'name';
    let meta = document.querySelector(`meta[${attribute}="${name}"]`);

    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(attribute, name);
      document.head.appendChild(meta);
    }

    meta.setAttribute('content', content);
  }, []);

  const setLinkTag = useCallback((rel: string, href: string) => {
    let link = document.querySelector(`link[rel="${rel}"]`);

    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', rel);
      document.head.appendChild(link);
    }

    link.setAttribute('href', href);
  }, []);

  const setStructuredData = useCallback((data: unknown, id = 'seo-structured-data') => {
    let script = document.querySelector(`script[type="application/ld+json"]#${id}`);

    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('id', id);
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(data);
  }, []);

  const updateSEO = useCallback(() => {
    const pageData = getPageSEOData(location.pathname);

    const finalData = {
      title: props.title ?? pageData.title,
      description: props.description ?? pageData.description,
      keywords: props.keywords ?? pageData.keywords,
      ogImage: props.ogImage ?? pageData.ogImage ?? `${BASE_URL}/logo.svg`,
      type: props.type ?? 'website',
      author: props.author ?? 'ProHelper',
      publishedTime: props.publishedTime,
      modifiedTime: props.modifiedTime,
      noIndex: props.noIndex ?? pageData.noIndex ?? false,
    };

    const currentUrl = `${BASE_URL}${location.pathname}`;

    document.title = finalData.title;

    setMetaTag('description', finalData.description);
    setMetaTag('keywords', finalData.keywords);
    setMetaTag('author', finalData.author);
    setMetaTag(
      'robots',
      finalData.noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    );

    setMetaTag('og:title', finalData.title, true);
    setMetaTag('og:description', finalData.description, true);
    setMetaTag('og:image', finalData.ogImage, true);
    setMetaTag('og:url', currentUrl, true);
    setMetaTag('og:type', finalData.type, true);
    setMetaTag('og:site_name', 'ProHelper', true);
    setMetaTag('og:locale', 'ru_RU', true);

    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', finalData.title);
    setMetaTag('twitter:description', finalData.description);
    setMetaTag('twitter:image', finalData.ogImage);
    setMetaTag('twitter:url', currentUrl);

    if (finalData.publishedTime) {
      setMetaTag('article:published_time', finalData.publishedTime, true);
    }

    if (finalData.modifiedTime) {
      setMetaTag('article:modified_time', finalData.modifiedTime, true);
    }

    setLinkTag('canonical', currentUrl);

    setStructuredData(
      generateWebPageSchema({
        name: finalData.title,
        description: finalData.description,
        url: currentUrl,
      }),
      'webpage-schema',
    );
    setStructuredData(generateSoftwareSchema(), 'software-schema');
    setStructuredData(generateOrganizationSchema(), 'organization-schema');

    if (props.structuredData) {
      setStructuredData(props.structuredData, 'custom-structured-data');
    }
  }, [
    location.pathname,
    props.author,
    props.description,
    props.keywords,
    props.modifiedTime,
    props.noIndex,
    props.ogImage,
    props.publishedTime,
    props.structuredData,
    props.title,
    props.type,
    setLinkTag,
    setMetaTag,
    setStructuredData,
  ]);

  useEffect(() => {
    updateSEO();
  }, [updateSEO]);

  const addBreadcrumbSchema = useCallback((items: Array<{ name: string; url: string }>) => {
    setStructuredData(
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      },
      'breadcrumb-schema',
    );
  }, [setStructuredData]);

  const addFAQSchema = useCallback((faqs: Array<{ question: string; answer: string }>) => {
    setStructuredData(
      {
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
      },
      'faq-schema',
    );
  }, [setStructuredData]);

  const addProductSchema = useCallback((product: {
    name: string;
    description: string;
    price: string;
    currency: string;
    availability: string;
    brand: string;
  }) => {
    setStructuredData(
      {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.description,
        brand: {
          '@type': 'Brand',
          name: product.brand,
        },
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: product.currency,
          availability: `https://schema.org/${product.availability}`,
        },
      },
      'product-schema',
    );
  }, [setStructuredData]);

  return {
    updateSEO,
    addBreadcrumbSchema,
    addFAQSchema,
    addProductSchema,
    setMetaTag,
    setLinkTag,
    setStructuredData,
  };
};

export const usePageTitle = (title: string) => {
  useEffect(() => {
    if (isBrowser) {
      document.title = title;
    }
  }, [title]);
};
