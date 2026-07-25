import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext, AuthProvider } from './AuthContext';
import { authService } from '@utils/api';
import { disconnectEcho } from '../services/echo';
import {
  clearAuthToken,
  clearCsrfToken,
  getAuthToken,
  getCsrfToken,
  invalidateAuthSession,
} from '@utils/authTokenStorage';

vi.mock('@utils/api', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    refreshToken: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));
vi.mock('../services/echo', () => ({
  default: vi.fn(),
  disconnectEcho: vi.fn(),
}));

const user = { id: 7, name: 'User', email: 'user@example.test' };

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((next) => { resolve = next; });
  return { promise, resolve };
};

const Probe = () => (
  <AuthContext.Consumer>
    {(value) => (
      <>
        <span data-testid="auth">{`${value.isAuthenticated}:${value.token ?? 'none'}:${value.user?.id ?? 'none'}`}</span>
        <button onClick={() => void value.logout()}>logout</button>
        <button onClick={() => void value.login('user@example.test', 'password', true)}>login-remember</button>
      </>
    )}
  </AuthContext.Consumer>
);

describe('AuthProvider memory-only lifecycle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    clearAuthToken();
    clearCsrfToken();
    window.history.replaceState({}, '', '/dashboard');
    vi.mocked(authService.refreshToken).mockResolvedValue({
      token: 'bootstrap-token',
      csrfToken: 'bootstrap-csrf',
    } as never);
    vi.mocked(authService.getCurrentUser).mockResolvedValue({ data: { user } } as never);
    vi.mocked(authService.logout).mockResolvedValue(undefined as never);
  });

  it('восстанавливает сессию из HttpOnly refresh-cookie и держит токены в памяти', async () => {
    render(<AuthProvider><Probe /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true:bootstrap-token:7'));

    expect(authService.refreshToken).toHaveBeenCalledOnce();
    expect(getAuthToken()).toBe('bootstrap-token');
    expect(getCsrfToken()).toBe('bootstrap-csrf');
    expect(window.localStorage.getItem('authToken')).toBeNull();
    expect(window.sessionStorage.getItem('authToken')).toBeNull();
  });

  it('отзывает серверную сессию до очистки локального auth-состояния', async () => {
    vi.mocked(disconnectEcho).mockImplementationOnce(() => {
      expect(getAuthToken()).toBe('bootstrap-token');
      throw new Error('disconnect failed');
    });
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true:bootstrap-token:7'));

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('false:none:none'));
    expect(authService.logout).toHaveBeenCalledWith('bootstrap-token');
    expect(disconnectEcho).toHaveBeenCalled();
    expect(getAuthToken()).toBeNull();
    expect(getCsrfToken()).toBeNull();
  });

  it('очищает UI при сигнале logout от другой вкладки', async () => {
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true:bootstrap-token:7'));

    act(() => invalidateAuthSession());

    expect(screen.getByTestId('auth')).toHaveTextContent('false:none:none');
    expect(disconnectEcho).toHaveBeenCalled();
  });

  it('не восстанавливает пользователя, если logout произошёл во время bootstrap refresh', async () => {
    const refresh = deferred<{ token: string; csrfToken: string }>();
    vi.mocked(authService.refreshToken).mockReturnValueOnce(refresh.promise as never);
    render(<AuthProvider><Probe /></AuthProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await act(async () => {
      refresh.resolve({ token: 'late-token', csrfToken: 'late-csrf' });
      await refresh.promise;
    });

    expect(screen.getByTestId('auth')).toHaveTextContent('false:none:none');
    expect(getAuthToken()).toBeNull();
  });

  it('передаёт remember_me серверу и сохраняет ответ только в памяти', async () => {
    window.history.replaceState({}, '', '/login');
    vi.mocked(authService.login).mockResolvedValue({
      data: { data: { token: 'login-token', csrf_token: 'login-csrf', user } },
    } as never);
    render(<AuthProvider><Probe /></AuthProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'login-remember' }));

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true:login-token:7'));
    expect(authService.login).toHaveBeenCalledWith({
      email: 'user@example.test',
      password: 'password',
      remember_me: true,
    });
    expect(getCsrfToken()).toBe('login-csrf');
    expect(window.localStorage.getItem('authToken')).toBeNull();
    expect(window.sessionStorage.getItem('authToken')).toBeNull();
  });
});
