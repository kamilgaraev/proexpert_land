import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { resend, state } = vi.hoisted(() => ({ resend: vi.fn(), state: { canResend: true, resendCooldown: 0, loading: false, error: null as string | null } }));
vi.mock('@/hooks/useEmailVerification', () => ({ useEmailVerification: () => ({ ...state, resendVerificationEmail: resend }) }));
import { EmailVerificationModal } from './EmailVerificationModal';

function Example() {
  const [open, setOpen] = useState(false);
  return <><button onClick={() => setOpen(true)}>Войти</button><EmailVerificationModal isOpen={open} email="owner@example.test" onClose={() => setOpen(false)} /></>;
}

async function openModal() {
  render(<Example />);
  const trigger = screen.getByRole('button', { name: 'Войти', exact: true });
  trigger.focus();
  fireEvent.click(trigger);
  await screen.findByRole('dialog', { name: 'Подтвердите почту' });
  return trigger;
}

describe('EmailVerificationModal', () => {
  beforeEach(() => { Object.assign(state, { canResend: true, resendCooldown: 0, loading: false, error: null }); resend.mockReset(); });

  it('объявляет диалог, переводит фокус внутрь и возвращает после Escape', async () => {
    const trigger = await openModal();
    const dialog = screen.getByRole('dialog', { name: 'Подтвердите почту' });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('закрывается доступной подписанной кнопкой', async () => {
    await openModal();
    fireEvent.click(screen.getByRole('button', { name: 'Закрыть диалог' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('показывает паузу и не отправляет письмо при открытии', async () => {
    state.canResend = false;
    state.resendCooldown = 42;
    await openModal();
    expect(screen.getByRole('button', { name: 'Повторить через 42 с' })).toBeDisabled();
    expect(resend).not.toHaveBeenCalled();
  });

  it('показывает понятную ошибку без технического сообщения', async () => {
    state.error = 'SQL internal failure';
    await openModal();
    expect(screen.getByRole('alert')).toHaveTextContent('Не удалось отправить письмо');
    expect(screen.queryByText('SQL internal failure')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Отправить письмо повторно' }));
    expect(resend).toHaveBeenCalledTimes(1);
  });
});
