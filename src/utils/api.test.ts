import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  authService,
  billingService,
  createFetchResponse,
  getBalanceTransactionDescription,
  landingService,
  normalizeBalanceTransactionsResponse,
  normalizeOrganizationBalanceResponse,
} from './api';
import { clearAuthToken, getAuthToken, saveAuthToken } from './authTokenStorage';

afterEach(() => {
  clearAuthToken();
  vi.unstubAllGlobals();
});

describe('createFetchResponse', () => {
  it('creates a typed axios-like response for fetch payloads', () => {
    const response = new Response(JSON.stringify({ success: true }), {
      status: 201,
      statusText: 'Created',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'request-42',
      },
    });

    const result = createFetchResponse({ success: true }, response);

    expect(result).toEqual({
      data: { success: true },
      status: 201,
      statusText: 'Created',
      headers: {
        'content-type': 'application/json',
        'x-request-id': 'request-42',
      },
      config: {
        headers: {},
      },
    });
  });
});

describe('authService.login', () => {
  it('retries a transient transport failure before returning the login response', async () => {
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: {
          token: 'login-token',
          user: {
            id: 1,
            email: 'user@example.com',
          },
        },
      }), {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
        },
      }));

    vi.stubGlobal('fetch', fetchMock);

    const result = await authService.login({
      email: 'user@example.com',
      password: 'secret-password',
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.data.data?.token).toBe('login-token');
    expect(getAuthToken()).toBe('login-token');
  });

  it('converts persistent fetch transport failures to a user-facing Russian error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(authService.login({
      email: 'user@example.com',
      password: 'secret-password',
    })).rejects.toMatchObject({
      message: 'Не удалось подключиться к серверу. Проверьте подключение к интернету или попробуйте позже.',
      status: 0,
    });
  });
});

describe('authService.register', () => {
  it('throws validation errors from the registration API instead of returning a tokenless response', async () => {
    const payload = {
      success: false,
      message: 'Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру',
      data: null,
      errors: {
        password: ['Пароль должен содержать минимум одну заглавную букву, одну строчную букву и одну цифру'],
      },
    };

    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), {
      status: 422,
      statusText: 'Unprocessable Content',
      headers: {
        'content-type': 'application/json',
      },
    })));

    await expect(authService.register(new FormData())).rejects.toMatchObject({
      message: payload.message,
      status: 422,
      data: payload,
      errors: payload.errors,
    });

    expect(getAuthToken()).toBeNull();
  });
});

describe('billing response normalizers', () => {
  it('normalizes balance from Laravel resource envelope', () => {
    expect(normalizeOrganizationBalanceResponse({
      data: {
        organization_id: 7,
        balance_cents: 125000,
        balance_formatted: '1 250.00',
        currency: 'RUB',
        updated_at: '2026-05-08T10:00:00+03:00',
      },
    })).toEqual({
      organization_id: 7,
      balance_cents: 125000,
      balance_formatted: '1 250.00',
      currency: 'RUB',
      updated_at: '2026-05-08T10:00:00+03:00',
    });
  });

  it('normalizes paginated transactions from Laravel collection envelope', () => {
    const result = normalizeBalanceTransactionsResponse({
      data: [
        {
          id: 10,
          type: 'credit',
          amount_cents: 500000,
          amount_formatted: '5 000.00',
          balance_before_cents: 0,
          balance_after_cents: 500000,
          description: null,
          payment_id: null,
          user_subscription_id: null,
          meta: { type: 'contractor_referral_reward' },
          created_at: '2026-05-08T10:00:00+03:00',
        },
      ],
      links: { first: null, last: null, prev: null, next: null },
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 1 },
    });

    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
    expect(result.meta.per_page).toBe(10);
  });

  it('uses business labels for referral balance transactions', () => {
    expect(getBalanceTransactionDescription({
      id: 10,
      type: 'credit',
      amount_cents: 500000,
      amount_formatted: '5 000.00',
      balance_before_cents: 0,
      balance_after_cents: 500000,
      description: null,
      payment_id: null,
      user_subscription_id: null,
      meta: { type: 'contractor_referral_reward' },
      created_at: '2026-05-08T10:00:00+03:00',
    })).toBe('Бонус за приглашенную организацию');
  });
});

describe('billingService', () => {
  it('loads organization dashboard from the landing billing dashboard endpoint', async () => {
    saveAuthToken('test-token');
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ data: { ok: true } }), {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
      },
    }));

    vi.stubGlobal('fetch', fetchMock);

    const result = await billingService.getOrgDashboard();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.prohelper.pro/api/v1/landing/billing/dashboard',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
    expect(result.data).toEqual({ ok: true });
  });
});

describe('landingService', () => {
  it('unwraps landing dashboard response data from the Laravel envelope', async () => {
    saveAuthToken('test-token');
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      success: true,
      message: 'loaded',
      data: {
        financial: {
          balance: 125000,
          credits_this_month: 50000,
          debits_this_month: 25000,
        },
        projects: {
          total: 3,
          active: 2,
          completed: 1,
        },
        contracts: {
          total: 7,
          active: 5,
          draft: 1,
          completed: 1,
          total_amount: 3000000,
        },
        works_materials: {
          works: {},
          materials: {},
        },
        acts: {
          total: 4,
          approved: 3,
          total_amount: 750000,
        },
        team: {
          total: 12,
          by_roles: {},
        },
        team_details: [],
        charts: {
          projects_monthly: { labels: ['Июнь'], values: [3] },
          contracts_monthly: { labels: ['Июнь'], values: [7] },
          completed_works_monthly: { labels: ['Июнь'], values: [4] },
          balance_monthly: { labels: ['Июнь'], values: [125000] },
          projects_status: { active: 2, completed: 1 },
          contracts_status: { active: 5, completed: 1 },
          status_labels: {
            projects: { active: 'Активные', completed: 'Завершенные' },
            contracts: { active: 'Активные', completed: 'Завершенные' },
          },
        },
      },
    }), {
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
      },
    }));

    vi.stubGlobal('fetch', fetchMock);

    const result = await landingService.getLandingDashboard();

    expect(result.data.projects.total).toBe(3);
    expect(result.data.financial.balance).toBe(125000);
    expect(result.data.charts.status_labels?.projects?.active).toBe('Активные');
  });
});
