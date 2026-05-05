import { describe, expect, it } from 'vitest';
import { publicPricingPlans, getPlanRegisterHref } from './pricingPlans';

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
    expect(enterprise?.isSelfService).toBe(false);
    expect(enterprise?.ctaHref).toBe('/contact');
  });
});
