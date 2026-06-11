import { describe, expect, it } from 'vitest';
import { getMarketingModuleLabel } from './PackageFamilyCard';

describe('PackageFamilyCard module labels', () => {
  it('does not expose raw module slugs', () => {
    const labels = [
      getMarketingModuleLabel('project-management'),
      getMarketingModuleLabel('basic-warehouse'),
      getMarketingModuleLabel('design-management'),
      getMarketingModuleLabel('safety-management'),
      getMarketingModuleLabel('machinery-operations'),
      getMarketingModuleLabel('change-management'),
      getMarketingModuleLabel('crm'),
      getMarketingModuleLabel('unknown-module-slug'),
    ];

    expect(labels).toEqual([
      'Управление проектами',
      'Складской учет',
      'ПИР и проектная документация',
      'Охрана труда',
      'Техника и механизмы',
      'Изменения и претензии',
      'CRM и продажи',
      'Возможность ProHelper',
    ]);
    expect(labels.join(' ')).not.toMatch(/[a-z]+-[a-z-]+/);
  });
});
