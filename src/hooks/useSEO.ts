import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  buildStructuredDataGraph,
  getPageSEOData,
  normalizeOgImageUrl,
  type StructuredDataGraph,
} from '@/utils/seo';

const isBrowser = typeof document !== 'undefined';
const BASE_URL = 'https://1мост.рф';
const LEGACY_STRUCTURED_DATA_SELECTORS = [
  '#seo-structured-data',
  '#webpage-schema',
  '#software-schema',
  '#organization-schema',
  '#custom-structured-data',
  '#breadcrumb-schema',
  '#faq-schema',
  '#product-schema',
  '#dynamic-seo',
  'script[type="application/ld+json"][data-seo="auto"]',
].join(',');

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
  statusCode?: number;
}

export const useSEO = (props: UseSEOProps = {}) => {
  if (!isBrowser) {
    const noop = () => {};

    return {
      updateSEO: noop,
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

  const removeMetaTag = useCallback((name: string, property = false) => {
    const attribute = property ? 'property' : 'name';
    document.querySelector(`meta[${attribute}="${name}"]`)?.remove();
  }, []);

  const setStructuredData = useCallback((graph: StructuredDataGraph) => {
    document.querySelectorAll(LEGACY_STRUCTURED_DATA_SELECTORS).forEach((script) => script.remove());

    let script = document.querySelector<HTMLScriptElement>('script[type="application/ld+json"]#ld-json');

    if (graph['@graph'].length === 0) {
      script?.remove();
      return;
    }

    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('id', 'ld-json');
      document.head.appendChild(script);
    }

    script.textContent = JSON.stringify(graph).replace(/</g, '\\u003c');
  }, []);

  const updateSEO = useCallback(() => {
    const pageData = getPageSEOData(location.pathname);

    const finalData = {
      title: props.title ?? pageData.title,
      description: props.description ?? pageData.description,
      keywords: props.keywords ?? pageData.keywords,
      ogImage: normalizeOgImageUrl(props.ogImage ?? pageData.ogImage) ?? `${BASE_URL}/og/default.png`,
      type: props.type ?? pageData.type,
      author: props.author ?? 'МОСТ',
      publishedTime: props.publishedTime,
      modifiedTime: props.modifiedTime,
      noIndex: props.noIndex ?? pageData.noIndex ?? false,
      statusCode: props.statusCode ?? pageData.statusCode,
    };

    const currentUrl = pageData.canonicalUrl.replace(/[?#].*$/, '');

    document.title = finalData.title;

    setMetaTag('description', finalData.description);
    setMetaTag('keywords', finalData.keywords);
    setMetaTag('author', finalData.author);
    setMetaTag(
      'robots',
      finalData.noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    );
    setMetaTag(
      'googlebot',
      finalData.noIndex
        ? 'noindex, nofollow'
        : 'index, follow, max-snippet:-1, max-image-preview:large',
    );

    setMetaTag('og:title', finalData.title, true);
    setMetaTag('og:description', finalData.description, true);
    setMetaTag('og:image', finalData.ogImage, true);
    setMetaTag('og:image:type', 'image/png', true);
    setMetaTag('og:image:alt', finalData.title, true);
    setMetaTag('og:url', currentUrl, true);
    setMetaTag('og:type', finalData.type, true);
    setMetaTag('og:site_name', 'МОСТ', true);
    setMetaTag('og:locale', 'ru_RU', true);

    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', finalData.title);
    setMetaTag('twitter:description', finalData.description);
    setMetaTag('twitter:image', finalData.ogImage);
    setMetaTag('twitter:image:alt', finalData.title);
    setMetaTag('twitter:url', currentUrl);

    if (finalData.publishedTime) {
      setMetaTag('article:published_time', finalData.publishedTime, true);
    } else {
      removeMetaTag('article:published_time', true);
    }

    if (finalData.modifiedTime) {
      setMetaTag('article:modified_time', finalData.modifiedTime, true);
    } else {
      removeMetaTag('article:modified_time', true);
    }

    setLinkTag('canonical', currentUrl);

    setStructuredData(buildStructuredDataGraph({
      pathname: location.pathname,
      title: finalData.title,
      description: finalData.description,
      canonicalUrl: currentUrl,
      noIndex: finalData.noIndex,
      statusCode: finalData.statusCode,
      structuredData: props.structuredData,
    }));
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
    props.statusCode,
    props.title,
    props.type,
    removeMetaTag,
    setLinkTag,
    setMetaTag,
    setStructuredData,
  ]);

  useEffect(() => {
    updateSEO();
  }, [updateSEO]);

  return {
    updateSEO,
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
