import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supportService } from '@/utils/api';
import { ContactForm } from './ContactForm';

vi.mock('@/utils/api', () => ({ supportService: { submitSupportRequest: vi.fn() } }));

function completeDraft() {
  fireEvent.change(screen.getByRole('textbox', { name: 'Ваше имя' }), { target: { value: 'Тестовый пользователь' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Email для связи' }), { target: { value: 'test@example.com' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Тема', exact: true }), { target: { value: 'Не открывается проект' } });
  fireEvent.change(screen.getByRole('textbox', { name: 'Сообщение', exact: true }), { target: { value: 'При открытии проекта вижу пустую страницу.' } });
}

describe('ContactForm submission', () => {
  beforeEach(() => vi.clearAllMocks());

  it.each([200, 400, 422, 429, 500])('keeps the draft after an unsuccessful response with HTTP %s', async (status) => {
    vi.mocked(supportService.submitSupportRequest).mockResolvedValueOnce({ status, statusText: 'Error', data: { success: false, message: 'SQL exception: internal details' } });
    render(<ContactForm />);
    completeDraft();
    fireEvent.click(screen.getByRole('button', { name: 'Отправить сообщение' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.queryByText('Сообщение отправлено')).not.toBeInTheDocument();
    expect(screen.queryByText(/SQL exception/)).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Сообщение', exact: true })).toHaveValue('При открытии проекта вижу пустую страницу.');
    expect(screen.getByRole('button', { name: 'Отправить сообщение' })).toBeEnabled();
  });

  it('shows success only for an accepted request', async () => {
    vi.mocked(supportService.submitSupportRequest).mockResolvedValueOnce({ status: 200, statusText: 'OK', data: { success: true, data: null } });
    render(<ContactForm />);
    completeDraft();
    fireEvent.click(screen.getByRole('button', { name: 'Отправить сообщение' }));
    expect(await screen.findByRole('status')).toHaveTextContent('Сообщение отправлено');
  });

  it('keeps a network failure readable without exposing raw exceptions', async () => {
    vi.mocked(supportService.submitSupportRequest).mockRejectedValueOnce(new Error('Failed to fetch: internal host'));
    render(<ContactForm />);
    completeDraft();
    fireEvent.click(screen.getByRole('button', { name: 'Отправить сообщение' }));
    expect(await screen.findByRole('alert')).not.toHaveTextContent('internal host');
    expect(screen.getByRole('textbox', { name: 'Тема', exact: true })).toHaveValue('Не открывается проект');
  });
});
