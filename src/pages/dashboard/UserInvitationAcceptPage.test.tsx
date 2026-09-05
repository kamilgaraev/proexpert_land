import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userManagementService } from '@utils/api';
import UserInvitationAcceptPage from './UserInvitationAcceptPage';

vi.mock('@utils/api', () => ({ userManagementService: { getInvitationByToken: vi.fn(), acceptInvitation: vi.fn() } }));
const load = vi.mocked(userManagementService.getInvitationByToken);
const accept = vi.mocked(userManagementService.acceptInvitation);
const details = { email: 'colleague@example.com', name: 'Коллега', organization_name: 'Строительная компания', can_be_accepted: true, is_expired: false };
const response = (data = details) => ({ data: { data } }) as Awaited<ReturnType<typeof userManagementService.getInvitationByToken>>;
const open = (query = '?token=test-invitation') => render(<MemoryRouter initialEntries={[`/invitations/accept${query}`]}><UserInvitationAcceptPage /></MemoryRouter>);

describe('Приглашение сотрудника', () => {
  beforeEach(() => { load.mockReset(); accept.mockReset(); });

  it('не обращается к сервису без токена', async () => {
    open('');
    expect(await screen.findByRole('alert')).toHaveTextContent('Ссылка приглашения недействительна');
    expect(load).not.toHaveBeenCalled();
  });

  it('скрывает техническую ошибку и позволяет повторить чтение', async () => {
    load.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce(response());
    open();
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось связаться с сервисом');
    expect(screen.queryByText('Network Error')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Попробовать снова' }));
    expect(await screen.findByText('colleague@example.com')).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('не предлагает повторять недействительную ссылку', async () => {
    load.mockRejectedValue({ response: { status: 410, data: { message: 'internal key' } } });
    open();
    expect(await screen.findByRole('alert')).toHaveTextContent('Попросите коллегу отправить новое приглашение');
    expect(screen.queryByRole('button', { name: 'Попробовать снова' })).not.toBeInTheDocument();
  });

  it('объясняет отказ после открытия формы без сообщения о проблеме с интернетом', async () => {
    load.mockResolvedValue(response());
    accept.mockRejectedValue({ response: { status: 422, data: { message: 'internal invitation state' } } });
    open();
    fireEvent.change(await screen.findByLabelText('Пароль'), { target: { value: 'test-password-1' } });
    fireEvent.change(screen.getByLabelText('Повторите пароль'), { target: { value: 'test-password-1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Принять приглашение' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('попросите коллегу проверить приглашение');
    expect(screen.queryByText(/Проверьте подключение|internal invitation state/)).not.toBeInTheDocument();
    expect(accept).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Пароль')).toHaveValue('test-password-1');
  });

  it('проверяет совпадение паролей до отправки', async () => {
    load.mockResolvedValue(response());
    open();
    fireEvent.change(await screen.findByLabelText('Пароль'), { target: { value: 'test-password-1' } });
    fireEvent.change(screen.getByLabelText('Повторите пароль'), { target: { value: 'test-password-2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Принять приглашение' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Пароли не совпадают');
    expect(accept).not.toHaveBeenCalled();
  });
});
