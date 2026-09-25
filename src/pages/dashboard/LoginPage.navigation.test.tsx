import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { login } = vi.hoisted(() => ({ login: vi.fn() }));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ login }) }));
vi.mock('@/components/dashboard/EmailVerificationModal', () => ({
  EmailVerificationModal: ({ isOpen }: { isOpen: boolean }) => isOpen ? <div role="dialog">Подтвердите почту</div> : null,
}));

import LoginPage from './LoginPage';
import { readProjectInvitationReturnPath, storeProjectInvitationReturnPath } from '@/utils/projectParticipantInvitationReturn';

function Destination() {
  const location = useLocation();
  return <output>{location.pathname}{location.search}{location.hash}</output>;
}

function renderLogin(state?: unknown) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state }]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Destination />} />
      </Routes>
    </MemoryRouter>,
  );
}

async function submitLogin() {
  fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'owner@example.test' } });
  fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'test-password' } });
  fireEvent.click(screen.getByRole('button', { name: 'Войти в систему' }));
  await waitFor(() => expect(login).toHaveBeenCalledWith('owner@example.test', 'test-password', false));
}

describe('LoginPage navigation', () => {
  beforeEach(() => { login.mockReset(); login.mockResolvedValue(undefined); });

  it('возвращает к странице с параметрами и якорем после успешного входа', async () => {
    renderLogin({ from: { pathname: '/dashboard/projects', search: '?status=active', hash: '#project-42' } });
    await submitLogin();
    expect(await screen.findByText('/dashboard/projects?status=active#project-42')).toBeInTheDocument();
  });

  it.each([undefined, { from: { pathname: '//outside.example' } }, { from: { pathname: 'https://outside.example' } }, { from: { pathname: '/\\outside.example' } }])('использует кабинет при отсутствии допустимого внутреннего адреса: %j', async (state) => {
    renderLogin(state);
    await submitLogin();
    expect(await screen.findByText('/dashboard')).toBeInTheDocument();
  });

  it('подставляет адрес из страницы подтверждения и позволяет его изменить', () => {
    renderLogin({ email: 'registration@example.test' });
    const input = screen.getByLabelText('Email');
    expect(input).toHaveValue('registration@example.test');
    fireEvent.change(input, { target: { value: 'other@example.test' } });
    expect(input).toHaveValue('other@example.test');
  });

  it('восстанавливает приглашение из сессии после принудительного возврата к входу', async () => {
    window.sessionStorage.clear();
    storeProjectInvitationReturnPath('/project-invitations/invite-token');
    renderLogin();

    await submitLogin();

    expect(await screen.findByText('/project-invitations/invite-token')).toBeInTheDocument();
    expect(readProjectInvitationReturnPath()).toBeNull();
  });

  it('сохраняет безопасный возврат к приглашению при неподтверждённой почте', async () => {
    window.sessionStorage.clear();
    login.mockRejectedValue({
      status: 403,
      response: { data: { message: 'Пожалуйста, подтвердите ваш email адрес' } },
    });
    renderLogin({ from: { pathname: '/project-invitations/invite-token' } });

    await waitFor(() => expect(readProjectInvitationReturnPath()).toBe('/project-invitations/invite-token'));
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'owner@example.test' } });
    fireEvent.change(screen.getByLabelText('Пароль'), { target: { value: 'test-password' } });
    fireEvent.click(screen.getByRole('button', { name: 'Войти в систему' }));

    expect(await screen.findByRole('dialog')).toHaveTextContent('Подтвердите почту');
    expect(readProjectInvitationReturnPath()).toBe('/project-invitations/invite-token');
  });
});
