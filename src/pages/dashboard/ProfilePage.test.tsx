import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userService } from '@utils/api';
import { toast } from 'react-toastify';
import ProfilePage from './ProfilePage';

const auth = vi.hoisted(() => ({
  user: { name: 'Иван', email: 'ivan@example.com', phone: '', position: 'Инженер', avatar_url: null },
  fetchUser: vi.fn(),
  isLoading: false,
}));
vi.mock('@hooks/useAuth', () => ({ useAuth: () => auth }));
vi.mock('@utils/api', () => ({ userService: { updateProfile: vi.fn() } }));
vi.mock('@/hooks/useEmailVerification', () => ({ useEmailVerification: () => ({ isVerified: true, loading: false }) }));
vi.mock('framer-motion', async () => {
  const { createElement } = await import('react');
  const element = (tag: string) => (props: Record<string, unknown>) => createElement(tag, Object.fromEntries(
    Object.entries(props).filter(([key]) => !['initial', 'animate', 'transition', 'whileHover', 'whileTap'].includes(key)),
  ));
  return { motion: { div: element('div'), button: element('button') } };
});
vi.mock('react-toastify', () => ({ toast: { info: vi.fn(), success: vi.fn(), error: vi.fn() } }));

function edit() {
  fireEvent.click(screen.getByRole('button', { name: 'Редактировать' }));
}

describe('ProfilePage draft', () => {
  beforeEach(() => vi.clearAllMocks());

  it('does not send a PATCH override without profile changes', () => {
    render(<ProfilePage />);
    edit();
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    expect(userService.updateProfile).not.toHaveBeenCalled();
    expect(toast.info).toHaveBeenCalledWith('Нет изменений для сохранения.');
    expect(screen.getByRole('button', { name: 'Редактировать' })).toBeInTheDocument();
  });

  it('restores the draft on cancel without updating the account', () => {
    render(<ProfilePage />);
    edit();
    fireEvent.change(screen.getByRole('textbox', { name: 'Полное имя' }), { target: { value: 'Черновик' } });
    fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
    edit();
    expect(screen.getByRole('textbox', { name: 'Полное имя' })).toHaveValue('Иван');
    expect(userService.updateProfile).not.toHaveBeenCalled();
  });

  it('sends changed fields and keeps the PATCH contract', async () => {
    vi.mocked(userService.updateProfile).mockResolvedValueOnce({ data: {}, status: 200, statusText: 'OK' });
    render(<ProfilePage />);
    edit();
    fireEvent.change(screen.getByRole('textbox', { name: 'Должность' }), { target: { value: 'Прораб' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    await waitFor(() => expect(auth.fetchUser).toHaveBeenCalledOnce());
    const form = vi.mocked(userService.updateProfile).mock.calls[0][0];
    expect(Array.from(form.entries())).toEqual([['position', 'Прораб'], ['_method', 'PATCH']]);
  });

  it('preserves a rejected draft and permits retry', async () => {
    vi.mocked(userService.updateProfile).mockRejectedValueOnce(new Error('Не удалось обновить профиль.'));
    render(<ProfilePage />);
    edit();
    fireEvent.change(screen.getByRole('textbox', { name: 'Полное имя' }), { target: { value: 'Новое имя' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(screen.getByRole('textbox', { name: 'Полное имя' })).toHaveValue('Новое имя');
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeEnabled();
    expect(auth.fetchUser).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
  });
});
