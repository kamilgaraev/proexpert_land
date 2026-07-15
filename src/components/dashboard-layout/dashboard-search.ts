import type { ElementType } from 'react';

export interface DashboardNavigationItem {
  name: string;
  href: string;
  icon?: ElementType;
  description?: string;
  visible?: boolean;
  badge?: number | string;
  aliases?: string[];
}

export interface DashboardUserNavigationItem {
  name: string;
  href: string;
  description?: string;
  aliases?: string[];
  onClick?: () => void;
}

export interface DashboardSearchItem {
  name: string;
  href: string;
  description?: string;
  aliases: string[];
  priority: number;
}

interface BuildDashboardSearchItemsOptions {
  navigation: DashboardNavigationItem[];
  supportNavigation?: DashboardNavigationItem[];
  userNavigation?: DashboardUserNavigationItem[];
}

interface ContextualSearchItem extends DashboardSearchItem {
  requireHref?: string;
}

const contextualSearchItems: ContextualSearchItem[] = [
  {
    name: 'Уведомления',
    href: '/dashboard/notifications',
    description: 'Оповещения, события и новые действия',
    aliases: ['оповещения', 'колокольчик', 'сообщения'],
    priority: 70,
  },
  {
    name: 'Поддержка',
    href: '/dashboard/support',
    description: 'Обращения в поддержку и помощь по кабинету',
    aliases: ['обращение', 'заявка в поддержку', 'помощь'],
    priority: 68,
  },
  {
    name: 'Вопросы и ответы',
    href: '/dashboard/faq',
    description: 'Ответы на частые вопросы',
    aliases: ['faq', 'частые вопросы', 'справка'],
    priority: 62,
  },
  {
    name: 'Пакеты и оплата',
    href: '/dashboard/billing',
    description: 'Пакеты, оплата и история',
    aliases: ['пакеты', 'оплата', 'история', 'автопродление'],
    priority: 60,
    requireHref: '/dashboard/billing',
  },
  {
    name: 'Пробный доступ',
    href: '/dashboard/billing',
    description: 'Пробный доступ к бизнес-пакетам',
    aliases: ['пробный доступ', 'пакеты', '3 дня'],
    priority: 58,
    requireHref: '/dashboard/billing',
  },
  {
    name: 'Партнеры и бонусы',
    href: '/dashboard/contractor-referral-program',
    description: 'Партнерская программа и бонусы за приглашения',
    aliases: ['бонусы', 'партнерская программа', 'пригласить подрядчика'],
    priority: 58,
    requireHref: '/dashboard/contractor-invitations',
  },
];

export const normalizeDashboardSearchValue = (value: string) =>
  value
    .toLocaleLowerCase('ru-RU')
    .replace(/ё/g, 'е')
    .replace(/\s+/g, ' ')
    .trim();

const isDashboardHref = (href: string) =>
  href.startsWith('/dashboard') || href.startsWith('/landing/multi-organization');

const toSearchItem = (
  item: DashboardNavigationItem | DashboardUserNavigationItem,
  priority: number
): DashboardSearchItem | null => {
  if (!isDashboardHref(item.href)) {
    return null;
  }

  return {
    name: item.name,
    href: item.href,
    description: item.description,
    aliases: item.aliases ?? [],
    priority,
  };
};

const mergeSearchItem = (
  itemsByHref: Map<string, DashboardSearchItem>,
  item: DashboardSearchItem | null
) => {
  if (!item) {
    return;
  }

  const existingItem = itemsByHref.get(item.href);

  if (!existingItem) {
    itemsByHref.set(item.href, item);
    return;
  }

  itemsByHref.set(item.href, {
    ...existingItem,
    name: existingItem.name || item.name,
    description: existingItem.description || item.description,
    aliases: Array.from(new Set([...existingItem.aliases, ...item.aliases])),
    priority: Math.max(existingItem.priority, item.priority),
  });
};

export const buildDashboardSearchItems = ({
  navigation,
  supportNavigation = [],
  userNavigation = [],
}: BuildDashboardSearchItemsOptions): DashboardSearchItem[] => {
  const itemsByHref = new Map<string, DashboardSearchItem>();
  const navigationHrefs = new Set(navigation.map((item) => item.href));

  navigation.forEach((item) => mergeSearchItem(itemsByHref, toSearchItem(item, 100)));
  supportNavigation.forEach((item) => mergeSearchItem(itemsByHref, toSearchItem(item, 80)));
  userNavigation.forEach((item) => mergeSearchItem(itemsByHref, toSearchItem(item, 75)));

  contextualSearchItems.forEach((item) => {
    if (item.requireHref && !navigationHrefs.has(item.requireHref)) {
      return;
    }

    mergeSearchItem(itemsByHref, item);
  });

  return Array.from(itemsByHref.values()).sort(
    (first, second) => second.priority - first.priority || first.name.localeCompare(second.name, 'ru')
  );
};

const getSearchScore = (item: DashboardSearchItem, query: string) => {
  const name = normalizeDashboardSearchValue(item.name);
  const description = normalizeDashboardSearchValue(item.description ?? '');
  const aliases = item.aliases.map(normalizeDashboardSearchValue);
  const href = normalizeDashboardSearchValue(item.href.replace(/[-/]/g, ' '));
  const haystack = [name, description, href, ...aliases].join(' ');
  const queryWords = query.split(' ').filter(Boolean);

  if (name === query) {
    return 1000;
  }

  if (name.startsWith(query)) {
    return 900;
  }

  if (aliases.some((alias) => alias === query || alias.startsWith(query))) {
    return 850;
  }

  if (description.startsWith(query)) {
    return 700;
  }

  if (queryWords.every((word) => haystack.includes(word))) {
    return 500;
  }

  return 0;
};

export const findDashboardSearchItems = (
  items: DashboardSearchItem[],
  query: string,
  limit = 6
) => {
  const normalizedQuery = normalizeDashboardSearchValue(query);

  if (!normalizedQuery) {
    return [];
  }

  return items
    .map((item) => ({
      item,
      score: getSearchScore(item, normalizedQuery),
    }))
    .filter(({ score }) => score > 0)
    .sort(
      (first, second) =>
        second.score - first.score ||
        second.item.priority - first.item.priority ||
        first.item.name.localeCompare(second.item.name, 'ru')
    )
    .slice(0, limit)
    .map(({ item }) => item);
};

export const getDashboardProjectSearchHref = (query: string) =>
  `/dashboard/projects?search=${encodeURIComponent(query.trim())}`;
