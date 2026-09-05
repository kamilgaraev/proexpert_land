import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MultiOrganizationPage from './MultiOrganizationPage';

vi.mock('@hooks/useMultiOrganization', () => ({
  useMultiOrganization: () => ({
    availability: { available: false },
    hierarchy: null,
    accessibleOrganizations: [],
    loading: false,
    checkAvailability: async () => false,
    fetchHierarchy: async () => undefined,
    fetchAccessibleOrganizations: async () => undefined,
  }),
}));

afterEach(cleanup);

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
