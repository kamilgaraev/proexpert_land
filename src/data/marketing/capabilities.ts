import type { MarketingCapability } from "@/types/marketing";

export const marketingCapabilityMatrix: MarketingCapability[] = [
  {
    id: "project-control",
    title: "Управление объектом и исполнением",
    businessContour: "Проекты и исполнение",
    summary:
      "Объект связывает договор, задачи, статусы, документы и ответственных сотрудников.",
    publicClaim:
      "Карточка объекта показывает открытые задачи, статусы, ответственных и зафиксированные договорённости.",
    audiences: ["Подрядчик", "Генподрядчик", "ПТО"],
    outcomes: [
      "Реестр объекта связывает задачи, документы и ответственных.",
      "Статус задачи показывает её текущее состояние.",
      "История объекта хранит зафиксированные изменения.",
    ],
    surfaces: ["admin", "mobile", "lk"],
    maturity: "stable",
    moduleSlugs: [
      "project-management",
      "contract-management",
      "schedule-management",
    ],
    packageSlugs: ["objects-execution"],
    sourceOfTruth: [
      "prohelper/app/BusinessModules/Features/ProjectManagement",
      "prohelper/app/BusinessModules/Features/ScheduleManagement",
      "prohelper_admin/src/pages/Projects",
      "prohelpers_mobile/lib/features/projects",
    ],
    cta: "Управление объектами",
  },
  {
    id: "site-requests",
    title: "Заявки с объекта и полевой контроль",
    businessContour: "Проекты и исполнение",
    summary:
      "Прораб и команда площадки передают потребности и факт работ напрямую в систему.",
    publicClaim:
      "Карточка заявки содержит объект, статус, ответственного и данные с площадки.",
    audiences: ["Подрядчик", "Генподрядчик"],
    outcomes: [
      "Заявка связывает данные площадки с объектом.",
      "Статус заявки показывает этап обработки.",
      "Руководитель видит зафиксированный факт работ по объекту.",
    ],
    surfaces: ["mobile", "admin"],
    maturity: "stable",
    moduleSlugs: ["site-requests", "time-tracking"],
    packageSlugs: ["objects-execution"],
    sourceOfTruth: [
      "prohelper/app/BusinessModules/Features/SiteRequests",
      "prohelper/app/BusinessModules/Features/TimeTracking",
      "prohelpers_mobile/lib/features/site_requests",
    ],
    cta: "Работа с площадкой",
  },
  {
    id: "supply-chain",
    title: "Снабжение и склад",
    businessContour: "Снабжение и материалы",
    summary:
      "Потребность, закупка, остатки и движение материалов живут рядом с проектом, а не отдельно от него.",
    publicClaim:
      "Заявка на снабжение содержит объект, потребность, статус и ответственного.",
    audiences: ["Снабжение", "Подрядчик", "Генподрядчик"],
    outcomes: [
      "Потребность связывается с заявкой на закупку.",
      "Склад показывает остатки и движения материалов.",
      "Материалы относятся к объекту и складской операции.",
    ],
    surfaces: ["admin", "mobile"],
    maturity: "stable",
    moduleSlugs: ["catalog-management", "basic-warehouse", "procurement"],
    packageSlugs: ["supply-warehouse"],
    sourceOfTruth: [
      "prohelper/app/BusinessModules/Features/BasicWarehouse",
      "prohelper/app/BusinessModules/Features/Procurement",
      "prohelper_admin/src/pages/Warehouse",
      "prohelpers_mobile/lib/features/warehouse",
    ],
    cta: "Снабжение и склад",
  },
  {
    id: "finance-control",
    title: "Финансы, платежи и акты",
    businessContour: "Финансы и документы",
    summary:
      "Платежи, акты и другие финансовые документы связываются с проектом, контрагентом и стадией работ.",
    publicClaim:
      "Реестр финансовых документов связывает платежи и акты с объектом, контрагентом и стадией работ.",
    audiences: ["Финансовый блок", "Руководитель", "ПТО"],
    outcomes: [
      "Платёж содержит объект, контрагента, сумму и статус.",
      "Акт связан с проектом и стадией работ.",
      "Реестр обязательств показывает записи по объектам.",
    ],
    surfaces: ["admin", "lk"],
    maturity: "stable",
    moduleSlugs: ["payments", "act-reporting", "advance-accounting"],
    packageSlugs: ["finance-acts"],
    sourceOfTruth: [
      "prohelper/app/BusinessModules/Core/Payments",
      "prohelper/config/Packages/finance-acts.json",
      "prohelper_admin/src/pages/Finance",
    ],
    cta: "Финансы и документы",
  },
  {
    id: "pir-project-documentation",
    title: "ПИР и проектная документация",
    businessContour: "ПИР и ПТО",
    summary:
      "Проектная и рабочая документация (ПД и РД), формат IFC для информационных моделей, замечания, нормоконтроль и выпуск комплектов связаны с объектом.",
    publicClaim:
      "Карточка комплекта показывает версии, замечания, ответственных и текущий статус.",
    audiences: ["ПИР", "ПТО", "Девелопер", "Генподрядчик"],
    outcomes: [
      "Документы привязаны к объекту, разделу и версии.",
      "Замечание содержит ответственного и статус.",
      "История комплекта хранит проектные решения и выпуски.",
    ],
    surfaces: ["admin", "lk"],
    maturity: "stable",
    moduleSlugs: ["design-management", "budget-estimates", "file-management"],
    packageSlugs: ["estimates-pto"],
    sourceOfTruth: [
      "prohelper/config/ModuleList/features/design-management.json",
      "prohelper/config/Packages/estimates-pto.json",
      "docs/workflows/construction-erp-coverage.md",
    ],
    cta: "ПИР и документация",
  },
  {
    id: "quality-handover",
    title: "Качество, дефекты и приемка",
    businessContour: "Качество и сдача",
    summary:
      "Инспекции, дефекты, исполнительная документация и перечень замечаний при приёмке (punch-list) связываются с передачей результата заказчику.",
    publicClaim:
      "Карточка дефекта связывает замечание с зоной объекта и показывает статус, срок, ответственного и повторную проверку.",
    audiences: ["Стройконтроль", "ПТО", "Генподрядчик", "Заказчик"],
    outcomes: [
      "Реестр связывает дефекты с инспекциями и зонами объекта.",
      "Статус дефекта показывает этап устранения и повторной проверки.",
      "Исполнительная документация привязана к приёмке зоны.",
    ],
    surfaces: ["admin", "mobile", "lk"],
    maturity: "stable",
    moduleSlugs: [
      "quality-control",
      "handover-acceptance",
      "executive-documentation",
    ],
    packageSlugs: ["site-quality-handover"],
    sourceOfTruth: [
      "prohelper/config/ModuleList/features/quality-control.json",
      "prohelper/config/ModuleList/features/handover-acceptance.json",
      "docs/workflows/construction-erp-coverage.md",
    ],
    cta: "Качество и приёмка",
  },
  {
    id: "construction-safety",
    title: "Охрана труда и безопасность",
    businessContour: "Безопасность стройки",
    summary:
      "Инструктажи, допуски, нарушения, инциденты, предписания и устранение становятся частью объектного контроля.",
    publicClaim:
      "Карточка события охраны труда содержит объект, срок реакции, ответственного и статус.",
    audiences: [
      "Специалист ОТ",
      "Прораб",
      "Генподрядчик",
      "Руководитель проекта",
    ],
    outcomes: [
      "Допуск связан с участником работ и объектом.",
      "Реестр хранит нарушения и инциденты по объекту.",
      "Предписание содержит срок, ответственного и статус устранения.",
    ],
    surfaces: ["admin", "mobile"],
    maturity: "stable",
    moduleSlugs: ["safety-management", "brigades", "file-management"],
    packageSlugs: ["construction-safety"],
    sourceOfTruth: [
      "prohelper/config/ModuleList/features/safety-management.json",
      "prohelper/config/Packages/construction-safety.json",
    ],
    cta: "Охрана труда",
  },
  {
    id: "machinery-labor",
    title: "Техника, наряды и выработка",
    businessContour: "Ресурсы и выработка",
    summary:
      "Техника, механизмы, смены, простои, ГСМ, наряды и фактическая выработка связываются с объектом.",
    publicClaim:
      "Карточка смены содержит технику, объект, простой, ГСМ и зафиксированную выработку.",
    audiences: ["Прораб", "Механик", "ПТО", "Финансовый блок"],
    outcomes: [
      "Техника связана с объектом и сменным рапортом.",
      "Наряд содержит фактический объём и выработку.",
      "Данные смены используются для подготовки начислений.",
    ],
    surfaces: ["admin", "mobile"],
    maturity: "stable",
    moduleSlugs: ["machinery-operations", "production-labor", "time-tracking"],
    packageSlugs: ["machinery-and-labor"],
    sourceOfTruth: [
      "prohelper/config/ModuleList/features/machinery-operations.json",
      "prohelper/config/ModuleList/features/production-labor.json",
      "prohelper/config/Packages/machinery-and-labor.json",
    ],
    cta: "Техника и выработка",
  },
  {
    id: "workforce-control",
    title: "Персонал и трудозатраты",
    businessContour: "Ресурсы и выработка",
    summary:
      "Сотрудники, бригады, наряды, графики, отсутствия и данные для начислений относятся к объектам и периодам.",
    publicClaim:
      "Реестр трудозатрат связывает объект и период с нарядами, сменами и выработкой.",
    audiences: [
      "Прораб",
      "HR/кадры",
      "Финансовый блок",
      "Руководитель проекта",
    ],
    outcomes: [
      "Сотрудник связан с бригадой, объектом и производственной задачей.",
      "Наряд содержит смену, объём и выработку.",
      "Данные периода используются при подготовке начислений.",
    ],
    surfaces: ["admin", "mobile"],
    maturity: "stable",
    moduleSlugs: ["workforce-management", "production-labor", "time-tracking"],
    packageSlugs: ["workforce-management"],
    sourceOfTruth: [
      "prohelper/config/ModuleList/features/workforce-management.json",
      "prohelper/config/ModuleList/features/production-labor.json",
      "prohelper/config/Packages/workforce-management.json",
    ],
    cta: "Персонал и трудозатраты",
  },
  {
    id: "change-control",
    title: "Запросы информации, изменения и претензии",
    businessContour: "Изменения и коммерческий контроль",
    summary:
      "Запросы информации, изменения к договору, дополнительные работы и претензии связываются со сроками и бюджетом.",
    publicClaim:
      "Карточка изменения содержит основание, решение заказчика, сроки, бюджет и связанные документы.",
    audiences: ["ПТО", "Руководитель проекта", "Финансовый блок", "Заказчик"],
    outcomes: [
      "Карточка запроса содержит срок, статус и историю ответов.",
      "Реестр изменений показывает связанные сметы, сроки и платежи.",
      "Карточка претензии хранит основания и приложенные материалы.",
    ],
    surfaces: ["admin", "lk"],
    maturity: "stable",
    moduleSlugs: ["change-management", "budget-estimates", "payments"],
    packageSlugs: ["change-control"],
    sourceOfTruth: [
      "prohelper/config/ModuleList/features/change-management.json",
      "prohelper/config/Packages/change-control.json",
    ],
    cta: "Изменения и претензии",
  },
  {
    id: "analytics-control",
    title: "Отчетность и управленческий контроль",
    businessContour: "Аналитика и контроль",
    summary:
      "Руководитель получает сводную картину по проектам, финансам, ресурсам и рабочим потокам без ручного сбора данных.",
    publicClaim:
      "Сводная панель показывает доступные данные по проектам, финансам, ресурсам и рабочим процессам.",
    audiences: ["Руководитель", "Собственник", "Финансовый блок"],
    outcomes: [
      "Показатель панели связан с доступными данными проекта или ресурса.",
      "Срез объекта показывает зафиксированные статусы и отклонения.",
      "Отчёт использует записи, которые команда ведёт в системе.",
    ],
    surfaces: ["admin", "lk", "holding"],
    maturity: "stable",
    moduleSlugs: [
      "dashboard-widgets",
      "data-filters",
      "reports",
      "data-export",
    ],
    packageSlugs: ["holding-analytics"],
    sourceOfTruth: [
      "prohelper/config/Packages/holding-analytics.json",
      "prohelper_land/src/components/multi-org",
    ],
    cta: "Отчётность и контроль",
  },
  {
    id: "multi-org",
    title: "Управление группой компаний",
    businessContour: "Группа компаний",
    summary:
      "Несколько юридических лиц и дочерних структур можно собирать в общую управленческую картину.",
    publicClaim:
      "Сводка показывает доступные управляющей команде данные по организациям и объектам с учётом прав.",
    audiences: ["Девелопер", "Холдинг", "Управляющая компания"],
    outcomes: [
      "Организация содержит собственные объекты и пользователей.",
      "Роль определяет доступ к данным организации.",
      "Отчёт показывает записи доступных организаций.",
    ],
    surfaces: ["holding", "admin", "lk"],
    maturity: "stable",
    moduleSlugs: ["multi-organization", "dashboard-widgets", "data-filters"],
    packageSlugs: ["holding-analytics"],
    sourceOfTruth: [
      "prohelper/config/Packages/holding-analytics.json",
      "prohelper_land/src/components/multi-org",
      "prohelper_land/src/HoldingRouter.tsx",
    ],
    cta: "Группа компаний",
  },
  {
    id: "1c-integration",
    title: "Интеграция с 1С и мастер-данные",
    businessContour: "Интеграции и данные",
    summary:
      "Обмен с 1С настраивается для согласованных справочников, документов и направления передачи данных конкретной компании.",
    publicClaim:
      "Данные профиля обмена с 1С содержат согласованные юридические лица, справочники, направление передачи и правила сверки.",
    audiences: ["ИТ-руководитель", "Финансовый блок", "Владелец мастер-данных"],
    outcomes: [
      "Данные обмена содержат согласованный состав и направление передачи.",
      "Сопоставление хранит правило и статус расхождения.",
      "Сверка показывает результат по согласованному набору данных.",
    ],
    surfaces: ["admin", "lk"],
    maturity: "early_access",
    moduleSlugs: ["integrations", "data-filters"],
    packageSlugs: ["holding-analytics"],
    sourceOfTruth: [
      "prohelper/app/BusinessModules/Addons/Integrations",
      "prohelper/app/Models/OneCIntegrationProfile.php",
      "prohelper/app/Services/AccountingIntegrationService.php",
    ],
    cta: "Обсудить интеграцию с 1С",
  },
  {
    id: "contractor-marketplace",
    title: "Маркетплейс подрядчиков",
    businessContour: "Подбор исполнителей",
    summary:
      "Профили, категории, поиск, списки кандидатов, приглашения и предложения поддерживают подбор подрядчика до договорной работы.",
    publicClaim:
      "Карточка подбора хранит кандидатов, категории поиска и отправленные приглашения.",
    audiences: ["Генподрядчик", "Руководитель проекта", "Подрядчик"],
    outcomes: [
      "Профиль кандидата содержит специализацию и доступные сведения.",
      "Карточка подбора хранит приглашения и ответы.",
      "Статус подбора фиксирует выбранного исполнителя перед передачей контакта.",
    ],
    surfaces: ["admin", "lk"],
    maturity: "stable",
    moduleSlugs: ["contractor-marketplace", "contract-management"],
    packageSlugs: ["objects-execution"],
    sourceOfTruth: [
      "prohelper/app/BusinessModules/Features/ContractorMarketplace",
      "prohelper_land/src/pages/dashboard/contractor-marketplace",
      "prohelper_admin/src/components/contractors",
    ],
    cta: "Подбор подрядчиков",
  },
  {
    id: "project-pulse",
    title: "Project Pulse",
    businessContour: "Управленческие сигналы",
    summary:
      "Пилотная функция собирает доступные факты по проектам, снабжению, финансам, людям, графику и заявкам в ежедневную сводку для руководителя.",
    publicClaim:
      "Сводка Project Pulse собирает зафиксированные сигналы и связывает каждый сигнал с исходным процессом. Решение и ответственного назначает пользователь.",
    audiences: [
      "Руководитель строительства",
      "Руководитель проекта",
      "Собственник или холдинг",
    ],
    outcomes: [
      "Сигнал содержит объект и источник зафиксированного факта.",
      "Сводка группирует сигналы для управленческой проверки.",
      "История хранит назначенное действие, ответственного и результат проверки.",
    ],
    surfaces: ["admin", "lk", "holding"],
    maturity: "early_access",
    moduleSlugs: ["ai-assistant", "dashboard-widgets", "reports"],
    packageSlugs: ["holding-analytics"],
    sourceOfTruth: [
      "prohelper/app/BusinessModules/Features/AIAssistant",
      "prohelper/app/BusinessModules/Features/ProjectManagement",
      "prohelper_land/src/components/multi-org",
    ],
    cta: "Обсудить пилот Project Pulse",
  },
];
