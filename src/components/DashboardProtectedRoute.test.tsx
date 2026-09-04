import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardProtectedRoute from './DashboardProtectedRoute';

const state = vi.hoisted(() => ({
  auth: { isAuthenticated: true, isLoading: false, token: 'test-token' },
  permissions: { isLoaded: true, isLoading: false, error: null as string | null, load: vi.fn() },
}));
vi.mock('@hooks/useAuth', () => ({ useAuth: () => state.auth }));
vi.mock('@hooks/usePermissions', () => ({ usePermissions: () => state.permissions }));

function LoginProbe() {
  const location = useLocation();
  const from = location.state?.from;
  return <div>Вход: {from?.pathname}{from?.search}</div>;
}

function renderGuard() {
  render(<MemoryRouter initialEntries={['/dashboard/projects?status=active']}>
    <Routes>
      <Route path="/login" element={<LoginProbe />} />
      <Route path="/dashboard/projects" element={<DashboardProtectedRoute><div>Закрытые данные</div></DashboardProtectedRoute>} />
    </Routes>
  </MemoryRouter>);
}

beforeEach(() => {
  state.auth.isAuthenticated = true;
  state.auth.isLoading = false;
  state.permissions.isLoaded = true;
  state.permissions.isLoading = false;
  state.permissions.error = null;
});

describe('DashboardProtectedRoute routing contract', () => {
  it('redirects unauthenticated users and preserves the destination with query', async () => {
    state.auth.isAuthenticated = false;
    renderGuard();
    expect(await screen.findByText('Вход: /dashboard/projects?status=active')).toBeInTheDocument();
    expect(screen.queryByText('Закрытые данные')).not.toBeInTheDocument();
  });

  it('does not expose content while authentication is loading', () => {
    state.auth.isLoading = true;
    renderGuard();
    expect(screen.getByText('Проверяем авторизацию...')).toBeInTheDocument();
    expect(screen.queryByText('Закрытые данные')).not.toBeInTheDocument();
  });

  it('waits for permissions before showing content', () => {
    state.permissions.isLoaded = false;
    state.permissions.isLoading = true;
    renderGuard();
    expect(screen.getByText('Настраиваем личный кабинет')).toBeInTheDocument();
    expect(screen.queryByText('Закрытые данные')).not.toBeInTheDocument();
  });

  it('keeps content hidden when permission loading fails', () => {
    state.permissions.error = 'Тестовая ошибка';
    renderGuard();
    expect(screen.getByRole('button', { name: 'Обновить страницу' })).toBeInTheDocument();
    expect(screen.queryByText('Закрытые данные')).not.toBeInTheDocument();
  });

  it('renders authenticated content after permissions have loaded', () => {
    renderGuard();
    expect(screen.getByText('Закрытые данные')).toBeInTheDocument();
  });
});
