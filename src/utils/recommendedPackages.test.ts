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
      ['working-entry', 'Рабочий вход'],
      ['supply-warehouse', 'Снабжение и склад'],
      ['sales-contractors', 'Продажи и подрядчики'],
    ]);
  });

  it('покрывает рабочий вход и семь контуров единым сопоставлением', () => {
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
      'working-entry',
      'supply-warehouse',
      'finance-contracts',
      'pto-handover',
      'quality-safety',
      'workforce-output',
      'machinery',
      'sales-contractors',
    ]);
  });
});
