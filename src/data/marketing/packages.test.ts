import { describe, expect, it } from 'vitest';
import {
  commercialPackages,
  fullSuiteOffer,
  getCommercialSelection,
  marketingPackageCatalogSource,
} from './packages';

describe('коммерческий каталог пакетов', () => {
  it('точно отражает серверный каталог из десяти пакетов', () => {
    expect(marketingPackageCatalogSource).toBe('Backend МОСТ: GET /api/v1/landing/packages');
    expect(commercialPackages.map(({ slug, name, price }) => [slug, name, price])).toEqual([
      ['projects-processes', 'Проекты и процессы', 9_900],
      ['planning-schedules', 'Графики и планирование', 7_900],
      ['estimates-norms', 'Сметы и нормы', 12_900],
      ['quality-safety', 'Качество и безопасность', 9_900],
      ['pto-handover', 'ПТО и сдача', 11_900],
      ['supply-warehouse', 'Снабжение и склад', 11_900],
      ['finance-contracts', 'Финансы и договоры', 12_900],
      ['workforce-output', 'Персонал и выработка', 9_900],
      ['machinery', 'Техника и механизмы', 7_900],
      ['sales-contractors', 'Продажи и подрядчики', 7_900],
    ]);
  });

  it('фиксирует цену и экономию полного комплекта', () => {
    const separateTotal = commercialPackages.reduce((sum, item) => sum + item.price, 0);

    expect(separateTotal).toBe(103_000);
    expect(fullSuiteOffer.price).toBe(79_900);
    expect(fullSuiteOffer.savings).toBe(23_100);
    expect(fullSuiteOffer.savingsPercent).toBe(22.43);
    expect(fullSuiteOffer.billingPeriodDays).toBe(30);
  });

  it('рекомендует полный комплект с восьми пакетов, но не меняет выбор', () => {
    const slugs = commercialPackages.slice(0, 8).map((item) => item.slug);
    const selection = getCommercialSelection(slugs);

    expect(selection.selectedSlugs).toEqual(slugs);
    expect(selection.total).toBe(87_200);
    expect(selection.recommendFullSuite).toBe(true);
    expect(selection.isFullSuite).toBe(false);
  });
});
