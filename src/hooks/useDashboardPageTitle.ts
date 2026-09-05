import { usePageTitle } from './useSEO';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Личный кабинет',
  '/dashboard/profile': 'Мой профиль',
  '/dashboard/settings': 'Настройки кабинета',
  '/dashboard/help': 'Помощь',
  '/dashboard/help/knowledge': 'Инструкции',
  '/dashboard/help/changelog': 'Что изменилось',
  '/dashboard/support': 'Поддержка',
  '/dashboard/faq': 'Вопросы и ответы',
  '/dashboard/notifications': 'Уведомления',
  '/dashboard/billing': 'Пакеты и оплата',
  '/dashboard/admins': 'Сотрудники и доступ',
  '/dashboard/admins/create': 'Сотрудники и доступ',
  '/dashboard/custom-roles': 'Роли доступа',
  '/dashboard/organization': 'Данные компании',
  '/dashboard/organization/settings': 'Направления работы',
  '/dashboard/organization/onboarding': 'Настройка компании',
  '/dashboard/projects': 'Проекты',
  '/dashboard/contractor-invitations': 'Приглашения подрядчиков',
  '/dashboard/contractor-referral-program': 'Условия партнёрской программы',
  '/dashboard/contractor-marketplace': 'Каталог подрядчиков',
  '/dashboard/multi-organization': 'Группа компаний',
};

const detailTitles: ReadonlyArray<readonly [string, string]> = [
  ['/dashboard/help/knowledge/', 'Инструкция'],
  ['/dashboard/help/changelog/', 'Обновление МОСТ'],
  ['/dashboard/projects/', 'Обзор проекта'],
  ['/dashboard/contractor-invitations/token/', 'Приглашение подрядчика'],
];

export function useDashboardPageTitle(pathname: string) {
  const path = pathname.replace(/\/+$/, '');
  const title = pageTitles[path]
    ?? detailTitles.find(([prefix]) => path.startsWith(prefix))?.[1]
    ?? 'Личный кабинет';

  usePageTitle(`${title} — МОСТ`);
}
