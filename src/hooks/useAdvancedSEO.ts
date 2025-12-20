import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  getPageSEOData, 
  generateOrganizationSchema,
  generateSoftwareSchema, 
  generateFAQSchema,
  generatePricingSchema,
  generateOGImage,
  validateSEOLength,
  generateArticleSchema,
  generateWebPageSchema
} from '../utils/seo';

interface AdvancedSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  faqs?: Array<{question: string, answer: string}>;
  breadcrumbs?: Array<{name: string, url: string}>;
  article?: {
    title: string;
    description: string;
    author: string;
    publishedTime: string;
    modifiedTime?: string;
    image?: string;
    category: string;
    tags?: string[];
  };
  enablePricingSchema?: boolean;
  customSchema?: any[];
}

export const useAdvancedSEO = (props: AdvancedSEOProps = {}) => {
  const location = useLocation();
  const [seoWarnings, setSeoWarnings] = useState<string[]>([]);
  
  useEffect(() => {
    const pageName = location.pathname.slice(1) || 'home';
    const pageData = getPageSEOData(pageName);
    
    const finalTitle = props.title || pageData.title;
    const finalDescription = props.description || pageData.description;
    const finalKeywords = props.keywords || pageData.keywords;
    const finalOGImage = props.ogImage || generateOGImage(pageName, finalTitle);
    
    // Валидация SEO параметров
    const warnings = validateSEOLength(finalTitle, finalDescription);
    setSeoWarnings(warnings);
    
    // Обновляем meta теги
    updateMetaTags({
      title: finalTitle,
      description: finalDescription,
      keywords: finalKeywords,
      ogImage: finalOGImage,
      url: `https://prohelper.pro${location.pathname}`
    });
    
    // Создаем structured data
    const schemas: any[] = [
      generateOrganizationSchema(),
      generateSoftwareSchema()
    ];
    
    // Добавляем WebPage схему
    if (props.breadcrumbs) {
      schemas.push(generateWebPageSchema({
        name: finalTitle,
        description: finalDescription,
        url: `https://prohelper.pro${location.pathname}`,
        breadcrumbs: props.breadcrumbs
      }));
    }
    
    // Добавляем FAQ схему если есть
    if (props.faqs && props.faqs.length > 0) {
      schemas.push(generateFAQSchema(props.faqs));
    }
    
    // Добавляем Article схему для блога
    if (props.article) {
      schemas.push(generateArticleSchema({
        ...props.article,
        url: `https://prohelper.pro${location.pathname}`
      }));
    }
    
    // Добавляем Pricing схему на странице тарифов
    if (props.enablePricingSchema || pageName === 'pricing') {
      schemas.push(generatePricingSchema());
    }
    
    // Добавляем кастомные схемы
    if (props.customSchema) {
      schemas.push(...props.customSchema);
    }
    
    // Устанавливаем structured data
    setStructuredData(schemas);
    
    // Добавляем preload для критических ресурсов
    if (pageName === 'home') {
      preloadCriticalResources();
    }
    
  }, [location, props]);
  
  return { seoWarnings };
};

const updateMetaTags = (data: {
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
  url: string;
}) => {
  document.title = data.title;
  
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
  
  // Основные meta теги
  setMetaTag('description', data.description);
  setMetaTag('keywords', data.keywords);
  setMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
  setMetaTag('geo.region', 'RU');
  setMetaTag('geo.placename', 'Россия');
  setMetaTag('geo.position', '55.751244;37.618423');
  setMetaTag('ICBM', '55.751244, 37.618423');
  
  // Open Graph
  setMetaTag('og:title', data.title, true);
  setMetaTag('og:description', data.description, true);
  setMetaTag('og:image', data.ogImage, true);
  setMetaTag('og:image:width', '1200', true);
  setMetaTag('og:image:height', '630', true);
  setMetaTag('og:url', data.url, true);
  setMetaTag('og:type', 'website', true);
  setMetaTag('og:site_name', 'ProHelper', true);
  setMetaTag('og:locale', 'ru_RU', true);
  
  // Twitter Cards
  setMetaTag('twitter:card', 'summary_large_image', true);
  setMetaTag('twitter:title', data.title, true);
  setMetaTag('twitter:description', data.description, true);
  setMetaTag('twitter:image', data.ogImage, true);
  
  // Дополнительные SEO теги
  setMetaTag('theme-color', '#EA580C');
  setMetaTag('msapplication-TileColor', '#EA580C');
  
  // Canonical URL
  setLinkTag('canonical', data.url);
  
  // Alternate для мобильной версии
  setLinkTag('alternate', data.url);
};

const setStructuredData = (schemas: any[]) => {
  // Удаляем старые схемы
  const existingSchemas = document.querySelectorAll('script[type="application/ld+json"][data-seo="auto"]');
  existingSchemas.forEach(script => script.remove());
  
  // Добавляем новые схемы
  schemas.forEach((schema, index) => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'auto');
    script.setAttribute('data-schema-id', `schema-${index}`);
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
  });
};

const preloadCriticalResources = () => {
  const criticalResources = [
    '/images/hero-bg.jpg',
    '/fonts/inter-var.woff2',
    'https://prohelper.pro/og-images/home.jpg'
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    
    if (resource.includes('.woff2')) {
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
    } else if (resource.includes('.jpg') || resource.includes('.png')) {
      link.as = 'image';
    } else {
      link.as = 'fetch';
    }
    
    link.href = resource;
    document.head.appendChild(link);
  });
};

// Хук для SEO анализа страницы
export const useSEOAnalysis = () => {
  const [analysis, setAnalysis] = useState<{
    score: number;
    issues: string[];
    recommendations: string[];
  } | null>(null);
  
  useEffect(() => {
    const analyzeCurrentPage = () => {
      const title = document.title;
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      const content = document.body.innerHTML;
      
      // Импортируем анализатор динамически
      import('../utils/seoOptimizer').then(({ SEOOptimizer }) => {
        const result = SEOOptimizer.auditContentSEO(content, title, description);
        setAnalysis(result);
      });
    };
    
    // Анализируем через 2 секунды после загрузки страницы
    const timer = setTimeout(analyzeCurrentPage, 2000);
    return () => clearTimeout(timer);
  }, []);
  
  return analysis;
};
