import { useEffect } from 'react';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: any;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'ProHelper - Умная платформа для управления строительными проектами',
  description = 'Автоматизируйте строительные процессы с ProHelper: учет материалов, контроль бюджета, координация команд и отчетность в одной платформе.',
  keywords = 'строительство, управление проектами, учет материалов, строительная отчетность, SaaS для строителей, автоматизация строительства, финансовый контроль, ProHelper',
  ogImage = 'https://prohelper.pro/logo.svg',
  canonicalUrl,
  type = 'website',
  author = 'ProHelper Team',
  publishedTime,
  modifiedTime,
  structuredData
}) => {
  const currentUrl = canonicalUrl || `https://prohelper.pro${window.location.pathname}`;

  useEffect(() => {
    document.title = title;
    
    const setMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    const setLinkTag = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      
      link.setAttribute('href', href);
    };

    setMetaTag('description', description);
    setMetaTag('keywords', keywords);
    setMetaTag('author', author);
    setMetaTag('robots', 'index, follow');
    setMetaTag('geo.region', 'RU');
    setMetaTag('geo.placename', 'Россия');
    setMetaTag('geo.position', '55.751244;37.618423');
    setMetaTag('ICBM', '55.751244, 37.618423');
    
    setMetaTag('og:title', title, true);
    setMetaTag('og:description', description, true);
    setMetaTag('og:image', ogImage, true);
    setMetaTag('og:url', currentUrl, true);
    setMetaTag('og:type', type, true);
    setMetaTag('og:site_name', 'ProHelper', true);
    setMetaTag('og:locale', 'ru_RU', true);
    
    setMetaTag('twitter:card', 'summary_large_image', true);
    setMetaTag('twitter:title', title, true);
    setMetaTag('twitter:description', description, true);
    setMetaTag('twitter:image', ogImage, true);
    setMetaTag('twitter:url', currentUrl, true);

    if (publishedTime) {
      setMetaTag('article:published_time', publishedTime, true);
    }
    
    if (modifiedTime) {
      setMetaTag('article:modified_time', modifiedTime, true);
    }

    setLinkTag('canonical', currentUrl);

    if (structuredData) {
      let script = document.querySelector('script[type="application/ld+json"]#dynamic-seo');
      
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        script.setAttribute('id', 'dynamic-seo');
        document.head.appendChild(script);
      }
      
      script.textContent = JSON.stringify(structuredData);
    }

    return () => {
      const dynamicScript = document.querySelector('script#dynamic-seo');
      if (dynamicScript) {
        dynamicScript.remove();
      }
    };
  }, [title, description, keywords, ogImage, currentUrl, type, author, publishedTime, modifiedTime, structuredData]);

  return null;
}; 