import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthContext, AuthProvider } from './AuthContext';
import { authService } from '@utils/api';
import { disconnectEcho } from '../services/echo';
import { clearAuthToken, getAuthToken, saveAuthToken } from '@utils/authTokenStorage';

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
  const promise = new Promise<T>(next => { resolve = next; });
  return { promise, resolve };
};

const Probe = () => (
  <AuthContext.Consumer>
    {value => (
      <>
        <span data-testid="auth">{`${value.isAuthenticated}:${value.token ?? 'none'}:${value.user?.id ?? 'none'}`}</span>
        <button onClick={value.logout}>logout</button>
        <button onClick={() => void value.login('user@example.test', 'password')}>login</button>
      </>
    )}
  </AuthContext.Consumer>
);

describe('AuthProvider realtime lifecycle', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    clearAuthToken();
    window.localStorage.clear();
    window.sessionStorage.clear();
    window.history.replaceState({}, '', '/dashboard');
    vi.mocked(authService.getCurrentUser).mockResolvedValue({ data: { user } } as never);
    vi.mocked(authService.logout).mockResolvedValue(undefined as never);
  });

  it('disconnects before logout and always clears auth when disconnect fails', async () => {
    saveAuthToken('token-one');
    vi.mocked(disconnectEcho).mockImplementationOnce(() => {
      expect(getAuthToken()).toBe('token-one');
      throw new Error('disconnect failed');
    });
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true:token-one:7'));

    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('false:none:none'));
    expect(disconnectEcho).toHaveBeenCalledOnce();
    expect(getAuthToken()).toBeNull();
  });

  it('disconnects and clears auth when another tab removes the token', async () => {
    saveAuthToken('token-one', 'local');
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true:token-one:7'));
    window.localStorage.removeItem('authToken');

    act(() => window.dispatchEvent(new StorageEvent('storage', {
      key: 'authToken', oldValue: 'token-one', newValue: null,
    })));

    expect(disconnectEcho).toHaveBeenCalledOnce();
    expect(screen.getByTestId('auth')).toHaveTextContent('false:none:none');
    expect(getAuthToken()).toBeNull();
  });

  it('disconnects and publishes a replacement token from another tab', async () => {
    saveAuthToken('token-one', 'local');
    const replacement = deferred<{ data: { user: typeof user } }>();
    vi.mocked(authService.getCurrentUser)
      .mockResolvedValueOnce({ data: { user } } as never)
      .mockReturnValueOnce(replacement.promise as never);
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true:token-one:7'));
    window.localStorage.setItem('authToken', 'token-two');

    act(() => window.dispatchEvent(new StorageEvent('storage', {
      key: 'authToken', oldValue: 'token-one', newValue: 'token-two',
    })));

    expect(disconnectEcho).toHaveBeenCalledOnce();
    expect(screen.getByTestId('auth')).toHaveTextContent('false:token-two:none');
    expect(getAuthToken()).toBe('token-two');

    await act(async () => {
      replacement.resolve({ data: { user: { ...user, id: 8 } } });
      await replacement.promise;
    });

    expect(screen.getByTestId('auth')).toHaveTextContent('true:token-two:8');
  });

  it('does not restore a user when initial verification resolves after logout', async () => {
    saveAuthToken('token-one');
    const verification = deferred<{ data: { user: typeof user } }>();
    vi.mocked(authService.getCurrentUser).mockReturnValueOnce(verification.promise as never);
    render(<AuthProvider><Probe /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'logout' }));

    await act(async () => {
      verification.resolve({ data: { user } });
      await verification.promise;
    });

    expect(screen.getByTestId('auth')).toHaveTextContent('false:none:none');
  });

  it('does not publish a pending login after the provider unmounts', async () => {
    window.history.replaceState({}, '', '/login');
    const login = deferred<{ data: { token: string; user: typeof user } }>();
    vi.mocked(authService.login).mockReturnValueOnce(login.promise as never);
    const view = render(<AuthProvider><Probe /></AuthProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'login' }));
    view.unmount();

    await act(async () => {
      login.resolve({ data: { token: 'late-token', user } });
      await login.promise;
    });

    expect(getAuthToken()).toBeNull();
  });
});
