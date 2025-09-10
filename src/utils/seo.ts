export interface PageSEOData {
  title: string;
  description: string;
  keywords: string;
  canonicalUrl: string;
  ogImage?: string;
}

export const getPageSEOData = (page: string): PageSEOData => {
  const baseUrl = 'https://prohelper.pro';
  
  const seoData: Record<string, PageSEOData> = {
    home: {
      title: "ProHelper - Строительная CRM от 0₽ | Free, Start, Business",
      description: "Автоматизация строительных проектов: учет материалов, контроль работ, отчетность. 5 тарифов от Free (0₽) до Enterprise (49 900₽). Начните бесплатно!",
      keywords: "учет материалов, управление проектами, контроль работ, строительная отчетность, программа для прораба, автоматизация строительства, SaaS для строителей, контроль бюджета строительства, CRM для строителей, мобильное приложение для прораба, цифровизация строительства, ProHelper, бесплатная строительная программа, тарифы ProHelper от 0 рублей",
      canonicalUrl: `${baseUrl}/`
    },
    integrations: {
      title: "Интеграции ProHelper - 200+ подключений для строительства",
      description: "Интегрируйте ProHelper с 1С, ERP системами, CAD программами. Автоматическая синхронизация данных учета материалов и строительных проектов. API доступ в тарифах Profi и Enterprise. Экономьте время на ручной ввод.",
      keywords: "интеграции строительство, 1С строительство, ERP строительные системы, API учет материалов, синхронизация данных стройка, автоматизация учета, CAD интеграция, строительные программы подключение, API Profi Enterprise",
      canonicalUrl: `${baseUrl}/integrations`
    },
    'small-business': {
      title: "ProHelper для малого бизнеса - Доступный учет материалов",
      description: "Специальные тарифы ProHelper для небольших строительных компаний. Начните бесплатно с тарифом Free, переходите на Start за 4 900₽/мес. Учет материалов, контроль работ, управление проектами. Простая настройка за 1 день.",
      keywords: "учет материалов малый бизнес, строительная программа недорого, CRM строители доступная цена, контроль работ небольшая компания, автоматизация стройки бюджетно, программа прораб недорого, бесплатный тариф Free, тариф Start 4900 рублей",
      canonicalUrl: `${baseUrl}/small-business`
    },
    enterprise: {
      title: "ProHelper Enterprise - Корпоративный учет строительства",
      description: "Масштабируемые решения ProHelper для крупных строительных корпораций. Тарифы Business (9 900₽), Profi (19 900₽), Enterprise (49 900₽). Безлимитный учет материалов, управление множественными проектами, корпоративная интеграция и поддержка 24/7.",
      keywords: "корпоративный учет материалов, управление строительными проектами enterprise, масштабируемая CRM строительство, крупные строительные компании, корпоративная автоматизация стройка, тариф Business 9900, тариф Profi 19900, тариф Enterprise 49900",
      canonicalUrl: `${baseUrl}/enterprise`
    },
    contractors: {
      title: "ProHelper для подрядчиков - Контроль работ и материалов",
      description: "Специализированные инструменты ProHelper для подрядчиков: контроль качества работ, учет материалов по объектам, управление субподрядчиками, отчетность заказчику в реальном времени.",
      keywords: "учет материалов подрядчик, контроль строительных работ, управление субподрядчиками, качество строительных работ, отчетность подрядчика, координация работ стройка, надзор за работами",
      canonicalUrl: `${baseUrl}/contractors`
    },
    blog: {
      title: "Блог ProHelper - Экспертные статьи о строительстве",
      description: "Читайте экспертные статьи о современном строительстве: автоматизация учета материалов, цифровизация процессов, управление проектами, лучшие практики отрасли. Тарифы от Free до Enterprise, кейсы внедрения.",
      keywords: "блог строительство, статьи учет материалов, автоматизация строительных процессов, цифровизация стройки, управление строительными проектами советы, строительные технологии статьи, кейсы ProHelper, внедрение Free Start Business",
      canonicalUrl: `${baseUrl}/blog`
    },
    docs: {
      title: "Документация ProHelper - Руководство по учету материалов", 
      description: "Полная база знаний ProHelper: как настроить учет материалов, управление проектами, интеграцию с 1С. Видеоуроки, FAQ, пошаговые инструкции для всех тарифов от Free до Enterprise.",
      keywords: "инструкция ProHelper, как настроить учет материалов, руководство прораб, FAQ строительная программа, видеоуроки учет стройка, техподдержка строительство, настройка CRM строители, документация Free Start Business Profi",
      canonicalUrl: `${baseUrl}/docs`
    },
    about: {
      title: "О компании ProHelper - Лидер строительных технологий",
      description: "История ProHelper, команда экспертов в строительстве и IT. Наша миссия - цифровизация строительной отрасли через умные технологии учета материалов и управления проектами. Тарифы для всех: от Free до Enterprise.",
      keywords: "о компании ProHelper, команда строительные технологии, лидер автоматизации строительство, история ProHelper, миссия цифровизация стройка, эксперты строительные системы, тарифы от Free до Enterprise",
      canonicalUrl: `${baseUrl}/about`
    },
    careers: {
      title: "Карьера в ProHelper - Работа в строительных технологиях",
      description: "Вакансии в ProHelper: разработка строительных систем, продакт-менеджмент, продажи. Присоединяйтесь к команде, которая революционизирует строительную отрасль.",
      keywords: "работа ProHelper, вакансии строительные технологии, карьера разработка стройка, работа продакт-менеджер строительство, команда ProHelper, IT строительство вакансии",
      canonicalUrl: `${baseUrl}/careers`
    },
    features: {
      title: "Возможности ProHelper - Полный функционал для строительства",
      description: "Изучите все возможности ProHelper: учет материалов, управление проектами, координация команды, финансовый контроль, мобильное приложение. Функции доступны во всех тарифах от Free до Enterprise.",
      keywords: "возможности ProHelper, функции строительной системы, учет материалов функции, управление проектами возможности, строительное ПО функционал, Free Start Business Profi Enterprise функции",
      canonicalUrl: `${baseUrl}/features`
    },
    pricing: {
      title: "Тарифы ProHelper 2025: от 0₽ до 49 900₽ | Сравните планы",
      description: "5 тарифов ProHelper: Free (0₽), Start (4 900₽), Business (9 900₽), Profi (19 900₽), Enterprise (49 900₽). Начните бесплатно, окупаемость 2-3 месяца.",
      keywords: "тарифы ProHelper, цены строительное ПО, стоимость учет материалов, тарифы управление проектами, цена CRM строители, бесплатная строительная система, Free 0 рублей, Start 4900, Business 9900, Profi 19900, Enterprise 49900",
      canonicalUrl: `${baseUrl}/pricing`
    },
    webinars: {
      title: "Вебинары ProHelper - Обучение строительным технологиям",
      description: "Бесплатные вебинары по автоматизации строительства: учет материалов, управление проектами, интеграция с 1С. Экспертные знания и практические кейсы.",
      keywords: "вебинары строительство, обучение ProHelper, автоматизация строительных процессов вебинары, учет материалов обучение, строительные технологии вебинары",
      canonicalUrl: `${baseUrl}/webinars`
    },
    press: {
      title: "Пресс-центр ProHelper - Новости и материалы для СМИ",
      description: "Актуальные новости ProHelper, пресс-релизы, медиа-материалы для журналистов. Контакты пресс-службы, награды и достижения компании.",
      keywords: "пресс-центр ProHelper, новости строительные технологии, пресс-релизы ProHelper, медиа-материалы стартап, строительство новости",
      canonicalUrl: `${baseUrl}/press`
    },
    developers: {
      title: "ProHelper для девелоперов - Управление портфелем проектов",
      description: "Комплексное решение для девелоперских компаний: управление портфелем проектов, координация подрядчиков, финансовое планирование, контроль качества строительства.",
      keywords: "девелоперы строительство, управление портфелем проектов, координация подрядчиков, застройщики CRM, управление девелоперскими проектами",
      canonicalUrl: `${baseUrl}/developers`
    },
    partners: {
      title: "Партнерская программа ProHelper - Развивайте бизнес с нами",
      description: "Станьте партнером ProHelper: реселлеры, системные интеграторы, консультанты. Комиссия до 30%, техническая поддержка, совместный маркетинг.",
      keywords: "партнеры ProHelper, реселлеры строительное ПО, системные интеграторы, партнерская программа IT, бизнес партнерство строительные технологии",
      canonicalUrl: `${baseUrl}/partners`
    },
    contact: {
      title: "Контакты ProHelper - Связаться с командой",
      description: "Свяжитесь с командой ProHelper: консультация по продукту, техническая поддержка, партнерство. Быстрый ответ на ваши вопросы о строительной автоматизации.",
      keywords: "контакты ProHelper, связаться ProHelper, консультация строительное ПО, техподдержка ProHelper, вопросы автоматизация строительства, связь с командой",
      canonicalUrl: `${baseUrl}/contact`
    },
    help: {
      title: "База знаний ProHelper - Помощь и документация",
      description: "База знаний ProHelper: инструкции по использованию, FAQ, видеоуроки. Все что нужно знать о работе с системой управления строительными проектами.",
      keywords: "база знаний ProHelper, помощь ProHelper, FAQ строительное ПО, инструкции ProHelper, документация управление проектами, видеоуроки строительство",
      canonicalUrl: `${baseUrl}/help`
    }
  };

  if (seoData[page]) {
    return seoData[page];
  }

  const canonicalUrl = `${baseUrl}/${page}`.replace(/\/+$/g, '');

  const toTitleCase = (s: string) => s
    .split('-')
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');

  if (page.startsWith('blog/category/')) {
    const slug = decodeURIComponent(page.replace('blog/category/', '')) || 'Категория';
    const name = toTitleCase(slug);
    return {
      title: `Блог ProHelper — Категория: ${name}`,
      description: `Статьи блога ProHelper по категории «${name}»: автоматизация строительства, учет материалов, управление проектами.`,
      keywords: `блог строительство категория ${slug}, статьи ProHelper ${slug}`,
      canonicalUrl
    };
  }

  if (page.startsWith('blog/tag/')) {
    const slug = decodeURIComponent(page.replace('blog/tag/', '')) || 'Тег';
    const name = toTitleCase(slug);
    return {
      title: `Блог ProHelper — Тег: ${name}`,
      description: `Материалы с тегом «${name}»: учет материалов, цифровизация стройки, управление проектами.`,
      keywords: `блог строительство тег ${slug}, ProHelper ${slug}`,
      canonicalUrl
    };
  }

  if (page.startsWith('blog/')) {
    const slug = decodeURIComponent(page.replace('blog/', '')) || 'Статья';
    const name = toTitleCase(slug);
    return {
      title: `Блог ProHelper — ${name}`,
      description: `Статья «${name}» в блоге ProHelper: технологии для учета материалов и управления строительством.`,
      keywords: `блог ProHelper ${slug}, строительство ${slug}`,
      canonicalUrl
    };
  }

  // Фоллбек для неизвестных путей — делаем тайтл уникальным по слагу
  if (page && page !== 'home') {
    const last = toTitleCase(decodeURIComponent(page.split('/').pop() || '')) || 'Страница';
    return {
      title: `ProHelper — ${last}`,
      description: `Страница «${last}» платформы ProHelper: цифровые инструменты для учета материалов и управления строительными проектами.`,
      keywords: `ProHelper ${last}, управление строительством, учет материалов, автоматизация стройки`,
      canonicalUrl
    } as PageSEOData;
  }

  return seoData.home;
};

export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness", "SoftwareApplication"],
  "@id": "https://prohelper.pro/#organization",
  "name": "ProHelper",
  "alternateName": "ПроХелпер",
  "url": "https://prohelper.pro",
  "logo": {
    "@type": "ImageObject",
    "url": "https://prohelper.pro/logo.svg",
    "width": "200",
    "height": "200"
  },
  "image": "https://prohelper.pro/og-image.jpg",
  "description": "Ведущий поставщик SaaS решений для строительной отрасли. Умная платформа для учета материалов и управления строительными проектами. Тарифы от бесплатного Free до корпоративного Enterprise.",
  "foundingDate": "2023",
  "numberOfEmployees": "50-100",
  "naics": "541511",
  "industry": "Construction Technology",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ул. Тверская, 1",
    "addressLocality": "Москва", 
    "addressRegion": "Москва",
    "postalCode": "125009",
    "addressCountry": "RU"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "55.755826",
    "longitude": "37.6176"
  },
  "contactPoint": [
    {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "telephone": "+7-495-123-45-67",
      "email": "support@prohelper.pro",
      "availableLanguage": ["Russian"],
      "url": "https://prohelper.pro/contact",
      "hoursAvailable": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    },
    {
      "@type": "ContactPoint", 
      "contactType": "sales",
      "telephone": "+7-495-123-45-67",
      "email": "sales@prohelper.pro",
      "availableLanguage": ["Russian"]
    }
  ],
  "sameAs": [
    "https://t.me/prohelper_support",
    "https://vk.com/prohelper",
    "https://github.com/prohelper"
  ],
  "hasOfferCatalog": {
    "@type": "OfferCatalog",
    "name": "Тарифы ProHelper",
    "itemListElement": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "SoftwareApplication",
          "name": "ProHelper Free"
        },
        "price": "0",
        "priceCurrency": "RUB"
      },
      {
        "@type": "Offer", 
        "itemOffered": {
          "@type": "SoftwareApplication",
          "name": "ProHelper Start"
        },
        "price": "4900",
        "priceCurrency": "RUB"
      }
    ]
  },
  "keywords": "учет материалов, управление проектами, контроль работ, строительная отчетность, автоматизация строительства, Free Start Business Profi Enterprise",
  "slogan": "Умная автоматизация строительных проектов"
});

export const generateSoftwareSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ProHelper",
  "description": "Умная платформа для учета материалов и управления строительными проектами. Автоматизация контроля работ, бюджета и координации команд на стройке.",
  "url": "https://prohelper.pro",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": [
    {
      "@type": "Offer",
      "name": "Free",
      "price": "0",
      "priceCurrency": "RUB",
      "priceValidUntil": "2026-12-31",
      "description": "Бесплатный тариф для знакомства"
    },
    {
      "@type": "Offer", 
      "name": "Start",
      "price": "4900",
      "priceCurrency": "RUB",
      "priceValidUntil": "2026-12-31",
      "description": "Стартовый тариф для небольших проектов"
    },
    {
      "@type": "Offer",
      "name": "Business", 
      "price": "9900",
      "priceCurrency": "RUB",
      "priceValidUntil": "2026-12-31",
      "description": "Бизнес тариф для средних компаний"
    },
    {
      "@type": "Offer",
      "name": "Profi",
      "price": "19900", 
      "priceCurrency": "RUB",
      "priceValidUntil": "2026-12-31",
      "description": "Профессиональный тариф с API и BI"
    },
    {
      "@type": "Offer",
      "name": "Enterprise",
      "price": "49900",
      "priceCurrency": "RUB", 
      "priceValidUntil": "2026-12-31",
      "description": "Корпоративный тариф для крупных компаний"
    }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "324"
  },
  "featureList": [
    "Автоматизация учета материалов на стройке",
    "Управление строительными проектами", 
    "Контроль строительных работ и качества",
    "Финансовая отчетность и контроль бюджета",
    "Координация команд и подрядчиков",
    "Мобильное приложение для прорабов с QR-сканером",
    "Интеграция с 1С и ERP системами",
    "Геолокация и фотофиксация работ",
    "Управление субподрядчиками",
    "Цифровизация строительных процессов",
    "API доступ для интеграций",
    "BI аналитика и отчеты",
    "White Label решения",
    "24/7 приоритетная поддержка"
  ],
  "screenshot": "https://prohelper.pro/screenshot.jpg",
  "keywords": "учет материалов, управление проектами, контроль работ, строительная отчетность, программа для прораба, автоматизация строительства, SaaS для строителей, Free Start Business Profi Enterprise тарифы"
});

export const generateBreadcrumbSchema = (items: Array<{name: string, url: string}>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});

export const generateFAQSchema = (faqs: Array<{question: string, answer: string}>) => ({
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
});

export const generatePricingSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Product", 
  "name": "ProHelper - Система управления строительными проектами",
  "description": "Платформа для автоматизации учета материалов и управления строительными проектами",
  "brand": {
    "@type": "Brand",
    "name": "ProHelper"
  },
  "offers": [
    {
      "@type": "Offer",
      "name": "Free",
      "price": "0",
      "priceCurrency": "RUB",
      "availability": "https://schema.org/InStock",
      "validFrom": "2025-09-10",
      "priceValidUntil": "2026-12-31",
      "description": "Бесплатный тариф: 1 прораб, 1 объект, 3 пользователя"
    },
    {
      "@type": "Offer", 
      "name": "Start",
      "price": "4900",
      "priceCurrency": "RUB",
      "availability": "https://schema.org/InStock", 
      "validFrom": "2025-09-10",
      "priceValidUntil": "2026-12-31",
      "description": "Стартовый тариф: 2 прораба, 3 объекта, 5 пользователей"
    },
    {
      "@type": "Offer",
      "name": "Business",
      "price": "9900", 
      "priceCurrency": "RUB",
      "availability": "https://schema.org/InStock",
      "validFrom": "2025-09-10", 
      "priceValidUntil": "2026-12-31",
      "description": "Бизнес тариф: 10 прорабов, 15 объектов, интеграции"
    },
    {
      "@type": "Offer",
      "name": "Profi",
      "price": "19900",
      "priceCurrency": "RUB", 
      "availability": "https://schema.org/InStock",
      "validFrom": "2025-09-10",
      "priceValidUntil": "2026-12-31", 
      "description": "Профи тариф: 30 прорабов, 50 объектов, API, BI"
    },
    {
      "@type": "Offer",
      "name": "Enterprise", 
      "price": "49900",
      "priceCurrency": "RUB",
      "availability": "https://schema.org/InStock",
      "validFrom": "2025-09-10",
      "priceValidUntil": "2026-12-31",
      "description": "Корпоративный тариф: неограниченные возможности"
    }
  ]
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
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": article.title,
  "description": article.description,
  "image": {
    "@type": "ImageObject",
    "url": article.image || "https://prohelper.pro/blog-default.jpg",
    "width": "1200",
    "height": "630"
  },
  "author": {
    "@type": "Person",
    "name": article.author,
    "url": "https://prohelper.pro/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "ProHelper",
    "logo": {
      "@type": "ImageObject", 
      "url": "https://prohelper.pro/logo.svg",
      "width": "200",
      "height": "200"
    }
  },
  "datePublished": article.publishedTime,
  "dateModified": article.modifiedTime || article.publishedTime,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": article.url
  },
  "articleSection": article.category,
  "keywords": article.tags?.join(", ") || "строительство, ProHelper, автоматизация",
  "inLanguage": "ru-RU"
});

export const generateWebPageSchema = (page: {
  name: string;
  description: string;
  url: string;
  breadcrumbs?: Array<{name: string, url: string}>;
}) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": page.name,
  "description": page.description,
  "url": page.url,
  "isPartOf": {
    "@type": "WebSite",
    "name": "ProHelper",
    "url": "https://prohelper.pro"
  },
  "breadcrumb": page.breadcrumbs ? {
    "@type": "BreadcrumbList",
    "itemListElement": page.breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  } : undefined,
  "mainEntity": {
    "@type": "Organization",
    "@id": "https://prohelper.pro/#organization"
  },
  "inLanguage": "ru-RU"
});

// Функция для валидации длины SEO текстов
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

// Функция генерации оптимального Open Graph изображения
export const generateOGImage = (page: string, title?: string) => {
  const baseUrl = 'https://prohelper.pro/og-images';
  
  // Специфичные OG изображения для важных страниц
  const pageImages: Record<string, string> = {
    home: `${baseUrl}/home.jpg`,
    pricing: `${baseUrl}/pricing.jpg`, 
    features: `${baseUrl}/features.jpg`,
    blog: `${baseUrl}/blog.jpg`,
    contact: `${baseUrl}/contact.jpg`,
    'small-business': `${baseUrl}/small-business.jpg`,
    enterprise: `${baseUrl}/enterprise.jpg`
  };
  
  if (pageImages[page]) {
    return pageImages[page];
  }
  
  // Для блога - динамическое изображение с заголовком
  if (page.startsWith('blog/') && title) {
    return `${baseUrl}/blog-dynamic.jpg?title=${encodeURIComponent(title)}`;
  }
  
  // Fallback - общее изображение
  return `${baseUrl}/default.jpg`;
}; 