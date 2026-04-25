import { describe, expect, it } from 'vitest';
import { marketingPackages, marketingSalesOffers } from './packages';

describe('marketing pricing packages', () => {
  it('publishes six paid commercial contours with client-facing names', () => {
    expect(marketingPackages.map((item) => item.slug)).toEqual([
      'objects-execution',
      'supply-warehouse',
      'finance-acts',
      'estimates-pto',
      'holding-analytics',
      'ai-contour',
    ]);

    expect(marketingPackages.every((item) => item.tiers.every((tier) => tier.price > 0))).toBe(true);
    expect(marketingPackages.flatMap((item) => item.tiers).every((tier) => tier.businessOutcome)).toBe(true);
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
    expect(marketingSalesOffers[2].isConsultative).toBe(true);
  });

  it('does not publish retired internal module slugs', () => {
    const moduleSlugs = marketingPackages.flatMap((item) =>
      item.tiers.flatMap((tier) => tier.moduleSlugs),
    );

    expect(moduleSlugs).not.toContain('advanced-reports');
    expect(moduleSlugs).not.toContain('advanced-dashboard');
    expect(moduleSlugs).not.toContain('basic-reports');
  });
});
