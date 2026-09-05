import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SecuritySessions } from './SecuritySessions';
import { securitySessionService } from '@/services/securitySessionService';

vi.mock('@/services/securitySessionService', () => ({ securitySessionService: { list: vi.fn(), revoke: vi.fn() } }));
const current = { id: 1, device_name: 'Мой компьютер', ip_address: null, ip_city: null, ip_country: null, is_current: true, status: 'active', last_seen_at: null };
const other = { ...current, id: 2, device_name: 'Другой компьютер', is_current: false };

const openConfirmation = async () => {
  fireEvent.click(await screen.findByRole('button', { name: /Завершить вход\s*:\s*Другой компьютер/ }));
  return screen.getByRole('dialog');
};

describe('SecuritySessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(securitySessionService.list).mockResolvedValue([current, other]);
  });

  it('показывает реальные устройства и не предлагает завершать текущий вход', async () => {
    render(<SecuritySessions />);
    expect(await screen.findByText('Мой компьютер')).toBeInTheDocument();
    expect(screen.getByText('Это устройство')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Завершить вход\s*:\s*Мой компьютер/ })).not.toBeInTheDocument();
    expect(screen.queryByText(/Москва/)).not.toBeInTheDocument();
    const dialog = await openConfirmation();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Отмена' }));
    expect(securitySessionService.revoke).not.toHaveBeenCalled();
  });

  it('различает ошибку загрузки и пустой список, позволяет повторить запрос', async () => {
    vi.mocked(securitySessionService.list).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce([]);
    render(<SecuritySessions />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить устройства');
    expect(screen.queryByText('Сведения о входах пока отсутствуют.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(await screen.findByText('Сведения о входах пока отсутствуют.')).toBeInTheDocument();
  });

  it('сохраняет диалог при ошибке удаления и подтверждает только успешный повтор', async () => {
    vi.mocked(securitySessionService.revoke).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    render(<SecuritySessions />);
    const dialog = await openConfirmation();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Завершить вход' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Не удалось завершить вход');
    expect(screen.queryByText('Вход на выбранном устройстве завершён.')).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Завершить вход' }));
    expect(await screen.findByText('Вход на выбранном устройстве завершён.')).toBeInTheDocument();
    expect(screen.getByText('Вход завершён')).toBeInTheDocument();
    expect(securitySessionService.revoke).toHaveBeenLastCalledWith(2);
  });

  it('не отправляет повторное завершение пока запрос выполняется', async () => {
    let finish!: () => void;
    vi.mocked(securitySessionService.revoke).mockImplementation(() => new Promise<void>((resolve) => { finish = resolve; }));
    render(<SecuritySessions />);
    const dialog = await openConfirmation();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Завершить вход' }));
    expect(within(dialog).getByRole('button', { name: 'Завершаем…' })).toBeDisabled();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Завершаем…' }));
    expect(securitySessionService.revoke).toHaveBeenCalledTimes(1);
    await act(async () => finish());
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('отменяет чтение при уходе со страницы', async () => {
    const view = render(<SecuritySessions />);
    await screen.findByText('Мой компьютер');
    const signal = vi.mocked(securitySessionService.list).mock.calls[0][0];
    view.unmount();
    expect(signal?.aborted).toBe(true);
  });
});
