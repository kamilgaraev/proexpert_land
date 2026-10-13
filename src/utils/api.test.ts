import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  authService,
  authApi,
  authorizedFetch,
  createFetchResponse,
  getBalanceTransactionDescription,
  landingService,
  normalizeBalanceTransactionsResponse,
  normalizeOrganizationBalanceResponse,
  refreshAccessTokenOnce,
} from './api';
import api from './api';
import { clearAuthToken, clearCsrfToken, getAuthToken, getCsrfToken, saveAuthToken, saveCsrfToken } from './authTokenStorage';

afterEach(() => {
  clearAuthToken();
  clearCsrfToken();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('createFetchResponse', () => {
  it('accepts the standard AbortSignal in the central axios wrapper config', () => {
    const signal = new AbortController().signal;
    const config: Parameters<typeof api.get>[1] = { signal };

    expect(config.signal).toBe(signal);
  });

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
      remember_me: true,
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.data.data?.token).toBe('login-token');
    expect(getAuthToken()).toBeNull();
    expect(JSON.parse(fetchMock.mock.calls[1][1]?.body as string)).toMatchObject({
      email: 'user@example.com',
      remember_me: true,
    });
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

describe('refreshAccessTokenOnce', () => {
  it('сохраняет новый вход при позднем втором 401 старого запроса', async () => {
    const token = (id: string) => `header.${btoa(JSON.stringify({ session_uuid: id }))}.signature`;
    saveAuthToken(token('original-session'));
    vi.spyOn(authApi, 'get').mockResolvedValue({ data: { csrf_token: 'csrf', session_id: 'original-session' } } as never);
    vi.spyOn(authApi, 'post').mockResolvedValue({ data: { token: token('original-session'), csrf_token: 'next-csrf' } } as never);
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{}', { status: 401 })).mockImplementationOnce(async () => {
      saveAuthToken(token('new-session'));
      return new Response('{}', { status: 401 });
    }));
    await expect(authorizedFetch('/private')).rejects.toMatchObject({ response: { data: { code: 'web_auth_session_changed' } } });
    expect(getAuthToken()).toBe(token('new-session'));
  });
  it('не повторяет старый запрос с credentials нового входа', async () => {
    const token = (id: string) => `header.${btoa(JSON.stringify({ session_uuid: id }))}.signature`;
    saveAuthToken(token('old-session'));
    vi.stubGlobal('fetch', vi.fn(async () => {
      saveAuthToken(token('new-session'));
      return new Response('{}', { status: 401 });
    }));
    const csrf = vi.spyOn(authApi, 'get');
    await expect(authorizedFetch('/private')).rejects.toMatchObject({ response: { data: { code: 'web_auth_session_changed' } } });
    expect(csrf).not.toHaveBeenCalled();
    expect(getAuthToken()).toBe(token('new-session'));
  });
  it('выходит с актуальным CSRF и не отзывает новую сессию общей cookie', async () => {
    const original = `header.${btoa(JSON.stringify({ session_uuid: 'original-session' }))}.signature`;
    saveAuthToken(original);
    saveCsrfToken('stale-csrf');
    const csrf = vi.spyOn(authApi, 'get').mockResolvedValue({ data: { csrf_token: 'current-csrf', session_id: 'original-session' } } as never);
    const logout = vi.spyOn(authApi, 'post').mockResolvedValue({ data: {} } as never);
    await authService.logout(original);
    expect(logout).toHaveBeenCalledWith('/auth/logout', undefined, { headers: { Authorization: `Bearer ${original}`, 'X-CSRF-Token': 'current-csrf' } });
    logout.mockClear();
    csrf.mockResolvedValue({ data: { csrf_token: 'new-csrf', session_id: 'new-session' } } as never);
    await expect(authService.logout(original)).rejects.toMatchObject({ response: { data: { code: 'web_auth_session_changed' } } });
    expect(logout).not.toHaveBeenCalled();
  });
  it('не сбрасывает авторизацию при временном отказе обновления', async () => {
    saveAuthToken('current-access');
    saveCsrfToken('current-csrf');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
    vi.spyOn(authApi, 'get').mockResolvedValue({ data: { csrf_token: 'current-csrf' } } as never);
    vi.spyOn(authApi, 'post').mockRejectedValue({ response: { status: 503, data: { code: 'web_refresh_unavailable' } } });
    await expect(authorizedFetch('/private')).rejects.toMatchObject({ response: { status: 503 } });
    expect(getAuthToken()).toBe('current-access');
    expect(getCsrfToken()).toBe('current-csrf');
  });
  it('получает CSRF текущей общей cookie вместо устаревшего токена вкладки', async () => {
    saveAuthToken('old-access');
    saveCsrfToken('old-csrf');
    const csrf = vi.spyOn(authApi, 'get').mockResolvedValue({ data: { csrf_token: 'current-csrf' } } as never);
    const refresh = vi.spyOn(authApi, 'post').mockResolvedValue({ data: { token: 'new-access', csrf_token: 'next-csrf' } } as never);
    await refreshAccessTokenOnce();
    expect(csrf).toHaveBeenCalledOnce();
    expect(refresh).toHaveBeenCalledWith('/auth/refresh', undefined, { headers: { 'X-CSRF-Token': 'current-csrf' } });
  });

  it('повторяет CSRF-гонку один раз, сохраняя отказ Origin', async () => {
    const csrf = vi.spyOn(authApi, 'get').mockResolvedValue({ data: { csrf_token: 'current-csrf' } } as never);
    const refresh = vi.spyOn(authApi, 'post').mockRejectedValueOnce({ response: { status: 403, data: { code: 'web_csrf_mismatch' } } })
      .mockResolvedValueOnce({ data: { token: 'new-access', csrf_token: 'next-csrf' } } as never);
    await refreshAccessTokenOnce();
    expect(csrf).toHaveBeenCalledTimes(2);
    refresh.mockReset().mockRejectedValue({ response: { status: 403, data: { code: 'web_origin_forbidden' } } });
    await expect(refreshAccessTokenOnce()).rejects.toMatchObject({ response: { status: 403 } });
    expect(refresh).toHaveBeenCalledOnce();
  });

  it('не восстанавливает сессию после logout во время refresh', async () => {
    vi.spyOn(authApi, 'get').mockResolvedValue({ data: { csrf_token: 'csrf' } } as never);
    let resolve!: (value: never) => void;
    const response = new Promise<never>(done => { resolve = done; });
    const refresh = vi.spyOn(authApi, 'post').mockReturnValue(response);
    const pending = refreshAccessTokenOnce();
    await vi.waitFor(() => expect(refresh).toHaveBeenCalledOnce());
    clearAuthToken();
    clearCsrfToken();
    resolve({ data: { token: 'late-access', csrf_token: 'late-csrf' } } as never);
    await expect(pending).rejects.toThrow('Состояние авторизации изменилось');
    expect(getAuthToken()).toBeNull();
    expect(getCsrfToken()).toBeNull();
  });
  it('объединяет параллельные refresh-запросы и заменяет токены в памяти', async () => {
    const csrfRequest = vi.spyOn(authApi, 'get').mockResolvedValue({
      data: { data: { csrf_token: 'csrf-before-refresh' } },
    } as never);
    const refreshRequest = vi.spyOn(authApi, 'post').mockResolvedValue({
      data: { data: { token: 'refreshed-access-token', csrf_token: 'csrf-after-refresh' } },
    } as never);

    const [first, second] = await Promise.all([
      refreshAccessTokenOnce(),
      refreshAccessTokenOnce(),
    ]);

    expect(first).toEqual({ token: 'refreshed-access-token', csrfToken: 'csrf-after-refresh' });
    expect(second).toEqual(first);
    expect(csrfRequest).toHaveBeenCalledOnce();
    expect(refreshRequest).toHaveBeenCalledOnce();
    expect(refreshRequest).toHaveBeenCalledWith('/auth/refresh', undefined, {
      headers: { 'X-CSRF-Token': 'csrf-before-refresh' },
    });
    expect(getAuthToken()).toBe('refreshed-access-token');
    expect(getCsrfToken()).toBe('csrf-after-refresh');
  });

  it('повторяет bearer-запрос после единого refresh при ответе 401', async () => {
    vi.spyOn(authApi, 'get').mockResolvedValue({ data: { csrf_token: 'csrf-before-refresh' } } as never);
    saveAuthToken('expired-access-token');
    saveCsrfToken('csrf-before-refresh');
    vi.spyOn(authApi, 'post').mockResolvedValue({
      data: { data: { token: 'fresh-access-token', csrf_token: 'fresh-csrf-token' } },
    } as never);
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await authorizedFetch('https://api.1мост.рф/api/v1/landing/projects');

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(new Headers(fetchMock.mock.calls[0]?.[1]?.headers).get('Authorization')).toBe('Bearer expired-access-token');
    expect(new Headers(fetchMock.mock.calls[1]?.[1]?.headers).get('Authorization')).toBe('Bearer fresh-access-token');
    expect(authApi.post).toHaveBeenCalledWith('/auth/refresh', undefined, {
      headers: { 'X-CSRF-Token': 'csrf-before-refresh' },
    });
  });
});

describe('authService.register', () => {
  it('does not persist a token from a successful verification-required registration response', async () => {
    const payload = {
      success: true,
      message: 'Регистрация завершена. Подтвердите email, чтобы войти в аккаунт.',
      data: {
        status: 'verification_required',
        email_verified: false,
        can_enter_portal: false,
        email: 'owner@example.test',
        token: 'unexpected-registration-token',
      },
    };

    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(payload), {
      status: 201,
      statusText: 'Created',
      headers: {
        'content-type': 'application/json',
      },
    })));

    const result = await authService.register(new FormData(), 'registration-key-123');

    expect(result.data.data?.status).toBe('verification_required');
    expect(getAuthToken()).toBeNull();
  });

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

    await expect(authService.register(new FormData(), 'registration-key-456')).rejects.toMatchObject({
      message: payload.message,
      status: 422,
      data: payload,
      errors: payload.errors,
    });

    expect(getAuthToken()).toBeNull();
  });

  it('sends a stable idempotency header and normalizes Safari transport failures', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('Load failed'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(authService.register(new FormData(), 'registration-key-safari')).rejects.toMatchObject({
      name: 'ApiTransportError',
      kind: 'aborted',
      message: 'Не удалось связаться с сервером. Проверьте подключение и повторите регистрацию.',
    });
    expect(new Headers(fetchMock.mock.calls[0][1]?.headers).get('Idempotency-Key'))
      .toBe('registration-key-safari');
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
