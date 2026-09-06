import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import CustomRolesPage from './CustomRolesPage';

const roleState = vi.hoisted(() => ({ loading: false, permissionsUnavailable: false, error: null as string | null, roles: [] as Array<Record<string, unknown>> }));
const createCustomRole = vi.fn();
const updateCustomRole = vi.fn();
const deleteCustomRole = vi.fn();
const cloneCustomRole = vi.fn();
const fetchCustomRoles = vi.fn();
const fetchAvailablePermissions = vi.fn();

vi.mock('@hooks/useCustomRoles', () => ({
  useCustomRoles: () => ({
    customRoles: roleState.roles,
    availablePermissions: roleState.permissionsUnavailable ? null : {
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
    loading: roleState.loading,
    error: roleState.error,
    fetchCustomRoles,
    fetchAvailablePermissions,
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
    roleState.loading = false;
    roleState.permissionsUnavailable = false;
    roleState.error = null;
    roleState.roles = [];
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

  it('preserves the first role form while the hook is saving', () => {
    const view = render(<CustomRolesPage />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Создать роль' })[0]);
    fireEvent.change(screen.getByRole('textbox', { name: 'Название роли *' }), { target: { value: 'Снабжение' } });
    roleState.loading = true;
    view.rerender(<CustomRolesPage />);
    expect(screen.getByRole('textbox', { name: 'Название роли *' })).toHaveValue('Снабжение');
    roleState.loading = false;
    view.rerender(<CustomRolesPage />);
    expect(screen.getByRole('textbox', { name: 'Название роли *' })).toHaveValue('Снабжение');
  });

  it('prevents saving without loaded permissions and offers a safe load retry', () => {
    roleState.permissionsUnavailable = true;
    roleState.error = 'Internal server failure';
    render(<CustomRolesPage />);
    expect(screen.getByRole('alert')).not.toHaveTextContent('Internal server failure');
    fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
    expect(fetchCustomRoles).toHaveBeenCalledTimes(1);
    expect(fetchAvailablePermissions).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getAllByRole('button', { name: 'Создать роль' })[0]);
    fireEvent.change(screen.getByPlaceholderText('Введите название роли'), { target: { value: 'Снабжение' } });
    expect(screen.getByText(/Права пока не загружены/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Создать' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }));
    expect(createCustomRole).not.toHaveBeenCalled();
  });

  it('copies a role through the named dialog', async () => {
    roleState.roles = [{ id: 7, name: 'Склад', system_permissions: [], module_permissions: {}, is_active: true, created_at: '2026-09-01' }];
    render(<CustomRolesPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Копировать роль «Склад»' }));
    expect(screen.getByRole('dialog', { name: 'Копировать роль' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Создать копию' })).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox', { name: 'Название новой роли' }), { target: { value: 'Второй склад' } });
    fireEvent.click(screen.getByRole('button', { name: 'Создать копию' }));
    await waitFor(() => expect(cloneCustomRole).toHaveBeenCalledWith(7, 'Второй склад'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
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

  it('preserves selected permissions when searching another module and retrying a failed save', async () => {
    createCustomRole.mockRejectedValueOnce(new Error('Internal server failure'));
    render(<CustomRolesPage />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Создать роль' })[0]);
    fireEvent.change(screen.getByPlaceholderText('Введите название роли'), { target: { value: 'Складской доступ' } });
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Модули' }), { button: 0, ctrlKey: false });
    const search = screen.getByRole('searchbox', { name: 'Найти право или раздел' });
    fireEvent.change(search, { target: { value: 'Просмотр склада' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Просмотр склада' }));
    fireEvent.change(search, { target: { value: 'Сметы' } });
    expect(screen.queryByRole('checkbox', { name: 'Просмотр склада' })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'AI-генерация смет' })).not.toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Не удалось сохранить роль'));
    expect(screen.queryByText('Internal server failure')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Создать' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(createCustomRole).toHaveBeenCalledTimes(2);
    for (const [data] of createCustomRole.mock.calls) {
      expect(data).toEqual(expect.objectContaining({ name: 'Складской доступ', module_permissions: { warehouse: ['warehouse.view'] } }));
    }
  });

  it('does not offer bulk selection of hidden permissions during search', () => {
    render(<CustomRolesPage />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Создать роль' })[0]);
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Модули' }), { button: 0, ctrlKey: false });
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'Просмотр склада' } });
    expect(screen.queryByRole('button', { name: 'Выбрать все' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Выбрать все права модуля Склад' })).not.toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Просмотр склада' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Сбросить' }));
    expect(screen.getByRole('button', { name: 'Выбрать все' })).toBeInTheDocument();
  });

  it('shows an empty permission search and restores module groups after reset', () => {
    render(<CustomRolesPage />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Создать роль' })[0]);
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Модули' }), { button: 0, ctrlKey: false });
    fireEvent.change(screen.getByRole('searchbox', { name: 'Найти право или раздел' }), { target: { value: 'Несуществующее право' } });
    expect(screen.getByRole('status')).toHaveTextContent('Права не найдены');
    fireEvent.click(screen.getByRole('button', { name: 'Сбросить' }));
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Развернуть модуль Склад' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Развернуть модуль Сметы' })).toBeInTheDocument();
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
