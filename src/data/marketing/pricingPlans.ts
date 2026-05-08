import { marketingPaths } from './common';

export type PublicPricingPlanSlug = 'free' | 'start' | 'business' | 'profi' | 'enterprise';

export interface PublicPricingPlan {
  slug: PublicPricingPlanSlug;
  title: string;
  priceLabel: string;
  userLimitLabel: string;
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
    userLimitLabel: 'до 3 пользователей',
    ctaHref: getPlanRegisterHref('free'),
    isSelfService: true,
  },
  {
    slug: 'start',
    title: 'Start',
    priceLabel: '4 900 ₽',
    userLimitLabel: 'до 5 пользователей',
    ctaHref: getPlanRegisterHref('start'),
    isSelfService: true,
  },
  {
    slug: 'business',
    title: 'Business',
    priceLabel: '19 900 ₽',
    userLimitLabel: 'до 10 пользователей',
    ctaHref: getPlanRegisterHref('business'),
    isSelfService: true,
    isFeatured: true,
  },
  {
    slug: 'profi',
    title: 'Profi',
    priceLabel: '29 900 ₽',
    userLimitLabel: 'до 30 пользователей',
    ctaHref: getPlanRegisterHref('profi'),
    isSelfService: true,
  },
  {
    slug: 'enterprise',
    title: 'Enterprise Конструктор',
    priceLabel: 'от 99 000 ₽',
    userLimitLabel: 'от 100 пользователей',
    ctaHref: `${marketingPaths.pricing}#enterprise-constructor`,
    isSelfService: true,
  },
];

export const enterpriseConstructorMarketing = {
  title: 'Enterprise Конструктор',
  priceLabel: 'от 99 000 ₽',
  baseOptions: [
    '100 пользователей',
    '100 проектов',
    '50 ГБ хранилища',
    '2 000 AI-запросов',
  ],
  extensions: [
    'Расширение команды до 250 пользователей',
    'Дополнительные организации',
    'Дополнительное хранилище',
    'Расширенный AI',
    'Приоритетная поддержка',
    'Сложное внедрение',
  ],
  standardCta: 'Рассчитать стоимость',
  implementationCta: 'Подготовить проект внедрения',
};
