// Утилиты для SEO оптимизации
export class SEOOptimizer {
  
  // Анализ плотности ключевых слов
  static analyzeKeywordDensity(content: string, keywords: string[]): Record<string, number> {
    const text = content.toLowerCase().replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).length;
    const density: Record<string, number> = {};
    
    keywords.forEach(keyword => {
      const keywordCount = (text.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
      density[keyword] = Math.round((keywordCount / words) * 100 * 100) / 100; // Процент с 2 знаками
    });
    
    return density;
  }
  
  // Проверка оптимальности заголовков
  static analyzeHeadingStructure(content: string): {
    h1Count: number;
    hasH1: boolean;
    missingLevels: number[];
    structure: Array<{level: number, text: string}>;
  } {
    const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h[1-6]>/gi;
    const headings: Array<{level: number, text: string}> = [];
    let match;
    
    while ((match = headingRegex.exec(content)) !== null) {
      headings.push({
        level: parseInt(match[1]),
        text: match[2].replace(/<[^>]*>/g, '').trim()
      });
    }
    
    const h1Count = headings.filter(h => h.level === 1).length;
    const hasH1 = h1Count > 0;
    
    // Проверяем пропущенные уровни
    const levels = headings.map(h => h.level);
    const uniqueLevels = [...new Set(levels)].sort();
    const missingLevels: number[] = [];
    
    for (let i = 1; i < uniqueLevels.length; i++) {
      const current = uniqueLevels[i];
      const previous = uniqueLevels[i - 1];
      if (current - previous > 1) {
        for (let j = previous + 1; j < current; j++) {
          missingLevels.push(j);
        }
      }
    }
    
    return { h1Count, hasH1, missingLevels, structure: headings };
  }
  
  // Оптимизация внутренних ссылок
  static optimizeInternalLinks(content: string, currentPage: string): string {
    const linkPatterns = [
      { pattern: /учет материалов/gi, link: '/features', anchor: 'учет материалов' },
      { pattern: /управление проектами/gi, link: '/features', anchor: 'управление строительными проектами' },
      { pattern: /тарифы|цены/gi, link: '/pricing', anchor: 'тарифы ProHelper' },
      { pattern: /интеграция|интеграции/gi, link: '/integrations', anchor: 'интеграции ProHelper' },
      { pattern: /малый бизнес/gi, link: '/small-business', anchor: 'ProHelper для малого бизнеса' },
      { pattern: /enterprise|корпоративный/gi, link: '/enterprise', anchor: 'ProHelper Enterprise' }
    ];
    
    let optimizedContent = content;
    
    linkPatterns.forEach(({ pattern, link, anchor }) => {
      if (currentPage !== link) {
        optimizedContent = optimizedContent.replace(
          pattern,
          `<a href="${link}" title="${anchor}">${anchor}</a>`
        );
      }
    });
    
    return optimizedContent;
  }
  
  // Генерация мета-тегов на основе контента
  static generateMetaFromContent(content: string, currentTitle?: string): {
    suggestedTitle: string;
    suggestedDescription: string;
    suggestedKeywords: string[];
  } {
    const text = content.replace(/<[^>]*>/g, '').toLowerCase();
    
    // Извлекаем ключевые фразы
    const commonPhrases = [
      'учет материалов', 'управление проектами', 'строительство', 'prohelper',
      'автоматизация', 'контроль работ', 'отчетность', 'бюджет', 'crm'
    ];
    
    const foundKeywords = commonPhrases.filter(phrase => 
      text.includes(phrase.toLowerCase())
    );
    
    // Генерируем description из первых 150 символов
    const firstParagraph = content.match(/<p[^>]*>(.*?)<\/p>/i);
    let description = firstParagraph 
      ? firstParagraph[1].replace(/<[^>]*>/g, '')
      : content.replace(/<[^>]*>/g, '').substring(0, 150);
    
    description = description.length > 150 
      ? description.substring(0, 147) + '...'
      : description;
    
    // Генерируем title
    const h1Match = content.match(/<h1[^>]*>(.*?)<\/h1>/i);
    const suggestedTitle = h1Match 
      ? h1Match[1].replace(/<[^>]*>/g, '') + ' | ProHelper'
      : currentTitle || 'ProHelper - Строительная CRM';
    
    return {
      suggestedTitle,
      suggestedDescription: description,
      suggestedKeywords: foundKeywords
    };
  }
  
  // Проверка качества контента для SEO
  static auditContentSEO(content: string, title: string, description: string): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    
    // Проверка длины title
    if (title.length > 60) {
      issues.push(`Title слишком длинный: ${title.length} символов (рекомендуется до 60)`);
      score -= 10;
    }
    if (title.length < 30) {
      issues.push(`Title слишком короткий: ${title.length} символов (рекомендуется от 30)`);
      score -= 10;
    }
    
    // Проверка description
    if (description.length > 160) {
      issues.push(`Description слишком длинный: ${description.length} символов`);
      score -= 10;
    }
    if (description.length < 120) {
      issues.push(`Description слишком короткий: ${description.length} символов`);
      score -= 5;
    }
    
    // Проверка структуры заголовков
    const headingAnalysis = this.analyzeHeadingStructure(content);
    if (!headingAnalysis.hasH1) {
      issues.push('Отсутствует заголовок H1');
      score -= 20;
    }
    if (headingAnalysis.h1Count > 1) {
      issues.push(`Слишком много H1 заголовков: ${headingAnalysis.h1Count}`);
      score -= 15;
    }
    if (headingAnalysis.missingLevels.length > 0) {
      issues.push(`Пропущены уровни заголовков: H${headingAnalysis.missingLevels.join(', H')}`);
      score -= 5;
    }
    
    // Проверка плотности ключевых слов
    const keywords = ['prohelper', 'строительство', 'учет материалов'];
    const density = this.analyzeKeywordDensity(content, keywords);
    
    Object.entries(density).forEach(([keyword, percent]) => {
      if (percent > 3) {
        issues.push(`Переспам ключевого слова "${keyword}": ${percent}%`);
        score -= 10;
      }
      if (percent === 0) {
        recommendations.push(`Добавьте ключевое слово "${keyword}" в контент`);
      }
    });
    
    // Проверка изображений
    const images = content.match(/<img[^>]*>/gi) || [];
    const imagesWithoutAlt = images.filter(img => !img.includes('alt=') || img.includes('alt=""'));
    
    if (imagesWithoutAlt.length > 0) {
      issues.push(`${imagesWithoutAlt.length} изображений без alt-текста`);
      score -= imagesWithoutAlt.length * 5;
    }
    
    // Проверка внутренних ссылок
    const internalLinks = (content.match(/<a[^>]*href=["']\/[^"']*["'][^>]*>/gi) || []).length;
    if (internalLinks < 2) {
      recommendations.push('Добавьте больше внутренних ссылок для улучшения навигации');
    }
    
    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }
}

// Функция для автоматической оптимизации контента
export const optimizeContentForSEO = (
  content: string,
  currentPage: string,
  _targetKeywords: string[] = []
): string => {
  let optimizedContent = content;
  
  // Добавляем внутренние ссылки
  optimizedContent = SEOOptimizer.optimizeInternalLinks(optimizedContent, currentPage);
  
  // Добавляем schema markup для изображений
  optimizedContent = optimizedContent.replace(
    /<img([^>]*)src=["']([^"']*)["']([^>]*)alt=["']([^"']*)["']([^>]*)>/gi,
    (_match, before, src, middle, alt, after) => {
      return `<img${before}src="${src}"${middle}alt="${alt}"${after} itemProp="image">`;
    }
  );
  
  return optimizedContent;
};
