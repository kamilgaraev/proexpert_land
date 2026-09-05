import { beforeEach, expect, it, vi } from 'vitest';
import api from '@/utils/api';
import { notificationPreferencesService } from './notificationPreferencesService';

vi.mock('@/utils/api', () => ({ default: { get: vi.fn(), put: vi.fn() } }));
beforeEach(() => vi.resetAllMocks());

it('проверяет структуру настроек и сохраняет явное отсутствие каналов', async () => {
  const data = { items: [{ notification_type: 'marketing', name: 'Новости', description: 'Новости МОСТ', mandatory: false, user_customizable: true, enabled_channels: [] }], available_channels: ['email'] };
  vi.mocked(api.get).mockResolvedValue({ data: { success: true, data } });
  expect(await notificationPreferencesService.load()).toEqual(data);
});

it('не считает ошибочный ответ пустыми настройками', async () => {
  vi.mocked(api.get).mockResolvedValue({ data: { success: false, data: null } });
  await expect(notificationPreferencesService.load()).rejects.toThrow();
  vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: { items: [], available_channels: ['unknown'] } } });
  await expect(notificationPreferencesService.load()).rejects.toThrow();
});

it('отправляет пустой список без идентификаторов сотрудника и организации', async () => {
  vi.mocked(api.put).mockResolvedValue({ data: { success: true, data: null } });
  await notificationPreferencesService.save('marketing', []);
  expect(api.put).toHaveBeenCalledWith('/notifications/preferences', { notification_type: 'marketing', enabled_channels: [] });
});

it('не подтверждает сохранение при отказе сервера', async () => {
  vi.mocked(api.put).mockResolvedValue({ data: { success: false, data: null } });
  await expect(notificationPreferencesService.save('marketing', [])).rejects.toThrow();
});
