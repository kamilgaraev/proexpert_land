import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsManager } from './permissionsManager';

const api = vi.hoisted(() => ({
  getTokenFromStorages: vi.fn(() => 'token'),
  authorizedFetch: vi.fn(),
}));

vi.mock('@/services/debugPermissions', () => ({
  debugPermissions: vi.fn(),
  isPermissionsDebugEnabled: vi.fn(() => false),
}));

vi.mock('@/utils/api', () => ({
  getTokenFromStorages: api.getTokenFromStorages,
  authorizedFetch: api.authorizedFetch,
}));

const permissionsResponse = (overrides: Record<string, unknown> = {}) => ({
  success: true,
  data: {
    user_id: 12,
    organization_id: 34,
    permissions_flat: [],
    permissions: {
      system: [],
      modules: {},
    },
    roles: [],
    interfaces: ['lk'],
    active_modules: [],
    ...overrides,
  },
});

describe('PermissionsManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.getTokenFromStorages).mockReturnValue('token');
  });

  it('allows contractor marketplace permissions from contractor portal wildcard', async () => {
    vi.mocked(api.authorizedFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => permissionsResponse({
        permissions: {
          system: ['admin.*'],
          modules: {
            'contractor-portal': ['*'],
          },
        },
        roles: ['organization_owner'],
        active_modules: [{ slug: 'contractor-portal' }],
      }),
    } as Response);

    const manager = new PermissionsManager();

    await expect(manager.load('lk')).resolves.toBe(true);

    expect(manager.can('contractor_marketplace.profile.view')).toBe(true);
    expect(manager.can('contractor_marketplace.offers.view')).toBe(true);
    expect(manager.hasRole('organization_owner')).toBe(true);
    expect(manager.hasModule('contractor_marketplace')).toBe(true);
    expect(api.authorizedFetch).toHaveBeenCalledWith(
      'https://api.1мост.рф/api/lk/v1/permissions',
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('uses the interface-specific permissions check endpoint through the central auth flow', async () => {
    vi.mocked(api.authorizedFetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: { has_permission: true } }),
    } as Response);

    const manager = new PermissionsManager();

    await expect(manager.checkPermission('users.view', undefined, 'admin')).resolves.toBe(true);
    expect(api.authorizedFetch).toHaveBeenCalledWith(
      'https://api.1мост.рф/api/admin/v1/permissions/check',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });
});
