import type { MarketingSolutionSegment } from '@/types/marketing';

export const marketingSolutionSegments: MarketingSolutionSegment[] = [
  {
    id: 'contractor',
    title: 'Подрядчик',
    audience: 'Команда, которой нужно быстро навести порядок по объектам и заявкам.',
    challenge:
      'Информация по объекту, снабжению и оплатам часто живет в разных каналах, поэтому руководителю сложно быстро увидеть реальную картину.',
    transformation:
      'ProHelper помогает собрать объект, заявки, документы и базовый финансовый поток в один рабочий контур без перегрузки лишними модулями.',
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
      'Когда проектов становится больше, ручной сбор статусов, потребностей и финансовой информации начинает тормозить управление.',
    transformation:
      'Продукт собирает ключевые потоки по объектам в понятную модель для офиса, площадки и руководителя.',
    workflows: [
      'Контроль нескольких объектов',
      'Связка объекта, снабжения и финансов',
      'Сводная картина по задачам и статусам',
      'Управленческая отчетность по проектам',
    ],
    surfaces: ['admin', 'mobile', 'lk'],
    capabilityIds: ['project-control', 'supply-chain', 'finance-control', 'analytics-control'],
    recommendedPackageSlugs: ['objects-execution', 'supply-warehouse', 'finance-acts', 'holding-analytics'],
    cta: 'Разобрать сценарий для генподрядчика',
  },
  {
    id: 'developer-holding',
    title: 'Девелопер / группа компаний',
    audience: 'Управляющая команда, которой нужна единая картина по нескольким организациям и объектам.',
    challenge:
      'На росте компании теряется прозрачность: информация разнесена по юрлицам, доступам, объектам и отдельным таблицам.',
    transformation:
      'ProHelper помогает собрать корпоративный контур с разграничением доступа и сводной отчетностью без потери управляемости.',
    workflows: [
      'Сводная картина по структуре',
      'Разделение доступа между организациями',
      'Корпоративная отчетность',
      'Масштабирование без повторного внедрения с нуля',
    ],
    surfaces: ['holding', 'admin', 'lk'],
    capabilityIds: ['analytics-control', 'multi-org', 'finance-control'],
    recommendedPackageSlugs: ['holding-analytics', 'finance-acts'],
    cta: 'Показать корпоративный контур',
  },
  {
    id: 'engineering',
    title: 'Инженерный блок / ПТО',
    audience: 'Команда, которая работает с документами, актами, сметами и подготовкой проекта.',
    challenge:
      'Документы и версии часто собираются вручную, из-за чего подготовка актов и инженерной части затягивается.',
    transformation:
      'Продукт помогает навести порядок в документном контуре и встроить его в общую модель проекта.',
    workflows: [
      'Документы и версии в одном процессе',
      'Связка сметной и исполнительной части с проектом',
      'Подготовка актов и сопроводительных документов',
      'Пилотное подключение AI-сценариев по запросу',
    ],
    surfaces: ['admin'],
    capabilityIds: ['engineering-docs', 'finance-control', 'project-control'],
    recommendedPackageSlugs: ['estimates-pto', 'finance-acts', 'objects-execution'],
    cta: 'Разобрать документный сценарий',
  },
];
