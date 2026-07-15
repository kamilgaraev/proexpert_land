import { describe, expect, it } from 'vitest';
import { getRecommendedPackages } from './recommendedPackages';

describe('рекомендации коммерческих пакетов', () => {
  it('преобразует серверные модули в настоящие пакеты и удаляет повторы', () => {
    const packages = getRecommendedPackages([
      'project-management',
      { value: 'site-requests', label: 'Заявки с объекта' },
      'workflow-management',
      'schedule-management',
      'basic-warehouse',
      'procurement',
      'contractor-portal',
    ]);

    expect(packages.map(({ slug, name }) => [slug, name])).toEqual([
      ['projects-processes', 'Проекты и процессы'],
      ['planning-schedules', 'Графики и планирование'],
      ['supply-warehouse', 'Снабжение и склад'],
      ['sales-contractors', 'Продажи и подрядчики'],
    ]);
  });

  it('покрывает все десять коммерческих пакетов единым сопоставлением', () => {
    const packages = getRecommendedPackages([
      'project-management',
      'schedule-management',
      'rate-management',
      'safety-management',
      'executive-documentation',
      'procurement',
      'budgeting',
      'time-tracking',
      'machinery-operations',
      'crm',
    ]);

    expect(packages.map((item) => item.slug)).toEqual([
      'projects-processes',
      'planning-schedules',
      'estimates-norms',
      'quality-safety',
      'pto-handover',
      'supply-warehouse',
      'finance-contracts',
      'workforce-output',
      'machinery',
      'sales-contractors',
    ]);
  });
});
