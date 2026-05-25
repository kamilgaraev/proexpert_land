import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  getModulesMock,
  getActiveModulesMock,
  getExpiringModulesMock,
  getBillingInfoMock,
  reloadPermissionsMock,
} = vi.hoisted(() => ({
  getModulesMock: vi.fn(),
  getActiveModulesMock: vi.fn(),
  getExpiringModulesMock: vi.fn(),
  getBillingInfoMock: vi.fn(),
  reloadPermissionsMock: vi.fn(),
}));

vi.mock('@utils/api', () => ({
  newModulesService: {
    getModules: getModulesMock,
    getActiveModules: getActiveModulesMock,
    getExpiringModules: getExpiringModulesMock,
    getBillingInfo: getBillingInfoMock,
  },
}));

vi.mock('@/hooks/usePermissions', () => ({
  usePermissions: () => ({
    reload: reloadPermissionsMock,
  }),
}));

import { useModules } from './useModules';

describe('useModules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getModulesMock.mockResolvedValue({ status: 200, data: { data: [] } });
    getActiveModulesMock.mockResolvedValue({ status: 200, data: { data: [] } });
    getExpiringModulesMock.mockResolvedValue({ status: 200, data: { data: [] } });
    getBillingInfoMock.mockResolvedValue({ status: 200, data: { data: {} } });
  });

  it('does not request module billing information when billing is not visible', async () => {
    const { result } = renderHook(() => useModules({ includeBilling: false }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getModulesMock).toHaveBeenCalled();
    expect(getActiveModulesMock).toHaveBeenCalled();
    expect(getExpiringModulesMock).toHaveBeenCalled();
    expect(getBillingInfoMock).not.toHaveBeenCalled();
  });
});
