import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CustomRolesPage from './CustomRolesPage';

const createCustomRole = vi.fn();
const updateCustomRole = vi.fn();
const deleteCustomRole = vi.fn();
const cloneCustomRole = vi.fn();

vi.mock('@hooks/useCustomRoles', () => ({
  useCustomRoles: () => ({
    customRoles: [],
    availablePermissions: {
      system_permissions: [],
      module_permissions: {
        warehouse: [
          { key: 'warehouse.view', name: 'Просмотр склада' },
          { key: 'warehouse.stock.manage', name: 'Управление остатками склада' },
        ],
        estimates: [
          { key: 'estimates.ai.generate', name: 'AI-генерация смет' },
        ],
      },
      module_groups: {
        warehouse: 'Склад',
        estimates: 'Сметы',
      },
    },
    loading: false,
    error: null,
    createCustomRole,
    updateCustomRole,
    deleteCustomRole,
    cloneCustomRole,
  }),
}));

vi.mock('@/components/permissions/ProtectedComponent', () => ({
  ProtectedComponent: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('@components/shared/NotificationService', () => ({
  default: {
    show: vi.fn(),
  },
}));

describe('CustomRolesPage', () => {
  beforeEach(() => {
    createCustomRole.mockResolvedValue({});
    updateCustomRole.mockResolvedValue({});
    deleteCustomRole.mockResolvedValue({});
    cloneCustomRole.mockResolvedValue({});
  });

  it('selects all module permissions from the role modal', async () => {
    render(<CustomRolesPage />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Создать роль' })[0]);
    fireEvent.change(screen.getByPlaceholderText('Введите название роли'), {
      target: { value: 'Полный доступ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Модули' }));
    fireEvent.click(screen.getByRole('button', { name: 'Выбрать все' }));
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }));

    await waitFor(() => {
      expect(createCustomRole).toHaveBeenCalledWith(expect.objectContaining({
        module_permissions: {
          warehouse: ['warehouse.view', 'warehouse.stock.manage'],
          estimates: ['estimates.ai.generate'],
        },
      }));
    });
  });
});
