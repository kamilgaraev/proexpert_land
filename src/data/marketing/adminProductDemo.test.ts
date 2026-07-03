import { describe, expect, it } from 'vitest';
import {
  adminProductDemoDisclaimer,
  adminProductDemoFlows,
  adminProductDemoModules,
} from './adminProductDemo';

describe('admin product demo content', () => {
  it('shows exactly ten core modules', () => {
    expect(adminProductDemoModules).toHaveLength(10);
  });

  it('uses unique module ids', () => {
    const ids = adminProductDemoModules.map((module) => module.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps every flow linked to existing modules', () => {
    const ids = new Set(adminProductDemoModules.map((module) => module.id));

    for (const flow of adminProductDemoFlows) {
      expect(flow.modules.length).toBeGreaterThanOrEqual(2);

      for (const moduleId of flow.modules) {
        expect(ids.has(moduleId)).toBe(true);
      }
    }
  });

  it('keeps every module grounded in business outcome', () => {
    for (const module of adminProductDemoModules) {
      expect(module.businessOutcome.length).toBeGreaterThan(20);
      expect(module.rows.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('makes demo data explicit to avoid misleading visitors', () => {
    expect(adminProductDemoDisclaimer).toContain('сокращенный пример');
    expect(adminProductDemoDisclaimer).toContain('В личном кабинете МОСТ больше деталей');
    expect(adminProductDemoDisclaimer).toContain('данные вашей компании');
  });
});
