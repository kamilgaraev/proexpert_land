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
    vi.clearAllMocks();
    createCustomRole.mockResolvedValue({});
    updateCustomRole.mockResolvedValue({});
    deleteCustomRole.mockResolvedValue({});
    cloneCustomRole.mockResolvedValue({});
  });

  it('names the dialog and fields and closes without saving', async () => {
    render(<CustomRolesPage />);
    const trigger = screen.getAllByRole('button', { name: 'Создать роль' })[0];
    trigger.focus();
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog', { name: 'Создать роль' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Название роли *' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Основное' })).toHaveFocus();
    expect(screen.getByRole('textbox', { name: 'Описание' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Основное' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Закрыть диалог' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(createCustomRole).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('selects all module permissions from the role modal', async () => {
    render(<CustomRolesPage />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Создать роль' })[0]);
    fireEvent.change(screen.getByPlaceholderText('Введите название роли'), {
      target: { value: 'Полный доступ' },
    });
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Модули' }), { button: 0, ctrlKey: false });
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

  it('keeps module permission groups collapsed until a module is opened', () => {
    render(<CustomRolesPage />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Создать роль' })[0]);
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Модули' }), { button: 0, ctrlKey: false });

    expect(screen.getByRole('button', { name: 'Развернуть модуль Склад' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('checkbox', { name: 'Просмотр склада' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Развернуть модуль Склад' }));

    expect(screen.getByRole('button', { name: 'Свернуть модуль Склад' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('checkbox', { name: 'Просмотр склада' })).toBeInTheDocument();
  });

  it('selects permissions only for the chosen module', async () => {
    render(<CustomRolesPage />);

    fireEvent.click(screen.getAllByRole('button', { name: 'Создать роль' })[0]);
    fireEvent.change(screen.getByPlaceholderText('Введите название роли'), {
      target: { value: 'Складской доступ' },
    });
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Модули' }), { button: 0, ctrlKey: false });
    fireEvent.click(screen.getByRole('button', { name: 'Выбрать все права модуля Склад' }));
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }));

    await waitFor(() => {
      expect(createCustomRole).toHaveBeenCalledWith(expect.objectContaining({
        module_permissions: {
          warehouse: ['warehouse.view', 'warehouse.stock.manage'],
        },
      }));
    });
  });
});
