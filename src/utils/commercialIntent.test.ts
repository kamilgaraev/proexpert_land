import { describe, expect, it } from 'vitest';
import { parseCommercialIntent, serializeCommercialIntent } from './commercialIntent';

describe('регистрационный коммерческий intent', () => {
  it('переносит только известные пакеты без активации тарифа', () => {
    expect(parseCommercialIntent('projects-processes,unknown,machinery')).toEqual([
      'projects-processes',
      'machinery',
    ]);
    expect(serializeCommercialIntent(['machinery', 'projects-processes'])).toBe(
      'machinery,projects-processes',
    );
  });

  it('поддерживает явное намерение подключить полный комплект', () => {
    expect(parseCommercialIntent('full-suite')).toEqual(['full-suite']);
  });
});
