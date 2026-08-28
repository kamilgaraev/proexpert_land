import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import AdminFormModal from './AdminFormModal';

const { getAvailableRoles } = vi.hoisted(() => ({
  getAvailableRoles: vi.fn(),
}));

vi.mock('@hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 7, current_organization_id: 44 } }),
}));

vi.mock('@utils/api', () => ({
  adminPanelUserService: {
    createAdmin: vi.fn(),
    updateAdmin: vi.fn(),
  },
  customRolesService: {
    getAvailableRoles,
  },
}));

vi.mock('react-toastify', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

describe('AdminFormModal autocomplete', () => {
  beforeEach(() => {
    getAvailableRoles.mockResolvedValue({
      data: {
        data: {
          system_roles: [],
          custom_roles: [],
        },
      },
    });
  });

  it('does not offer the owner credentials when creating an employee', async () => {
    render(
      <AdminFormModal
        isOpen
        onClose={vi.fn()}
        onFormSubmit={vi.fn()}
      />,
    );

    await waitFor(() => expect(getAvailableRoles).toHaveBeenCalledOnce());

    expect(document.querySelector('form')).toHaveAttribute('autocomplete', 'off');
    expect(screen.getByLabelText('Имя и Фамилия')).toHaveAttribute('autocomplete', 'off');
    expect(screen.getByLabelText('Email')).toHaveAttribute('autocomplete', 'off');
    expect(screen.getByLabelText(/^Пароль/)).toHaveAttribute('autocomplete', 'new-password');
    expect(screen.getByLabelText('Подтверждение пароля')).toHaveAttribute('autocomplete', 'new-password');
  });
});
