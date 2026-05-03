import { describe, expect, it } from 'vitest';

import { normalizeHoldingOrganizationsResponse } from '@/services/holdingOrganizationsService';

describe('normalizeHoldingOrganizationsResponse', () => {
  it('normalizes LandingResponse child-organizations contract without fake fields', () => {
    const result = normalizeHoldingOrganizationsResponse({
      status: 200,
      statusText: 'OK',
      data: {
        success: true,
        data: {
          organizations: [
            {
              id: 42,
              name: 'Строй Контур',
              organization_type: 'child',
              is_holding: false,
              hierarchy_level: 1,
              tax_number: '7701234567',
              registration_number: null,
              address: null,
              created_at: '2026-04-30T10:00:00.000000Z',
              users_count: 7,
              projects_count: 3,
              contracts_count: 2,
              is_active: false,
            },
          ],
          pagination: {
            current_page: 1,
            last_page: 1,
            per_page: 15,
            total: 1,
          },
        },
      },
    });

    expect(result.pagination.total).toBe(1);
    expect(result.organizations).toEqual([
      {
        id: 42,
        name: 'Строй Контур',
        organization_type: 'child',
        hierarchy_level: 1,
        tax_number: '7701234567',
        registration_number: undefined,
        address: undefined,
        created_at: '2026-04-30T10:00:00.000000Z',
        is_active: false,
        stats: {
          users_count: 7,
          projects_count: 3,
          contracts_count: 2,
        },
      },
    ]);
    expect(result.organizations[0]?.email).toBeUndefined();
    expect(result.organizations[0]?.phone).toBeUndefined();
    expect(result.organizations[0]?.stats.active_contracts_value).toBeUndefined();
  });
});
