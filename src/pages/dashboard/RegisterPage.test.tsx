import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import RegisterPage from './RegisterPage';

const registerMock = vi.fn();

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    register: registerMock,
  }),
}));

vi.mock('@/hooks/useDaData', () => ({
  default: () => ({
    searchAddresses: vi.fn(),
    searchCities: vi.fn(),
    searchOrganizations: vi.fn(),
    isLoading: false,
  }),
}));

const renderPage = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </MemoryRouter>,
  );

describe('RegisterPage', () => {
  it('shows selected business plan from query string', () => {
    renderPage('/register?plan=business');

    expect(screen.getByText('Выбран тариф Business')).toBeInTheDocument();
  });
});
