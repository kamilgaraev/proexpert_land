import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { saveAuthToken } from '@/utils/authTokenStorage';
import type { OrganizationTeamMember } from '@/types/organization-team';
import OrganizationTeamRoleAction from './OrganizationTeamRoleAction';

const base = 'https://api.xn--1-xtbgmf.xn--p1ai/api/v1/landing/user-management';
const system = { slug: 'accountant', name: 'Бухгалтер', type: 'system', is_active: true, assignable: true, description: 'Учёт финансов компании', permission_preview: ['Просмотр платежей'] };
const custom = { id: 15, slug: 'reviewer', name: 'Проверка документов', type: 'custom', is_active: true, description: null, permission_preview: [] };
const member: OrganizationTeamMember = { id: 2, name: 'Анна', email: 'anna@example.test', is_active: true, email_verified_at: null, created_at: null, roles: [{ id: null, slug: 'accountant', name: 'Бухгалтер', type: 'system' }] };
const server = setupServer();
let changes: unknown[] = [];
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => { cleanup(); server.resetHandlers(); });
beforeEach(() => {
  changes = [];
  saveAuthToken('team-role-test-token');
  server.use(
    http.get(`${base}/available-roles`, ({ request }) => {
      expect(new URL(request.url).searchParams.get('scope')).toBe('all');
      return HttpResponse.json({ success: true, data: { organization_id: 7, system_roles: [system], custom_roles: [custom] } });
    }),
    http.post(`${base}/organization-users/2/roles`, async ({ request }) => {
      changes.push(await request.json());
      return HttpResponse.json({ success: true, data: { id: 2 } });
    }),
  );
});
const view = (changed = vi.fn(), actorId = 1) => <OrganizationTeamRoleAction member={member} actorId={actorId} organizationId={7} canAssign onChanged={changed} />;
const open = () => fireEvent.click(screen.getByRole('button', { name: 'Изменить роли: Анна' }));

it('назначает только выбранную собственную роль и не заменяет остальные назначения', async () => {
  const changed = vi.fn();
  render(view(changed));
  open();
  fireEvent.change(await screen.findByRole('combobox'), { target: { value: 'custom:reviewer' } });
  expect(screen.getByRole('dialog')).toHaveTextContent('Остальные роли сохранятся.');
  fireEvent.click(screen.getByRole('button', { name: 'Назначить роль' }));
  await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
  expect(changes).toEqual([{ action: 'add', custom_role_ids: [15], scope: 'all' }]);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('снимает только выбранную системную роль после явного выбора', async () => {
  const changed = vi.fn();
  render(view(changed));
  open();
  fireEvent.click(await screen.findByRole('button', { name: 'Снять роль: Бухгалтер' }));
  expect(changes).toHaveLength(0);
  fireEvent.click(screen.getByRole('button', { name: 'Снять роль' }));
  await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
  expect(changes).toEqual([{ action: 'remove', system_roles: ['accountant'], scope: 'all' }]);
});

it('снятие своей роли требует подтверждения возможной потери доступа', async () => {
  const changed = vi.fn();
  render(view(changed, 2));
  open();
  fireEvent.click(await screen.findByRole('button', { name: 'Снять роль: Бухгалтер' }));
  expect(screen.getByRole('button', { name: 'Снять роль' })).toBeDisabled();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Снять роль' }));
  await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
});

it.each(['wrong-company', 'missing-list'])('не позволяет изменять роли по неполному или чужому ответу %s', async kind => {
  server.use(http.get(`${base}/available-roles`, () => HttpResponse.json({ success: true, data: kind === 'wrong-company'
    ? { organization_id: 9, system_roles: [system], custom_roles: [custom] }
    : { organization_id: 7, system_roles: [system] } })));
  render(view());
  open();
  expect(await screen.findByRole('alert')).toHaveTextContent('Текущие назначения сохранены');
  expect(screen.getByText('Бухгалтер')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Назначить роль' })).toBeDisabled();
  expect(changes).toHaveLength(0);
});

it('отказ сервера оставляет выбранную роль в диалоге и не показывает служебную ошибку', async () => {
  const changed = vi.fn();
  server.use(http.post(`${base}/organization-users/2/roles`, () => HttpResponse.json({ success: false, message: 'SQL exception' }, { status: 403 })));
  render(view(changed));
  open();
  fireEvent.change(await screen.findByRole('combobox'), { target: { value: 'custom:reviewer' } });
  fireEvent.click(screen.getByRole('button', { name: 'Назначить роль' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('нет права');
  expect(screen.getByRole('alert')).not.toHaveTextContent('SQL');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(changed).not.toHaveBeenCalled();
});

it('не предлагает снять владельца и недоступные роли при частичном справочнике', async () => {
  const owner = { id: null, slug: 'organization_owner', name: 'Владелец', type: 'system' as const };
  render(<OrganizationTeamRoleAction member={{ ...member, roles: [...member.roles, owner, { id: 16, slug: 'existing', name: 'Роль вне справочника', type: 'custom' }] }} actorId={1} organizationId={7} canAssign onChanged={vi.fn()} />);
  open();
  await screen.findByRole('combobox');
  expect(screen.queryByRole('button', { name: 'Снять роль: Владелец' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Снять роль: Роль вне справочника' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByRole('combobox'), { target: { value: 'custom:reviewer' } });
  fireEvent.click(screen.getByRole('button', { name: 'Назначить роль' }));
  await waitFor(() => expect(changes).toHaveLength(1));
  expect(changes[0]).toEqual({ action: 'add', custom_role_ids: [15], scope: 'all' });
});
