import type { MarketingCapability } from '@/types/marketing';

export const marketingCapabilityMatrix: MarketingCapability[] = [
  {
    id: 'project-control',
    title: 'Управление объектом и исполнением',
    businessContour: 'Проекты и исполнение',
    summary:
      'Объект, договор, задачи, статусы и рабочая координация собираются в одном цифровом контуре.',
    publicClaim:
      'Команда видит, что происходит по объекту сейчас: кто отвечает, какие задачи открыты и какие договоренности уже зафиксированы.',
    audiences: ['Подрядчик', 'Генподрядчик', 'ПТО'],
    outcomes: [
      'Меньше потерь между офисом и площадкой.',
      'Задачи и статусы привязаны к конкретному объекту.',
      'Картина по проекту не распадается на разные файлы.',
    ],
    surfaces: ['admin', 'mobile', 'lk'],
    maturity: 'stable',
    moduleSlugs: ['project-management', 'contract-management', 'schedule-management'],
    packageSlugs: ['projects'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Features/ProjectManagement',
      'prohelper/app/BusinessModules/Features/ScheduleManagement',
      'prohelper_admin/src/pages/Projects',
      'prohelpers_mobile/lib/features/projects',
    ],
    cta: 'Разобрать сценарий по объектам',
  },
  {
    id: 'site-requests',
    title: 'Заявки с объекта и полевой контроль',
    businessContour: 'Проекты и исполнение',
    summary:
      'Прораб и команда площадки передают потребности и факт работ напрямую в систему.',
    publicClaim:
      'Полевые запросы не теряются в переписках: они приходят в понятный рабочий поток и видны офису без ручной пересборки.',
    audiences: ['Подрядчик', 'Генподрядчик'],
    outcomes: [
      'Сокращается ручная передача информации между объектом и офисом.',
      'Заявки быстрее попадают в обработку.',
      'Руководитель видит исполнение по факту, а не с задержкой.',
    ],
    surfaces: ['mobile', 'admin'],
    maturity: 'stable',
    moduleSlugs: ['site-requests', 'time-tracking'],
    packageSlugs: ['projects'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Features/SiteRequests',
      'prohelper/app/BusinessModules/Features/TimeTracking',
      'prohelpers_mobile/lib/features/site_requests',
    ],
    cta: 'Показать работу с площадкой',
  },
  {
    id: 'supply-chain',
    title: 'Снабжение и склад',
    businessContour: 'Снабжение и материалы',
    summary:
      'Потребность, закупка, остатки и движение материалов живут рядом с проектом, а не отдельно от него.',
    publicClaim:
      'Снабжение получает заявки в контексте объекта и доводит процесс до закупки и контроля материалов без лишней ручной переписки.',
    audiences: ['Снабжение', 'Подрядчик', 'Генподрядчик'],
    outcomes: [
      'Потребности по объекту быстрее доходят до закупки.',
      'Склад и движение материалов видны в единой логике.',
      'Проект и снабжение остаются синхронизированы.',
    ],
    surfaces: ['admin', 'mobile'],
    maturity: 'stable',
    moduleSlugs: ['catalog-management', 'basic-warehouse', 'procurement'],
    packageSlugs: ['supply'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Features/BasicWarehouse',
      'prohelper/app/BusinessModules/Features/Procurement',
      'prohelper_admin/src/pages/Warehouse',
      'prohelpers_mobile/lib/features/warehouse',
    ],
    cta: 'Собрать контур снабжения',
  },
  {
    id: 'finance-control',
    title: 'Финансы, платежи и акты',
    businessContour: 'Финансы и документы',
    summary:
      'Финансовые документы и исполнительский контур связываются с проектом, контрагентом и стадией работ.',
    publicClaim:
      'Платежи, акты и связанные документы собираются в понятную финансовую картину, с которой удобно работать руководителю и финансовому блоку.',
    audiences: ['Финансовый блок', 'Руководитель', 'ПТО'],
    outcomes: [
      'Меньше разрывов между исполнением и оплатой.',
      'Финансовые документы легче контролировать по объектам.',
      'Руководитель быстрее видит реальные обязательства.',
    ],
    surfaces: ['admin', 'lk'],
    maturity: 'stable',
    moduleSlugs: ['payments', 'acts', 'advance-requests'],
    packageSlugs: ['finance'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Features/Payments',
      'prohelper/app/BusinessModules/Features/Acts',
      'prohelper_admin/src/pages/Finance',
    ],
    cta: 'Показать финансовый контур',
  },
  {
    id: 'engineering-docs',
    title: 'Сметы, акты и инженерные документы',
    businessContour: 'Финансы и документы',
    summary:
      'Документный контур помогает собрать инженерную и сметную часть проекта в управляемый процесс.',
    publicClaim:
      'Команда ПТО и инженерный блок работают с версиями, шаблонами и документами в более собранной структуре, без хаотичного обмена файлами.',
    audiences: ['ПТО', 'Инженерный блок'],
    outcomes: [
      'Документы проще связать с проектом и этапом работ.',
      'Версии и шаблоны не теряются в ручном обмене.',
      'Подготовка актов и документов становится прозрачнее.',
    ],
    surfaces: ['admin'],
    maturity: 'beta',
    moduleSlugs: ['estimates', 'engineering-documents'],
    packageSlugs: ['finance'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Features/Estimates',
      'prohelper_admin/src/pages/Estimates',
    ],
    cta: 'Обсудить документный блок',
  },
  {
    id: 'analytics-control',
    title: 'Отчетность и управленческий контроль',
    businessContour: 'Аналитика и контроль',
    summary:
      'Руководитель получает сводную картину по проектам, финансам и рабочим потокам без ручного сбора данных.',
    publicClaim:
      'Ключевые показатели и отчеты собираются в одном месте, чтобы принимать решения быстрее и на понятной базе.',
    audiences: ['Руководитель', 'Собственник', 'Финансовый блок'],
    outcomes: [
      'Сокращается время на подготовку управленческой информации.',
      'По объектам можно быстрее увидеть отклонения.',
      'Отчетность перестает зависеть от ручного свода в конце периода.',
    ],
    surfaces: ['admin', 'lk', 'holding'],
    maturity: 'stable',
    moduleSlugs: ['analytics', 'reporting'],
    packageSlugs: ['analytics'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Features/Analytics',
      'prohelper_admin/src/pages/Analytics',
      'prohelper_land/src/components/multi-org',
    ],
    cta: 'Открыть управленческий сценарий',
  },
  {
    id: 'multi-org',
    title: 'Контур группы компаний',
    businessContour: 'Группа компаний',
    summary:
      'Несколько юридических лиц и дочерних структур можно собирать в общую управленческую картину.',
    publicClaim:
      'Управляющая команда видит сводную информацию по структуре и сохраняет разграничение доступа между организациями.',
    audiences: ['Девелопер', 'Холдинг', 'Управляющая компания'],
    outcomes: [
      'Консолидированная картина без потери границ доступа.',
      'Удобнее управлять несколькими организациями в одной логике.',
      'Корпоративная отчетность масштабируется вместе со структурой.',
    ],
    surfaces: ['holding', 'admin', 'lk'],
    maturity: 'stable',
    moduleSlugs: ['multi-organization', 'holding-dashboard'],
    packageSlugs: ['enterprise'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Features/MultiOrganization',
      'prohelper_land/src/components/multi-org',
      'prohelper_land/src/HoldingRouter.tsx',
    ],
    cta: 'Разобрать сценарий группы компаний',
  },
];
