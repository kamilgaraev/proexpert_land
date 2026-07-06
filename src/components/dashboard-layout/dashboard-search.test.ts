import { describe, expect, it } from 'vitest';

import {
  buildDashboardSearchItems,
  findDashboardSearchItems,
  getDashboardProjectSearchHref,
} from './dashboard-search';

describe('dashboard search', () => {
  const navigation = [
    {
      name: 'Главная',
      href: '/dashboard',
      description: 'Сводная статистика и стартовые сценарии',
    },
    {
      name: 'Проекты',
      href: '/dashboard/projects',
      description: 'Проекты вашей организации',
    },
    {
      name: 'Оплата и тариф',
      href: '/dashboard/billing',
      description: 'Баланс, тарифы и лимиты',
    },
    {
      name: 'Подрядчики',
      href: '/dashboard/contractor-invitations',
      description: 'Приглашения и совместная работа',
    },
  ];

  it('finds dashboard sections by label and description', () => {
    const items = buildDashboardSearchItems({ navigation });

    expect(findDashboardSearchItems(items, 'проекты')[0]?.href).toBe('/dashboard/projects');
    expect(findDashboardSearchItems(items, 'баланс')[0]?.href).toBe('/dashboard/billing');
  });

  it('finds merged organization page by work directions alias', () => {
    const items = buildDashboardSearchItems({
      navigation: [
        {
          name: 'Данные компании',
          href: '/dashboard/organization',
          description: 'Реквизиты, верификация и направления работы',
          aliases: ['направления работы', 'специализации'],
        },
      ],
    });

    expect(findDashboardSearchItems(items, 'направления')[0]?.href).toBe(
      '/dashboard/organization'
    );
  });

  it('adds contextual routes only when the parent section is visible', () => {
    const items = buildDashboardSearchItems({ navigation });

    expect(findDashboardSearchItems(items, 'партнеры')[0]?.href).toBe(
      '/dashboard/contractor-referral-program'
    );
    expect(findDashboardSearchItems(items, 'лимиты')[0]?.href).toBe('/dashboard/limits');
  });

  it('keeps account navigation but excludes logout links', () => {
    const items = buildDashboardSearchItems({
      navigation: [],
      userNavigation: [
        { name: 'Мой профиль', href: '/dashboard/profile' },
        { name: 'Выйти', href: '/login' },
      ],
    });

    expect(findDashboardSearchItems(items, 'профиль')[0]?.href).toBe('/dashboard/profile');
    expect(findDashboardSearchItems(items, 'выйти')).toHaveLength(0);
  });

  it('builds project search fallback href', () => {
    expect(getDashboardProjectSearchHref('  проект 180  ')).toBe(
      '/dashboard/projects?search=%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82%20180'
    );
  });
});
