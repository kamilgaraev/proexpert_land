import { describe, expect, it } from 'vitest';
import { marketingPackages, marketingSalesOffers } from './packages';

describe('marketing pricing packages', () => {
  it('publishes eleven paid commercial contours with client-facing names', () => {
    expect(marketingPackages.map((item) => item.slug)).toEqual([
      'objects-execution',
      'supply-warehouse',
      'finance-acts',
      'estimates-pto',
      'holding-analytics',
      'ai-contour',
      'site-quality-handover',
      'construction-safety',
      'machinery-and-labor',
      'workforce-management',
      'change-control',
    ]);

    expect(marketingPackages.every((item) => item.tiers.every((tier) => tier.price > 0))).toBe(true);
    expect(marketingPackages.flatMap((item) => item.tiers).every((tier) => tier.businessOutcome)).toBe(true);
  });

  it('publishes package v2 business sections for every contour', () => {
    for (const item of marketingPackages) {
      expect(item.foundationModules.length).toBeGreaterThan(0);
      expect(item.businessOutcomes.length).toBeGreaterThan(0);
      expect(item.tiers.every((tier) => tier.includedModules.length > 0)).toBe(true);
    }

    const objectsPackage = marketingPackages.find((item) => item.slug === 'objects-execution');
    expect(objectsPackage?.integrations.map((item) => item.label)).toContain('Склад и заявки с объекта');
    expect(objectsPackage?.recommendedAddons.map((item) => item.label)).toContain('Видео с площадки');

    const analyticsPackage = marketingPackages.find((item) => item.slug === 'holding-analytics');
    expect(analyticsPackage?.dataSources.map((item) => item.label)).toContain('Дашборды');

    const aiPackage = marketingPackages.find((item) => item.slug === 'ai-contour');
    expect(aiPackage?.capabilities.map((item) => item.label)).toContain('Вопросы по объектам');

    const qualityPackage = marketingPackages.find((item) => item.slug === 'site-quality-handover');
    expect(qualityPackage?.dataSources.map((item) => item.moduleSlug)).toEqual(
      expect.arrayContaining(['quality-control', 'handover-acceptance', 'executive-documentation']),
    );

    const safetyPackage = marketingPackages.find((item) => item.slug === 'construction-safety');
    expect(safetyPackage?.dataSources.map((item) => item.moduleSlug)).toContain('safety-management');
  });

  it('keeps newly released backend modules visible in public package tiers', () => {
    const bySlug = new Map(marketingPackages.map((item) => [item.slug, item]));

    expect(bySlug.get('estimates-pto')?.tiers[1].moduleSlugs).toContain('design-management');
    expect(bySlug.get('site-quality-handover')?.tiers[0].moduleSlugs).toEqual(
      expect.arrayContaining(['quality-control', 'handover-acceptance']),
    );
    expect(bySlug.get('site-quality-handover')?.tiers[1].moduleSlugs).toContain('executive-documentation');
    expect(bySlug.get('construction-safety')?.tiers[0].moduleSlugs).toContain('safety-management');
    expect(bySlug.get('machinery-and-labor')?.tiers[0].moduleSlugs).toEqual(
      expect.arrayContaining(['machinery-operations', 'production-labor']),
    );
    expect(bySlug.get('workforce-management')?.tiers[0].moduleSlugs).toEqual(
      expect.arrayContaining(['workforce-management', 'production-labor']),
    );
    expect(bySlug.get('change-control')?.tiers[0].moduleSlugs).toContain('change-management');
  });

  it('keeps package tiers cheaper than buying modules separately', () => {
    const allDiscounts = marketingPackages.flatMap((item) =>
      item.tiers
        .filter((tier) => tier.standalonePrice > 0)
        .map((tier) => Math.round((1 - tier.price / tier.standalonePrice) * 100)),
    );

    expect(Math.min(...allDiscounts)).toBeGreaterThanOrEqual(15);
    expect(Math.max(...allDiscounts)).toBeLessThanOrEqual(25);
  });

  it('defines three sales offers around subscription plus packages', () => {
    expect(marketingSalesOffers).toHaveLength(3);
    expect(marketingSalesOffers.map((offer) => offer.title)).toEqual([
      'Малый подрядчик',
      'Растущая строительная компания',
      'Генподряд или холдинг',
    ]);
    expect(marketingSalesOffers[1].planSlug).toBe('business');
    expect(marketingSalesOffers[1].priceLabel).toBe('от 24 900 ₽/мес');
    expect(marketingSalesOffers[2].planName).toBe('Enterprise Конструктор');
    expect(marketingSalesOffers[2].priceLabel).toBe('от 99 000 ₽/мес');
    expect(marketingSalesOffers[2].isConsultative).toBe(false);
  });

  it('does not publish retired internal module slugs', () => {
    const moduleSlugs = marketingPackages.flatMap((item) =>
      item.tiers.flatMap((tier) => tier.moduleSlugs),
    );

    expect(moduleSlugs).not.toContain('advanced-reports');
    expect(moduleSlugs).not.toContain('advanced-dashboard');
    expect(moduleSlugs).not.toContain('basic-reports');
    expect(moduleSlugs).not.toContain('acts');
    expect(moduleSlugs).not.toContain('advance-requests');
    expect(moduleSlugs).not.toContain('estimates');
    expect(moduleSlugs).not.toContain('engineering-documents');
    expect(moduleSlugs).not.toContain('analytics');
    expect(moduleSlugs).not.toContain('reporting');
    expect(moduleSlugs).not.toContain('holding-dashboard');
  });
});
