import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authService } from '@utils/api';
import ResetPasswordPage from './ResetPasswordPage';

vi.mock('@utils/api', () => ({ authService: { resetPassword: vi.fn() } }));
vi.mock('@/hooks/useSEO', () => ({ usePageTitle: vi.fn() }));

const renderPage = (url = '/reset-password?token=test-token&email=owner%40example.com') =>
  render(<MemoryRouter initialEntries={[url]}><ResetPasswordPage /></MemoryRouter>);

const fillPasswords = (confirmation = 'NewPassword123') => {
  fireEvent.change(screen.getByLabelText('Новый пароль'), { target: { value: 'NewPassword123' } });
  fireEvent.change(screen.getByLabelText('Повторите пароль'), { target: { value: confirmation } });
  fireEvent.click(screen.getByRole('button', { name: 'Сохранить пароль' }));
};

describe('ResetPasswordPage', () => {
  beforeEach(() => { vi.mocked(authService.resetPassword).mockReset(); });

  it('submits link credentials and the new password, then offers login', async () => {
    vi.mocked(authService.resetPassword).mockResolvedValue({} as Awaited<ReturnType<typeof authService.resetPassword>>);
    renderPage();
    fillPasswords();
    await screen.findByRole('heading', { name: 'Пароль изменён' });
    expect(authService.resetPassword).toHaveBeenCalledWith({
      token: 'test-token', email: 'owner@example.com', password: 'NewPassword123', password_confirmation: 'NewPassword123',
    });
    expect(screen.getByRole('link', { name: 'Войти' })).toHaveAttribute('href', '/login');
  });

  it('does not submit mismatching passwords', () => {
    renderPage();
    fillPasswords('Different123');
    expect(screen.getByRole('alert')).toHaveTextContent('Пароли не совпадают');
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  it('offers a replacement for an incomplete link without submitting', () => {
    renderPage('/reset-password');
    expect(screen.getByRole('alert')).toHaveTextContent('В ссылке не хватает данных');
    expect(screen.getByRole('link', { name: 'Запросить новую ссылку' })).toHaveAttribute('href', '/forgot-password');
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  it('shows server validation and allows retry after an expired link', async () => {
    vi.mocked(authService.resetPassword).mockRejectedValue({ response: { data: {
      message: 'Ошибка проверки', errors: { token: ['Ссылка устарела. Запросите новую.'] },
    } } });
    renderPage();
    fillPasswords();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Ссылка устарела'));
    expect(screen.getByRole('button', { name: 'Сохранить пароль' })).toBeEnabled();
  });
});
