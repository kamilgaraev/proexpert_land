import type { MarketingAdvancedOffer, MarketingPackageFamily } from '@/types/marketing';

export const marketingPackageCatalogSource = 'Backend МОСТ: GET /api/v1/landing/packages';

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

const foundationModules = ['organizations', 'users', 'project-management', 'catalog-management'];

const definitions: PackageDefinition[] = [
  {
    slug: 'projects-processes',
    name: 'Проекты и процессы',
    price: 9_900,
    description: 'Единый рабочий контур проектов, задач, договоров и согласованных процессов.',
    bestFor: 'Командам, которым важно собрать управление объектами и ответственностью в одном месте.',
    moduleSlugs: ['project-management', 'contract-management', 'workflow-management'],
    highlights: ['Проекты и этапы', 'Задачи и ответственность', 'Рабочие маршруты'],
    outcomes: ['Статусы проекта видны без ручной сводки', 'Договоры и процессы связаны с объектом'],
  },
  {
    slug: 'planning-schedules',
    name: 'Графики и планирование',
    price: 7_900,
    description: 'Календарное планирование, зависимости, сменные задания и план-факт по срокам.',
    bestFor: 'Проектным командам и площадкам, которые управляют сроками и загрузкой.',
    moduleSlugs: ['schedule-management', 'time-tracking'],
    highlights: ['График работ', 'Зависимости', 'План-факт'],
    outcomes: ['Отклонения по срокам заметны раньше', 'Площадка и офис работают по одному плану'],
  },
  {
    slug: 'estimates-norms',
    name: 'Сметы и нормы',
    price: 12_900,
    description: 'Сметный контур, нормативы, расценки и контроль объемов по объекту.',
    bestFor: 'Сметчикам, ПТО и руководителям проектов с регулярным контролем стоимости.',
    moduleSlugs: ['budget-estimates', 'rate-management', 'report-templates'],
    highlights: ['Сметы', 'Нормы и расценки', 'Объемы работ'],
    outcomes: ['Расчетная база хранится вместе с проектом', 'Изменения стоимости легче проверять'],
  },
  {
    slug: 'quality-safety',
    name: 'Качество и безопасность',
    price: 9_900,
    description: 'Инспекции, дефекты, охрана труда, допуски, нарушения и контроль устранения.',
    bestFor: 'Стройконтролю и службам охраны труда на одном или нескольких объектах.',
    moduleSlugs: ['quality-control', 'safety-management'],
    highlights: ['Инспекции', 'Дефекты', 'Охрана труда'],
    outcomes: ['Замечания доводятся до устранения', 'Допуски и нарушения видны в проектном контексте'],
  },
  {
    slug: 'pto-handover',
    name: 'ПТО и сдача',
    price: 11_900,
    description: 'ПИР, исполнительная документация, комплектность, приемка и передача результата.',
    bestFor: 'ПТО и инженерным командам, которые ведут объект от документации до сдачи.',
    moduleSlugs: ['design-management', 'executive-documentation', 'handover-acceptance'],
    highlights: ['ПИР и версии', 'Исполнительная документация', 'Приемка'],
    outcomes: ['Комплект сдачи не теряется между папками', 'Замечания связаны с приемкой'],
  },
  {
    slug: 'supply-warehouse',
    name: 'Снабжение и склад',
    price: 11_900,
    description: 'Потребности объектов, закупки, поставки, резервы и складские остатки.',
    bestFor: 'Снабжению и складу при работе с несколькими объектами и поставщиками.',
    moduleSlugs: ['site-requests', 'procurement', 'basic-warehouse'],
    highlights: ['Заявки с объекта', 'Закупки', 'Остатки и резервы'],
    outcomes: ['Потребность проходит прозрачный маршрут', 'Материалы прослеживаются до объекта'],
  },
  {
    slug: 'finance-contracts',
    name: 'Финансы и договоры',
    price: 12_900,
    description: 'Договоры, обязательства, платежи, акты и финансовый контроль по объектам.',
    bestFor: 'Финансовым и договорным службам строительной компании.',
    moduleSlugs: ['contract-management', 'payments', 'act-reporting', 'advance-accounting'],
    highlights: ['Договоры', 'Платежи', 'Акты и обязательства'],
    outcomes: ['Деньги связаны с объектами и договорами', 'Обязательства видны до платежа'],
  },
  {
    slug: 'workforce-output',
    name: 'Персонал и выработка',
    price: 9_900,
    description: 'Сотрудники, бригады, смены, наряды, время и производственная выработка.',
    bestFor: 'Производственным командам с бригадами и сдельным учетом работ.',
    moduleSlugs: ['workforce-management', 'production-labor', 'brigades'],
    highlights: ['Бригады и смены', 'Наряды', 'Выработка'],
    outcomes: ['Трудозатраты связаны с объектом', 'Данные для начислений становятся проверяемыми'],
  },
  {
    slug: 'machinery',
    name: 'Техника и механизмы',
    price: 7_900,
    description: 'Техника, смены, загрузка, простои, путевые события и эксплуатационный контроль.',
    bestFor: 'Механикам и диспетчерам строительной техники.',
    moduleSlugs: ['machinery-operations'],
    highlights: ['Реестр техники', 'Смены и простои', 'Загрузка'],
    outcomes: ['Загрузка техники видна по объектам', 'Простои и смены фиксируются в одном контуре'],
  },
  {
    slug: 'sales-contractors',
    name: 'Продажи и подрядчики',
    price: 7_900,
    description: 'Продажи, воронка, подрядчики, предложения и переход от сделки к проекту.',
    bestFor: 'Коммерческим службам, генподрядчикам и компаниям с сетью подрядчиков.',
    moduleSlugs: ['crm', 'contractor-portal'],
    highlights: ['Лиды и сделки', 'Подрядчики', 'Связь с проектом'],
    outcomes: ['Коммерческий путь продолжается в проекте', 'Работа с подрядчиками становится прозрачнее'],
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
