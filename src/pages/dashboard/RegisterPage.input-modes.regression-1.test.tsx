import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ register: vi.fn() }),
}));

vi.mock('@/hooks/useDaData', () => ({
  default: () => ({
    searchAddresses: vi.fn().mockResolvedValue([]),
    searchCities: vi.fn().mockResolvedValue([]),
    searchOrganizations: vi.fn().mockResolvedValue([]),
    isLoading: false,
  }),
}));

import RegisterPage from './RegisterPage';

// Regression: ISSUE-060 — реквизиты организации открывали обычную клавиатуру вместо подходящей
// Found by /qa on 2026-08-29
// Report: .gstack/qa-reports/qa-report-most-full-2026-08-28.md
describe('RegisterPage organization input modes', () => {
  it('включает телефонную и цифровую клавиатуры для реквизитов', async () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Полное имя'), {
      target: { value: 'Иван Иванов' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'ivan@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Пароль'), {
      target: { value: 'Password1' },
    });
    fireEvent.change(screen.getByLabelText('Подтверждение пароля'), {
      target: { value: 'Password1' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));

    expect(await screen.findByLabelText('Телефон организации')).toHaveAttribute('type', 'tel');
    expect(screen.getByLabelText('ИНН')).toHaveAttribute('inputmode', 'numeric');
    expect(screen.getByLabelText('ОГРН')).toHaveAttribute('inputmode', 'numeric');
    expect(screen.getByLabelText('Индекс')).toHaveAttribute('inputmode', 'numeric');
  });
});
