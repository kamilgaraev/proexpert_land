import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCustomRoles } from './useCustomRoles';

const service = vi.hoisted(() => ({
  getCustomRoles: vi.fn(),
  getAvailableRoles: vi.fn(),
  getCustomRolePermissions: vi.fn(),
  createCustomRole: vi.fn(),
  updateCustomRole: vi.fn(),
  deleteCustomRole: vi.fn(),
  cloneCustomRole: vi.fn(),
}));
vi.mock('@utils/api', () => ({ customRolesService: service }));

const operations = [
  { name: 'создание', method: 'createCustomRole', args: [{ name: 'Прораб', system_permissions: [], module_permissions: {}, interface_access: ['lk'] }] },
  { name: 'изменение', method: 'updateCustomRole', args: [7, { name: 'Прораб' }] },
  { name: 'удаление', method: 'deleteCustomRole', args: [7] },
  { name: 'копирование', method: 'cloneCustomRole', args: [7, 'Прораб'] },
] as const;

beforeEach(() => {
  vi.resetAllMocks();
  service.getCustomRoles.mockResolvedValue({ data: { data: [] } });
  service.getAvailableRoles.mockResolvedValue({ data: {} });
  service.getCustomRolePermissions.mockResolvedValue({ data: { system_permissions: [], module_permissions: {} } });
});

describe('Ответы API операций с ролями', () => {
  it('по умолчанию загружает все каталоги один раз без повторов при перерисовке', async () => {
    const { result, rerender } = renderHook(() => useCustomRoles());
    await waitFor(() => expect(result.current.availablePermissions).not.toBeNull());
    rerender();
    expect(service.getCustomRoles).toHaveBeenCalledTimes(1);
    expect(service.getAvailableRoles).toHaveBeenCalledTimes(1);
    expect(service.getCustomRolePermissions).toHaveBeenCalledTimes(1);
  });

  it('без автозагрузки оставляет запросы вызывающему коду и получает свежие роли при повторе', async () => {
    const { result, rerender } = renderHook(() => useCustomRoles({ autoLoad: false }));
    rerender();
    expect(service.getCustomRoles).not.toHaveBeenCalled();
    expect(service.getAvailableRoles).not.toHaveBeenCalled();
    expect(service.getCustomRolePermissions).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    service.getCustomRoles.mockRejectedValueOnce(new Error('Unavailable'));
    await act(async () => { await result.current.fetchCustomRoles(); });
    expect(result.current.error).toBe('Unavailable');
    service.getCustomRoles.mockResolvedValueOnce({ data: { data: [{ id: 41, name: 'Прораб' }] } });
    await act(async () => { await result.current.fetchCustomRoles(); });
    expect(result.current.customRoles).toEqual([{ id: 41, name: 'Прораб' }]);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(service.getCustomRoles).toHaveBeenCalledTimes(2);
    expect(service.getAvailableRoles).not.toHaveBeenCalled();
    expect(service.getCustomRolePermissions).not.toHaveBeenCalled();
  });

  it.each(operations)('$name: отказ не обновляет список, повтор успешно завершается', async ({ method, args }) => {
    const { result } = renderHook(() => useCustomRoles());
    await waitFor(() => expect(result.current.availablePermissions).not.toBeNull());
    service.getCustomRoles.mockClear();
    service[method].mockResolvedValueOnce({ status: 200, data: { success: false, message: 'Операция отклонена' } });
    const invoke = () => (result.current[method] as (...values: unknown[]) => Promise<unknown>)(...args);
    await act(async () => {
      await expect(invoke()).rejects.toThrow('Операция отклонена');
    });
    expect(service.getCustomRoles).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    service[method].mockResolvedValueOnce({ status: 200, data: { success: true } });
    await act(async () => { await invoke(); });
    expect(service.getCustomRoles).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  it.each(operations)('$name: успешный HTTP-ответ без флага поддерживается', async ({ method, args }) => {
    const { result } = renderHook(() => useCustomRoles());
    await waitFor(() => expect(result.current.availablePermissions).not.toBeNull());
    service.getCustomRoles.mockClear();
    service[method].mockResolvedValueOnce({ status: 201, data: { data: { id: 7 } } });
    await act(async () => {
      await (result.current[method] as (...values: unknown[]) => Promise<unknown>)(...args);
    });
    expect(service.getCustomRoles).toHaveBeenCalledTimes(1);
    expect(result.current.loading).toBe(false);
  });
});
