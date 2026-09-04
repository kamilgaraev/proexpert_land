import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { saveAuthToken } from '@/utils/authTokenStorage';
import { userManagementService } from '@/utils/api';
import type { OrganizationTeamMember } from '@/types/organization-team';
import OrganizationTeamAccessAction from './OrganizationTeamAccessAction';

const url = 'https://api.xn--1-xtbgmf.xn--p1ai/api/v1/landing/user-management/organization-users/2/access';
const member: OrganizationTeamMember = { id: 2, name: 'Анна Петрова', email: 'anna@example.test', is_active: true, email_verified_at: null, created_at: null, roles: [] };
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterAll(() => server.close());
afterEach(() => { cleanup(); server.resetHandlers(); vi.restoreAllMocks(); });
beforeEach(() => saveAuthToken('team-access-test-token'));

it.each([true, false])('отправляет явное состояние доступа после подтверждения, исходная активность %s', async active => {
  const changed = vi.fn();
  const calls: unknown[] = [];
  server.use(http.patch(url, async ({ request }) => {
    calls.push(await request.json());
    return HttpResponse.json({ success: true, data: { id: 2, is_active: !active } });
  }));
  render(<OrganizationTeamAccessAction member={{ ...member, is_active: active }} actorId={1} scope="user1:org7" canManage onChanged={changed} />);
  fireEvent.click(screen.getByRole('button'));
  const dialog = screen.getByRole('dialog');
  expect(dialog).toHaveAccessibleName(active ? 'Отключить доступ к компании?' : 'Открыть доступ к компании?');
  expect(calls).toHaveLength(0);
  fireEvent.click(within(dialog).getByRole('button', { name: active ? 'Отключить доступ' : 'Открыть доступ' }));
  await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
  expect(calls).toEqual([{ is_active: !active }]);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(screen.getByRole('status')).toHaveTextContent(active ? 'Доступ к компании отключён.' : 'Доступ к компании открыт.');
});

it('отмена подтверждения не отправляет запрос', () => {
  const api = vi.spyOn(userManagementService, 'setOrganizationTeamAccess');
  render(<OrganizationTeamAccessAction member={member} actorId={1} scope="user1:org7" canManage onChanged={vi.fn()} />);
  fireEvent.click(screen.getByRole('button'));
  fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(api).not.toHaveBeenCalled();
});

it('не предлагает менять свой доступ, доступ владельца или действовать без компании и права', () => {
  const { rerender } = render(<OrganizationTeamAccessAction member={member} actorId={2} scope="user2:org7" canManage onChanged={vi.fn()} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  rerender(<OrganizationTeamAccessAction member={{ ...member, roles: [{ id: null, slug: 'organization_owner', name: 'Владелец компании', type: 'system' }] }} actorId={1} scope="user1:org7" canManage onChanged={vi.fn()} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  rerender(<OrganizationTeamAccessAction member={member} actorId={1} scope={null} canManage onChanged={vi.fn()} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  rerender(<OrganizationTeamAccessAction member={member} actorId={1} scope="user1:org7" canManage={false} onChanged={vi.fn()} />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

it.each([403, 404, 422, 500])('показывает понятную ошибку %s и сохраняет диалог для повторной попытки', async status => {
  const changed = vi.fn();
  server.use(http.patch(url, () => HttpResponse.json({ success: false, message: 'SQL internal exception' }, { status })));
  render(<OrganizationTeamAccessAction member={member} actorId={1} scope="user1:org7" canManage onChanged={changed} />);
  fireEvent.click(screen.getByRole('button'));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Отключить доступ' }));
  expect(await screen.findByRole('alert')).not.toHaveTextContent('SQL');
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(changed).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Отмена' })).toBeEnabled();
});

it('не принимает чужой или неверный ответ за успех и позволяет безопасный повтор', async () => {
  const changed = vi.fn();
  let calls = 0;
  server.use(http.patch(url, () => HttpResponse.json({ success: true, data: { id: ++calls === 1 ? 9 : 2, is_active: false } })));
  render(<OrganizationTeamAccessAction member={member} actorId={1} scope="user1:org7" canManage onChanged={changed} />);
  fireEvent.click(screen.getByRole('button'));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Отключить доступ' }));
  await screen.findByRole('alert');
  expect(changed).not.toHaveBeenCalled();
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Отключить доступ' }));
  await waitFor(() => expect(changed).toHaveBeenCalledTimes(1));
  expect(calls).toBe(2);
});

it('не дублирует запрос и отменяет ожидание при смене компании', async () => {
  const changed = vi.fn();
  let finish!: () => void;
  const waiting = new Promise<void>(resolve => { finish = resolve; });
  let calls = 0;
  server.use(http.patch(url, async () => {
    calls++;
    await waiting;
    return HttpResponse.json({ success: true, data: { id: 2, is_active: false } });
  }));
  const api = vi.spyOn(userManagementService, 'setOrganizationTeamAccess');
  const { rerender } = render(<OrganizationTeamAccessAction member={member} actorId={1} scope="user1:org7" canManage onChanged={changed} />);
  fireEvent.click(screen.getByRole('button'));
  const button = within(screen.getByRole('dialog')).getByRole('button', { name: 'Отключить доступ' });
  fireEvent.click(button);
  fireEvent.click(button);
  await waitFor(() => expect(calls).toBe(1));
  expect(screen.getByRole('button', { name: 'Отмена' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Закрыть диалог' }));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  rerender(<OrganizationTeamAccessAction member={member} actorId={1} scope="user1:org9" canManage onChanged={changed} />);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(api.mock.calls[0][2].aborted).toBe(true);
  finish();
  await waiting;
  expect(changed).not.toHaveBeenCalled();
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
