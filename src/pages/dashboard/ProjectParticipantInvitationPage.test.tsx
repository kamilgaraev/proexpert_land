import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProjectParticipantInvitationPage from './ProjectParticipantInvitationPage';

const mocks = vi.hoisted(() => ({
  authenticated: false,
  getByToken: vi.fn(),
  accept: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: mocks.authenticated, isLoading: false }),
}));

vi.mock('@/utils/projectParticipantInvitationsApi', () => ({
  projectParticipantInvitationsApi: {
    getByToken: mocks.getByToken,
    accept: mocks.accept,
  },
}));

const pendingInvitation = {
  success: true,
  data: {
    status: 'pending',
    can_accept: true,
    project: { id: 42, name: 'Жилой комплекс' },
    role: 'Заказчик',
    invited_organization: null,
    expires_at: '2026-10-01T00:00:00Z',
    next_action: 'register',
  },
};

const LoginProbe = () => {
  const location = useLocation();
  return <output data-testid="login-return">{location.state?.from?.pathname}</output>;
};

const RegisterProbe = () => {
  const [params] = useSearchParams();
  return <output data-testid="register-return">{params.get('next')}</output>;
};

const InvitationNavigation = () => {
  const navigate = useNavigate();
  return <button onClick={() => navigate('/project-invitations/new-token')}>Открыть другое приглашение</button>;
};

const renderInvitation = (path = '/project-invitations/invite-token') => render(
  <MemoryRouter initialEntries={[path]}>
    <InvitationNavigation />
    <Routes>
      <Route path="/project-invitations/:token" element={<ProjectParticipantInvitationPage />} />
      <Route path="/login" element={<LoginProbe />} />
      <Route path="/register" element={<RegisterProbe />} />
      <Route path="/dashboard/projects" element={<div>Проекты</div>} />
    </Routes>
  </MemoryRouter>,
);

describe('ProjectParticipantInvitationPage', () => {
  beforeEach(() => {
    mocks.authenticated = false;
    mocks.getByToken.mockReset().mockResolvedValue(pendingInvitation);
    mocks.accept.mockReset();
  });

  it('предлагает регистрацию владельца своей организации и сохраняет возврат к приглашению', async () => {
    renderInvitation();

    expect(await screen.findByRole('heading', { name: 'Жилой комплекс' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /создать организацию и аккаунт/i }));

    expect(await screen.findByTestId('register-return')).toHaveTextContent('/project-invitations/invite-token');
  });

  it('после входа принимает приглашение текущей организации', async () => {
    mocks.authenticated = true;
    mocks.accept.mockResolvedValue({
      success: true,
      data: {
        invitation: { id: 8, status: 'accepted', accepted_at: '2026-09-25T10:00:00Z' },
        project: { id: 42, name: 'Жилой комплекс' },
        organization: { id: 19, name: 'ООО Строитель' },
      },
    });
    renderInvitation();

    fireEvent.click(await screen.findByRole('button', { name: /принять приглашение/i }));
    expect(await screen.findByRole('heading', { name: 'Организация добавлена в проект' })).toBeInTheDocument();
    expect(mocks.accept).toHaveBeenCalledWith('invite-token');
  });

  it('возвращает на приглашение после перехода ко входу', async () => {
    renderInvitation();
    await screen.findByRole('heading', { name: 'Жилой комплекс' });
    fireEvent.click(screen.getByRole('button', { name: /уже есть аккаунт\? войти/i }));

    await waitFor(() => expect(screen.getByTestId('login-return')).toHaveTextContent('/project-invitations/invite-token'));
  });

  it('не предлагает создать вторую организацию, если приглашение адресовано существующей', async () => {
    mocks.getByToken.mockResolvedValue({
      ...pendingInvitation,
      data: {
        ...pendingInvitation.data,
        invited_organization: { id: 19, name: 'ООО Строитель' },
        next_action: 'login',
      },
    });
    renderInvitation();

    expect(await screen.findByText('ООО Строитель')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /войти и продолжить/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /создать организацию/i })).not.toBeInTheDocument();
  });

  it('игнорирует preview GET, завершившийся после смены токена', async () => {
    let resolveOld!: (value: typeof pendingInvitation) => void;
    let resolveCurrent!: (value: typeof pendingInvitation) => void;
    mocks.getByToken.mockImplementation((token: string) => new Promise((resolve) => {
      if (token === 'old-token') resolveOld = resolve;
      else resolveCurrent = resolve;
    }));
    renderInvitation('/project-invitations/old-token');

    await waitFor(() => expect(mocks.getByToken).toHaveBeenCalledWith('old-token'));
    fireEvent.click(screen.getByRole('button', { name: 'Открыть другое приглашение' }));

    expect(screen.getByRole('status')).toHaveTextContent('Проверяем приглашение');
    expect(screen.queryByRole('heading', { name: 'Жилой комплекс' })).not.toBeInTheDocument();
    await act(async () => {
      resolveCurrent({
        ...pendingInvitation,
        data: { ...pendingInvitation.data, project: { id: 43, name: 'Текущий проект' } },
      });
    });
    expect(await screen.findByRole('heading', { name: 'Текущий проект' })).toBeInTheDocument();

    await act(async () => {
      resolveOld(pendingInvitation);
    });

    expect(screen.queryByRole('heading', { name: 'Жилой комплекс' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Текущий проект' })).toBeInTheDocument();
  });

  it('игнорирует accept POST, завершившийся после смены токена', async () => {
    mocks.authenticated = true;
    let resolveAccept!: (value: {
      success: boolean;
      data: {
        invitation: { id: number; status: string; accepted_at: string };
        project: { id: number; name: string };
        organization: { id: number; name: string };
      };
    }) => void;
    mocks.accept.mockImplementation(() => new Promise((resolve) => { resolveAccept = resolve; }));
    mocks.getByToken.mockImplementation((token: string) => Promise.resolve({
      ...pendingInvitation,
      data: {
        ...pendingInvitation.data,
        project: { id: token === 'old-token' ? 42 : 43, name: token === 'old-token' ? 'Старый проект' : 'Текущий проект' },
      },
    }));
    renderInvitation('/project-invitations/old-token');

    fireEvent.click(await screen.findByRole('button', { name: /принять приглашение/i }));
    await waitFor(() => expect(mocks.accept).toHaveBeenCalledWith('old-token'));
    fireEvent.click(screen.getByRole('button', { name: 'Открыть другое приглашение' }));
    expect(await screen.findByRole('heading', { name: 'Текущий проект' })).toBeInTheDocument();

    await act(async () => {
      resolveAccept({
        success: true,
        data: {
          invitation: { id: 8, status: 'accepted', accepted_at: '2026-09-25T10:00:00Z' },
          project: { id: 42, name: 'Старый проект' },
          organization: { id: 19, name: 'Старая организация' },
        },
      });
    });

    expect(screen.queryByRole('heading', { name: 'Организация добавлена в проект' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Старая организация/)).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Текущий проект' })).toBeInTheDocument();
  });
});
