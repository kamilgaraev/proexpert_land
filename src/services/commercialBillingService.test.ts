import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import {
  commercialBillingService,
  COMMERCIAL_PAYMENT_POLL_DELAYS_MS,
  createCheckoutIntentKey,
  pollCommercialOrder,
} from './commercialBillingService';
import { clearAuthToken, saveAuthToken } from '@/utils/authTokenStorage';

const baseUrl = 'https://api.xn--1-xtbgmf.xn--p1ai/api/v1/landing';

const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  window.sessionStorage.clear();
  clearAuthToken();
  vi.useRealTimers();
});
afterAll(() => server.close());

describe('commercialBillingService', () => {
  it('повторно проверяет оплату через полсекунды и продолжает проверку около минуты', () => {
    expect(COMMERCIAL_PAYMENT_POLL_DELAYS_MS.slice(0, 3)).toEqual([0, 500, 1000]);
    expect(COMMERCIAL_PAYMENT_POLL_DELAYS_MS.reduce((total, delay) => total + delay, 0)).toBeGreaterThanOrEqual(50000);
  });

  it('нормализует LandingResponse каталога и пагинацию истории', async () => {
    saveAuthToken('test-token');
    server.use(
      http.get(`${baseUrl}/packages`, () => HttpResponse.json({
        success: true,
        data: [{
          slug: 'machinery',
          name: 'Механизация',
          description: 'Контроль техники',
          sort_order: 1,
          price: '7900.00',
          price_minor: 790000,
          currency: 'RUB',
          billing_period_days: 30,
          modules: [{
            slug: 'machinery',
            name: 'Техника',
            description: 'Учёт техники, рейсов и загрузки.',
            billing_model: 'subscription',
          }],
          highlights: ['Рейсы'],
          business_outcomes: ['Меньше простоев'],
          is_active: false,
          status: null,
          access_source: null,
          current_period_start_at: null,
          current_period_end_at: null,
          trial_ends_at: null,
          trial_available: false,
          trial_used: true,
        }],
      })),
      http.get(`${baseUrl}/billing/commercial/history`, ({ request }) => {
        expect(new URL(request.url).searchParams.get('page')).toBe('2');
        return HttpResponse.json({
          success: true,
          data: [{ order_id: 'order-1', status: 'refunded', amount: '7900.00', amount_minor: 790000, currency: 'RUB', selected_package_slugs: ['machinery'], offer_type: 'packages', period_start_at: null, period_end_at: null, auto_renew_consent: false, payment_status: 'succeeded', confirmation_url: null, created_at: '2026-07-10T10:00:00Z', paid_at: '2026-07-10T10:01:00Z', canceled_at: null, refunds_summary: { count: 1, amount: '7900.00', amount_minor: 790000, currency: 'RUB', fully_refunded: true }, payments: [], refunds: [] }],
          meta: { current_page: 2, per_page: 20, last_page: 3, total: 41 },
          links: { first: null, last: null, prev: null, next: null },
        });
      }),
    );

    const packages = await commercialBillingService.getPackages();
    expect(packages[0].modules[0]).toEqual({
      slug: 'machinery',
      name: 'Техника',
      description: 'Учёт техники, рейсов и загрузки.',
    });
    expect(packages[0]).toMatchObject({ trialAvailable: false, trialUsed: true });
    await expect(commercialBillingService.getHistory(2)).resolves.toMatchObject({
      items: [{ orderId: 'order-1', status: 'refunded' }],
      meta: { currentPage: 2, total: 41 },
    });
  });

  it('нормализует пакеты, лимиты и дополнительные ресурсы без потери состава', async () => {
    saveAuthToken('test-token');
    server.use(
      http.get(`${baseUrl}/packages`, () => HttpResponse.json({
        success: true,
        data: [
          {
            slug: 'projects-processes',
            name: 'Проекты и процессы',
            description: 'Проектный контур',
            sort_order: 1,
            price: '990.00',
            price_minor: 99000,
            currency: 'RUB',
            billing_period_days: 30,
            modules: [{ slug: 'projects', name: 'Проекты', description: 'Работа с проектами' }],
            highlights: ['Проекты'],
            business_outcomes: ['Контроль портфеля'],
            is_active: true,
            status: 'active',
            access_source: 'paid_package',
            current_period_start_at: '2026-07-22T16:56:00Z',
            current_period_end_at: '2026-08-22T16:56:00Z',
            trial_ends_at: null,
            trial_available: false,
            trial_used: true,
          },
          {
            slug: 'planning-schedules',
            name: 'Графики и планирование',
            description: 'Графики работ',
            sort_order: 2,
            price: '990.00',
            price_minor: 99000,
            currency: 'RUB',
            billing_period_days: 30,
            modules: [{ slug: 'schedules', name: 'Графики', description: 'Календарное планирование' }],
            highlights: [],
            business_outcomes: [],
            is_active: false,
            status: null,
            access_source: null,
            current_period_start_at: null,
            current_period_end_at: null,
            trial_ends_at: null,
            trial_available: true,
            trial_used: false,
          },
        ],
      })),
      http.get(`${baseUrl}/billing/limits`, () => HttpResponse.json({
        success: true,
        data: {
          account_status: 'active',
          offer_type: 'packages',
          monthly_package_amount_minor: 99000,
          monthly_package_amount: '990.00',
          monthly_resource_amount_minor: 20000,
          monthly_resource_amount: '200.00',
          currency: 'RUB',
          period: { start_at: '2026-07-22T16:56:00Z', end_at: '2026-08-22T16:56:00Z' },
          limits: [
            { key: 'projects', name: 'Проекты', unit: 'project', used: 2, limit: 12, remaining: 10, percent: 17, status: 'ok', enforcement: 'hard', sources: { free_base: 2, packages: 10, paid_addons: 0, corporate_override: null } },
            { key: 'storage_gb', name: 'Хранилище', unit: 'gb', used: 1.5, limit: 32, remaining: 30.5, percent: 5, status: 'ok', enforcement: 'hard', sources: { free_base: 2, packages: 20, paid_addons: 10, corporate_override: null } },
          ],
          resource_addons: [
            { slug: 'storage_gb', limit_key: 'storage_gb', name: 'Дополнительное хранилище', unit: 'gb', current_quantity: 10, step: 10, min: 0, max_self_service: 1000, requires_package: null, requires_module: null, available: true, pricing: { model: 'linear', currency: 'RUB', price_minor: 2000, amount: '20.00' } },
            { slug: 'extra_holding_organizations', limit_key: 'holding_organizations', name: 'Дополнительные организации холдинга', unit: 'organization', current_quantity: 1, step: 1, min: 0, max_self_service: 50, requires_package: null, requires_module: 'multi-organization', available: true, pricing: { model: 'linear', currency: 'RUB', price_minor: 100000, amount: '1000.00' } },
            { slug: 'extra_ai_requests', limit_key: 'ai_requests_month', name: 'Дополнительные AI-запросы', unit: 'request', current_quantity: 0, step: 100, min: 0, max_self_service: 10000, requires_package: null, requires_module: 'ai-assistant', available: true, pricing: { model: 'linear', currency: 'RUB', price_minor: 500, amount: '5.00' } },
            { slug: 'extra_document_pages', limit_key: 'document_pages_month', name: 'Дополнительные страницы распознавания', unit: 'page', current_quantity: 0, step: 100, min: 0, max_self_service: 5000, requires_package: 'estimates-norms', requires_module: null, available: false, pricing: { model: 'linear', currency: 'RUB', price_minor: 1000, amount: '10.00' } },
          ],
        },
      })),
    );

    await expect(commercialBillingService.getPackages()).resolves.toMatchObject([
      {
        slug: 'projects-processes',
        name: 'Проекты и процессы',
        priceMinor: 99000,
        isActive: true,
        accessSource: 'paid_package',
        modules: [{ slug: 'projects', name: 'Проекты' }],
      },
      {
        slug: 'planning-schedules',
        name: 'Графики и планирование',
        isActive: false,
        trialAvailable: true,
      },
    ]);

    await expect(commercialBillingService.getLimits()).resolves.toMatchObject({
      accountStatus: 'active',
      offerType: 'packages',
      monthlyPackageAmountMinor: 99000,
      monthlyResourceAmountMinor: 20000,
      limits: [
        {
          key: 'projects',
          name: 'Проекты',
          unit: 'project',
          limit: 12,
          sources: { freeBase: 2, packages: 10, paidAddons: 0, corporateOverride: null },
        },
        {
          key: 'storage_gb',
          name: 'Хранилище',
          unit: 'gb',
          limit: 32,
          sources: { freeBase: 2, packages: 20, paidAddons: 10, corporateOverride: null },
        },
      ],
      resourceAddons: [
        {
          slug: 'storage_gb',
          limitKey: 'storage_gb',
          name: 'Дополнительное хранилище',
          currentQuantity: 10,
          step: 10,
          available: true,
          pricing: { priceMinor: 2000, amount: '20.00' },
        },
        {
          slug: 'extra_holding_organizations',
          limitKey: 'holding_organizations',
          requiresPackage: null,
          requiresModule: 'multi-organization',
          available: true,
          pricing: { priceMinor: 100000, amount: '1000.00' },
        },
        {
          slug: 'extra_ai_requests',
          limitKey: 'ai_requests_month',
          requiresPackage: null,
          requiresModule: 'ai-assistant',
          available: true,
          pricing: { priceMinor: 500, amount: '5.00' },
        },
        {
          slug: 'extra_document_pages',
          limitKey: 'document_pages_month',
          name: 'Дополнительные страницы распознавания',
          requiresPackage: 'estimates-norms',
          requiresModule: null,
          available: false,
        },
      ],
    });
  });

  it('передает точный checkout payload и повторно использует UUID одного намерения', async () => {
    saveAuthToken('test-token');
    const first = createCheckoutIntentKey('machinery|1|renew');
    const second = createCheckoutIntentKey('machinery|1|renew');
    const different = createCheckoutIntentKey('pto|1|renew');
    expect(first).toBe(second);
    expect(first).not.toBe(different);
    expect(first).toMatch(/^[0-9a-f-]{36}$/i);

    server.use(http.post(`${baseUrl}/billing/commercial/checkout`, async ({ request }) => {
      expect(await request.json()).toEqual({
        target_package_slugs: ['machinery'],
        current_package_slugs: [],
        full_suite: false,
        quote_version: 1,
        resource_quote_version: 1,
        client_idempotency_key: first,
        auto_renew_consent: true,
        use_balance: false,
        resources: [],
      });
      return HttpResponse.json({ success: true, data: { order_id: 'order-1', status: 'pending_payment', amount: '7900.00', amount_minor: 790000, currency: 'RUB', confirmation_url: 'https://yookassa.ru/confirm/safe', payment_status: 'pending', auto_renew_consent: true, test_mode: false } });
    }));

    await expect(commercialBillingService.checkout({
      targetPackageSlugs: ['machinery'], currentPackageSlugs: [], fullSuite: false,
      quoteVersion: 1, clientIdempotencyKey: first, autoRenewConsent: true, useBalance: false,
    })).resolves.toMatchObject({ orderId: 'order-1', confirmationUrl: 'https://yookassa.ru/confirm/safe' });
  });

  it('считает пакеты и дополнительный объём одним commercial quote', async () => {
    saveAuthToken('test-token');
    server.use(http.post(`${baseUrl}/billing/commercial/quote`, async ({ request }) => {
      expect(await request.json()).toEqual({
        target_package_slugs: ['machinery'],
        full_suite: false,
        resources: [{ slug: 'extra_users', quantity: 2 }],
      });

      return HttpResponse.json({
        success: true,
        data: {
          quote_version: 1,
          currency: 'RUB',
          billing_period_days: 30,
          offer_type: 'packages',
          target_package_slugs: ['machinery'],
          current_package_slugs: [],
          added_package_slugs: ['machinery'],
          removed_package_slugs: [],
          monthly_total: '8500.00',
          monthly_total_minor: 850000,
          amount_due_now: '8500.00',
          amount_due_now_minor: 850000,
          savings_amount: '0.00',
          savings_amount_minor: 0,
          savings_percent: 0,
          recommendation: null,
          period_start_at: '2026-07-15T10:00:00Z',
          period_end_at: '2026-08-14T10:00:00Z',
          resource_quote_version: 1,
          resource_addons_quote: {
            amount_minor: 60000,
            amount: '600.00',
            currency: 'RUB',
            requires_manager: false,
            quote_version: 1,
            items: [{
              slug: 'extra_users',
              limit_key: 'users',
              quantity: 2,
              amount_minor: 60000,
              amount: '600.00',
              currency: 'RUB',
              status: 'ok',
              requires_package: null,
            }],
          },
        },
      });
    }));

    await expect(commercialBillingService.quote({
      targetPackageSlugs: ['machinery'],
      fullSuite: false,
      resources: [{ slug: 'extra_users', quantity: 2 }],
    })).resolves.toMatchObject({
      amountDueNowMinor: 850000,
      resourceAddonQuote: {
        amountMinor: 60000,
        items: [{ slug: 'extra_users', quantity: 2 }],
      },
    });
  });

  it('передает ресурсы в общий checkout payload', async () => {
    saveAuthToken('test-token');
    const key = '77777777-7777-4777-8777-777777777777';
    server.use(http.post(`${baseUrl}/billing/commercial/checkout`, async ({ request }) => {
      expect(await request.json()).toMatchObject({
        target_package_slugs: ['machinery'],
        current_package_slugs: [],
        full_suite: false,
        quote_version: 1,
        resource_quote_version: 1,
        client_idempotency_key: key,
        auto_renew_consent: true,
        use_balance: false,
        resources: [{ slug: 'extra_users', quantity: 10 }],
      });

      return HttpResponse.json({ success: true, data: { order_id: 'combined-order', status: 'pending_payment', amount: '10900.00', amount_minor: 1090000, currency: 'RUB', confirmation_url: 'https://yookassa.ru/confirm/combined', payment_status: 'pending', auto_renew_consent: true, test_mode: false } });
    }));

    await expect(commercialBillingService.checkout({
      targetPackageSlugs: ['machinery'],
      currentPackageSlugs: [],
      fullSuite: false,
      quoteVersion: 1,
      resourceQuoteVersion: 1,
      clientIdempotencyKey: key,
      autoRenewConsent: true,
      useBalance: false,
      resources: [{ slug: 'extra_users', quantity: 10 }],
    })).resolves.toMatchObject({ orderId: 'combined-order', amountMinor: 1090000 });
  });

  it('считает оплату успешной только после authoritative order status', async () => {
    saveAuthToken('test-token');
    let attempts = 0;
    server.use(http.get(`${baseUrl}/billing/commercial/orders/order-1`, () => {
      attempts += 1;
      return HttpResponse.json({ success: true, data: {
        order_id: 'order-1', kind: 'initial', status: attempts < 2 ? 'pending_payment' : 'paid',
        payment_status: attempts < 2 ? 'pending' : 'succeeded', amount: '7900.00', amount_minor: 790000,
        currency: 'RUB', selected_package_slugs: ['machinery'], offer_type: 'packages',
        period_start_at: '2026-07-15T10:00:00Z', period_end_at: '2026-08-14T10:00:00Z',
        auto_renew_consent: true, test_mode: false, confirmation_url: null,
        created_at: '2026-07-15T10:00:00Z', paid_at: attempts < 2 ? null : '2026-07-15T10:01:00Z',
        canceled_at: null, refunds_summary: { count: 0, amount: '0.00', amount_minor: 0, currency: 'RUB', fully_refunded: false },
      } });
    }));

    await expect(pollCommercialOrder('order-1', { delaysMs: [0, 0] })).resolves.toMatchObject({ status: 'paid' });
    expect(attempts).toBe(2);
  });

  it('нормализует состав, оплаченный в текущем заказе', async () => {
    saveAuthToken('test-token');
    server.use(http.get(`${baseUrl}/billing/commercial/orders/order-added`, () => HttpResponse.json({ success: true, data: {
      order_id: 'order-added', kind: 'initial', status: 'paid',
      payment_status: 'succeeded', amount: '1000.00', amount_minor: 100000,
      currency: 'RUB',
      selected_package_slugs: ['machinery', 'planning-schedules'],
      current_package_slugs: ['machinery'],
      paid_composition_items: [{ type: 'package', slug: 'planning-schedules', label: 'Графики и планирование', quantity: null }],
      offer_type: 'packages',
      period_start_at: '2026-07-15T10:00:00Z', period_end_at: '2026-08-14T10:00:00Z',
      auto_renew_consent: true, test_mode: false, confirmation_url: null,
      created_at: '2026-07-15T10:00:00Z', paid_at: '2026-07-15T10:01:00Z',
      canceled_at: null, refunds_summary: { count: 0, amount: '0.00', amount_minor: 0, currency: 'RUB', fully_refunded: false },
    } })));

    await expect(commercialBillingService.getOrder('order-added')).resolves.toMatchObject({
      selectedPackageSlugs: ['machinery', 'planning-schedules'],
      targetPackageSlugs: ['machinery', 'planning-schedules'],
      currentPackageSlugs: ['machinery'],
      paidPackageSlugs: ['planning-schedules'],
      paidCompositionItems: [{ type: 'package', slug: 'planning-schedules', label: 'Графики и планирование', quantity: null }],
    });
  });

  it('не подставляет текущие пакеты как оплаченные при заказе только на ресурсы', async () => {
    saveAuthToken('test-token');
    server.use(http.get(`${baseUrl}/billing/commercial/orders/order-resource-only`, () => HttpResponse.json({ success: true, data: {
      order_id: 'order-resource-only', kind: 'initial', status: 'paid',
      payment_status: 'succeeded', amount: '1000.00', amount_minor: 100000,
      currency: 'RUB',
      selected_package_slugs: ['machinery', 'planning-schedules'],
      target_package_slugs: ['machinery', 'planning-schedules'],
      current_package_slugs: ['machinery', 'planning-schedules'],
      selected_resource_addons: [{ slug: 'extra_projects', limit_key: 'projects', quantity: 2, amount_minor: 100000, amount: '1000.00', currency: 'RUB', status: 'ok', requires_package: null }],
      paid_composition_items: [{ type: 'resource', slug: 'extra_projects', label: 'Дополнительные проекты', quantity: 2 }],
      offer_type: 'packages',
      period_start_at: '2026-07-15T10:00:00Z', period_end_at: '2026-08-14T10:00:00Z',
      auto_renew_consent: true, test_mode: false, confirmation_url: null,
      created_at: '2026-07-15T10:00:00Z', paid_at: '2026-07-15T10:01:00Z',
      canceled_at: null, refunds_summary: { count: 0, amount: '0.00', amount_minor: 0, currency: 'RUB', fully_refunded: false },
    } })));

    await expect(commercialBillingService.getOrder('order-resource-only')).resolves.toMatchObject({
      paidPackageSlugs: [],
      targetPackageSlugs: ['machinery', 'planning-schedules'],
      selectedResourceAddons: [{ slug: 'extra_projects', quantity: 2 }],
      paidCompositionItems: [{ type: 'resource', slug: 'extra_projects', label: 'Дополнительные проекты', quantity: 2 }],
    });
  });

  it('создаёт ручную оплату grace с UUID без передачи состава или периода', async () => {
    saveAuthToken('test-token');
    const key = '33333333-3333-4333-8333-333333333333';
    server.use(http.post(`${baseUrl}/billing/commercial/renewal/manual-payment`, async ({ request }) => {
      expect(await request.json()).toEqual({ client_idempotency_key: key });
      return HttpResponse.json({ success: true, data: {
        order_id: 'renewal-order', status: 'pending_payment', payment_status: 'pending',
        amount: '7900.00', amount_minor: 790000, currency: 'RUB',
        confirmation_url: 'https://yookassa.ru/confirm/manual', selected_package_slugs: ['machinery'],
        period_start_at: '2026-07-14T09:00:00Z', period_end_at: '2026-08-13T09:00:00Z',
        grace_deadline_at: '2026-07-21T09:00:00Z', test_mode: false,
      } }, { status: 201 });
    }));

    await expect(commercialBillingService.createManualPayment(key)).resolves.toMatchObject({
      orderId: 'renewal-order',
      confirmationUrl: 'https://yookassa.ru/confirm/manual',
      periodEndAt: '2026-08-13T09:00:00Z',
    });
  });

  it.each(['failed', 'canceled', 'refunded'] as const)('возвращает отдельный terminal status %s', async (status) => {
    saveAuthToken('test-token');
    server.use(http.get(`${baseUrl}/billing/commercial/orders/order-terminal`, () => HttpResponse.json({ success: true, data: {
      order_id: 'order-terminal', kind: 'renewal', status,
      payment_status: status === 'failed' ? 'canceled' : status, amount: '7900.00', amount_minor: 790000,
      currency: 'RUB', selected_package_slugs: ['machinery'], offer_type: 'packages',
      period_start_at: null, period_end_at: null, auto_renew_consent: false, test_mode: false,
      confirmation_url: null, created_at: null, paid_at: null, canceled_at: null,
      refunds_summary: { count: status === 'refunded' ? 1 : 0, amount: '0.00', amount_minor: 0, currency: 'RUB', fully_refunded: status === 'refunded' },
    } })));

    await expect(pollCommercialOrder('order-terminal', { delaysMs: [0] })).resolves.toMatchObject({ status });
  });

  it('завершает ограниченный polling явным timeout, сохраняя возможность повторной проверки', async () => {
    saveAuthToken('test-token');
    server.use(http.get(`${baseUrl}/billing/commercial/orders/order-timeout`, () => HttpResponse.json({ success: true, data: {
      order_id: 'order-timeout', kind: 'renewal', status: 'pending_payment', payment_status: 'pending',
      amount: '7900.00', amount_minor: 790000, currency: 'RUB', selected_package_slugs: ['machinery'], offer_type: 'packages',
      period_start_at: null, period_end_at: null, auto_renew_consent: false, test_mode: false,
      confirmation_url: null, created_at: null, paid_at: null, canceled_at: null,
      refunds_summary: { count: 0, amount: '0.00', amount_minor: 0, currency: 'RUB', fully_refunded: false },
    } })));

    await expect(pollCommercialOrder('order-timeout', { delaysMs: [0, 0] })).rejects.toMatchObject({ name: 'CommercialPollingTimeoutError', orderId: 'order-timeout' });
  });

  it('пробрасывает 403, 409, 422 и недоступность провайдера как типизированную ошибку', async () => {
    saveAuthToken('test-token');
    for (const status of [403, 409, 422, 502]) {
      server.use(http.post(`${baseUrl}/billing/commercial/quote`, () => HttpResponse.json({ success: false, message: `status-${status}` }, { status })));
      await expect(commercialBillingService.quote({ targetPackageSlugs: [], fullSuite: false })).rejects.toMatchObject({ status, message: `status-${status}` });
      server.resetHandlers();
    }
  });
});
