import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { saveAuthToken } from '@/utils/authTokenStorage';
import AdminsPage from './AdminsPage';

const state = vi.hoisted(() => ({
  user: { id: 1, current_organization_id: 7 },
  permissions: { user_id: 1, organization_id: 7 },
  grants: new Set(['users.manage', 'users.invite', 'roles.view_custom']),
  loaded: true,
  error: null as string | null,
  reload: vi.fn(),
  fetchInvitations: vi.fn().mockResolvedValue(undefined),
  clearError: vi.fn(),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: state.user, isLoading: false }) }));
vi.mock('@/hooks/usePermissions', () => ({ usePermissions: () => ({
  permissions: state.permissions, isLoaded: state.loaded, isLoading: false, error: state.error,
  can: (permission: string) => state.grants.has(permission), hasRole: () => false, reload: state.reload,
}) }));
vi.mock('@/hooks/useUserManagement', () => ({ useUserManagement: () => ({
  invitations: [], loading: false, error: null, fetchInvitations: state.fetchInvitations, clearError: state.clearError,
}) }));
vi.mock('@/components/dashboard/users/InvitationsList', () => ({ default: () => <p>Приглашений пока нет</p> }));
vi.mock('@/components/dashboard/roles/RolesComparisonTable', () => ({ default: () => <p>Состав прав роли</p> }));
vi.mock('@/components/dashboard/users/UserCreateInviteModal', () => ({ default: ({ canInvite, onClose }: { canInvite: boolean; onClose: () => void }) => (
  <div role="dialog" aria-label="Добавить сотрудника"><p>{canInvite ? 'Приглашение доступно' : 'Прямое создание'}</p><button onClick={onClose}>Закрыть</button></div>
) }));

const url = 'https://api.xn--1-xtbgmf.xn--p1ai/api/v1/landing/user-management/organization-users';
const server = setupServer();
let requests = 0;
const member = { id: 2, name: 'Анна Петрова', email: 'anna@example.test', email_verified_at: null, is_active: true, roles: [], created_at: null };
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => { cleanup(); server.resetHandlers(); });
beforeEach(() => {
  state.user = { id: 1, current_organization_id: 7 };
  state.permissions = { user_id: 1, organization_id: 7 };
  state.grants = new Set(['users.manage', 'users.invite', 'roles.view_custom']);
  state.loaded = true;
  state.error = null;
  state.reload.mockClear();
  state.fetchInvitations.mockClear();
  requests = 0;
  saveAuthToken('team-page-test-token');
  server.use(http.get(url, () => {
    requests++;
    return HttpResponse.json({ success: true, data: [member], meta: { total: 1, current_page: 1, last_page: 1, per_page: 20 } });
  }));
});
const page = () => <MemoryRouter><AdminsPage /></MemoryRouter>;

it.each([1, 2])('после смены роли сотрудника %s обновляет только нужный контекст', async memberId => {
  state.grants.add('users.assign_roles');
  server.use(
    http.get(url, () => {
      requests++;
      return HttpResponse.json({ success: true, data: [{ ...member, id: memberId }], meta: { total: 1, current_page: 1, last_page: 1, per_page: 20 } });
    }),
    http.get(url.replace('/organization-users', '/available-roles'), () => HttpResponse.json({ success: true, data: {
      organization_id: 7,
      system_roles: [{ slug: 'accountant', name: 'Бухгалтер', type: 'system', is_active: true, assignable: true, description: '', permission_preview: [] }],
      custom_roles: [],
    } })),
    http.post(`${url}/${memberId}/roles`, () => HttpResponse.json({ success: true, data: { id: memberId } })),
  );
  const { rerender } = render(page());
  fireEvent.click(await screen.findByRole('button', { name: 'Изменить роли: Анна Петрова' }));
  fireEvent.change(await screen.findByRole('combobox'), { target: { value: 'system:accountant' } });
  fireEvent.click(screen.getByRole('button', { name: 'Назначить роль' }));
  if (memberId === state.user.id) {
    await waitFor(() => expect(state.reload).toHaveBeenCalledTimes(1));
    state.grants.delete('users.manage');
    rerender(page());
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByText('У вас нет доступа к управлению командой этой компании.')).toBeInTheDocument();
  } else {
    await waitFor(() => expect(requests).toBe(2));
    expect(state.reload).not.toHaveBeenCalled();
  }
});

it('показывает единый список сотрудников и доступные действия вместо двух категорий людей', async () => {
  render(page());
  expect(screen.getByRole('tab', { name: 'Сотрудники' })).toHaveAttribute('aria-selected', 'true');
  expect(screen.queryByRole('tab', { name: 'Администраторы' })).not.toBeInTheDocument();
  expect(screen.queryByRole('tab', { name: 'Пользователи' })).not.toBeInTheDocument();
  expect(await screen.findByText('Анна Петрова')).toBeInTheDocument();
  expect(requests).toBe(1);
  expect(screen.getByRole('button', { name: 'Отключить доступ: Анна Петрова' })).toBeInTheDocument();
  expect(state.fetchInvitations).not.toHaveBeenCalled();
  fireEvent.mouseDown(screen.getByRole('tab', { name: 'Приглашения' }), { button: 0, ctrlKey: false });
  expect(await screen.findByText('Приглашений пока нет')).toBeInTheDocument();
  expect(state.fetchInvitations).toHaveBeenCalledTimes(1);
  fireEvent.mouseDown(screen.getByRole('tab', { name: 'Роли и права' }), { button: 0, ctrlKey: false });
  expect(await screen.findByText('Состав прав роли')).toBeInTheDocument();
});

it('не загружает команду по правам другой компании', () => {
  state.permissions.organization_id = 9;
  render(page());
  expect(screen.getByRole('alert')).toHaveTextContent('этой компании');
  expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  expect(requests).toBe(0);
  fireEvent.click(screen.getByRole('button', { name: 'Проверить доступ' }));
  expect(state.reload).toHaveBeenCalledTimes(1);
});

it('ошибка начальной проверки прав не превращается в бесконечную загрузку', () => {
  state.loaded = false;
  state.error = 'network';
  render(page());
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(requests).toBe(0);
});

it('не открывает команду без права управления сотрудниками', () => {
  state.grants.delete('users.manage');
  render(page());
  expect(screen.getByText('У вас нет доступа к управлению командой этой компании.')).toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Добавить сотрудника' })).not.toBeInTheDocument();
  expect(requests).toBe(0);
});

it('без права отправки сохраняет просмотр приглашений и прямое создание сотрудника', async () => {
  state.grants.delete('users.invite');
  render(page());
  await screen.findByText('Анна Петрова');
  expect(screen.getByRole('tab', { name: 'Приглашения' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Добавить сотрудника' }));
  expect(screen.getByRole('dialog')).toHaveTextContent('Прямое создание');
});

it('смена компании закрывает форму и очищает прежний список до подтверждения прав', async () => {
  const { rerender } = render(page());
  await screen.findByText('Анна Петрова');
  fireEvent.click(screen.getByRole('button', { name: 'Добавить сотрудника' }));
  state.user = { id: 1, current_organization_id: 9 };
  rerender(page());
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.queryByText('Анна Петрова')).not.toBeInTheDocument();
  expect(screen.getByRole('alert')).toBeInTheDocument();
  state.permissions = { user_id: 1, organization_id: 9 };
  rerender(page());
  await waitFor(() => expect(requests).toBe(2));
  expect(await screen.findByText('Анна Петрова')).toBeInTheDocument();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
