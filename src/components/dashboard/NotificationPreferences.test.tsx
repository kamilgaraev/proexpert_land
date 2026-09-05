import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { NotificationPreferences } from './NotificationPreferences';
import { notificationPreferencesService } from '@/services/notificationPreferencesService';

vi.mock('@/services/notificationPreferencesService', () => ({ notificationPreferencesService: { load: vi.fn(), save: vi.fn() } }));

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(notificationPreferencesService.load).mockResolvedValue({
    available_channels: ['email', 'in_app', 'websocket'],
    items: [
      { notification_type: 'marketing', name: 'Новости', description: '', mandatory: false, user_customizable: true, enabled_channels: ['email'] },
      { notification_type: 'transactional', name: 'Платежи', description: '', mandatory: true, user_customizable: false, enabled_channels: ['email', 'in_app'] },
    ],
  });
});

it('сохраняет отключение каналов только после подтверждения сервера', async () => {
  vi.mocked(notificationPreferencesService.save).mockResolvedValue();
  render(<NotificationPreferences />);
  const row = within(await screen.findByRole('group', { name: 'Новости МОСТ' }));
  fireEvent.click(row.getByRole('checkbox', { name: 'На почту' }));
  fireEvent.click(row.getByRole('button', { name: 'Сохранить' }));
  expect(await row.findByRole('status')).toHaveTextContent('Настройки сохранены');
  expect(notificationPreferencesService.save).toHaveBeenCalledWith('marketing', []);
  expect(row.getByRole('button', { name: 'Сохранить' })).toBeDisabled();
  const mandatory = within(screen.getByRole('group', { name: 'Платежи и подтверждения' }));
  expect(mandatory.getByRole('checkbox', { name: 'На почту' })).toBeDisabled();
  expect(mandatory.queryByRole('button')).not.toBeInTheDocument();
});

it('сохраняет выбор после ошибки и объединяет доставку в кабинете', async () => {
  vi.mocked(notificationPreferencesService.save).mockRejectedValue(new Error('network'));
  render(<NotificationPreferences />);
  const row = within(await screen.findByRole('group', { name: 'Новости МОСТ' }));
  fireEvent.click(row.getByRole('checkbox', { name: 'В кабинете' }));
  fireEvent.click(row.getByRole('button', { name: 'Сохранить' }));
  expect(await row.findByRole('alert')).toHaveTextContent('Не удалось сохранить');
  expect(row.getByRole('checkbox', { name: 'В кабинете' })).toBeChecked();
  expect(notificationPreferencesService.save).toHaveBeenLastCalledWith('marketing', ['email', 'in_app', 'websocket']);
  vi.mocked(notificationPreferencesService.save).mockResolvedValue();
  fireEvent.click(row.getByRole('button', { name: 'Сохранить' }));
  await waitFor(() => expect(notificationPreferencesService.save).toHaveBeenCalledTimes(2));
  expect(await row.findByRole('status')).toBeInTheDocument();
});

it('предлагает повтор после ошибки загрузки', async () => {
  vi.mocked(notificationPreferencesService.load).mockRejectedValueOnce(new Error('network'));
  render(<NotificationPreferences />);
  expect(await screen.findByRole('alert')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
  expect(await screen.findByRole('group', { name: 'Новости МОСТ' })).toBeInTheDocument();
});
