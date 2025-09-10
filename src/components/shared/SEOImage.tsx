import React from 'react';

interface SEOImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  width?: number;
  height?: number;
  priority?: boolean;
  keyword?: string; // Ключевое слово для SEO
}

export const SEOImage: React.FC<SEOImageProps> = ({
  src,
  alt,
  title,
  className = '',
  loading = 'lazy',
  width,
  height,
  priority = false,
  keyword
}) => {
  // Генерируем SEO-оптимизированный alt текст
  const seoAlt = keyword ? `${alt} - ${keyword}` : alt;
  
  // Добавляем structured data для изображения
  const imageSchema = {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "url": src,
    "name": seoAlt,
    "description": title || alt,
    "width": width,
    "height": height,
    "encodingFormat": getImageFormat(src)
  };

  React.useEffect(() => {
    // Добавляем schema для изображения
    if (priority) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(imageSchema);
      script.id = `image-schema-${src.replace(/[^a-zA-Z0-9]/g, '')}`;
      
      if (!document.getElementById(script.id)) {
        document.head.appendChild(script);
      }
    }
  }, [src, priority]);

  return (
    <>
      {priority && (
        <link rel="preload" as="image" href={src} />
      )}
      <img
        src={src}
        alt={seoAlt}
        title={title || alt}
        className={className}
        loading={priority ? 'eager' : loading}
        width={width}
        height={height}
        decoding="async"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          // Fallback для сломанных изображений
          target.src = '/images/fallback.jpg';
          target.alt = 'Изображение недоступно - ProHelper';
        }}
      />
    </>
  );
};

function getImageFormat(src: string): string {
  const extension = src.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'svg':
      return 'image/svg+xml';
    default:
      return 'image/jpeg';
  }
}

// Компонент для критически важных изображений (логотипы, hero)
export const CriticalSEOImage: React.FC<SEOImageProps> = (props) => {
  return (
    <SEOImage
      {...props}
      priority={true}
      loading="eager"
    />
  );
};

// Компонент для изображений блога с дополнительной SEO оптимизацией
export const BlogSEOImage: React.FC<SEOImageProps & {
  articleTitle?: string;
  category?: string;
}> = ({ articleTitle, category, keyword, alt, ...props }) => {
  const seoKeyword = keyword || category || 'строительство ProHelper';
  const blogAlt = articleTitle 
    ? `${alt} - ${articleTitle} | ${seoKeyword}`
    : `${alt} - ${seoKeyword}`;

  return (
    <SEOImage
      {...props}
      alt={blogAlt}
      keyword={seoKeyword}
    />
  );
};
