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
    packageSlugs: ['objects-execution'],
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
    packageSlugs: ['objects-execution'],
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
    packageSlugs: ['supply-warehouse'],
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
    moduleSlugs: ['payments', 'act-reporting', 'advance-accounting'],
    packageSlugs: ['finance-acts'],
    sourceOfTruth: [
      'prohelper/app/BusinessModules/Features/Payments',
      'prohelper/config/Packages/finance-acts.json',
      'prohelper_admin/src/pages/Finance',
    ],
    cta: 'Показать финансовый контур',
  },
  {
    id: 'pir-project-documentation',
    title: 'ПИР и проектная документация',
    businessContour: 'ПИР и ПТО',
    summary:
      'ПД, РД, BIM/IFC, замечания, нормоконтроль и выпуск комплектов проектной документации собираются в управляемый процесс.',
    publicClaim:
      'Проектная команда видит версии, замечания, ответственных и готовность комплектов без ручной пересборки файлов и писем.',
    audiences: ['ПИР', 'ПТО', 'Девелопер', 'Генподрядчик'],
    outcomes: [
      'ПД и РД привязаны к объекту, разделам и версиям.',
      'Замечания и нормоконтроль получают ответственных и статусы.',
      'Комплекты выпускаются из понятной истории проектных решений.',
    ],
    surfaces: ['admin', 'lk'],
    maturity: 'stable',
    moduleSlugs: ['design-management', 'budget-estimates', 'file-management'],
    packageSlugs: ['estimates-pto'],
    sourceOfTruth: [
      'prohelper/config/ModuleList/features/design-management.json',
      'prohelper/config/Packages/estimates-pto.json',
      'docs/workflows/construction-erp-coverage.md',
    ],
    cta: 'Показать контур ПИР',
  },
  {
    id: 'quality-handover',
    title: 'Качество, дефекты и приемка',
    businessContour: 'Качество и сдача',
    summary:
      'Инспекции, дефекты, исполнительная документация и punch-list связываются с передачей результата заказчику.',
    publicClaim:
      'Дефекты не теряются до сдачи: у каждого замечания есть статус, ответственный, срок устранения и связь с приемкой.',
    audiences: ['Стройконтроль', 'ПТО', 'Генподрядчик', 'Заказчик'],
    outcomes: [
      'Дефекты и инспекции ведутся в едином реестре.',
      'Повторная проверка и приемка зон становятся управляемыми.',
      'Исполнительная документация связана с качеством и сдачей.',
    ],
    surfaces: ['admin', 'mobile', 'lk'],
    maturity: 'stable',
    moduleSlugs: ['quality-control', 'handover-acceptance', 'executive-documentation'],
    packageSlugs: ['site-quality-handover'],
    sourceOfTruth: [
      'prohelper/config/ModuleList/features/quality-control.json',
      'prohelper/config/ModuleList/features/handover-acceptance.json',
      'docs/workflows/construction-erp-coverage.md',
    ],
    cta: 'Показать качество и приемку',
  },
  {
    id: 'construction-safety',
    title: 'Охрана труда и безопасность',
    businessContour: 'Безопасность стройки',
    summary:
      'Инструктажи, допуски, нарушения, инциденты, предписания и устранение становятся частью объектного контроля.',
    publicClaim:
      'События охраны труда фиксируются рядом с проектом: видны сроки реакции, ответственные и открытые риски по объектам.',
    audiences: ['Специалист ОТ', 'Прораб', 'Генподрядчик', 'Руководитель проекта'],
    outcomes: [
      'Инструктажи и допуски связаны с участниками работ.',
      'Нарушения и инциденты не остаются только в журналах.',
      'Предписания доводятся до устранения с видимым статусом.',
    ],
    surfaces: ['admin', 'mobile'],
    maturity: 'stable',
    moduleSlugs: ['safety-management', 'brigades', 'file-management'],
    packageSlugs: ['construction-safety'],
    sourceOfTruth: [
      'prohelper/config/ModuleList/features/safety-management.json',
      'prohelper/config/Packages/construction-safety.json',
    ],
    cta: 'Показать охрану труда',
  },
  {
    id: 'machinery-labor',
    title: 'Техника, наряды и выработка',
    businessContour: 'Ресурсы и выработка',
    summary:
      'Техника, механизмы, смены, простои, ГСМ, наряды и фактическая выработка связываются с объектом.',
    publicClaim:
      'Руководитель видит ресурсный факт по объекту: какая техника работала, где простой, какие наряды закрыты и что влияет на себестоимость.',
    audiences: ['Прораб', 'Механик', 'ПТО', 'Финансовый блок'],
    outcomes: [
      'Техника и механизмы получают сменные статусы и простои.',
      'Наряды и выработка связаны с фактическими объемами.',
      'Начисления готовятся на проверяемой производственной базе.',
    ],
    surfaces: ['admin', 'mobile'],
    maturity: 'stable',
    moduleSlugs: ['machinery-operations', 'production-labor', 'time-tracking'],
    packageSlugs: ['machinery-and-labor'],
    sourceOfTruth: [
      'prohelper/config/ModuleList/features/machinery-operations.json',
      'prohelper/config/ModuleList/features/production-labor.json',
      'prohelper/config/Packages/machinery-and-labor.json',
    ],
    cta: 'Показать ресурсный контур',
  },
  {
    id: 'workforce-control',
    title: 'Персонал и трудозатраты',
    businessContour: 'Ресурсы и выработка',
    summary:
      'Сотрудники, бригады, наряды, графики, отсутствия и payroll source собираются в один производственный контур.',
    publicClaim:
      'Трудозатраты закрываются по объектам и периодам на базе нарядов, смен и фактической выработки, а не ручного свода.',
    audiences: ['Прораб', 'HR/кадры', 'Финансовый блок', 'Руководитель проекта'],
    outcomes: [
      'Сотрудники и бригады связаны с объектами и производственными задачами.',
      'Наряды, выработка и смены становятся источником для начислений.',
      'Периоды можно закрывать на проверяемой базе.',
    ],
    surfaces: ['admin', 'mobile'],
    maturity: 'stable',
    moduleSlugs: ['workforce-management', 'production-labor', 'time-tracking'],
    packageSlugs: ['workforce-management'],
    sourceOfTruth: [
      'prohelper/config/ModuleList/features/workforce-management.json',
      'prohelper/config/ModuleList/features/production-labor.json',
      'prohelper/config/Packages/workforce-management.json',
    ],
    cta: 'Показать персонал и трудозатраты',
  },
  {
    id: 'change-control',
    title: 'RFI, изменения и претензии',
    businessContour: 'Изменения и коммерческий контроль',
    summary:
      'RFI, change orders, дополнительные работы, претензии и влияние на бюджет и сроки проходят управляемый маршрут.',
    publicClaim:
      'Изменения не теряются в переписке: видны основания, решения заказчика, влияние на сроки, деньги и комплект документов.',
    audiences: ['ПТО', 'Руководитель проекта', 'Финансовый блок', 'Заказчик'],
    outcomes: [
      'RFI и ответы получают срок, статус и историю.',
      'Изменения показывают влияние на смету, сроки и платежи.',
      'Претензии собирают основания и доказательную базу.',
    ],
    surfaces: ['admin', 'lk'],
    maturity: 'stable',
    moduleSlugs: ['change-management', 'budget-estimates', 'payments'],
    packageSlugs: ['change-control'],
    sourceOfTruth: [
      'prohelper/config/ModuleList/features/change-management.json',
      'prohelper/config/Packages/change-control.json',
    ],
    cta: 'Показать контур изменений',
  },
  {
    id: 'analytics-control',
    title: 'Отчетность и управленческий контроль',
    businessContour: 'Аналитика и контроль',
    summary:
      'Руководитель получает сводную картину по проектам, финансам, ресурсам и рабочим потокам без ручного сбора данных.',
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
    moduleSlugs: ['dashboard-widgets', 'data-filters', 'reports', 'data-export'],
    packageSlugs: ['holding-analytics'],
    sourceOfTruth: [
      'prohelper/config/Packages/holding-analytics.json',
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
    moduleSlugs: ['multi-organization', 'dashboard-widgets', 'data-filters'],
    packageSlugs: ['holding-analytics'],
    sourceOfTruth: [
      'prohelper/config/Packages/holding-analytics.json',
      'prohelper_land/src/components/multi-org',
      'prohelper_land/src/HoldingRouter.tsx',
    ],
    cta: 'Разобрать сценарий группы компаний',
  },
];
