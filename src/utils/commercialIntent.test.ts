import { beforeEach, describe, expect, it } from 'vitest';
import {
  commercialIntentStorageKey,
  consumeCommercialIntent,
  parseCommercialIntent,
  rememberCommercialIntent,
  serializeCommercialIntent,
} from './commercialIntent';

describe('регистрационный коммерческий intent', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('переносит только известные пакеты без активации тарифа', () => {
    expect(parseCommercialIntent('projects-processes,planning-schedules,pto-handover,unknown,machinery')).toEqual([
      'working-entry',
      'machinery',
    ]);
    expect(serializeCommercialIntent(['machinery', 'working-entry'])).toBe(
      'machinery,working-entry',
    );
  });

  it('поддерживает явное намерение подключить полный комплект', () => {
    expect(parseCommercialIntent('full-suite')).toEqual(['full-suite']);
  });

  it('очищает устаревшее намерение при пустом выборе', () => {
    window.sessionStorage.setItem(commercialIntentStorageKey, 'machinery');

    rememberCommercialIntent([]);

    expect(window.sessionStorage.getItem(commercialIntentStorageKey)).toBeNull();
  });

  it('отдает валидное намерение только один раз и сразу удаляет его', () => {
    window.sessionStorage.setItem(
      commercialIntentStorageKey,
      'projects-processes,unknown,machinery',
    );

    expect(consumeCommercialIntent()).toEqual(['working-entry', 'machinery']);
    expect(window.sessionStorage.getItem(commercialIntentStorageKey)).toBeNull();
    expect(consumeCommercialIntent()).toEqual([]);
  });

  it('удаляет поврежденное намерение при попытке чтения', () => {
    window.sessionStorage.setItem(commercialIntentStorageKey, 'unknown');

    expect(consumeCommercialIntent()).toEqual([]);
    expect(window.sessionStorage.getItem(commercialIntentStorageKey)).toBeNull();
  });
});
