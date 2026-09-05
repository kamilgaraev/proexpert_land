import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import { useDashboardPageTitle } from './useDashboardPageTitle';
import { usePageTitle } from './useSEO';

afterEach(cleanup);

function GroupPage() {
  usePageTitle('Группа компаний — МОСТ');
  return null;
}

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  useDashboardPageTitle(location.pathname);

  return (
    <>
      {location.pathname === '/dashboard/multi-organization' && <GroupPage />}
      <button onClick={() => navigate('/dashboard/billing')}>Оплата</button>
      <button onClick={() => navigate('/dashboard/admins')}>Сотрудники</button>
      <button onClick={() => navigate(-1)}>Назад</button>
    </>
  );
}

describe('заголовки разделов личного кабинета', () => {
  it('обновляет заголовок при переходе и возврате после страницы со своим заголовком', () => {
    render(<MemoryRouter initialEntries={['/dashboard/multi-organization']}><Navigation /></MemoryRouter>);
    expect(document.title).toBe('Группа компаний — МОСТ');
    fireEvent.click(screen.getByRole('button', { name: 'Оплата' }));
    expect(document.title).toBe('Пакеты и оплата — МОСТ');
    fireEvent.click(screen.getByRole('button', { name: 'Сотрудники' }));
    expect(document.title).toBe('Сотрудники и доступ — МОСТ');
    fireEvent.click(screen.getByRole('button', { name: 'Назад' }));
    expect(document.title).toBe('Пакеты и оплата — МОСТ');
  });

  it.each([
    ['/dashboard/', 'Личный кабинет'],
    ['/dashboard/profile', 'Мой профиль'],
    ['/dashboard/settings', 'Настройки кабинета'],
    ['/dashboard/help', 'Помощь'],
    ['/dashboard/help/knowledge', 'Инструкции'],
    ['/dashboard/help/knowledge/first-project', 'Инструкция'],
    ['/dashboard/help/changelog', 'Что изменилось'],
    ['/dashboard/help/changelog/update', 'Обновление МОСТ'],
    ['/dashboard/support', 'Поддержка'],
    ['/dashboard/faq', 'Вопросы и ответы'],
    ['/dashboard/notifications', 'Уведомления'],
    ['/dashboard/custom-roles', 'Роли доступа'],
    ['/dashboard/organization', 'Данные компании'],
    ['/dashboard/organization/onboarding', 'Настройка компании'],
    ['/dashboard/projects', 'Проекты'],
    ['/dashboard/projects/52', 'Обзор проекта'],
    ['/dashboard/contractor-invitations', 'Приглашения подрядчиков'],
    ['/dashboard/contractor-referral-program', 'Условия партнёрской программы'],
    ['/dashboard/contractor-marketplace', 'Каталог подрядчиков'],
    ['/dashboard/contractor-invitations/token/private-token', 'Приглашение подрядчика'],
  ])('задаёт название при прямом открытии %s', (path, title) => {
    render(<MemoryRouter initialEntries={[path]}><Navigation /></MemoryRouter>);
    expect(document.title).toBe(`${title} — МОСТ`);
    expect(document.title).not.toContain('private-token');
  });
});
