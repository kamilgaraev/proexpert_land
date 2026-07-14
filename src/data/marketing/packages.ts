import type { MarketingAdvancedOffer, MarketingPackageFamily } from '@/types/marketing';

export const marketingPackageCatalogSource = 'Backend МОСТ: config/Packages/*.json, config/commercial_offers.php, config/module_packages.php';

export type CommercialPackageSlug =
  | 'projects-processes'
  | 'planning-schedules'
  | 'estimates-norms'
  | 'quality-safety'
  | 'pto-handover'
  | 'supply-warehouse'
  | 'finance-contracts'
  | 'workforce-output'
  | 'machinery'
  | 'sales-contractors';

export interface CommercialPackage extends MarketingPackageFamily {
  number: number;
  slug: CommercialPackageSlug;
  price: number;
}

interface PackageDefinition {
  slug: CommercialPackageSlug;
  name: string;
  price: number;
  description: string;
  bestFor: string;
  moduleSlugs: string[];
  highlights: string[];
  outcomes: string[];
}

const foundationModules = [
  'organizations',
  'users',
  'project-management',
  'contract-management',
  'catalog-management',
  'workflow-management',
  'act-reporting',
  'payments',
  'reports',
  'dashboard-widgets',
  'data-filters',
  'brigades',
];

const definitions: PackageDefinition[] = [
  {
    slug: 'projects-processes',
    name: 'Проекты и процессы',
    price: 9_900,
    description: 'Управление объектами, рабочими процессами и заявками с площадки в едином контуре.',
    bestFor: 'Командам, которым важно собрать управление объектами и ответственностью в одном месте.',
    moduleSlugs: ['site-requests', 'file-management'],
    highlights: ['Заявки с объекта', 'Файлы и документы'],
    outcomes: ['Единый порядок работы по объектам', 'Связь офиса и строительной площадки'],
  },
  {
    slug: 'planning-schedules',
    name: 'Графики и планирование',
    price: 7_900,
    description: 'Календарное и оперативное планирование работ по объектам.',
    bestFor: 'Проектным командам и площадкам, которые управляют сроками и загрузкой.',
    moduleSlugs: ['schedule-management'],
    highlights: ['Календарные графики', 'Оперативное планирование'],
    outcomes: ['Управляемые сроки и последовательность работ'],
  },
  {
    slug: 'estimates-norms',
    name: 'Сметы и нормы',
    price: 12_900,
    description: 'Сметы, расценки, нормы и связанные расчёты для строительных проектов.',
    bestFor: 'Сметчикам, ПТО и руководителям проектов с регулярным контролем стоимости.',
    moduleSlugs: ['budget-estimates', 'rate-management'],
    highlights: ['Сметы', 'Расценки и нормы'],
    outcomes: ['Единая сметно-нормативная база', 'Контролируемые расчёты стоимости'],
  },
  {
    slug: 'quality-safety',
    name: 'Качество и безопасность',
    price: 9_900,
    description: 'Контроль качества работ, охрана труда и безопасность на строительной площадке.',
    bestFor: 'Стройконтролю и службам охраны труда на одном или нескольких объектах.',
    moduleSlugs: ['budget-estimates', 'file-management', 'quality-control', 'safety-management'],
    highlights: ['Инспекции и дефекты', 'Инструктажи и безопасность'],
    outcomes: ['Системный контроль качества', 'Управляемая охрана труда'],
  },
  {
    slug: 'pto-handover',
    name: 'ПТО и сдача',
    price: 11_900,
    description: 'Исполнительная и проектная документация, контроль качества и приёмка результата.',
    bestFor: 'ПТО и инженерным командам, которые ведут объект от документации до сдачи.',
    moduleSlugs: ['budget-estimates', 'file-management', 'quality-control', 'report-templates', 'executive-documentation', 'design-management', 'handover-acceptance'],
    highlights: ['Исполнительная документация', 'ПИР', 'Приёмка'],
    outcomes: ['Комплектная исполнительная документация', 'Прозрачная приёмка и сдача'],
  },
  {
    slug: 'supply-warehouse',
    name: 'Снабжение и склад',
    price: 11_900,
    description: 'Закупки, складской учёт и материальный контроль по объектам.',
    bestFor: 'Снабжению и складу при работе с несколькими объектами и поставщиками.',
    moduleSlugs: ['site-requests', 'basic-warehouse', 'procurement', 'material-analytics'],
    highlights: ['Заявки на снабжение', 'Закупки', 'Склад и материалы'],
    outcomes: ['Прозрачное снабжение', 'Контроль остатков и движения материалов'],
  },
  {
    slug: 'finance-contracts',
    name: 'Финансы и договоры',
    price: 12_900,
    description: 'Договоры, бюджетирование, акты и финансовый контроль строительных проектов.',
    bestFor: 'Финансовым и договорным службам строительной компании.',
    moduleSlugs: ['budget-estimates', 'budgeting', 'change-management', 'advance-accounting'],
    highlights: ['Бюджетирование', 'Изменения и претензии', 'Подотчётные средства'],
    outcomes: ['Финансовый план-факт по объектам', 'Контроль договорных изменений'],
  },
  {
    slug: 'workforce-output',
    name: 'Персонал и выработка',
    price: 9_900,
    description: 'Рабочее время, персонал, наряды и фактическая выработка по объектам.',
    bestFor: 'Производственным командам с бригадами и сдельным учетом работ.',
    moduleSlugs: ['time-tracking', 'budget-estimates', 'workforce-management', 'production-labor'],
    highlights: ['Учёт времени', 'Персонал', 'Наряды и выработка'],
    outcomes: ['Контроль трудозатрат', 'Проверяемая выработка по объектам'],
  },
  {
    slug: 'machinery',
    name: 'Техника и механизмы',
    price: 7_900,
    description: 'Эксплуатация техники, заявки, смены, простои и производственные показатели.',
    bestFor: 'Механикам и диспетчерам строительной техники.',
    moduleSlugs: ['budget-estimates', 'site-requests', 'machinery-operations'],
    highlights: ['Заявки на технику', 'Сменные рапорты', 'Простои'],
    outcomes: ['Прозрачная загрузка техники', 'Контроль смен и простоев'],
  },
  {
    slug: 'sales-contractors',
    name: 'Продажи и подрядчики',
    price: 7_900,
    description: 'CRM, коммерческие предложения и совместная работа с подрядчиками.',
    bestFor: 'Коммерческим службам, генподрядчикам и компаниям с сетью подрядчиков.',
    moduleSlugs: ['crm', 'commercial-proposals', 'contractor-portal'],
    highlights: ['CRM', 'Коммерческие предложения', 'Портал подрядчиков'],
    outcomes: ['Единая воронка продаж', 'Управляемая работа с подрядчиками'],
  },
];

export const commercialPackages: CommercialPackage[] = definitions.map((item, index) => ({
  ...item,
  number: index + 1,
  color: index % 2 === 0 ? 'construction' : 'steel',
  icon: item.slug,
  foundationModules,
  integrations: [],
  recommendedAddons: [],
  businessOutcomes: item.outcomes,
  dataSources: item.moduleSlugs.map((moduleSlug) => ({ moduleSlug, label: item.highlights[0] })),
  capabilities: [],
  tiers: [{
    key: 'base',
    label: 'Бизнес-пакет',
    description: item.description,
    price: item.price,
    standalonePrice: item.price,
    priceLabel: `${item.price.toLocaleString('ru-RU')} ₽ за 30 дней`,
    billingModel: 'subscription',
    durationDays: 30,
    moduleSlugs: item.moduleSlugs,
    includedModules: item.moduleSlugs,
    highlights: item.highlights,
    businessOutcome: item.outcomes[0],
  }],
}));

export const marketingPackages: MarketingPackageFamily[] = commercialPackages;

export const freeFoundationOffer = {
  name: 'Бесплатная база',
  price: 0,
  description: 'Ограниченный, но полезный стартовый контур для организации, команды, проектов, базовых записей и просмотра данных.',
  includes: ['Организация и команда', 'Проекты и базовые записи', 'Просмотр доступных данных'],
};

export const fullSuiteOffer = {
  slug: 'full-suite' as const,
  name: 'Полный комплект',
  price: 79_900,
  separatePrice: 103_000,
  savings: 23_100,
  savingsPercent: 22.43,
  billingPeriodDays: 30,
};

export const commercialTerms = {
  trialHours: 72,
  graceDays: 7,
  recommendationThreshold: 8,
};

export const getCommercialSelection = (slugs: readonly string[]) => {
  const selected = new Set(slugs);
  const selectedPackages = commercialPackages.filter((item) => selected.has(item.slug));

  return {
    selectedSlugs: selectedPackages.map((item) => item.slug),
    selectedPackages,
    total: selectedPackages.reduce((sum, item) => sum + item.price, 0),
    recommendFullSuite: selectedPackages.length >= commercialTerms.recommendationThreshold,
    isFullSuite: false,
  };
};

export const marketingAdvancedOffers: MarketingAdvancedOffer[] = [
  {
    id: 'corporate',
    title: 'Корпоративный уровень',
    summary: 'Полный комплект с несколькими организациями, сводной отчетностью, SSO, аудитом, интеграциями, SLA, миграцией и обучением.',
    maturity: 'stable',
    surfaces: ['admin', 'lk', 'holding'],
    moduleSlugs: ['multi-organization', 'integrations'],
    sourceOfTruth: ['prohelper/app/BusinessModules/Billing'],
    cta: 'Обсудить корпоративные условия',
  },
];
