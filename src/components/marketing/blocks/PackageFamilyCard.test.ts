import { describe, expect, it } from 'vitest';
import { getMarketingModuleLabel } from './PackageFamilyCard';

describe('PackageFamilyCard module labels', () => {
  it('does not expose raw module slugs', () => {
    const labels = [
      getMarketingModuleLabel('project-management'),
      getMarketingModuleLabel('basic-warehouse'),
      getMarketingModuleLabel('unknown-module-slug'),
    ];

    expect(labels).toEqual([
      'Управление проектами',
      'Складской учет',
      'Возможность ProHelper',
    ]);
    expect(labels.join(' ')).not.toMatch(/[a-z]+-[a-z-]+/);
  });
});
