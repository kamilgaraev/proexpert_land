import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import InvitationsList from './InvitationsList';
import type { UserInvitation } from '@/hooks/useUserManagement';
import { saveAuthToken } from '@/utils/authTokenStorage';

const { access } = vi.hoisted(() => ({ access: { invite: true } }));
vi.mock('@/hooks/usePermissions', () => ({ useHasPermission: (permission: string) => permission === 'users.invite' && access.invite }));
const baseUrl = 'https://api.xn--1-xtbgmf.xn--p1ai/api/v1/landing/user-management/invitations';
const server = setupServer();
const invitation: UserInvitation = {
  id: 17,
  name: 'Анна Инженер',
  email: 'anna@example.test',
  role_slugs: ['site_engineer'],
  role_names: ['Инженер ПТО'],
  status: 'pending',
  status_text: 'Ожидает ответа',
  status_color: '',
  expires_at: '2026-09-10T10:00:00Z',
  is_expired: false,
  can_be_accepted: true,
  invited_by: { id: 1, name: 'Руководитель', email: 'owner@example.test' },
  created_at: '2026-09-01T10:00:00Z',
};

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { cleanup(); server.resetHandlers(); });
afterAll(() => server.close());
beforeEach(() => { access.invite = true; saveAuthToken('invitation-test-token'); });

const renderList = (items: UserInvitation[] = [invitation], onRefresh = vi.fn()) => {
  const onInvite = vi.fn();
  render(<InvitationsList invitations={items} loading={false} onRefresh={onRefresh} onInvite={onInvite} />);
  return { onRefresh, onInvite };
};

describe('Приглашения сотрудников', () => {
  it('отправляет повторное приглашение и не допускает двойной запрос', async () => {
    let requests = 0;
    server.use(http.post(`${baseUrl}/17/resend`, async () => { requests++; await delay(80); return HttpResponse.json({ success: true, data: invitation }); }));
    const { onRefresh } = renderList();
    const button = screen.getByRole('button', { name: `Повторить приглашение ${invitation.email}` });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(button).toBeDisabled();
    await screen.findByText('Приглашение отправлено повторно.');
    expect(requests).toBe(1);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('отменяет приглашение только после подтверждения и убирает повторные действия', async () => {
    let requests = 0;
    server.use(http.delete(`${baseUrl}/17`, () => { requests++; return HttpResponse.json({ success: true, data: null }); }));
    const { onRefresh } = renderList();
    fireEvent.click(screen.getByRole('button', { name: `Отменить приглашение ${invitation.email}` }));
    const dialog = await screen.findByRole('dialog');
    expect(requests).toBe(0);
    expect(within(dialog).getByText(/Ссылка для anna@example.test/)).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Отменить приглашение' }));
    await screen.findByText('Приглашение отменено. Ссылка больше не действует.');
    expect(requests).toBe(1);
    expect(onRefresh).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: `Повторить приглашение ${invitation.email}` })).not.toBeInTheDocument();
    expect(screen.getByText('Отменено')).toBeInTheDocument();
  });

  it('сохраняет диалог при ошибке и позволяет повторить отмену', async () => {
    let requests = 0;
    server.use(http.delete(`${baseUrl}/17`, () => { requests++; return HttpResponse.json({ success: requests > 1, data: null }); }));
    renderList();
    fireEvent.click(screen.getByRole('button', { name: `Отменить приглашение ${invitation.email}` }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Отменить приглашение' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Не удалось отменить приглашение');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Отменить приглашение' }));
    await screen.findByText('Отменено');
    expect(requests).toBe(2);
  });

  it('не предлагает изменение без права приглашать сотрудников', () => {
    access.invite = false;
    renderList();
    expect(screen.getByText(invitation.name)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Пригласить сотрудника' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Повторить приглашение/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Отменить приглашение/ })).not.toBeInTheDocument();
  });

  it('не предлагает повтор и отмену завершённых приглашений', () => {
    renderList(['accepted', 'expired', 'cancelled'].map((status, index) => ({ ...invitation, id: index + 1, status: status as UserInvitation['status'] })));
    expect(screen.getByText('Принято')).toBeInTheDocument();
    expect(screen.getByText('Срок истёк')).toBeInTheDocument();
    expect(screen.getByText('Отменено')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Повторить приглашение/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Отменить приглашение/ })).not.toBeInTheDocument();
  });

  it('открывает создание приглашения из пустого состояния', () => {
    const { onInvite } = renderList([]);
    fireEvent.click(screen.getByRole('button', { name: 'Пригласить сотрудника' }));
    expect(onInvite).toHaveBeenCalledTimes(1);
  });

  it('сохраняет результат отмены при ошибке обновления списка', async () => {
    server.use(http.delete(`${baseUrl}/17`, () => HttpResponse.json({ success: true, data: null })));
    renderList([invitation], vi.fn().mockRejectedValue(new Error('refresh_failed')));
    fireEvent.click(screen.getByRole('button', { name: `Отменить приглашение ${invitation.email}` }));
    const dialog = await screen.findByRole('dialog');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Отменить приглашение' }));
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Действие выполнено'));
    expect(screen.getByText('Отменено')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: `Отменить приглашение ${invitation.email}` })).not.toBeInTheDocument();
  });
});
