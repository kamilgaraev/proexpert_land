import type {
  LegalDocumentMeta,
  MarketingAboutSection,
  MarketingAdvancedOffer,
  MarketingCapability,
  MarketingContactCard,
  MarketingFaqItem,
  MarketingHeroFact,
  MarketingLaunchStep,
  MarketingMaturityMeta,
  MarketingPackageFamily,
  MarketingRouteLink,
  MarketingSecuritySection,
  MarketingSeoMeta,
  MarketingSolutionSegment,
  MarketingSurfaceMeta,
  MarketingTrustFact,
} from '@/types/marketing';

export const marketingPaths = {
  home: '/',
  solutions: '/solutions',
  features: '/features',
  pricing: '/pricing',
  about: '/about',
  contact: '/contact',
  security: '/security',
  privacy: '/privacy',
  offer: '/offer',
  cookies: '/cookies',
} as const;

export const marketingSeo: Record<string, MarketingSeoMeta> = {
  home: {
    title: 'ProHelper - корпоративная платформа для управления строительными процессами',
    description:
      'ProHelper объединяет проекты, снабжение, финансы, документы, аналитику и мобильную работу на стройке в одном контуре управления.',
    keywords:
      'ProHelper, управление строительством, строительная ERP, проекты, снабжение, склад, финансы, документы, mobile, holding',
  },
  solutions: {
    title: 'Решения ProHelper - сценарии для подрядчика, генподрядчика и холдинга',
    description:
      'Показываем ProHelper через реальные сценарии: подрядчик, генподрядчик, девелопер, инженерный блок и мультиорганизационный контур.',
    keywords:
      'сценарии ProHelper, подрядчик, генподрядчик, девелопер, инженерный блок, холдинг, multi-organization',
  },
  features: {
    title: 'Возможности ProHelper - проекты, снабжение, финансы, AI и multi-org',
    description:
      'Возможности ProHelper сгруппированы по бизнес-контурам: проекты, склад и закупки, финансы, сметы, аналитика, AI, holding и безопасность.',
    keywords:
      'возможности ProHelper, склад, закупки, платежи, сметы, AI, аналитика, mobile, holding',
  },
  pricing: {
    title: 'Пакеты ProHelper - текущая коммерческая модель из личного кабинета',
    description:
      'Публичная витрина пакетов ProHelper синхронизирована с моделью ЛК: семейства пакетов, tier base/pro/enterprise, модульные расширения и early access.',
    keywords:
      'цены ProHelper, пакеты ProHelper, base pro enterprise, модули ProHelper, trial, early access',
  },
  about: {
    title: 'О платформе ProHelper - продуктовая система для строительных компаний',
    description:
      'ProHelper строит единый цифровой контур между офисом, объектом, личным кабинетом и холдинговой структурой без вымышленных цифр и маркетингового шума.',
    keywords:
      'о ProHelper, платформа для стройки, внедрение ProHelper, поддержка ProHelper, цифровой контур строительства',
  },
  contact: {
    title: 'Контакты ProHelper - запросить демо и обсудить внедрение',
    description:
      'Оставьте запрос на демо ProHelper: поможем собрать контур внедрения, подобрать пакеты и обсудить legal/compliance-вопросы.',
    keywords:
      'контакты ProHelper, демо ProHelper, внедрение ProHelper, консультация ProHelper',
  },
  security: {
    title: 'Безопасность ProHelper - доступ, хранение файлов, аудит и surfaces',
    description:
      'Как в ProHelper организованы JWT-аутентификация, разграничение прав, S3-хранение файлов, аудит действий и работа нескольких интерфейсов.',
    keywords:
      'безопасность ProHelper, JWT, RBAC, ABAC, S3, аудит действий, личный кабинет, mobile, holding',
  },
  privacy: {
    title: 'Политика конфиденциальности ProHelper',
    description:
      'Политика конфиденциальности ProHelper: какие данные собираются на сайте и в форме обращения, для каких целей и как управлять своими данными.',
    noIndex: true,
  },
  offer: {
    title: 'Публичная оферта ProHelper',
    description:
      'Публичная оферта ProHelper с базовыми условиями использования сайта, обращения за демо и последующего оформления коммерческих условий.',
    noIndex: true,
  },
  cookies: {
    title: 'Политика cookies ProHelper',
    description:
      'Политика cookies ProHelper: обязательные cookie, аналитика, баннер согласия и способы изменить выбор.',
    noIndex: true,
  },
};

export const marketingNavigation: MarketingRouteLink[] = [
  { label: 'Главная', href: marketingPaths.home, exact: true },
  { label: 'Решения', href: marketingPaths.solutions },
  { label: 'Возможности', href: marketingPaths.features },
  { label: 'Пакеты', href: marketingPaths.pricing },
  { label: 'Безопасность', href: marketingPaths.security },
  { label: 'Контакты', href: marketingPaths.contact },
];

export const marketingMaturityMeta: Record<string, MarketingMaturityMeta> = {
  stable: {
    label: 'Готово',
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    description: 'Используется в основных сценариях продукта.',
  },
  beta: {
    label: 'Beta',
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
    description: 'Доступно в продукте, но требует внимательной упаковки и квалификации клиента.',
  },
  alpha: {
    label: 'Alpha',
    tone: 'border-rose-200 bg-rose-50 text-rose-700',
    description: 'Экспериментальный режим, показывается только как расширение или pilot.',
  },
  coming_soon: {
    label: 'Скоро',
    tone: 'border-slate-200 bg-slate-100 text-slate-700',
    description: 'Запланировано, но не должно продаваться как готовый production-сценарий.',
  },
  early_access: {
    label: 'Early access',
    tone: 'border-sky-200 bg-sky-50 text-sky-700',
    description: 'Доступно по запросу и требует индивидуального запуска.',
  },
};

export const marketingSurfaceMeta: Record<string, MarketingSurfaceMeta> = {
  admin: { label: 'Admin', tone: 'bg-slate-100 text-slate-700' },
  mobile: { label: 'Mobile', tone: 'bg-orange-100 text-orange-700' },
  lk: { label: 'LK', tone: 'bg-blue-100 text-blue-700' },
  holding: { label: 'Holding', tone: 'bg-indigo-100 text-indigo-700' },
};

export const marketingCompany = {
  brand: 'ProHelper',
  tagline: 'construction operating system',
  phone: '+7 (999) 123-45-67',
  phoneHref: 'tel:+79991234567',
  email: 'info@prohelper.ru',
  emailHref: 'mailto:info@prohelper.ru',
  location: 'Работаем по всей России, демо и внедрение проводим удаленно и на площадке.',
  responseTime: 'Ответ в течение рабочего дня',
  hours: 'Пн-Пт 09:00-18:00 МСК',
  legalStatusNote:
    'Реквизиты и финальные юридические формулировки проходят отдельное согласование; текущая редакция закрывает базовый legal-контур сайта.',
};

export const marketingHeroFacts: MarketingHeroFact[] = [
  {
    value: '4 surface',
    label: 'Admin, Mobile, LK и Holding',
    detail: 'Публичный сайт упаковывает возможности, которые уже живут на едином backend и раздаются в разные интерфейсы.',
  },
  {
    value: '7 семейств',
    label: 'пакетов из реальной модели ЛК',
    detail: 'Projects, Finance, Supply, Analytics, AI, Integrations и Enterprise уже описаны в package-конфигурации backend.',
  },
  {
    value: '1 источник',
    label: 'правды по продуктовым claims',
    detail: 'Контент сайта строится от capability matrix и не продаёт неподтверждённые сценарии как production-ready.',
  },
];

export const marketingCapabilityMatrix: MarketingCapability[] = [
  {
    id: 'project-control',
    title: 'Контур проекта и исполнения',
    businessContour: 'Проекты и исполнение',
    summary: 'Проект, договор, график и факт исполнения связаны в одном рабочем контуре.',
    publicClaim:
      'Руководитель и команда видят объект, договоры, задачи, статусы и заявки с площадки в одной модели проекта.',
    audiences: ['Подрядчик', 'Генподрядчик', 'Инженерный блок'],
    outcomes: [
      'Проект и договоры перестают жить в разных таблицах.',
      'Факт с площадки поднимается в офис через mobile и admin без ручной сводки.',
      'График, заявки и трудозатраты можно связать с конкретным проектом.',
    ],
    surfaces: ['admin', 'mobile', 'lk'],
    maturity: 'stable',
    moduleSlugs: ['project-management', 'contract-management', 'schedule-management', 'site-requests', 'time-tracking'],
    packageSlugs: ['projects'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Features/ProjectManagement',
      'prohelper/app/BusinessModules/Features/ScheduleManagement',
      'prohelper/app/BusinessModules/Features/SiteRequests',
      'prohelper_admin/src/pages/Projects',
      'prohelpers_mobile/lib/features/projects',
    ],
    cta: 'Разобрать сценарий по объектам',
  },
  {
    id: 'supply-chain',
    title: 'Снабжение и склад',
    businessContour: 'Снабжение и склад',
    summary: 'Номенклатура, остатки, закупки и движение материалов живут рядом с проектом, а не отдельно от него.',
    publicClaim:
      'Прораб формирует потребность на объекте, снабжение получает её в системе, а склад и закупка закрывают цикл без потери контекста.',
    audiences: ['Подрядчик', 'Генподрядчик', 'Снабжение'],
    outcomes: [
      'Заявка рождается на площадке и доезжает в контур закупки без ручного переписывания.',
      'Остатки и движения материалов можно привязать к проектам и категориям номенклатуры.',
      'Закупки и склад не живут отдельно от строительного процесса.',
    ],
    surfaces: ['admin', 'mobile'],
    maturity: 'stable',
    moduleSlugs: ['catalog-management', 'basic-warehouse', 'procurement', 'material-analytics'],
    packageSlugs: ['supply'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Features/BasicWarehouse',
      'prohelper/app/BusinessModules/Features/Procurement',
      'prohelper/app/BusinessModules/Addons/MaterialAnalytics',
      'prohelper_admin/src/pages/Warehouse',
      'prohelpers_mobile/lib/features/warehouse',
    ],
    cta: 'Собрать контур снабжения',
  },
  {
    id: 'finance-control',
    title: 'Финансы, платежи и акты',
    businessContour: 'Финансы и расчеты',
    summary: 'Платежные документы, акты, авансовые сценарии и расчеты собираются в единый финансовый слой.',
    publicClaim:
      'Финансовая модель проекта и контрагентов строится поверх платежей, актов и подотчётных средств, а не через разрозненные таблицы.',
    audiences: ['Собственник', 'Финансовый блок', 'ПТО'],
    outcomes: [
      'Платежи и взаиморасчеты можно увязать с проектами, договорами и поставками.',
      'Акты и финансовые документы перестают дублироваться между отделами.',
      'Подотчётные сценарии закрываются внутри того же продукта.',
    ],
    surfaces: ['admin', 'lk'],
    maturity: 'stable',
    moduleSlugs: ['payments', 'act-reporting', 'advance-accounting'],
    packageSlugs: ['finance'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Core/Payments',
      'prohelper/app/BusinessModules/Addons/ActReporting',
      'prohelper/app/BusinessModules/Addons/AdvanceAccounting',
      'prohelper_admin/src/pages/Payments',
      'prohelper_land/src/pages/dashboard/BillingPage.tsx',
    ],
    cta: 'Показать финансовый контур',
  },
  {
    id: 'estimate-office',
    title: 'Сметный и инженерный контур',
    businessContour: 'Сметы, документы и акты',
    summary: 'Сметы, версии, шаблоны и импорт уже реализованы, но часть advanced-сценариев требует аккуратной продажи.',
    publicClaim:
      'Инженерный блок получает управляемую работу со сметами, импортом, шаблонами и связью сметы с проектом и договорами.',
    audiences: ['ПТО', 'Сметчик', 'Инженерный блок'],
    outcomes: [
      'Есть CRUD, версии, шаблоны и импорт сметных данных.',
      'Сметы можно связать с проектами, контрактами и бюджетом.',
      'AI-генерацию смет нужно упаковывать как pilot, а не как массовый production feature.',
    ],
    surfaces: ['admin'],
    maturity: 'beta',
    moduleSlugs: ['budget-estimates', 'act-reporting'],
    packageSlugs: ['finance'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Features/BudgetEstimates',
      'prohelper/app/BusinessModules/Addons/ActReporting',
      'prohelper_admin/src/pages/Estimates',
    ],
    cta: 'Разобрать сценарий сметного блока',
  },
  {
    id: 'analytics-reporting',
    title: 'Отчётность и аналитика',
    businessContour: 'Отчетность и аналитика',
    summary: 'Дашборды, фильтры, экспорт и шаблоны отчётов встроены в продукт и могут быть packaged как отдельный слой ценности.',
    publicClaim:
      'Руководитель получает консолидированный слой отчётности, а не ручной сбор цифр из отделов.',
    audiences: ['Собственник', 'Руководитель проектов', 'Финансовый блок'],
    outcomes: [
      'Базовые отчёты и виджеты доступны сразу.',
      'Расширенный экспорт и шаблоны подключаются как отдельное пакетное расширение.',
      'Холдинговые отчёты поддерживаются отдельным holding surface.',
    ],
    surfaces: ['admin', 'lk', 'holding'],
    maturity: 'stable',
    moduleSlugs: ['reports', 'dashboard-widgets', 'data-filters', 'data-export', 'report-templates'],
    packageSlugs: ['analytics'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Core/Reports',
      'prohelper/app/BusinessModules/Services/DashboardWidgets',
      'prohelper/app/BusinessModules/Services/DataExport',
      'prohelper_land/src/pages/holding',
      'prohelper_admin/src/pages/Reports',
    ],
    cta: 'Показать уровень управленческой отчетности',
  },
  {
    id: 'ai-assistant',
    title: 'AI-ассистент по данным проектов',
    businessContour: 'AI и автоматизация',
    summary: 'AI-ассистент реализован как продуктовый модуль с чатами, usage tracking и интеграцией с проектными данными.',
    publicClaim:
      'AI-ассистент отвечает по данным организации: проекты, риски, материалы и контракты уже подключены к модели диалога.',
    audiences: ['Собственник', 'ПТО', 'Руководитель проекта'],
    outcomes: [
      'Есть chat API, история диалогов, лимиты и usage tracking.',
      'AI работает как слой над данными проектов и материалов.',
      'Упаковывать нужно как beta rollout с квалификацией сценария.',
    ],
    surfaces: ['admin', 'mobile'],
    maturity: 'beta',
    moduleSlugs: ['ai-assistant'],
    packageSlugs: ['ai'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Features/AIAssistant',
      'prohelper_admin/src/pages/AIAssistant',
      'prohelpers_mobile/lib/features/ai_assistant',
    ],
    cta: 'Запросить AI-демо',
  },
  {
    id: 'ai-estimates',
    title: 'AI-генерация смет',
    businessContour: 'AI и сметы',
    summary: 'AI-генерация смет уже имеет backend-модуль и admin endpoints, но продаётся только как alpha / pilot.',
    publicClaim:
      'Система умеет запускать AI-сессии генерации сметы по документам проекта, но этот сценарий требует pilot-квалификации и не должен маркироваться как массово готовый.',
    audiences: ['ПТО', 'Сметчик', 'Enterprise-клиент'],
    outcomes: [
      'Есть маршруты для генерации, истории, feedback и экспорта.',
      'Сценарий нужно вести через demo/pilot с явной меткой Alpha.',
      'На публичном сайте это расширение, а не базовый promise.',
    ],
    surfaces: ['admin'],
    maturity: 'alpha',
    moduleSlugs: ['ai-estimates', 'estimate-generation'],
    packageSlugs: ['ai'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Addons/AIEstimates',
      'prohelper/app/BusinessModules/Addons/EstimateGeneration',
      'prohelper/routes/api/v1/admin/estimates.php',
    ],
    cta: 'Обсудить pilot AI-смет',
  },
  {
    id: 'multi-organization',
    title: 'Мультиорганизация и holding-контур',
    businessContour: 'Мультиорганизация и holding',
    summary: 'Для групп компаний уже есть hierarchy, holding-dashboard, отчеты и runtime-лендинги.',
    publicClaim:
      'ProHelper поддерживает холдинговую иерархию, консолидированные отчеты и отдельный surface для multi-org управления.',
    audiences: ['Девелопер', 'Холдинг', 'Генподрядчик'],
    outcomes: [
      'Несколько организаций можно собрать в единую иерархию.',
      'Есть holding dashboard, отчетные страницы и dedicated surface.',
      'Портал подрядчиков и enterprise-контур выводятся как часть корпоративного внедрения.',
    ],
    surfaces: ['lk', 'holding'],
    maturity: 'stable',
    moduleSlugs: ['multi-organization', 'contractor-portal'],
    packageSlugs: ['enterprise'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Core/MultiOrganization',
      'prohelper/app/BusinessModules/Enterprise/MultiOrganization',
      'prohelper_land/src/pages/holding',
      'prohelper_land/src/components/multi-org',
    ],
    cta: 'Разобрать enterprise-контур',
  },
  {
    id: 'governance-security',
    title: 'Governance, доступы и безопасность',
    businessContour: 'Безопасность и governance',
    summary: 'JWT, role definitions, middleware-проверки, S3-хранение и аудит действий уже часть платформы.',
    publicClaim:
      'Безопасность ProHelper строится на раздельных интерфейсах, JWT-аутентификации, role-based правилах, S3 для файлов и логировании действий.',
    audiences: ['Enterprise', 'IT-служба', 'Собственник'],
    outcomes: [
      'Права и роли описаны через конфигурации и middleware.',
      'Файлы не хранятся локально: backend ориентирован на S3-слой.',
      'Публичные формы и внутренние интерфейсы можно разводить по уровням доступа и consent-сценариям.',
    ],
    surfaces: ['admin', 'mobile', 'lk', 'holding'],
    maturity: 'stable',
    moduleSlugs: ['users', 'system-logs', 'file-management'],
    packageSlugs: ['integrations', 'enterprise'],
    sourceOfTruth: [
      'prohelper/config/RoleDefinitions',
      'prohelper/app/Http/Responses',
      'prohelper/app/Services/Storage/FileService',
      'prohelper/app/BusinessModules/Addons/SystemLogs',
    ],
    cta: 'Посмотреть security-контур',
  },
];

export const marketingPackages: MarketingPackageFamily[] = [
  {
    slug: 'projects',
    name: 'Projects',
    description: 'Базовый контур управления объектами, договорами, графиком и полевым исполнением.',
    color: '#3B82F6',
    icon: 'clipboard-document-list',
    bestFor: 'Подрядчики и команды, которым нужно связать объект, договор и факт работ.',
    tiers: [
      {
        key: 'base',
        label: 'Базовый',
        description: 'Основной проектный каркас.',
        price: 0,
        billingModel: 'free',
        moduleSlugs: ['project-management', 'contract-management'],
        highlights: ['Проекты и договоры', 'Назначение ответственных', 'Базовая аналитика по объекту'],
      },
      {
        key: 'pro',
        label: 'Профессиональный',
        description: 'Расширяет объект графиком, site requests, временем и workflow.',
        price: 4890,
        billingModel: 'subscription',
        durationDays: 30,
        moduleSlugs: ['project-management', 'contract-management', 'schedule-management', 'time-tracking', 'site-requests', 'workflow-management'],
        highlights: ['График работ', 'Учет времени', 'Заявки с объекта', 'Workflow-процессы'],
      },
    ],
  },
  {
    slug: 'finance',
    name: 'Finance',
    description: 'Платежи, акты, сметный и авансовый слой.',
    color: '#10B981',
    icon: 'banknotes',
    bestFor: 'Финансовый блок, ПТО и руководители, которым нужен управляемый денежный контур.',
    tiers: [
      {
        key: 'base',
        label: 'Базовый',
        description: 'Основные платежные сценарии.',
        price: 0,
        billingModel: 'free',
        moduleSlugs: ['payments'],
        highlights: ['Платежные документы', 'Базовая финансовая аналитика', 'Связь с контрагентами'],
      },
      {
        key: 'pro',
        label: 'Профессиональный',
        description: 'Полный финансовый слой проекта.',
        price: 7490,
        billingModel: 'subscription',
        durationDays: 30,
        moduleSlugs: ['payments', 'budget-estimates', 'act-reporting', 'advance-accounting'],
        highlights: ['Сметный контур', 'Акты выполненных работ', 'Подотчётные средства', 'Интеграция финансовых сценариев'],
      },
    ],
  },
  {
    slug: 'supply',
    name: 'Supply',
    description: 'Каталог, базовый склад, закупка, аналитика материалов и управление расценками.',
    color: '#F59E0B',
    icon: 'cube',
    bestFor: 'Снабжение, склад и проекты, где критичны остатки, движения и закупка.',
    tiers: [
      {
        key: 'base',
        label: 'Базовый',
        description: 'Номенклатура и складской учет.',
        price: 0,
        billingModel: 'free',
        moduleSlugs: ['catalog-management', 'basic-warehouse'],
        highlights: ['Каталог материалов', 'Базовый склад', 'Остатки и движение ТМЦ'],
      },
      {
        key: 'pro',
        label: 'Профессиональный',
        description: 'Полный цикл снабжения и аналитики.',
        price: 5490,
        billingModel: 'subscription',
        durationDays: 30,
        moduleSlugs: ['catalog-management', 'basic-warehouse', 'procurement', 'rate-management', 'material-analytics'],
        highlights: ['Закупки и поставщики', 'Расценки и коэффициенты', 'Аналитика материалов', 'Импорт и экспорт'],
      },
    ],
  },
  {
    slug: 'analytics',
    name: 'Analytics',
    description: 'Виджеты, отчеты, фильтры, экспорт и шаблоны отчетности.',
    color: '#8B5CF6',
    icon: 'chart-bar',
    bestFor: 'Руководители и команды, которым нужен отдельный слой управленческой отчетности.',
    tiers: [
      {
        key: 'base',
        label: 'Базовый',
        description: 'Стандартные отчеты и dashboard.',
        price: 0,
        billingModel: 'free',
        moduleSlugs: ['reports', 'dashboard-widgets', 'data-filters'],
        highlights: ['Стандартные отчеты', 'Фильтры и базовые дашборды', 'Данные для ежедневного контроля'],
      },
      {
        key: 'pro',
        label: 'Профессиональный',
        description: 'Экспорт и шаблоны отчетности для управленческого слоя.',
        price: 2490,
        billingModel: 'subscription',
        durationDays: 30,
        moduleSlugs: ['reports', 'dashboard-widgets', 'data-filters', 'data-export', 'report-templates'],
        highlights: ['Экспорт в Excel, PDF, CSV', 'Кастомные шаблоны', 'Расширенный reporting layer'],
      },
    ],
  },
  {
    slug: 'ai',
    name: 'AI',
    description: 'AI-ассистент и pilot-сценарии AI-генерации смет.',
    color: '#EC4899',
    icon: 'cpu-chip',
    bestFor: 'Клиенты, готовые к assisted rollout AI-модулей поверх реальных данных проектов.',
    tiers: [
      {
        key: 'pro',
        label: 'Профессиональный',
        description: 'AI-пакет подключается как отдельный модульный слой.',
        price: 6990,
        billingModel: 'subscription',
        durationDays: 30,
        moduleSlugs: ['ai-assistant', 'ai-estimates'],
        highlights: ['AI-ассистент по проектным данным', 'AI-сценарии генерации смет', 'Pilot-подключение и usage tracking'],
      },
    ],
  },
  {
    slug: 'integrations',
    name: 'Integrations',
    description: 'Файлы, системные журналы и интеграции с внешними сервисами.',
    color: '#06B6D4',
    icon: 'globe-alt',
    bestFor: 'Команды, которым нужен внешний контур интеграций, событий и централизованного доступа к файлам.',
    tiers: [
      {
        key: 'pro',
        label: 'Профессиональный',
        description: 'Интеграционный и файловый слой.',
        price: 2900,
        billingModel: 'subscription',
        durationDays: 30,
        moduleSlugs: ['integrations', 'system-logs', 'file-management'],
        highlights: ['Интеграции и API-слой', 'Системные журналы', 'Управление файлами'],
      },
    ],
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    description: 'Мультиорганизация, contractor portal и корпоративный контур для групп компаний.',
    color: '#6366F1',
    icon: 'building-office-2',
    bestFor: 'Девелоперы, холдинги и группы компаний с несколькими юрлицами и общими проектами.',
    tiers: [
      {
        key: 'enterprise',
        label: 'Enterprise',
        description: 'Корпоративный multi-org слой.',
        price: 9900,
        billingModel: 'subscription',
        durationDays: 30,
        moduleSlugs: ['multi-organization', 'contractor-portal'],
        highlights: ['Иерархия организаций', 'Holding surface и отчеты', 'Контур подрядчиков и совместного доступа'],
      },
    ],
  },
];

export const marketingAdvancedOffers: MarketingAdvancedOffer[] = [
  {
    id: 'ai-assistant-offer',
    title: 'AI-ассистент по данным компании',
    summary: 'Доступен как beta-модуль с chat API, историей диалогов и лимитами использования.',
    maturity: 'beta',
    surfaces: ['admin', 'mobile'],
    moduleSlugs: ['ai-assistant'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Features/AIAssistant/README.md',
      'prohelper_admin/src/pages/AIAssistant',
    ],
    cta: 'Запросить demo beta-модуля',
  },
  {
    id: 'ai-estimates-offer',
    title: 'AI-генерация смет',
    summary: 'Показывается только как pilot/alpha-сценарий с отдельной квалификацией входных данных и процесса внедрения.',
    maturity: 'alpha',
    surfaces: ['admin'],
    moduleSlugs: ['ai-estimates', 'estimate-generation'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Addons/AIEstimates/routes.php',
      'prohelper/app/BusinessModules/Addons/EstimateGeneration/routes.php',
    ],
    cta: 'Обсудить pilot с ПТО',
  },
  {
    id: 'holding-sites-offer',
    title: 'Holding site builder',
    summary: 'Отдельный early access-контур для корпоративных лендингов холдинга и runtime-публикации страниц.',
    maturity: 'early_access',
    surfaces: ['holding'],
    moduleSlugs: ['holding-site-builder'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Enterprise/MultiOrganization/Website',
      'prohelper_land/src/pages/holding/LandingEditorPage.tsx',
    ],
    cta: 'Запросить enterprise-показ',
  },
];

export const marketingSolutionSegments: MarketingSolutionSegment[] = [
  {
    id: 'contractor',
    title: 'Подрядчик',
    audience: 'Команда с несколькими объектами и постоянной координацией офиса с площадкой.',
    challenge: 'Заявки, статусы, документы и взаиморасчеты расползаются по чатам, таблицам и звонкам между объектом и офисом.',
    transformation: 'ProHelper собирает проектный контур, заявки с площадки, склад/снабжение и финансовые артефакты в одной модели.',
    workflows: ['Проект и договор в одном контуре', 'Заявки с объекта через mobile', 'Базовый склад и закупка', 'Платежи и акты без дублирования'],
    surfaces: ['admin', 'mobile', 'lk'],
    capabilityIds: ['project-control', 'supply-chain', 'finance-control'],
    recommendedPackageSlugs: ['projects', 'supply', 'finance'],
    cta: 'Собрать пакет для подрядчика',
  },
  {
    id: 'general-contractor',
    title: 'Генподрядчик',
    audience: 'Организация, которой нужен контроль сразу по нескольким объектам, командам и подрядчикам.',
    challenge: 'Картина по объектам собирается вручную: снабжение отдельно, финансы отдельно, а управленческая отчетность догоняет слишком поздно.',
    transformation: 'Выстраивается единый operating system: проекты, закупки, платежи, отчеты и AI-слой под одним governance-контуром.',
    workflows: ['Проектный и договорной контур', 'Снабжение и материалы по объектам', 'Платежи, акты и управленческие отчеты', 'AI-ассистент в beta-формате'],
    surfaces: ['admin', 'mobile', 'lk'],
    capabilityIds: ['project-control', 'supply-chain', 'finance-control', 'analytics-reporting', 'ai-assistant'],
    recommendedPackageSlugs: ['projects', 'supply', 'finance', 'analytics', 'ai'],
    cta: 'Разобрать сценарий генподрядчика',
  },
  {
    id: 'developer-holding',
    title: 'Девелопер / холдинг',
    audience: 'Группа компаний с несколькими юрлицами, дочерними структурами и общей отчетной логикой.',
    challenge: 'На росте ломается управленческая модель: разные организации, разные контуры доступа и сложная консолидированная отчетность.',
    transformation: 'Multi-org слой ProHelper собирает hierarchy, holding-панель, корпоративные отчеты и controlled access между организациями.',
    workflows: ['Иерархия организаций и holding dashboard', 'Консолидированная отчетность', 'Контур подрядчиков и совместного доступа', 'Security / governance по surface-ам'],
    surfaces: ['lk', 'holding'],
    capabilityIds: ['multi-organization', 'analytics-reporting', 'governance-security'],
    recommendedPackageSlugs: ['enterprise', 'analytics', 'finance', 'projects'],
    cta: 'Обсудить enterprise-внедрение',
  },
  {
    id: 'engineering-office',
    title: 'Инженерный блок / ПТО',
    audience: 'Команда, которая работает со сметами, актами, документами и инженерной подготовкой проекта.',
    challenge: 'Сметы, акты и инженерные документы не связаны с проектным контуром и требуют большого объема ручной сборки.',
    transformation: 'Сметный и документный контур переносится в систему; AI-генерация смет может быть подключена как отдельный pilot.',
    workflows: ['Сметы, версии и шаблоны', 'Импорт данных и связка с проектом', 'Акты и финансовые документы', 'Pilot AI-генерации смет'],
    surfaces: ['admin'],
    capabilityIds: ['estimate-office', 'finance-control', 'ai-estimates'],
    recommendedPackageSlugs: ['finance', 'projects', 'ai'],
    cta: 'Разобрать сценарий ПТО',
  },
];

export const marketingLaunchSteps: MarketingLaunchStep[] = [
  {
    title: 'Диагностика текущего процесса',
    description:
      'На первом созвоне собираем карту ваших объектов, ролей, подрядчиков и точек ручного хаоса. Не продаём лишнее до этой диагностики.',
  },
  {
    title: 'Сборка целевого контура',
    description:
      'Подбираем пакетные семейства и surface-ы: что идёт в admin, что в mobile, что в LK или holding. Advanced-модули маркируем отдельно.',
  },
  {
    title: 'Запуск на реальном сценарии',
    description:
      'Внедрение начинается с реального объекта, финансового или supply-сценария, чтобы команда увидела ценность не по презентации, а по рабочему процессу.',
  },
  {
    title: 'Масштабирование и governance',
    description:
      'После первого рабочего контура расширяем пакеты, подключаем аналитику, multi-org и advanced-модули в темпе бизнеса.',
  },
];

export const marketingTrustFacts: MarketingTrustFact[] = [
  {
    title: 'Единый backend для всех surface-ов',
    text: 'Admin, Mobile, LK и Holding работают поверх одного backend-контракта и общей модели доступа.',
  },
  {
    title: 'JWT и разграничение прав',
    text: 'Доступ управляется через JWT, middleware и role definitions, а не через хаотичные локальные проверки.',
  },
  {
    title: 'Файлы ориентированы на S3-слой',
    text: 'Архитектура backend предусматривает работу с централизованным файловым хранилищем, а не локальное хранение на сервере приложения.',
  },
  {
    title: 'Пакетная модель уже работает в ЛК',
    text: 'Публичная pricing-страница синхронизируется с действующей моделью packages/modules/trial, а не придумывает отдельную витрину.',
  },
  {
    title: 'Advanced-модули помечаются честно',
    text: 'Beta, alpha и early access показываются явно, чтобы корпоративный сайт не обещал mass-market ready там, где нужен pilot.',
  },
];

export const marketingFaqs: MarketingFaqItem[] = [
  {
    question: 'Это отдельный корпоративный сайт или тот же продукт, что уже живет в ProHelper?',
    answer:
      'Это тот же продукт. Публичный сайт упаковывает уже существующие capability внутри backend, admin, mobile, LK и holding-контуров, а не демонстрирует отдельную витрину без связи с реальной системой.',
  },
  {
    question: 'Чем публичная pricing-страница отличается от старого лендинга?',
    answer:
      'Теперь pricing строится на реальной пакетной модели из личного кабинета: Projects, Finance, Supply, Analytics, AI, Integrations и Enterprise с текущими tier-ами, а не на отдельной маркетинговой сетке.',
  },
  {
    question: 'Все AI-возможности уже production-ready?',
    answer:
      'Нет. AI-ассистент и AI-генерация смет существуют в продукте, но публично они маркируются как beta или alpha/pilot и не продаются как безрисковый стандартный rollout.',
  },
  {
    question: 'Можно ли начать только с одного контура, например проектов или снабжения?',
    answer:
      'Да. В этом и смысл текущей коммерческой модели. Можно стартовать с нужного семейства пакетов и затем подключать соседние контуры по мере роста.',
  },
  {
    question: 'Есть ли у ProHelper multi-org сценарий для групп компаний?',
    answer:
      'Да. В продукте уже есть отдельный enterprise-контур с иерархией организаций, holding dashboard, отчетами и dedicated surface для multi-org управления.',
  },
  {
    question: 'Почему на legal-страницах нет полного набора реквизитов?',
    answer:
      'Финальная редакция реквизитов и части юридических формулировок проходит отдельное согласование. Сейчас сайт закрывает базовый legal-контур и честно помечает зоны, которые уточняются.',
  },
];

export const marketingSecuritySections: MarketingSecuritySection[] = [
  {
    title: 'Доступ и аутентификация',
    description: 'Платформа разделяет surface-ы по ролям и интерфейсам, а не смешивает их в один общий frontend.',
    bullets: [
      'JWT-аутентификация для клиентских интерфейсов.',
      'Раздельные контуры admin, mobile и landing/LK.',
      'Role definitions и middleware вместо hardcode-ролей в интерфейсах.',
    ],
  },
  {
    title: 'Файлы и документы',
    description: 'Файловый слой вынесен в сервис хранения, а архитектурное требование проекта — не держать production-файлы локально.',
    bullets: [
      'S3-ориентированный storage layer.',
      'Организационный контекст в путях хранения.',
      'Документы и файлы могут быть частью контрактного и project-контура.',
    ],
  },
  {
    title: 'Наблюдаемость и аудит',
    description: 'События и действия не должны пропадать между поверхностями: для этого используются журналы, уведомления и централизованные response-контракты.',
    bullets: [
      'System logs и уведомления как отдельные продуктовые слои.',
      'Стандартизированные AdminResponse, MobileResponse и LandingResponse.',
      'Отдельный public lead-flow для сайта и отдельные внутренние бизнес-контуры.',
    ],
  },
  {
    title: 'Внедрение и сопровождение',
    description: 'Security на сайте не ограничивается формулировками: он должен продолжаться в rollout, правах доступа и верификации сценариев.',
    bullets: [
      'Advanced-модули включаются только после квалификации сценария.',
      'Согласие на cookies и персональные данные отделено от маркетинговой аналитики.',
      'Legal и compliance-слой сайта связан с реальными формами и lead-процессом.',
    ],
  },
];

export const marketingAboutSections: MarketingAboutSection[] = [
  {
    title: 'Что мы упаковываем публично',
    description: 'Новый корпоративный сайт не рассказывает о гипотетическом продукте. Он показывает только то, что уже подтверждено в `prohelper`, `prohelper_admin`, `prohelpers_mobile` и LK.',
    bullets: [
      'Capability matrix как источник правды для content и SEO.',
      'Пакеты и tier-ы из действующей package-модели.',
      'Честная маркировка beta / alpha / early access.',
    ],
  },
  {
    title: 'Как работает внедрение',
    description: 'Мы не навязываем «всю платформу» сразу. Сначала собираем контур, который даёт управляемый результат именно в вашем текущем масштабе.',
    bullets: [
      'Диагностика роли, процессов и потерь.',
      'Сборка семейства пакетов по объектам, финансам и supply.',
      'Запуск на реальном сценарии и дальнейшее масштабирование.',
    ],
  },
  {
    title: 'На чем строится доверие',
    description: 'Доверие строится не на вымышленных цифрах, а на архитектурных фактах: единый backend, раздельные surface-ы, понятная роль security и прозрачный compliance-слой.',
    bullets: [
      'Admin, mobile, LK и holding подтверждены в кодовой базе.',
      'Публичные claims можно сопоставить с конкретными module/source-of-truth.',
      'Lead-flow, legal-ссылки и analytics работают по правилам consent.',
    ],
  },
];

export const marketingContactCards: MarketingContactCard[] = [
  {
    title: 'Demo и продажи',
    value: marketingCompany.email,
    href: marketingCompany.emailHref,
    description: 'Запрос демонстрации, пакетов и rollout-сценария.',
  },
  {
    title: 'Email для запроса',
    value: marketingCompany.email,
    href: marketingCompany.emailHref,
    description: 'Подходит для демо, legal-вопросов и запроса материалов.',
  },
  {
    title: 'Формат работы',
    value: 'Онлайн и на площадке',
    description: 'Поддерживаем удаленные демонстрации и рабочие сессии под конкретный объект.',
  },
  {
    title: 'Окно ответа',
    value: marketingCompany.responseTime,
    description: `${marketingCompany.hours}.`,
  },
];

export const legalDocuments: Record<'privacy' | 'offer' | 'cookies', LegalDocumentMeta> = {
  privacy: {
    title: 'Политика конфиденциальности',
    shortTitle: 'Конфиденциальность',
    path: marketingPaths.privacy,
    version: '1.0',
    updatedAt: '25 марта 2026',
    seo: marketingSeo.privacy,
    intro:
      'Этот документ описывает базовые правила обработки данных на публичном сайте ProHelper и в формах обращения. Финальная редакция реквизитов и отдельных формулировок дополняется по результатам юридического согласования.',
    highlights: [
      'Сайт разделяет обязательные cookie и аналитику.',
      'Форма обращения требует отдельного согласия на обработку персональных данных.',
      'Маркетинговая аналитика не запускается без согласия пользователя.',
    ],
    sections: [
      {
        title: '1. Какие данные мы получаем',
        paragraphs: [
          'При заполнении формы обращения сайт может получать имя, email, телефон, компанию, тему обращения, текст сообщения, а также metadata запроса: источник страницы, версию согласия и UTM-параметры.',
          'При просмотре сайта могут использоваться обязательные cookie для корректной работы интерфейса и, при отдельном согласии, аналитические cookie и события.',
        ],
      },
      {
        title: '2. Для каких целей используются данные',
        paragraphs: [
          'Данные из формы используются для ответа на запрос, проведения demo, квалификации потребности клиента, подготовки коммерческого предложения и согласования внедрения.',
          'Технические и аналитические данные используются для поддержки работы сайта, оценки интереса к контенту и улучшения маршрута пользователя только при наличии отдельного согласия на аналитику.',
        ],
      },
      {
        title: '3. Как хранятся и передаются данные',
        paragraphs: [
          'Данные формы обращения сохраняются в backend-контуре ProHelper и могут быть переданы во внутренние каналы уведомления команды для оперативной обработки обращения.',
          'Файлы и внутренние рабочие данные продукта в архитектуре ProHelper ориентированы на централизованное storage-хранилище, а не локальное хранение на сервере приложения.',
        ],
      },
      {
        title: '4. Права пользователя',
        paragraphs: [
          'Пользователь вправе запросить уточнение, исправление или удаление персональных данных, переданных через публичную форму, если это не противоречит обязательствам по хранению обращений и внутренним требованиям учета.',
          'Также пользователь вправе изменить решение по аналитическим cookie, очистив сохраненное consent-решение и выбрав новый режим работы cookies.',
        ],
      },
      {
        title: '5. Контакты и уточнение реквизитов',
        paragraphs: [
          'По вопросам обработки персональных данных, запросам на актуализацию или удаление информации можно использовать контактные каналы, указанные на странице контактов.',
          marketingCompany.legalStatusNote,
        ],
      },
    ],
  },
  offer: {
    title: 'Публичная оферта',
    shortTitle: 'Оферта',
    path: marketingPaths.offer,
    version: '1.0',
    updatedAt: '25 марта 2026',
    seo: marketingSeo.offer,
    intro:
      'Публичная оферта описывает базовые условия использования сайта ProHelper, отправки обращения за demo и рамку последующего коммерческого взаимодействия. Финальные проектные и лицензионные условия фиксируются отдельными документами и договорами.',
    highlights: [
      'Сайт не заменяет индивидуальное коммерческое предложение и договор внедрения.',
      'Advanced-модули не считаются обещанными production-функциями без отдельного согласования.',
      'Отправка формы обращения не означает автоматическое оказание платной услуги.',
    ],
    sections: [
      {
        title: '1. Предмет оферты',
        paragraphs: [
          'Сайт ProHelper предоставляет информацию о продукте, его пакетах, сценариях внедрения, legal/compliance-документах и позволяет оставить обращение для связи с командой.',
          'Отдельные функции продукта могут быть доступны в production, beta, alpha или early access-статусе. Публичный сайт маркирует эти статусы явно.',
        ],
      },
      {
        title: '2. Обращение через формы сайта',
        paragraphs: [
          'Пользователь, заполняющий форму, подтверждает достоверность предоставленных контактных данных и согласие на обработку персональных данных в объеме, необходимом для ответа на обращение.',
          'Отправка формы не создает автоматически лицензионного, внедренческого или сервисного договора. Такие условия оформляются отдельно.',
        ],
      },
      {
        title: '3. Коммерческие условия',
        paragraphs: [
          'Публичные описания пакетов и модулей показывают текущую продуктовую модель и служат ориентиром для обсуждения. Итоговая конфигурация зависит от сценария, состава модулей, статуса advanced-функций и условий внедрения.',
          'Для enterprise, pilot, beta и alpha-сценариев условия использования, объем работ и SLA определяются отдельными документами.',
        ],
      },
      {
        title: '4. Ограничение обещаний по advanced-модулям',
        paragraphs: [
          'AI-ассистент, AI-генерация смет, holding site builder и другие advanced-модули могут требовать pilot-режима, дополнительной квалификации и отдельного согласования rollout.',
          'Наличие страницы или описания на сайте не означает, что функция готова к массовому production-внедрению без оговорок.',
        ],
      },
      {
        title: '5. Применимое право и контакт',
        paragraphs: [
          'Все вопросы, не урегулированные этой офертой, решаются через отдельные договорные документы и переговоры с командой ProHelper.',
          marketingCompany.legalStatusNote,
        ],
      },
    ],
  },
  cookies: {
    title: 'Политика cookies',
    shortTitle: 'Cookies',
    path: marketingPaths.cookies,
    version: '1.0',
    updatedAt: '25 марта 2026',
    seo: marketingSeo.cookies,
    intro:
      'Политика cookies объясняет, какие cookie и события используются на публичном сайте ProHelper, какие из них обязательны, а какие включаются только после согласия пользователя.',
    highlights: [
      'Обязательные cookie используются для базовой работы сайта.',
      'Аналитика включается только после согласия.',
      'Решение пользователя можно изменить, очистив сохранённый выбор cookies.',
    ],
    sections: [
      {
        title: '1. Обязательные cookie',
        paragraphs: ['Обязательные cookie и локальные данные помогают сайту корректно отображать интерфейс, запоминать базовые технические настройки и поддерживать сценарий баннера согласия.'],
        bullets: ['Сохранение решения по cookies.', 'Поддержка корректной работы публичных страниц.', 'Технические настройки клиентского интерфейса.'],
      },
      {
        title: '2. Аналитические cookie и события',
        paragraphs: ['Аналитические инструменты включаются только при явном согласии пользователя на аналитику. До этого момента маркетинговые события и внешние аналитические скрипты не загружаются.'],
        bullets: ['Измерение просмотров публичных страниц.', 'Оценка переходов по CTA и формам.', 'Анализ интереса к разделам сайта и legal-страницам.'],
      },
      {
        title: '3. Как управлять выбором',
        paragraphs: [
          'В баннере cookies можно выбрать режим «только обязательные» или согласиться на аналитику. Сохранённый выбор используется на последующих сессиях сайта.',
          'Если нужно изменить решение, можно очистить сохранённый consent в браузере и выбрать новый режим при следующем визите.',
        ],
      },
    ],
  },
};
