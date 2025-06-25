import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageSEOData, generateSoftwareSchema, generateOrganizationSchema } from '../utils/seo';

interface UseSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: any;
  noIndex?: boolean;
}

export const useSEO = (props: UseSEOProps = {}) => {
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

  const setStructuredData = useCallback((data: any, id = 'seo-structured-data') => {
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
    const pageName = location.pathname.slice(1) || 'home';
    const pageData = getPageSEOData(pageName);
    
    const finalData = {
      title: props.title || pageData.title,
      description: props.description || pageData.description,
      keywords: props.keywords || pageData.keywords,
      ogImage: props.ogImage || 'https://prohelper.pro/logo.svg',
      type: props.type || 'website',
      author: props.author || 'ProHelper Team',
      publishedTime: props.publishedTime,
      modifiedTime: props.modifiedTime,
      noIndex: props.noIndex || false
    };

    const currentUrl = `https://prohelper.pro${location.pathname}`;

    document.title = finalData.title;
    
    setMetaTag('description', finalData.description);
    setMetaTag('keywords', finalData.keywords);
    setMetaTag('author', finalData.author);
    setMetaTag('robots', finalData.noIndex ? 'noindex, nofollow' : 'index, follow');
    
    setMetaTag('og:title', finalData.title, true);
    setMetaTag('og:description', finalData.description, true);
    setMetaTag('og:image', finalData.ogImage, true);
    setMetaTag('og:url', currentUrl, true);
    setMetaTag('og:type', finalData.type, true);
    setMetaTag('og:site_name', 'ProHelper', true);
    setMetaTag('og:locale', 'ru_RU', true);
    
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:title', finalData.title, true);
    setMetaTag('twitter:description', finalData.description, true);
    setMetaTag('twitter:image', finalData.ogImage, true);
    setMetaTag('twitter:url', currentUrl, true);

    if (finalData.publishedTime) {
      setMetaTag('article:published_time', finalData.publishedTime, true);
    }
    
    if (finalData.modifiedTime) {
      setMetaTag('article:modified_time', finalData.modifiedTime, true);
    }

    setLinkTag('canonical', currentUrl);

    if (props.structuredData) {
      setStructuredData(props.structuredData, 'custom-structured-data');
    }

    setStructuredData(generateSoftwareSchema(), 'software-schema');
    setStructuredData(generateOrganizationSchema(), 'organization-schema');

  }, [location.pathname, props, setMetaTag, setLinkTag, setStructuredData]);

  useEffect(() => {
    updateSEO();
  }, [updateSEO]);

  const addBreadcrumbSchema = useCallback((items: Array<{name: string, url: string}>) => {
    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };
    
    setStructuredData(breadcrumbSchema, 'breadcrumb-schema');
  }, [setStructuredData]);

  const addFAQSchema = useCallback((faqs: Array<{question: string, answer: string}>) => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
    
    setStructuredData(faqSchema, 'faq-schema');
  }, [setStructuredData]);

  const addProductSchema = useCallback((product: {
    name: string;
    description: string;
    price: string;
    currency: string;
    availability: string;
    brand: string;
  }) => {
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "brand": {
        "@type": "Brand",
        "name": product.brand
      },
      "offers": {
        "@type": "Offer",
        "price": product.price,
        "priceCurrency": product.currency,
        "availability": `https://schema.org/${product.availability}`,
        "seller": {
          "@type": "Organization",
          "name": "ProHelper"
        }
      }
    };
    
    setStructuredData(productSchema, 'product-schema');
  }, [setStructuredData]);

  return {
    updateSEO,
    addBreadcrumbSchema,
    addFAQSchema,
    addProductSchema,
    setMetaTag,
    setLinkTag,
    setStructuredData
  };
}; 