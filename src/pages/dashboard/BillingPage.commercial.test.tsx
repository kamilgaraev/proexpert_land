import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import BillingPage from './BillingPage';
import { saveAuthToken } from '@/utils/authTokenStorage';

const { access } = vi.hoisted(() => ({ access: { manage: true, view: true } }));
vi.mock('@/hooks/usePermissions', () => ({
  useCanAccess: ({ permission }: { permission?: string }) => permission === 'billing.manage' ? access.manage : access.view,
}));

const baseUrl = 'https://api.xn--1-xtbgmf.xn--p1ai/api/v1/landing';
const packageSlugs = ['projects-processes', 'planning-schedules', 'estimates-norms', 'quality-safety', 'pto-handover', 'supply-warehouse', 'finance-contracts', 'workforce-output', 'machinery', 'sales-contractors'];
const packages = Array.from({ length: 10 }, (_, index) => ({
  slug: packageSlugs[index],
  name: `Пакет ${index + 1}`,
  description: `Описание ${index + 1}`,
  sort_order: index + 1,
  price: `${index + 1}000.00`,
  price_minor: (index + 1) * 100000,
  currency: 'RUB',
  billing_period_days: 30,
  modules: [`module-${index + 1}`],
  highlights: [`Возможность ${index + 1}`],
  business_outcomes: [`Результат ${index + 1}`],
  is_active: index === 0,
  status: index === 0 ? 'active' : null,
  access_source: index === 0 ? 'paid_package' : null,
  current_period_start_at: index === 0 ? '2026-07-01T09:00:00Z' : null,
  current_period_end_at: index === 0 ? '2026-07-31T09:00:00Z' : null,
  trial_ends_at: null,
  trial_available: index !== 1,
  trial_used: index === 1,
}));

let accountStatus = 'active';
const server = setupServer(
  http.get(`${baseUrl}/packages`, () => HttpResponse.json({ success: true, data: packages })),
  http.get(`${baseUrl}/billing/commercial/renewal`, () => HttpResponse.json({ success: true, data: {
    status: accountStatus,
    auto_renew_enabled: true,
    saved_method_available: true,
    next_billing_at: '2026-07-31T09:00:00Z',
    grace_started_at: accountStatus === 'grace' ? '2026-07-31T09:00:00Z' : null,
    grace_ends_at: accountStatus === 'grace' ? '2026-08-07T09:00:00Z' : null,
    retry_status: accountStatus === 'grace' ? 'grace' : null,
    attempt_count: accountStatus === 'grace' ? 2 : 0,
    next_attempt_at: accountStatus === 'grace' ? '2026-08-01T00:00:00Z' : null,
    scheduled_change: null,
  } })),
  http.get(`${baseUrl}/billing/commercial/history`, () => HttpResponse.json({ success: true, data: [], meta: { current_page: 1, per_page: 20, last_page: 1, total: 0 } })),
  http.post(`${baseUrl}/billing/commercial/quote`, async ({ request }) => {
    const body = await request.json() as { target_package_slugs: string[]; full_suite: boolean };
    if (body.target_package_slugs.includes(packageSlugs[1]) && !body.target_package_slugs.includes(packageSlugs[2])) await delay(300);
    if (body.target_package_slugs.includes(packageSlugs[2])) await delay(10);
    const total = body.full_suite ? 7990000 : body.target_package_slugs.length * 100000;
    return HttpResponse.json({ success: true, data: {
      quote_version: 1, currency: 'RUB', billing_period_days: 30,
      offer_type: body.full_suite ? 'full_suite' : 'packages',
      target_package_slugs: body.full_suite ? packages.map((item) => item.slug) : body.target_package_slugs,
      current_package_slugs: [packageSlugs[0]], added_package_slugs: body.target_package_slugs.filter((slug) => slug !== packageSlugs[0]),
      removed_package_slugs: body.target_package_slugs.includes(packageSlugs[0]) ? [] : [packageSlugs[0]],
      monthly_total: (total / 100).toFixed(2), monthly_total_minor: total,
      amount_due_now: (total / 100).toFixed(2), amount_due_now_minor: total,
      savings_amount: '0.00', savings_amount_minor: 0, savings_percent: 0,
      recommendation: body.target_package_slugs.length >= 8 ? 'full_suite' : null,
      period_start_at: '2026-07-01T09:00:00Z', period_end_at: '2026-07-31T09:00:00Z',
    } });
  }),
);

const renderPage = () => render(<MemoryRouter><BillingPage /></MemoryRouter>);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => saveAuthToken('test-token'));
afterEach(() => {
  server.resetHandlers();
  accountStatus = 'active';
  access.manage = true;
  access.view = true;
  sessionStorage.clear();
});
afterAll(() => server.close());

describe('BillingPage commercial packages', () => {
  it('показывает понятный бесплатный доступ, ровно 10 пакетов и применяет intent один раз', async () => {
    sessionStorage.setItem('most:commercial-package-intent', packageSlugs[1]);
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Пакеты для вашей команды' })).toBeInTheDocument();
    expect(screen.getAllByText('МОСТ без оплаты').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'Выберите нужные возможности' })).toBeInTheDocument();
    expect(screen.getByText('Ваш выбор')).toBeInTheDocument();
    expect(screen.queryByText('Коммерческий контур')).not.toBeInTheDocument();
    expect(screen.queryByText('Расчёт сервера')).not.toBeInTheDocument();
    expect(await screen.findAllByRole('checkbox', { name: /Пакет/ })).toHaveLength(10);
    expect(screen.getByRole('checkbox', { name: /Пакет 2/ })).toBeChecked();
    expect(sessionStorage.getItem('most:commercial-package-intent')).toBeNull();
  });

  it('не показывает действия пользователю только с billing.view', async () => {
    access.manage = false;
    renderPage();
    await screen.findByText('Пакет 1');
    expect(screen.queryByRole('button', { name: /Перейти к оплате/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Доступен просмотр без изменения состава/)).toBeInTheDocument();
  });

  it('для корпоративного уровня оставляет только персональное сопровождение без самостоятельных действий', async () => {
    accountStatus = 'corporate';
    let quoteCalls = 0;
    server.use(http.post(`${baseUrl}/billing/commercial/quote`, () => {
      quoteCalls += 1;
      return HttpResponse.json({ success: false }, { status: 500 });
    }));

    renderPage();

    expect(await screen.findByText(/Персональное сопровождение/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Перейти к оплате/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Попробовать 3 дня/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Отключить автопродление/ })).not.toBeInTheDocument();
    screen.getAllByRole('checkbox', { name: /Пакет/ }).forEach((checkbox) => {
      expect(checkbox).toBeDisabled();
    });
    await act(() => new Promise((resolve) => setTimeout(resolve, 300)));
    expect(quoteCalls).toBe(0);
  });

  it.each(['paid', 'refunded'] as const)('после terminal статуса %s обновляет историю оплаты', async (status) => {
    let historyCalls = 0;
    sessionStorage.setItem('most:pending-commercial-order', 'order-terminal');
    server.use(
      http.get(`${baseUrl}/billing/commercial/history`, () => {
        historyCalls += 1;
        return HttpResponse.json({ success: true, data: [], meta: { current_page: 1, per_page: 20, last_page: 1, total: 0 } });
      }),
      http.get(`${baseUrl}/billing/commercial/orders/order-terminal`, () => HttpResponse.json({ success: true, data: {
        order_id: 'order-terminal', kind: 'renewal', status,
        payment_status: status === 'paid' ? 'succeeded' : 'refunded', amount: '1000.00', amount_minor: 100000,
        currency: 'RUB', selected_package_slugs: [packageSlugs[0]], offer_type: 'packages',
        period_start_at: null, period_end_at: null, auto_renew_consent: false, test_mode: false,
        confirmation_url: null, created_at: '2026-07-15T10:00:00Z', paid_at: status === 'paid' ? '2026-07-15T10:01:00Z' : null,
        canceled_at: null, refunds_summary: { count: status === 'refunded' ? 1 : 0, amount: status === 'refunded' ? '1000.00' : '0.00', amount_minor: status === 'refunded' ? 100000 : 0, currency: 'RUB', fully_refunded: status === 'refunded' },
      } })),
    );

    renderPage();

    await waitFor(() => expect(historyCalls).toBeGreaterThanOrEqual(2));
  });

  it('не показывает view-only пользователю CTA ручной оплаты в grace', async () => {
    accountStatus = 'grace';
    access.manage = false;
    renderPage();
    await screen.findByRole('heading', { name: 'Льготный период' });
    expect(screen.queryByRole('button', { name: 'Оплатить сейчас' })).not.toBeInTheDocument();
  });

  it('блокирует изменение в grace и объясняет фиксированную дату и оплату на шестой день', async () => {
    accountStatus = 'grace';
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Льготный период' })).toBeInTheDocument();
    expect(screen.getByText(/7 августа 2026/)).toBeInTheDocument();
    expect(screen.getByText(/на шестой день останется около 24 дней/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Пакет 2/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Оплатить сейчас' })).toBeInTheDocument();
  });

  it('запускает реальную ручную оплату grace с одним UUID intent', async () => {
    accountStatus = 'grace';
    let body: Record<string, unknown> | null = null;
    server.use(http.post(`${baseUrl}/billing/commercial/renewal/manual-payment`, async ({ request }) => {
      body = await request.json() as Record<string, unknown>;
      return HttpResponse.json({ success: true, data: {
        order_id: 'renewal-order', status: 'pending_payment', payment_status: 'pending', amount: '1000.00', amount_minor: 100000,
        currency: 'RUB', confirmation_url: 'https://yookassa.ru/confirm/manual', selected_package_slugs: [packageSlugs[0]],
        period_start_at: '2026-07-31T09:00:00Z', period_end_at: '2026-08-30T09:00:00Z', grace_deadline_at: '2026-08-07T09:00:00Z', test_mode: false,
      } }, { status: 201 });
    }));
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Оплатить сейчас' }));
    await waitFor(() => expect(body).not.toBeNull());
    expect(String((body as unknown as Record<string, unknown>).client_idempotency_key)).toMatch(/^[0-9a-f-]{36}$/i);
    expect(sessionStorage.getItem('most:pending-commercial-order')).toBe('renewal-order');
  });

  it('игнорирует запоздавший quote и оставляет итог последнего выбора', async () => {
    renderPage();
    await screen.findByText('Пакет 2');
    fireEvent.click(screen.getByRole('checkbox', { name: /Пакет 2/ }));
    await act(() => new Promise((resolve) => setTimeout(resolve, 280)));
    fireEvent.click(screen.getByRole('checkbox', { name: /Пакет 3/ }));
    await waitFor(() => expect(screen.getByTestId('monthly-total')).toHaveTextContent('3 000 ₽'));
    await act(() => new Promise((resolve) => setTimeout(resolve, 350)));
    expect(screen.getByTestId('monthly-total')).toHaveTextContent('3 000 ₽');
  });

  it('требует явное согласие на автопродление рядом с оплатой', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('checkbox', { name: /^Пакет 2,/ }));
    const pay = await screen.findByRole('button', { name: /Перейти к оплате/ }, { timeout: 3000 });
    expect(pay).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: /Согласен на автоматическое списание/ }));
    expect(pay).toBeEnabled();
    expect(screen.getByText(/каждые 30 дней/)).toBeInTheDocument();
  });

  it('показывает authoritative использованный trial сразу после reload', async () => {
    renderPage();
    expect(await screen.findByRole('button', { name: 'Пробный доступ уже использован' })).toBeDisabled();
  });

  it('восстанавливает после reload запланированное сокращение с точными пакетами и датой', async () => {
    server.use(http.get(`${baseUrl}/billing/commercial/renewal`, () => HttpResponse.json({ success: true, data: {
      status: 'active', auto_renew_enabled: true, saved_method_available: true,
      next_billing_at: '2026-07-31T09:00:00Z', grace_started_at: null, grace_ends_at: null,
      retry_status: null, attempt_count: 0, next_attempt_at: null,
      scheduled_change: { status: 'scheduled', offer_type: 'packages', target_package_slugs: [packageSlugs[0]], current_package_slugs: [packageSlugs[0], packageSlugs[1]], apply_at: '2026-07-31T09:00:00Z', billing_anchor_at: '2026-07-31T09:00:00Z' },
    } })));
    renderPage();
    expect(await screen.findByText(/После 31 июля 2026/)).toBeInTheDocument();
    expect(screen.getByText(/останется Пакет 1/)).toBeInTheDocument();
    expect(screen.getByText(/будет отключён Пакет 2/)).toBeInTheDocument();
  });

  it('планирует сокращение с UUID и не отбирает уже оплаченный период', async () => {
    let scheduledBody: Record<string, unknown> | null = null;
    server.use(http.post(`${baseUrl}/billing/commercial/contour/schedule`, async ({ request }) => {
      scheduledBody = await request.json() as Record<string, unknown>;
      return HttpResponse.json({ success: true, data: { change_id: 'change-1', status: 'scheduled', offer_type: 'packages', target_package_slugs: [], current_package_slugs: [packageSlugs[0]], apply_at: '2026-07-31T09:00:00Z' } }, { status: 201 });
    }));
    renderPage();
    fireEvent.click(await screen.findByRole('checkbox', { name: /^Пакет 1,/ }));
    const schedule = await screen.findByRole('button', { name: 'Запланировать сокращение' });
    expect(screen.getByText(/Уже оплаченный доступ сохранится/)).toBeInTheDocument();
    fireEvent.click(schedule);
    await screen.findByText(/Сокращение состава запланировано/);
    expect(scheduledBody).toMatchObject({ target_package_slugs: [], full_suite: false, quote_version: 1 });
    const scheduledKey = (scheduledBody as unknown as Record<string, unknown>).client_idempotency_key;
    expect(String(scheduledKey)).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('отключает будущие списания без обещания досрочного прекращения доступа', async () => {
    server.use(http.post(`${baseUrl}/billing/commercial/renewal/disable`, () => HttpResponse.json({ success: true, data: {
      status: 'active', auto_renew_enabled: false, saved_method_available: false,
      next_billing_at: '2026-07-31T09:00:00Z', grace_started_at: null, grace_ends_at: null,
      retry_status: null, attempt_count: 0, next_attempt_at: null,
    } })));
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Отключить автопродление' }));
    expect(await screen.findByText('Автопродление отключено')).toBeInTheDocument();
    expect(screen.getByText(/Оплачено до/)).toBeInTheDocument();
  });
});
