import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/utils/api';
import { securitySessionService } from './securitySessionService';

vi.mock('@/utils/api', () => ({ default: { get: vi.fn(), delete: vi.fn() } }));

const session = {
  id: 14,
  device_name: 'Chrome на Windows',
  ip_address: null,
  ip_country: null,
  ip_city: null,
  status: 'active',
  is_current: true,
  last_seen_at: '2026-09-05T10:00:00Z',
};

describe('securitySessionService', () => {
  beforeEach(() => vi.clearAllMocks());

  it('читает сеансы из ответа ЛК и передаёт сигнал отмены', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: { success: true, data: [session] } });
    const controller = new AbortController();
    await expect(securitySessionService.list(controller.signal)).resolves.toEqual([session]);
    expect(api.get).toHaveBeenCalledWith('/security/sessions', { signal: controller.signal });
  });

  it.each([
    { success: false, data: [] },
    { success: true, data: null },
    { success: true, data: [{ ...session, is_current: undefined }] },
  ])('не подменяет некорректный ответ пустым списком', async (data) => {
    vi.mocked(api.get).mockResolvedValue({ data });
    await expect(securitySessionService.list()).rejects.toThrow();
  });

  it('считает завершение успешным только после подтверждения сервера', async () => {
    vi.mocked(api.delete).mockResolvedValueOnce({ data: { success: false, data: null } });
    await expect(securitySessionService.revoke(14)).rejects.toThrow();
    vi.mocked(api.delete).mockResolvedValueOnce({ data: { success: true, data: null } });
    await expect(securitySessionService.revoke(14)).resolves.toBeUndefined();
    expect(api.delete).toHaveBeenLastCalledWith('/security/sessions/14');
  });

  it('передаёт сетевую ошибку вызывающему экрану', async () => {
    const failure = new Error('network');
    vi.mocked(api.delete).mockRejectedValue(failure);
    await expect(securitySessionService.revoke(14)).rejects.toBe(failure);
  });

  it('не отправляет запрос с некорректным идентификатором', async () => {
    await expect(securitySessionService.revoke(-1)).rejects.toThrow();
    expect(api.delete).not.toHaveBeenCalled();
  });
});
