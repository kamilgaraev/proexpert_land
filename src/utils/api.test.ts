import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  billingService,
  createFetchResponse,
  getBalanceTransactionDescription,
  normalizeBalanceTransactionsResponse,
  normalizeOrganizationBalanceResponse,
} from './api';
import { clearAuthToken, saveAuthToken } from './authTokenStorage';

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

    await billingService.getOrgDashboard();

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.prohelper.pro/api/v1/landing/billing/dashboard',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    );
  });
});
