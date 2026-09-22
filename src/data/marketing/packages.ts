import type { MarketingAdvancedOffer, MarketingPackage } from '@/types/marketing';

export const marketingPackageCatalogSource = 'Backend МОСТ: config/Packages/*.json, config/commercial_offers.php, config/module_packages.php';

export type CommercialPackageSlug =
  | 'working-entry'
  | 'supply-warehouse'
  | 'finance-contracts'
  | 'quality-safety'
  | 'workforce-output'
  | 'machinery'
  | 'sales-contractors';

export const retiredEntryPackageSlugs = [
  'projects-processes',
  'planning-schedules',
  'estimates-norms',
  'pto-handover',
] as const;

export interface CommercialPackage extends MarketingPackage {
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
    slug: 'working-entry',
    name: 'Рабочий вход',
    price: 39_900,
    description: 'Объекты, заявки, графики, сметы и сдача объекта в одном платном минимуме.',
    bestFor: 'Командам, которым нужен единый платный минимум для объектов, сроков, смет и сдачи.',
    moduleSlugs: ['site-requests', 'file-management', 'ai-assistant', 'data-export', 'schedule-management', 'budget-estimates', 'rate-management', 'ai-estimates', 'quality-control', 'report-templates', 'executive-documentation', 'design-management', 'handover-acceptance'],
    highlights: ['Заявки с объекта', 'Графики', 'Сметы и нормы', 'ПТО и сдача', 'Помощник'],
    outcomes: ['Единый порядок работы по объектам', 'Управляемые сроки', 'Единая сметно-нормативная база', 'Комплектная исполнительная документация'],
  },
  {
    slug: 'supply-warehouse',
    name: 'Снабжение и склад',
    price: 9_900,
    description: 'Закупки, складской учёт и материальный контроль по объектам.',
    bestFor: 'Снабжению и складу при работе с несколькими объектами и поставщиками.',
    moduleSlugs: ['site-requests', 'basic-warehouse', 'procurement', 'material-analytics'],
    highlights: ['Заявки на снабжение', 'Закупки', 'Склад и материалы'],
    outcomes: ['Прозрачное снабжение', 'Контроль остатков и движения материалов'],
  },
  {
    slug: 'finance-contracts',
    name: 'Финансы и договоры',
    price: 9_900,
    description: 'Договоры, бюджетирование, акты и финансовый контроль строительных проектов.',
    bestFor: 'Финансовым и договорным службам строительной компании.',
    moduleSlugs: ['budget-estimates', 'budgeting', 'change-management', 'advance-accounting', 'one-c-basic-exchange'],
    highlights: ['Бюджетирование', 'Изменения и претензии', 'Подотчётные средства'],
    outcomes: ['Финансовый план-факт по объектам', 'Контроль договорных изменений'],
  },
  {
    slug: 'quality-safety',
    name: 'Качество и безопасность',
    price: 6_900,
    description: 'Контроль качества работ, охрана труда и безопасность на строительной площадке.',
    bestFor: 'Стройконтролю и службам охраны труда на одном или нескольких объектах.',
    moduleSlugs: ['budget-estimates', 'file-management', 'quality-control', 'safety-management', 'video-monitoring', 'access_recertification'],
    highlights: ['Инспекции и дефекты', 'Инструктажи и безопасность'],
    outcomes: ['Системный контроль качества', 'Управляемая охрана труда'],
  },
  {
    slug: 'workforce-output',
    name: 'Персонал и выработка',
    price: 7_900,
    description: 'Рабочее время, персонал, наряды и фактическая выработка по объектам.',
    bestFor: 'Производственным командам с бригадами и сдельным учетом работ.',
    moduleSlugs: ['time-tracking', 'budget-estimates', 'workforce-management', 'production-labor'],
    highlights: ['Учёт времени', 'Персонал', 'Наряды и выработка'],
    outcomes: ['Контроль трудозатрат', 'Проверяемая выработка по объектам'],
  },
  {
    slug: 'machinery',
    name: 'Техника и механизмы',
    price: 5_900,
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
    moduleSlugs: ['crm', 'commercial-proposals', 'contractor-portal', 'file-management', 'tenders'],
    highlights: ['CRM', 'Коммерческие предложения', 'Портал подрядчиков'],
    outcomes: ['Единая воронка продаж', 'Управляемая работа с подрядчиками'],
  },
];

export const commercialPackages: CommercialPackage[] = definitions.map((item, index) => ({
  ...item,
  number: index + 1,
  color: index % 2 === 0 ? 'construction' : 'steel',
  icon: item.slug,
  standalonePrice: item.price,
  priceLabel: `${item.price.toLocaleString('ru-RU')} ₽ за 30 дней`,
  billingModel: 'subscription',
  durationDays: 30,
  includedModules: item.moduleSlugs,
  highlights: item.highlights,
  businessOutcome: item.outcomes[0],
  foundationModules,
  businessOutcomes: item.outcomes,
}));

export const marketingPackages: MarketingPackage[] = commercialPackages;

export const freeFoundationOffer = {
  name: 'Начните бесплатно',
  price: 0,
  description: 'Создайте организацию и начните вести проекты с небольшой командой. Базовый доступ не ограничен пробным периодом; дополнительные возможности подключаются пакетами.',
  includes: ['До 3 участников', 'До 2 объектов', '2 ГБ для файлов'],
  limitsNote: 'Лимиты бесплатной основы. Доступ к отдельным функциям зависит от подключённых пакетов и прав сотрудника.',
};

export const fullSuiteOffer = {
  slug: 'full-suite' as const,
  name: 'Полный комплект',
  price: 79_900,
  separatePrice: 88_300,
  savings: 8_400,
  savingsPercent: 9.51,
  billingPeriodDays: 30,
};

export const commercialTerms = {
  trialHours: 72,
  graceDays: 7,
  recommendationThreshold: 64_000,
  entrySlug: 'working-entry' as const,
};

export const getCommercialSelection = (slugs: readonly string[], fullSuite = false) => {
  const known = new Set(commercialPackages.map((item) => item.slug));
  const selected = new Set(
    slugs.filter((slug): slug is CommercialPackageSlug => known.has(slug as CommercialPackageSlug)),
  );
  if (fullSuite || [...selected].some((slug) => slug !== commercialTerms.entrySlug)) {
    selected.add(commercialTerms.entrySlug);
  }
  if (fullSuite) {
    commercialPackages.forEach((item) => selected.add(item.slug));
  }

  const selectedPackages = commercialPackages.filter((item) => selected.has(item.slug));
  const separateTotal = selectedPackages.reduce((sum, item) => sum + item.price, 0);

  return {
    selectedSlugs: selectedPackages.map((item) => item.slug),
    selectedPackages,
    total: fullSuite ? fullSuiteOffer.price : separateTotal,
    recommendFullSuite: !fullSuite && separateTotal >= commercialTerms.recommendationThreshold,
    isFullSuite: fullSuite,
  };
};

export const marketingAdvancedOffers: MarketingAdvancedOffer[] = [
  {
    id: 'corporate',
    title: 'Корпоративный уровень',
    summary: 'Для группы компаний согласуем состав возможностей, доступ к данным организаций, обмен с учётными системами, перенос данных и условия сопровождения.',
    maturity: 'stable',
    surfaces: ['admin', 'lk', 'holding'],
    moduleSlugs: ['multi-organization', 'integrations'],
    sourceOfTruth: ['prohelper/app/BusinessModules/Billing'],
    cta: 'Обсудить корпоративные условия',
  },
];
