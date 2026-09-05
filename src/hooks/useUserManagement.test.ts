import { act, renderHook } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { useUserManagement } from './useUserManagement';

const api = vi.hoisted(() => ({ getAvailableRoles: vi.fn(), createInvitation: vi.fn() }));
vi.mock('@utils/api', () => ({
  customRolesService: { getAvailableRoles: api.getAvailableRoles },
  userManagementService: { createInvitation: api.createInvitation },
}));
beforeEach(() => {
  vi.resetAllMocks();
  api.getAvailableRoles.mockResolvedValue({ data: { system_roles: [], custom_roles: [] } });
});

it('ошибка отправки не превращается в ошибку загрузки ролей', async () => {
  api.createInvitation.mockRejectedValue(new Error('Не удалось отправить'));
  const { result } = renderHook(() => useUserManagement());
  await act(async () => { await result.current.fetchRoles(); });
  await act(async () => {
    await expect(result.current.sendInvitation({ name: 'Анна', email: 'anna@example.test', role_slugs: [] })).rejects.toThrow();
  });
  expect(result.current.error).toBe('Не удалось отправить');
  expect(result.current.rolesError).toBeNull();
});

it('ошибка списка ролей очищается после успешного повтора', async () => {
  api.getAvailableRoles.mockRejectedValueOnce(new Error('Unavailable'));
  const { result } = renderHook(() => useUserManagement());
  await act(async () => { await result.current.fetchRoles(); });
  expect(result.current.rolesError).toBe('Не удалось загрузить роли.');
  await act(async () => { await result.current.fetchRoles(); });
  expect(result.current.rolesError).toBeNull();
});
