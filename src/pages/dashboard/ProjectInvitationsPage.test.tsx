import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectInvitationsPage from './ProjectInvitationsPage';
import type { IncomingProjectInvitation, IncomingProjectInvitationsResponse } from '@/utils/projectParticipantInvitationsApi';

const mocks = vi.hoisted(() => ({ organizationId: 7, listIncoming: vi.fn() }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 42, current_organization_id: mocks.organizationId } }) }));
vi.mock('@/utils/projectParticipantInvitationsApi', () => ({ projectParticipantInvitationsApi: { listIncoming: mocks.listIncoming } }));

const invitation: IncomingProjectInvitation = {
  id: 2,
  status: 'pending',
  can_accept: true,
  project: { id: 10, name: 'Строительство корпуса' },
  inviting_organization: { id: 3, name: 'ООО Генподрядчик' },
  role: { slug: 'contractor', name: 'Подрядчик' },
  message: 'Приглашаем участвовать в проекте.',
  created_at: '2030-01-01T10:00:00Z',
  expires_at: '2030-01-08T10:00:00Z',
  accepted_at: null,
  invitation_path: '/project-invitations/test-token',
};

const response = (items: IncomingProjectInvitation[] = [invitation]): IncomingProjectInvitationsResponse => ({
  success: true,
  data: items,
  meta: { current_page: 1, last_page: 1, per_page: 20, total: items.length },
});
const page = () => <MemoryRouter><ProjectInvitationsPage /></MemoryRouter>;

beforeEach(() => {
  mocks.organizationId = 7;
  mocks.listIncoming.mockReset().mockResolvedValue(response());
});
afterEach(cleanup);

describe('входящие приглашения в проекты', () => {
  it('показывает отправителя, проект и роль и ведёт к существующей странице принятия', async () => {
    render(page());

    expect(await screen.findByRole('heading', { name: invitation.project.name })).toBeInTheDocument();
    expect(screen.getByText('ООО Генподрядчик')).toBeInTheDocument();
    expect(screen.getByText('Подрядчик')).toBeInTheDocument();
    expect(screen.getByText('Ожидает принятия')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Открыть приглашение' })).toHaveAttribute('href', '/project-invitations/test-token');
    expect(mocks.listIncoming).toHaveBeenCalledWith(1, expect.any(AbortSignal));
  });

  it('объясняет пустой список при отсутствии приглашений', async () => {
    mocks.listIncoming.mockResolvedValue(response([]));
    render(page());
    expect(await screen.findByRole('heading', { name: 'Пока нет приглашений' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Открыть приглашение' })).not.toBeInTheDocument();
  });

  it('показывает ошибку и повторяет запрос по кнопке', async () => {
    mocks.listIncoming.mockRejectedValueOnce(new Error('Network failure'));
    render(page());
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить приглашения');
    fireEvent.click(screen.getByRole('button', { name: 'Попробовать снова' }));
    expect(await screen.findByRole('heading', { name: invitation.project.name })).toBeInTheDocument();
    expect(mocks.listIncoming).toHaveBeenCalledTimes(2);
  });

  it('не маскирует несовместимый ответ API пустым списком', async () => {
    mocks.listIncoming.mockResolvedValue({ success: true, data: { invitations: [invitation] } });
    render(page());
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('Пока нет приглашений')).not.toBeInTheDocument();
  });

  it('не предлагает принять просроченное приглашение', async () => {
    mocks.listIncoming.mockResolvedValue(response([{ ...invitation, status: 'expired', can_accept: false, invitation_path: null }]));
    render(page());
    expect(await screen.findByText('Срок истёк')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Открыть приглашение' })).not.toBeInTheDocument();
  });

  it('меняет страницу по серверной пагинации', async () => {
    const first = response();
    first.meta.last_page = 2;
    first.meta.total = 21;
    const second = response([{ ...invitation, id: 3, project: { id: 104, name: 'Второй проект' } }]);
    second.meta = { ...first.meta, current_page: 2 };
    mocks.listIncoming.mockResolvedValueOnce(first).mockResolvedValueOnce(second);
    render(page());
    fireEvent.click(await screen.findByRole('button', { name: 'Далее' }));
    expect(await screen.findByRole('heading', { name: 'Второй проект' })).toBeInTheDocument();
    expect(screen.getByText('Страница 2 из 2')).toBeInTheDocument();
    expect(mocks.listIncoming).toHaveBeenLastCalledWith(2, expect.any(AbortSignal));
    expect(screen.queryByRole('heading', { name: invitation.project.name })).not.toBeInTheDocument();
  });

  it('отбрасывает поздний ответ предыдущей организации', async () => {
    let resolveOld: (value: IncomingProjectInvitationsResponse) => void = () => {};
    mocks.listIncoming.mockImplementationOnce(() => new Promise<IncomingProjectInvitationsResponse>(resolve => { resolveOld = resolve; }));
    const view = render(page());
    await waitFor(() => expect(mocks.listIncoming).toHaveBeenCalledTimes(1));
    const oldSignal = mocks.listIncoming.mock.calls[0][1] as AbortSignal;

    mocks.organizationId = 99;
    mocks.listIncoming.mockResolvedValue(response([{ ...invitation, id: 9, project: { id: 900, name: 'Проект новой организации' } }]));
    view.rerender(page());
    expect(oldSignal.aborted).toBe(true);
    expect(await screen.findByRole('heading', { name: 'Проект новой организации' })).toBeInTheDocument();

    await act(async () => resolveOld(response()));
    expect(screen.queryByRole('heading', { name: invitation.project.name })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Проект новой организации' })).toBeInTheDocument();
  });
});
