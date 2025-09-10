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
      title: "ProHelper - Умная платформа для управления строительными проектами",
      description: "Автоматизируйте строительные процессы с ProHelper: учет материалов на стройке, контроль строительных проектов, управление подрядчиками и отчетность в одной платформе. Повышайте эффективность на 40%.",
      keywords: "учет материалов, управление проектами, контроль работ, строительная отчетность, программа для прораба, автоматизация строительства, SaaS для строителей, контроль бюджета строительства, CRM для строителей, мобильное приложение для прораба, цифровизация строительства, ProHelper",
      canonicalUrl: `${baseUrl}/`
    },
    integrations: {
      title: "Интеграции ProHelper - 200+ подключений для строительства",
      description: "Интегрируйте ProHelper с 1С, ERP системами, CAD программами. Автоматическая синхронизация данных учета материалов и строительных проектов. Экономьте время на ручной ввод.",
      keywords: "интеграции строительство, 1С строительство, ERP строительные системы, API учет материалов, синхронизация данных стройка, автоматизация учета, CAD интеграция, строительные программы подключение",
      canonicalUrl: `${baseUrl}/integrations`
    },
    'small-business': {
      title: "ProHelper для малого бизнеса - Доступный учет материалов",
      description: "Специальные тарифы ProHelper для небольших строительных компаний. Учет материалов, контроль работ, управление проектами от 990₽/мес. Простая настройка за 1 день.",
      keywords: "учет материалов малый бизнес, строительная программа недорого, CRM строители доступная цена, контроль работ небольшая компания, автоматизация стройки бюджетно, программа прораб недорого",
      canonicalUrl: `${baseUrl}/small-business`
    },
    enterprise: {
      title: "ProHelper Enterprise - Корпоративный учет строительства",
      description: "Масштабируемые решения ProHelper для крупных строительных корпораций. Безлимитный учет материалов, управление множественными проектами, корпоративная интеграция и поддержка 24/7.",
      keywords: "корпоративный учет материалов, управление строительными проектами enterprise, масштабируемая CRM строительство, крупные строительные компании, корпоративная автоматизация стройка",
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
      description: "Читайте экспертные статьи о современном строительстве: автоматизация учета материалов, цифровизация процессов, управление проектами, лучшие практики отрасли от команды ProHelper.",
      keywords: "блог строительство, статьи учет материалов, автоматизация строительных процессов, цифровизация стройки, управление строительными проектами советы, строительные технологии статьи",
      canonicalUrl: `${baseUrl}/blog`
    },
    docs: {
      title: "Документация ProHelper - Руководство по учету материалов", 
      description: "Полная база знаний ProHelper: как настроить учет материалов, управление проектами, интеграцию с 1С. Видеоуроки, FAQ, пошаговые инструкции для прорабов и администраторов.",
      keywords: "инструкция ProHelper, как настроить учет материалов, руководство прораб, FAQ строительная программа, видеоуроки учет стройка, техподдержка строительство, настройка CRM строители",
      canonicalUrl: `${baseUrl}/docs`
    },
    about: {
      title: "О компании ProHelper - Лидер строительных технологий",
      description: "История ProHelper, команда экспертов в строительстве и IT. Наша миссия - цифровизация строительной отрасли через умные технологии учета материалов и управления проектами.",
      keywords: "о компании ProHelper, команда строительные технологии, лидер автоматизации строительство, история ProHelper, миссия цифровизация стройка, эксперты строительные системы",
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
      description: "Изучите все возможности ProHelper: учет материалов, управление проектами, координация команды, финансовый контроль, мобильное приложение и многое другое.",
      keywords: "возможности ProHelper, функции строительной системы, учет материалов функции, управление проектами возможности, строительное ПО функционал",
      canonicalUrl: `${baseUrl}/features`
    },
    pricing: {
      title: "Тарифы ProHelper - Прозрачные цены на строительное ПО",
      description: "Выберите подходящий тариф ProHelper: от бесплатного плана до Enterprise решений. 14 дней бесплатно, без скрытых комиссий. Окупаемость 2-3 месяца.",
      keywords: "тарифы ProHelper, цены строительное ПО, стоимость учет материалов, тарифы управление проектами, цена CRM строители, бесплатная строительная система",
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
  "@type": "Organization",
  "@id": "https://prohelper.pro/#organization",
  "name": "ProHelper",
  "url": "https://prohelper.pro",
  "logo": "https://prohelper.pro/logo.svg",
  "description": "Ведущий поставщик SaaS решений для строительной отрасли. Умная платформа для учета материалов и управления строительными проектами.",
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
    "https://t.me/prohelper_support"
  ],
  "keywords": "учет материалов, управление проектами, контроль работ, строительная отчетность, автоматизация строительства"
});

export const generateSoftwareSchema = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ProHelper",
  "description": "Умная платформа для учета материалов и управления строительными проектами. Автоматизация контроля работ, бюджета и координации команд на стройке.",
  "url": "https://prohelper.pro",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "990",
    "priceCurrency": "RUB",
    "priceValidUntil": "2025-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "238"
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
    "Цифровизация строительных процессов"
  ],
  "screenshot": "https://prohelper.pro/screenshot.jpg",
  "keywords": "учет материалов, управление проектами, контроль работ, строительная отчетность, программа для прораба, автоматизация строительства, SaaS для строителей"
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