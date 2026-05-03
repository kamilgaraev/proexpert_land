import { describe, expect, it } from 'vitest';
import {
  normalizeChildOrganizationsPayload,
  normalizeOrganizationStatsPayload,
} from './childOrganizationManagerData';

describe('childOrganizationManagerData', () => {
  it('normalizes nested LandingResponse payload with child organizations', () => {
    const payload = {
      success: true,
      data: {
        organizations: [
          {
            id: 124,
            name: 'ООО Строитель',
            organization_type: 'child',
            hierarchy_level: 1,
            tax_number: '1234567890',
            registration_number: '123456789',
            address: 'Казань',
            users_count: 15,
            projects_count: 8,
            contracts_count: 5,
            is_active: true,
            created_at: '2026-05-01T10:00:00Z',
          },
        ],
        pagination: {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 1,
        },
      },
    };

    const result = normalizeChildOrganizationsPayload(payload);

    expect(result.organizations).toHaveLength(1);
    expect(result.organizations[0]?.name).toBe('ООО Строитель');
    expect(result.pagination.total).toBe(1);
  });

  it('keeps only real child organization stats contract fields', () => {
    const result = normalizeOrganizationStatsPayload({
      success: true,
      data: {
        users: { total: 15, active: 13, owners: 2 },
        projects: { total: 8, active: 5, completed: 2 },
        contracts: {
          total: 5,
          active: 3,
          total_value: 1800000,
          active_value: 1200000,
          monthly_income: 999,
        },
        financial: {
          balance: 350000,
          monthly_expenses: 85000,
          current_balance: 123,
        },
      },
    });

    expect(result.contracts.active_value).toBe(1200000);
    expect(result.financial.balance).toBe(350000);
    expect('monthly_income' in result.contracts).toBe(false);
    expect('current_balance' in result.financial).toBe(false);
  });
});
