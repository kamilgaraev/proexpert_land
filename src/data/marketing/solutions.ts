import type { MarketingSolutionSegment } from '@/types/marketing';

export const marketingSolutionSegments: MarketingSolutionSegment[] = [
  {
    id: 'contractor',
    title: 'Подрядчик',
    audience: 'Команда, которой нужно быстро навести порядок по объектам и заявкам.',
    challenge:
      'Информация по объекту, снабжению, оплатам и площадке часто живет в разных каналах, поэтому руководителю сложно быстро увидеть реальную картину.',
    transformation:
      'МОСТ помогает собрать объект, заявки, документы и базовый финансовый поток в один рабочий контур без перегрузки лишними направлениями.',
    workflows: [
      'Проект и договоры в одной системе',
      'Заявки с объекта без потерь в переписках',
      'Базовое снабжение и движение материалов',
      'Платежи и акты в связке с проектом',
    ],
    surfaces: ['admin', 'mobile', 'lk'],
    capabilityIds: ['project-control', 'site-requests', 'supply-chain', 'finance-control'],
    recommendedPackageSlugs: ['objects-execution', 'supply-warehouse', 'finance-acts'],
    cta: 'Показать стартовый контур для подрядчика',
  },
  {
    id: 'general-contractor',
    title: 'Генподрядчик',
    audience: 'Организация, которой нужен контроль сразу по нескольким объектам и участникам процесса.',
    challenge:
      'Когда проектов становится больше, ручной сбор статусов, потребностей, качества, безопасности и финансовой информации начинает тормозить управление.',
    transformation:
      'Продукт собирает ключевые потоки по объектам в понятную модель для офиса, площадки, стройконтроля, ПТО и руководителя.',
    workflows: [
      'Контроль нескольких объектов',
      'Связка объекта, снабжения и финансов',
      'Качество, приемка и замечания',
      'Управленческая отчетность по проектам',
    ],
    surfaces: ['admin', 'mobile', 'lk'],
    capabilityIds: ['project-control', 'supply-chain', 'finance-control', 'quality-handover', 'analytics-control'],
    recommendedPackageSlugs: ['objects-execution', 'supply-warehouse', 'finance-acts', 'site-quality-handover', 'holding-analytics'],
    cta: 'Разобрать сценарий для генподрядчика',
  },
  {
    id: 'developer-holding',
    title: 'Девелопер / группа компаний',
    audience: 'Управляющая команда, которой нужна единая картина по нескольким организациям и объектам.',
    challenge:
      'На росте компании теряется прозрачность: информация разнесена по юрлицам, доступам, объектам, проектным решениям и отдельным таблицам.',
    transformation:
      'МОСТ помогает собрать корпоративный контур с разграничением доступа, ПИР, изменениями и сводной отчетностью без потери управляемости.',
    workflows: [
      'Сводная картина по структуре',
      'ПИР, RFI и изменения в проектном контуре',
      'Разделение доступа между организациями',
      'Корпоративная отчетность',
    ],
    surfaces: ['holding', 'admin', 'lk'],
    capabilityIds: ['analytics-control', 'multi-org', 'finance-control', 'pir-project-documentation', 'change-control'],
    recommendedPackageSlugs: ['holding-analytics', 'finance-acts', 'estimates-pto', 'change-control'],
    cta: 'Показать корпоративный контур',
  },
  {
    id: 'engineering',
    title: 'Инженерный блок / ПТО',
    audience: 'Команда, которая работает с ПИР, сметами, актами, ИД и подготовкой проекта.',
    challenge:
      'Проектные версии, замечания, сметы и документы часто собираются вручную, из-за чего подготовка комплектов и инженерной части затягивается.',
    transformation:
      'Продукт помогает навести порядок в ПИР, сметном и документном контуре и встроить его в общую модель проекта.',
    workflows: [
      'ПД, РД, IFC и проектные версии',
      'Сметная и исполнительная часть в связке с проектом',
      'Замечания, нормоконтроль и выпуск комплектов',
      'Пилотное подключение AI-сценариев по запросу',
    ],
    surfaces: ['admin', 'lk'],
    capabilityIds: ['pir-project-documentation', 'finance-control', 'project-control', 'change-control'],
    recommendedPackageSlugs: ['estimates-pto', 'finance-acts', 'objects-execution', 'change-control'],
    cta: 'Разобрать инженерный сценарий',
  },
  {
    id: 'quality-handover',
    title: 'Стройконтроль, качество и приемка',
    audience: 'Команда, которой нужно доводить дефекты до устранения, приемки зон и передачи результата.',
    challenge:
      'Дефекты, фото, повторные проверки, punch-list и ИД часто живут отдельно, поэтому риски сдачи видны слишком поздно.',
    transformation:
      'МОСТ связывает качество, дефекты, исполнительную документацию, punch-list и приемку в один управляемый маршрут.',
    workflows: [
      'Инспекции и дефекты с ответственными',
      'Повторная проверка и статусы устранения',
      'Приемка зон и punch-list',
      'Комплект сдачи объекта заказчику',
    ],
    surfaces: ['admin', 'mobile', 'lk'],
    capabilityIds: ['quality-handover', 'project-control', 'change-control'],
    recommendedPackageSlugs: ['site-quality-handover', 'objects-execution', 'change-control'],
    cta: 'Показать качество и приемку',
  },
  {
    id: 'safety',
    title: 'Охрана труда и безопасность',
    audience: 'Специалисты ОТ, генподрядчики и руководители, которым нужно видеть события безопасности по объектам.',
    challenge:
      'Инструктажи, допуски, нарушения, инциденты и предписания часто ведутся отдельно от проектного контроля и статусов площадки.',
    transformation:
      'Контур безопасности связывает события ОТ с объектом, участниками, сроками устранения и управленческим обзором.',
    workflows: [
      'Инструктажи и допуски',
      'Нарушения, инциденты и предписания',
      'Контроль устранения',
      'Отчеты HSE по объектам',
    ],
    surfaces: ['admin', 'mobile'],
    capabilityIds: ['construction-safety', 'project-control', 'workforce-control'],
    recommendedPackageSlugs: ['construction-safety', 'workforce-management', 'objects-execution'],
    cta: 'Показать охрану труда',
  },
  {
    id: 'resources',
    title: 'Техника, персонал и выработка',
    audience: 'Проекты, где техника, бригады, смены и фактическая выработка заметно влияют на себестоимость.',
    challenge:
      'Сменные рапорты, простои, ГСМ, наряды, трудозатраты и начисления часто сверяются вручную после закрытия периода.',
    transformation:
      'МОСТ собирает ресурсный факт по объектам и связывает его с объемами, сроками, бюджетом и подготовкой начислений.',
    workflows: [
      'Техника, смены, простои и ГСМ',
      'Наряды и фактическая выработка',
      'Персонал, бригады и трудозатраты',
      'Связь с начислениями и финансовым контуром',
    ],
    surfaces: ['admin', 'mobile'],
    capabilityIds: ['machinery-labor', 'workforce-control', 'finance-control'],
    recommendedPackageSlugs: ['machinery-and-labor', 'workforce-management', 'finance-acts'],
    cta: 'Показать ресурсный контур',
  },
  {
    id: 'changes',
    title: 'RFI, изменения и претензии',
    audience: 'Команда, которой важно не терять решения заказчика, основания и влияние изменений на проект.',
    challenge:
      'RFI, дополнительные работы и претензии часто остаются в переписке, а влияние на сроки, бюджет и документы фиксируется поздно.',
    transformation:
      'Контур изменений связывает вопрос, основание, решение заказчика, влияние на сроки и бюджет и историю согласований.',
    workflows: [
      'RFI и ответы',
      'Change orders и дополнительные работы',
      'Претензии и доказательная база',
      'Влияние на бюджет, сроки и документы',
    ],
    surfaces: ['admin', 'lk'],
    capabilityIds: ['change-control', 'finance-control', 'pir-project-documentation'],
    recommendedPackageSlugs: ['change-control', 'finance-acts', 'estimates-pto'],
    cta: 'Показать контур изменений',
  },
];
