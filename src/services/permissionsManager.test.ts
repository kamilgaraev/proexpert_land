import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PermissionsManager } from './permissionsManager';

vi.mock('@/services/debugPermissions', () => ({
  debugPermissions: vi.fn(),
  isPermissionsDebugEnabled: vi.fn(() => false),
}));

vi.mock('@/utils/api', () => ({
  getTokenFromStorages: vi.fn(() => 'token'),
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
    vi.stubGlobal('fetch', vi.fn());
  });

  it('allows contractor marketplace permissions from contractor portal wildcard', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
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
  });
});
