import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { saveAuthToken } from '@/utils/authTokenStorage';
import { userManagementService } from '@/utils/api';
import type { OrganizationTeamMember } from '@/types/organization-team';
import OrganizationTeamOwnerAction from './OrganizationTeamOwnerAction';

const url = 'https://api.xn--1-xtbgmf.xn--p1ai/api/v1/landing/user-management/organization-users/2/grant-owner';
const member: OrganizationTeamMember = { id: 2, name: 'Анна Петрова', email: 'anna@example.test', is_active: true, email_verified_at: null, created_at: null, roles: [] };
const success = { success: true, data: { user: { id: 2, name: member.name, email: member.email }, role_slug: 'organization_owner' } };
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => { cleanup(); server.resetHandlers(); vi.restoreAllMocks(); });
beforeEach(() => saveAuthToken('team-owner-test-token'));
const action = (changed = vi.fn()) => <OrganizationTeamOwnerAction member={member} actorId={1} scope="1:7" canGrant onChanged={changed} />;
const open = () => fireEvent.click(screen.getByRole('button', { name: 'Назначить владельцем: Анна Петрова' }));
const confirm = () => within(screen.getByRole('dialog')).getByRole('button', { name: 'Назначить владельцем' });

it('требует отдельное подтверждение полного доступа и после успеха не предлагает повторное назначение', async () => {
  let calls = 0;
  const changed = vi.fn();
  server.use(http.post(url, () => { calls++; return HttpResponse.json(success); }));
  render(action(changed));
  open();
  expect(screen.getByRole('dialog')).toHaveAccessibleName('Добавить владельца компании?');
  expect(screen.getByRole('dialog')).toHaveTextContent('Вы сохраните свои права владельца.');
  expect(confirm()).toBeDisabled();
  fireEvent.click(confirm());
  expect(calls).toBe(0);
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(confirm());
  await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
  expect(calls).toBe(1);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent('назначен владельцем');
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it('отмена не отправляет запрос и сбрасывает согласие при повторном открытии', () => {
  const api = vi.spyOn(userManagementService, 'grantOrganizationOwner');
  render(action());
  open();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
  open();
  expect(screen.getByRole('checkbox')).not.toBeChecked();
  expect(confirm()).toBeDisabled();
  expect(api).not.toHaveBeenCalled();
});

it('не предлагает назначение себе, владельцу, отключённому сотруднику и без нужного права', () => {
  const { rerender } = render(<OrganizationTeamOwnerAction member={member} actorId={2} scope="2:7" canGrant onChanged={vi.fn()} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  rerender(<OrganizationTeamOwnerAction member={{ ...member, roles: [{ id: null, slug: 'organization_owner', name: 'Владелец', type: 'system' }] }} actorId={1} scope="1:7" canGrant onChanged={vi.fn()} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  rerender(<OrganizationTeamOwnerAction member={{ ...member, is_active: false }} actorId={1} scope="1:7" canGrant onChanged={vi.fn()} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  rerender(<OrganizationTeamOwnerAction member={member} actorId={1} scope="1:7" canGrant={false} onChanged={vi.fn()} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it.each([403, 404, 422, 500])('отказ сервера %s сохраняет диалог, убирает согласие и не показывает техническую ошибку', async status => {
  const changed = vi.fn();
  server.use(http.post(url, () => HttpResponse.json({ success: false, message: 'SQL exception' }, { status })));
  render(action(changed));
  open();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(confirm());
  expect(await screen.findByRole('alert')).not.toHaveTextContent('SQL');
  expect(screen.getByRole('checkbox')).not.toBeChecked();
  expect(confirm()).toBeDisabled();
  expect(changed).not.toHaveBeenCalled();
});

it('не считает чужого сотрудника или другую роль подтверждением назначения', async () => {
  const changed = vi.fn();
  server.use(http.post(url, () => HttpResponse.json({ success: true, data: { user: { id: 9 }, role_slug: 'organization_owner' } })));
  render(action(changed));
  open();
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(confirm());
  expect(await screen.findByRole('alert')).toHaveTextContent('проверьте его роль');
  expect(changed).not.toHaveBeenCalled();
});

it('защищает от двойного нажатия и не применяет поздний результат после смены компании', async () => {
  const changed = vi.fn();
  let finish!: () => void;
  const waiting = new Promise<void>(resolve => { finish = resolve; });
  let calls = 0;
  server.use(http.post(url, async () => { calls++; await waiting; return HttpResponse.json(success); }));
  const api = vi.spyOn(userManagementService, 'grantOrganizationOwner');
  const { rerender } = render(action(changed));
  open();
  fireEvent.click(screen.getByRole('checkbox'));
  const button = confirm();
  fireEvent.click(button);
  fireEvent.click(button);
  await waitFor(() => expect(calls).toBe(1));
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть диалог' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByRole('checkbox')).toBeDisabled();
  rerender(<OrganizationTeamOwnerAction member={member} actorId={1} scope="1:9" canGrant onChanged={changed} />);
  expect(api.mock.calls[0][1]?.aborted).toBe(true);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  finish();
  await waiting;
  expect(changed).not.toHaveBeenCalled();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
