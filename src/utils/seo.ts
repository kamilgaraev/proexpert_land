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
      title: "ProExpert - Система управления строительными проектами",
      description: "Единая экосистема для строительных компаний: от учета материалов на объекте до финансовой отчетности. Объединяем прорабов, администраторов и владельцев в одной платформе.",
      keywords: "прораб, строительство, учет материалов, управление проектами, строительные работы, финансовый учет, SaaS, строительная отчетность, строительные компании",
      canonicalUrl: `${baseUrl}/`
    },
    integrations: {
      title: "Интеграции - ProExpert",
      description: "200+ интеграций с ERP системами, CAD программами, облачными сервисами и строительными платформами. Подключите все ваши инструменты к ProExpert.",
      keywords: "интеграции, ERP, CAD, API, строительные системы, автоматизация, синхронизация данных",
      canonicalUrl: `${baseUrl}/integrations`
    },
    api: {
      title: "API и документация - ProExpert",
      description: "Мощный REST API для интеграции ProExpert с вашими системами. Подробная документация, примеры кода и SDK для разработчиков.",
      keywords: "API, REST, разработчики, интеграция, SDK, документация, веб-хуки",
      canonicalUrl: `${baseUrl}/api`
    },
    'small-business': {
      title: "Решения для малого бизнеса - ProExpert",
      description: "Доступные решения для небольших строительных компаний. Упростите учет, управление проектами и работу с клиентами.",
      keywords: "малый бизнес, небольшие компании, строительство, учет, управление, доступные цены",
      canonicalUrl: `${baseUrl}/small-business`
    },
    enterprise: {
      title: "Корпоративные решения - ProExpert",
      description: "Масштабируемые решения для крупных строительных корпораций. Управление множественными проектами, команды и интеграции.",
      keywords: "корпоративные решения, крупный бизнес, масштабирование, управление проектами, строительные корпорации",
      canonicalUrl: `${baseUrl}/enterprise`
    },
    contractors: {
      title: "Для подрядчиков - ProExpert",
      description: "Специализированные инструменты для подрядчиков: управление субподрядчиками, контроль качества, отчетность и координация работ.",
      keywords: "подрядчики, субподрядчики, контроль качества, координация работ, строительный надзор",
      canonicalUrl: `${baseUrl}/contractors`
    },
    blog: {
      title: "Блог - ProExpert",
      description: "Экспертные статьи о строительстве, управлении проектами, цифровизации и лучших практиках отрасли.",
      keywords: "блог, статьи, строительство, управление проектами, экспертные советы, цифровизация",
      canonicalUrl: `${baseUrl}/blog`
    },
    docs: {
      title: "Документация - ProExpert", 
      description: "Полная база знаний по использованию ProExpert. Руководства, FAQ, видеоуроки и поддержка пользователей.",
      keywords: "документация, руководство пользователя, FAQ, помощь, инструкции, видеоуроки",
      canonicalUrl: `${baseUrl}/docs`
    },
    about: {
      title: "О компании - ProExpert",
      description: "История ProExpert, наша команда, миссия и ценности. Узнайте больше о лидере в области строительных технологий.",
      keywords: "о компании, команда, история, миссия, ценности, строительные технологии",
      canonicalUrl: `${baseUrl}/about`
    },
    careers: {
      title: "Карьера - ProExpert",
      description: "Присоединяйтесь к нашей команде! Открытые вакансии в области разработки, дизайна, продакт-менеджмента и других направлений.",
      keywords: "карьера, вакансии, работа, команда, разработка, дизайн, продакт-менеджмент",
      canonicalUrl: `${baseUrl}/careers`
    }
  };

  return seoData[page] || seoData.home;
};

export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://prohelper.pro/#organization",
  "name": "ProExpert",
  "url": "https://prohelper.pro",
  "logo": "https://prohelper.pro/logo.svg",
  "description": "Ведущий поставщик SaaS решений для строительной отрасли",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "Russian",
    "url": "https://prohelper.pro/support"
  },
  "foundingDate": "2023",
  "numberOfEmployees": "50-100",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "RU",
    "addressLocality": "Москва"
  },
  "sameAs": [
    "https://t.me/proexpert_support"
  ]
});

export const generateSoftwareSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ProExpert",
  "description": "Профессиональная SaaS платформа для прорабов, соединяющая работу на стройплощадке с финансовым учетом",
  "url": "https://prohelper.pro",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "RUB",
    "priceValidUntil": "2025-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "156"
  },
  "featureList": [
    "Учет строительных материалов",
    "Управление проектами", 
    "Финансовая отчетность",
    "Координация команд",
    "Мобильное приложение",
    "Интеграции с ERP"
  ],
  "screenshot": "https://prohelper.pro/screenshot.jpg"
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