import type { MarketingSolutionSegment } from "@/types/marketing";

export const marketingSolutionSegments: MarketingSolutionSegment[] = [
  {
    id: "contractor",
    title: "Подрядчик",
    audience:
      "Команда, которой нужно быстро навести порядок по объектам и заявкам.",
    challenge:
      "Информация по объекту, снабжению, оплатам и площадке часто живет в разных каналах, поэтому руководителю сложно быстро увидеть реальную картину.",
    transformation:
      "МОСТ связывает объект, задачи, заявки, документы, объемы работ и подготовку к оплате. Руководитель видит исполнение по бригадам и этапам.",
    workflows: [
      "Проект и договоры в одной системе",
      "Заявки с объекта без потерь в переписках",
      "Базовое снабжение и движение материалов",
      "Платежи и акты в связке с проектом",
    ],
    surfaces: ["admin", "mobile", "lk"],
    capabilityIds: [
      "project-control",
      "site-requests",
      "supply-chain",
      "finance-control",
    ],
    recommendedPackageSlugs: [
      "projects-processes",
      "supply-warehouse",
      "finance-contracts",
    ],
    cta: "Возможности для подрядчика",
  },
  {
    id: "general-contractor",
    title: "Генподрядчик",
    audience:
      "Организация, которой нужен контроль сразу по нескольким объектам и участникам процесса.",
    challenge:
      "Когда проектов становится больше, ручной сбор статусов, потребностей, качества, безопасности и финансовой информации начинает тормозить управление.",
    transformation:
      "Площадка передает фактические данные, ПТО и стройконтроль ведут документы и замечания, офис сопоставляет снабжение и финансы по объектам.",
    workflows: [
      "Контроль нескольких объектов",
      "Связка объекта, снабжения и финансов",
      "Качество, приемка и замечания",
      "Управленческая отчетность по проектам",
    ],
    surfaces: ["admin", "mobile", "lk"],
    capabilityIds: [
      "project-control",
      "supply-chain",
      "finance-control",
      "quality-handover",
      "analytics-control",
    ],
    recommendedPackageSlugs: [
      "projects-processes",
      "supply-warehouse",
      "finance-contracts",
      "quality-safety",
      "pto-handover",
    ],
    cta: "Решение для генподрядчика",
  },
  {
    id: "developer-holding",
    title: "Девелопер / группа компаний",
    audience:
      "Управляющая команда, которой нужна единая картина по нескольким организациям и объектам.",
    challenge:
      "На росте компании теряется прозрачность: информация разнесена по юрлицам, доступам, объектам, проектным решениям и отдельным таблицам.",
    transformation:
      "Организации, объекты и права пользователей разделены. Управляющая команда получает сводные данные по портфелю, срокам, изменениям и финансам.",
    workflows: [
      "Сводная картина по структуре",
      "ПИР, запросы информации и изменения проекта",
      "Разделение доступа между организациями",
      "Корпоративная отчетность",
    ],
    surfaces: ["holding", "admin", "lk"],
    capabilityIds: [
      "analytics-control",
      "multi-org",
      "finance-control",
      "pir-project-documentation",
      "change-control",
    ],
    recommendedPackageSlugs: [
      "projects-processes",
      "finance-contracts",
      "estimates-norms",
      "pto-handover",
    ],
    cta: "Решение для группы компаний",
  },
  {
    id: "engineering",
    title: "Инженерный блок / ПТО",
    audience:
      "Команда, которая работает с ПИР, сметами, актами, ИД и подготовкой проекта.",
    challenge:
      "Проектные версии, замечания, сметы и документы часто собираются вручную, из-за чего подготовка комплектов и инженерной части затягивается.",
    transformation:
      "Проектные версии, замечания, сметы и исполнительные документы относятся к объекту, разделу и ответственному сотруднику.",
    workflows: [
      "Проектная и рабочая документация, модели IFC и версии",
      "Сметная и исполнительная часть в связке с проектом",
      "Замечания, нормоконтроль и выпуск комплектов",
      "Пилотные функции искусственного интеллекта по запросу",
    ],
    surfaces: ["admin", "lk"],
    capabilityIds: [
      "pir-project-documentation",
      "finance-control",
      "project-control",
      "change-control",
    ],
    recommendedPackageSlugs: [
      "estimates-norms",
      "finance-contracts",
      "projects-processes",
      "pto-handover",
    ],
    cta: "Решение для ПТО",
  },
  {
    id: "quality-handover",
    title: "Стройконтроль, качество и приемка",
    audience:
      "Команда, которой нужно доводить дефекты до устранения, приемки зон и передачи результата.",
    challenge:
      "Дефекты, фото, повторные проверки, punch-list и ИД часто живут отдельно, поэтому риски сдачи видны слишком поздно.",
    transformation:
      "Инспекции, дефекты, повторные проверки, исполнительные документы и перечни замечаний связаны с зонами объекта и приемкой.",
    workflows: [
      "Инспекции и дефекты с ответственными",
      "Повторная проверка и статусы устранения",
      "Приемка зон и punch-list",
      "Комплект сдачи объекта заказчику",
    ],
    surfaces: ["admin", "mobile", "lk"],
    capabilityIds: ["quality-handover", "project-control", "change-control"],
    recommendedPackageSlugs: [
      "quality-safety",
      "pto-handover",
      "projects-processes",
    ],
    cta: "Функции качества и приемки",
  },
  {
    id: "safety",
    title: "Охрана труда и безопасность",
    audience:
      "Специалисты ОТ, генподрядчики и руководители, которым нужно видеть события безопасности по объектам.",
    challenge:
      "Инструктажи, допуски, нарушения, инциденты и предписания часто ведутся отдельно от проектного контроля и статусов площадки.",
    transformation:
      "Инструктажи, допуски, нарушения и предписания привязаны к объекту, участникам и срокам устранения.",
    workflows: [
      "Инструктажи и допуски",
      "Нарушения, инциденты и предписания",
      "Контроль устранения",
      "Отчёты по охране труда и безопасности объектов",
    ],
    surfaces: ["admin", "mobile"],
    capabilityIds: [
      "construction-safety",
      "project-control",
      "workforce-control",
    ],
    recommendedPackageSlugs: [
      "quality-safety",
      "workforce-output",
      "projects-processes",
    ],
    cta: "Функции охраны труда",
  },
  {
    id: "resources",
    title: "Техника, персонал и выработка",
    audience:
      "Проекты, где техника, бригады, смены и фактическая выработка заметно влияют на себестоимость.",
    challenge:
      "Сменные рапорты, простои, ГСМ, наряды, трудозатраты и начисления часто сверяются вручную после закрытия периода.",
    transformation:
      "Смены техники, простои, наряды, объемы и трудозатраты фиксируются по объектам и используются при подготовке начислений.",
    workflows: [
      "Техника, смены, простои и ГСМ",
      "Наряды и фактическая выработка",
      "Персонал, бригады и трудозатраты",
      "Связь с начислениями и финансовыми данными",
    ],
    surfaces: ["admin", "mobile"],
    capabilityIds: ["machinery-labor", "workforce-control", "finance-control"],
    recommendedPackageSlugs: [
      "machinery",
      "workforce-output",
      "finance-contracts",
    ],
    cta: "Функции учета ресурсов",
  },
  {
    id: "changes",
    title: "Запросы информации, изменения и претензии",
    audience:
      "Команда, которой важно не терять решения заказчика, основания и влияние изменений на проект.",
    challenge:
      "Запросы информации, дополнительные работы и претензии часто остаются в переписке, а влияние на сроки, бюджет и документы фиксируется поздно.",
    transformation:
      "Запрос информации, основание, решение заказчика и влияние на сроки или бюджет сохраняются вместе с документами и согласованиями.",
    workflows: [
      "Запросы информации и ответы",
      "Change orders и дополнительные работы",
      "Претензии и доказательная база",
      "Влияние на бюджет, сроки и документы",
    ],
    surfaces: ["admin", "lk"],
    capabilityIds: [
      "change-control",
      "finance-control",
      "pir-project-documentation",
    ],
    recommendedPackageSlugs: [
      "projects-processes",
      "finance-contracts",
      "pto-handover",
    ],
    cta: "Функции управления изменениями",
  },
];
