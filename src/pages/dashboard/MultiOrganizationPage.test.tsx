import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MultiOrganizationPage from './MultiOrganizationPage';

const holding = vi.hoisted(() => ({ enabled: false, canViewSite: false }));

vi.mock('@hooks/useMultiOrganization', () => ({
  useMultiOrganization: () => ({
    availability: { available: holding.enabled },
    hierarchy: null,
    accessibleOrganizations: [],
    loading: false,
    checkAvailability: async () => false,
    fetchHierarchy: async () => undefined,
    fetchAccessibleOrganizations: async () => undefined,
    canCreateHolding: () => false,
    isHolding: () => holding.enabled,
    getCurrentOrganizationType: () => 'parent',
  }),
}));

vi.mock('@/components/permissions/ProtectedComponent', () => ({
  ProtectedComponent: ({ children, permission }: { children: ReactNode; permission: string }) =>
    permission === 'multi-organization.website.view' && holding.canViewSite ? children : null,
}));

afterEach(() => {
  cleanup();
  holding.enabled = false;
  holding.canViewSite = false;
});

describe('Группа компаний без подключенного модуля', () => {
  it('открывает условия оплаты по кнопке подключения', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/multi-organization']}>
        <Routes>
          <Route path="/dashboard/multi-organization" element={<MultiOrganizationPage />} />
          <Route path="/dashboard/billing" element={<h1>Пакеты и оплата</h1>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Группа компаний' })).toBeInTheDocument();
    expect(document.title).toBe('Группа компаний — МОСТ');
    fireEvent.click(screen.getByRole('link', { name: 'Посмотреть условия подключения' }));
    expect(await screen.findByRole('heading', { name: 'Пакеты и оплата' })).toBeInTheDocument();
  });
});

it('открывает редактор сайта из личного кабинета при наличии права', async () => {
  holding.enabled = true;
  holding.canViewSite = true;
  render(
    <MemoryRouter initialEntries={['/dashboard/multi-organization']}>
      <Routes>
        <Route path="/dashboard/multi-organization" element={<MultiOrganizationPage />} />
        <Route path="/dashboard/multi-organization/site" element={<h1>Редактор корпоративного сайта</h1>} />
      </Routes>
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole('link', { name: 'Редактор сайта' }));
  expect(await screen.findByRole('heading', { name: 'Редактор корпоративного сайта' })).toBeInTheDocument();
});

it('скрывает ссылку на редактор при отсутствии права на сайт', () => {
  holding.enabled = true;
  render(<MemoryRouter><MultiOrganizationPage /></MemoryRouter>);

  expect(screen.queryByRole('link', { name: 'Редактор сайта' })).not.toBeInTheDocument();
});
