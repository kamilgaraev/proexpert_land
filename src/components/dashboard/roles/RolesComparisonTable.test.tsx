import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RolesComparisonTable from './RolesComparisonTable';
import type { RoleComparison } from '@utils/api';

const getRolesComparison = vi.hoisted(() => vi.fn());
vi.mock('@utils/api', () => ({ rolesComparisonService: { getRolesComparison } }));

const foreman: RoleComparison = {
  slug: 'foreman', name: 'Прораб', description: 'Работы на площадке', context: 'Проект', context_slug: 'project',
  interfaces: ['Админ', 'Моб'], interfaces_slugs: ['admin', 'mobile'], billing_access: false,
  can_manage_roles: [], cannot_manage_roles: ['Владелец'], time_restrictions: { has_restrictions: false, working_hours: null, working_days: null },
  system_permissions_count: 1, module_permissions_count: 2, has_all_permissions: false, has_all_modules: false,
  permission_groups: [{ slug: 'works', name: 'Работы', permissions: [{ slug: 'works.view', name: 'Просмотр работ' }] }],
};
const owner: RoleComparison = { ...foreman, slug: 'owner', name: 'Владелец', description: 'Управление организацией', context_slug: 'organization', interfaces_slugs: ['lk'], billing_access: true, has_all_permissions: true };

beforeEach(() => {
  vi.clearAllMocks();
  getRolesComparison.mockResolvedValue({ data: { success: true, data: { roles: [foreman, owner] } } });
});

describe('Сравнение ролей', () => {
  it('совмещает фильтры и сбрасывает их', async () => {
    render(<RolesComparisonTable />);
    await screen.findByText('Показано: 2 из 2');
    fireEvent.change(screen.getByLabelText('Оплата и подписка'), { target: { value: 'yes' } });
    expect(screen.getByText('Показано: 1 из 2')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Работа с объектами'));
    expect(screen.getByText('Роли не найдены')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Сбросить фильтры' }));
    expect(screen.getByText('Показано: 2 из 2')).toBeTruthy();
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ПРОРАБ' } });
    expect(screen.getByText('Показано: 1 из 2')).toBeTruthy();
  });

  it('открывает доступный диалог без служебного идентификатора и закрывает его', async () => {
    render(<RolesComparisonTable />);
    const buttons = await screen.findAllByRole('button', { name: 'Подробнее о роли «Прораб»' });
    fireEvent.click(buttons[0]);
    expect(screen.getByRole('dialog', { name: 'Прораб' })).toBeTruthy();
    expect(screen.queryByText('Slug')).toBeNull();
    expect(screen.getByText('Просмотр работ')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('позволяет повторить загрузку после ошибки', async () => {
    getRolesComparison.mockRejectedValueOnce(new Error('network'));
    render(<RolesComparisonTable />);
    await screen.findByRole('alert');
    fireEvent.click(screen.getByRole('button', { name: 'Попробовать снова' }));
    await screen.findByText('Показано: 2 из 2');
    expect(getRolesComparison).toHaveBeenCalledTimes(2);
  });
});
