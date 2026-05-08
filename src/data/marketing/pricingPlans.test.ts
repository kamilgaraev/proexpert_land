import { describe, expect, it } from 'vitest';
import { publicPricingPlans, getPlanRegisterHref, enterpriseConstructorMarketing } from './pricingPlans';

describe('publicPricingPlans', () => {
  it('contains self-service plans with registration links', () => {
    const business = publicPricingPlans.find((plan) => plan.slug === 'business');

    expect(business).toBeDefined();
    expect(business?.isSelfService).toBe(true);
    expect(getPlanRegisterHref('business')).toBe('/register?plan=business');
  });

  it('keeps enterprise as contact-led plan', () => {
    const enterprise = publicPricingPlans.find((plan) => plan.slug === 'enterprise');

    expect(enterprise).toBeDefined();
    expect(enterprise?.title).toBe('Enterprise Конструктор');
    expect(enterprise?.priceLabel).toBe('от 99 000 ₽');
    expect(enterprise?.isSelfService).toBe(true);
    expect(enterprise?.ctaHref).toBe('/pricing#enterprise-constructor');
  });

  it('matches the market-ready pricing model', () => {
    expect(publicPricingPlans.map((plan) => [plan.slug, plan.priceLabel, plan.userLimitLabel])).toEqual([
      ['free', '0 ₽', 'до 3 пользователей'],
      ['start', '4 900 ₽', 'до 5 пользователей'],
      ['business', '19 900 ₽', 'до 10 пользователей'],
      ['profi', '29 900 ₽', 'до 30 пользователей'],
      ['enterprise', 'от 99 000 ₽', 'от 100 пользователей'],
    ]);
  });

  it('keeps enterprise constructor labels business-readable', () => {
    const text = [
      enterpriseConstructorMarketing.title,
      enterpriseConstructorMarketing.priceLabel,
      ...enterpriseConstructorMarketing.baseOptions,
      ...enterpriseConstructorMarketing.extensions,
      enterpriseConstructorMarketing.standardCta,
      enterpriseConstructorMarketing.implementationCta,
    ].join(' ');

    expect(text).toContain('Дополнительные организации');
    expect(text).toContain('Рассчитать стоимость');
    expect(text).not.toMatch(/\b(slug|payload|override|self-service|null|DTO|API|SQL)\b/i);
  });
});
