import { marketingPaths } from './common';

export type PublicPricingPlanSlug = 'free' | 'start' | 'business' | 'profi' | 'enterprise';

export interface PublicPricingPlan {
  slug: PublicPricingPlanSlug;
  title: string;
  priceLabel: string;
  ctaHref: string;
  isSelfService: boolean;
  isFeatured?: boolean;
}

export const getPlanRegisterHref = (slug: PublicPricingPlanSlug): string => `/register?plan=${slug}`;

export const publicPricingPlans: PublicPricingPlan[] = [
  {
    slug: 'free',
    title: 'Free',
    priceLabel: '0 ₽',
    ctaHref: getPlanRegisterHref('free'),
    isSelfService: true,
  },
  {
    slug: 'start',
    title: 'Start',
    priceLabel: '4 900 ₽',
    ctaHref: getPlanRegisterHref('start'),
    isSelfService: true,
  },
  {
    slug: 'business',
    title: 'Business',
    priceLabel: '9 900 ₽',
    ctaHref: getPlanRegisterHref('business'),
    isSelfService: true,
    isFeatured: true,
  },
  {
    slug: 'profi',
    title: 'Profi',
    priceLabel: '19 900 ₽',
    ctaHref: getPlanRegisterHref('profi'),
    isSelfService: true,
  },
  {
    slug: 'enterprise',
    title: 'Enterprise',
    priceLabel: 'от 49 900 ₽',
    ctaHref: marketingPaths.contact,
    isSelfService: false,
  },
];
