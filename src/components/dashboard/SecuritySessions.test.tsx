import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SecuritySessions } from './SecuritySessions';
import { securitySessionService } from '@/services/securitySessionService';

vi.mock('@/services/securitySessionService', () => ({ securitySessionService: { listPage: vi.fn(), revoke: vi.fn() } }));
const current = { id: 1, device_name: 'Мой компьютер', ip_address: null, ip_city: null, ip_country: null, is_current: true, status: 'active', last_seen_at: null };
const other = { ...current, id: 2, device_name: 'Другой компьютер', is_current: false };

const openConfirmation = async () => {
  fireEvent.click(await screen.findByRole('button', { name: /Завершить вход\s*:\s*Другой компьютер/ }));
  return screen.getByRole('dialog');
};

describe('SecuritySessions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(securitySessionService.listPage).mockResolvedValue({ sessions: [current, other], currentPage: 1, lastPage: 1, total: 2 });
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
    await waitFor(() => expect(screen.getByRole('button', { name: /Завершить вход\s*:\s*Другой компьютер/ })).toHaveFocus());
  });

  it('различает ошибку загрузки и пустой список, позволяет повторить запрос', async () => {
    vi.mocked(securitySessionService.listPage).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ sessions: [], currentPage: 1, lastPage: 1, total: 0 });
    render(<SecuritySessions />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить устройства');
    expect(screen.queryByText('Сведения о входах пока отсутствуют.')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    expect(await screen.findByText('Сведения о входах пока отсутствуют.')).toBeInTheDocument();
  });

  it('сохраняет диалог при ошибке удаления и подтверждает только успешный повтор', async () => {
    vi.mocked(securitySessionService.revoke).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(undefined);
    vi.mocked(securitySessionService.listPage)
      .mockResolvedValueOnce({ sessions: [current, other], currentPage: 1, lastPage: 1, total: 2 })
      .mockResolvedValueOnce({ sessions: [current], currentPage: 1, lastPage: 1, total: 1 });
    render(<SecuritySessions />);
    const dialog = await openConfirmation();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Завершить вход' }));
    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Не удалось завершить вход');
    expect(screen.queryByText('Вход на выбранном устройстве завершён.')).not.toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Завершить вход' }));
    expect(await screen.findByText('Вход на выбранном устройстве завершён.')).toBeInTheDocument();
    await screen.findByText('Всего: 1 · Страница 1 из 1');
    expect(screen.queryByText('Другой компьютер')).not.toBeInTheDocument();
    expect(securitySessionService.revoke).toHaveBeenLastCalledWith(2);
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Устройства и входы' })).toHaveFocus());
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

  it('запрашивает страницы истории и сбрасывает страницу при смене раздела', async () => {
    vi.mocked(securitySessionService.listPage).mockImplementation(async (group, page) => ({
      sessions: [group === 'active' ? current : { ...other, status: 'revoked' }],
      currentPage: page,
      lastPage: group === 'active' ? 1 : 3,
      total: group === 'active' ? 1 : 41,
    }));
    render(<SecuritySessions />);
    await screen.findByText('Мой компьютер');
    fireEvent.click(screen.getByRole('button', { name: 'История входов' }));
    await screen.findByText('Всего: 41 · Страница 1 из 3');
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    await screen.findByText('Всего: 41 · Страница 2 из 3');
    expect(securitySessionService.listPage).toHaveBeenLastCalledWith('history', 2, expect.any(AbortSignal));
    fireEvent.click(screen.getByRole('button', { name: 'Активные устройства' }));
    await screen.findByText('Всего: 1 · Страница 1 из 1');
    expect(securitySessionService.listPage).toHaveBeenLastCalledWith('active', 1, expect.any(AbortSignal));
  });

  it('отменяет чтение при уходе со страницы', async () => {
    const view = render(<SecuritySessions />);
    await screen.findByText('Мой компьютер');
    const signal = vi.mocked(securitySessionService.listPage).mock.calls[0][2];
    view.unmount();
    expect(signal?.aborted).toBe(true);
  });
});
