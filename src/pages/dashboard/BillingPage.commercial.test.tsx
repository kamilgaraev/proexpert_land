import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
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
  modules: [{
    slug: `module-${index + 1}`,
    name: `Возможность ${index + 1}`,
    description: `Краткое описание возможности ${index + 1}`,
  }],
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
  http.get(`${baseUrl}/billing/limits`, () => HttpResponse.json({ success: true, data: {
    account_status: accountStatus,
    offer_type: 'packages',
    monthly_package_amount_minor: 100000,
    monthly_package_amount: '1000.00',
    monthly_resource_amount_minor: 0,
    monthly_resource_amount: '0.00',
    currency: 'RUB',
    period: { start_at: '2026-07-01T09:00:00Z', end_at: '2026-07-31T09:00:00Z' },
    limits: [
      { key: 'users', name: 'Пользователи', unit: 'user', used: 2, limit: 3, remaining: 1, percent: 67, status: 'warning', enforcement: 'hard', sources: { free_base: 3, packages: 0, paid_addons: 0, corporate_override: null } },
      { key: 'projects', name: 'Проекты', unit: 'project', used: 8, limit: 12, remaining: 4, percent: 67, status: 'warning', enforcement: 'hard', sources: { free_base: 2, packages: 10, paid_addons: 0, corporate_override: null } },
      { key: 'storage_gb', name: 'Хранилище', unit: 'gb', used: 11.4, limit: 22, remaining: 10.6, percent: 52, status: 'warning', enforcement: 'hard', sources: { free_base: 2, packages: 20, paid_addons: 0, corporate_override: null } },
    ],
    resource_addons: [
      { slug: 'extra_users', limit_key: 'users', name: 'Дополнительные пользователи', unit: 'user', current_quantity: 0, step: 1, min: 0, max_self_service: 200, requires_package: null, available: true, pricing: { model: 'linear', currency: 'RUB', price_minor: 30000, amount: '300.00' } },
      { slug: 'extra_document_pages', limit_key: 'document_pages_month', name: 'Дополнительные страницы распознавания', unit: 'page', current_quantity: 0, step: 100, min: 0, max_self_service: 5000, requires_package: 'estimates-norms', available: false, pricing: { model: 'linear', currency: 'RUB', price_minor: 1000, amount: '10.00' } },
    ],
  } })),
  http.get(`${baseUrl}/billing/balance`, () => HttpResponse.json({
    organization_id: 1,
    balance_cents: 5000000,
    balance_formatted: '50 000 ₽',
    currency: 'RUB',
    updated_at: '2026-07-15T09:00:00Z',
  })),
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
  http.post(`${baseUrl}/billing/commercial/resource-addons/quote`, async ({ request }) => {
    const body = await request.json() as { resources: Array<{ slug: string; quantity: number }> };
    const extraUsers = body.resources.find((item) => item.slug === 'extra_users')?.quantity ?? 0;
    if (extraUsers === 13) return HttpResponse.json({ success: false, message: 'Не удалось рассчитать дополнительный объём.' }, { status: 422 });
    return HttpResponse.json({ success: true, data: {
      amount_minor: extraUsers * 30000,
      amount: (extraUsers * 300).toFixed(2),
      currency: 'RUB',
      requires_manager: extraUsers > 200,
      quote_version: 1,
      items: [{ slug: 'extra_users', limit_key: 'users', quantity: extraUsers, amount_minor: extraUsers * 30000, amount: (extraUsers * 300).toFixed(2), currency: 'RUB', status: extraUsers > 200 ? 'requires_manager' : 'ok', requires_package: null }],
    } });
  }),
  http.post(`${baseUrl}/billing/commercial/enterprise-inquiries`, () => HttpResponse.json({
    success: true,
    data: { request_id: 101 },
    message: 'Заявка отправлена.',
  }, { status: 201 })),
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
  it('разделяет подключённые и доступные пакеты и применяет intent один раз', async () => {
    sessionStorage.setItem('most:commercial-package-intent', packageSlugs[1]);
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Пакеты для вашей команды' })).toBeInTheDocument();
    expect(screen.getAllByText('МОСТ без оплаты').length).toBeGreaterThan(0);
    const connectedHeading = screen.getByRole('heading', { name: 'Подключённые пакеты' });
    const availableHeading = screen.getByRole('heading', { name: 'Добавить возможности' });
    const connectedSection = connectedHeading.closest('section');
    const availableSection = availableHeading.closest('section');
    expect(connectedSection).not.toBeNull();
    expect(availableSection).not.toBeNull();
    expect(within(connectedSection as HTMLElement).getByText('Пакет 1')).toBeInTheDocument();
    expect(within(availableSection as HTMLElement).queryByText('Пакет 1')).not.toBeInTheDocument();
    expect(within(connectedSection as HTMLElement).queryByRole('checkbox')).not.toBeInTheDocument();
    expect(within(availableSection as HTMLElement).getByText('Будет подключён')).toBeInTheDocument();
    expect(screen.getByText('Ваши изменения')).toBeInTheDocument();
    expect(screen.queryByText('Коммерческий контур')).not.toBeInTheDocument();
    expect(screen.queryByText('Расчёт сервера')).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox', { name: /Пакет/ })).not.toBeInTheDocument();
    expect(sessionStorage.getItem('most:commercial-package-intent')).toBeNull();
  });

  it('использует спокойные карточки личного кабинета вместо промо-блоков', async () => {
    renderPage();

    const pageTitle = await screen.findByRole('heading', { name: 'Пакеты для вашей команды' });
    const pageHeader = pageTitle.closest('header');
    const fullSuiteSection = screen.getByRole('heading', { name: 'Полный комплект' }).closest('section');

    expect(pageHeader).toHaveClass('bg-white');
    expect(pageHeader).not.toHaveClass('bg-slate-950');
    expect(fullSuiteSection).toHaveClass('bg-white');
    expect(fullSuiteSection).not.toHaveClass('bg-slate-950');
  });

  it('не показывает действия пользователю только с billing.view', async () => {
    access.manage = false;
    renderPage();
    await screen.findByText('Пакет 1');
    expect(screen.queryByRole('button', { name: /Перейти к оплате/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Доступен просмотр без изменения состава/)).toBeInTheDocument();
  });

  it('показывает отсутствие изменений и не предлагает повторную оплату', async () => {
    renderPage();
    expect(await screen.findByText('Изменений нет')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Перейти к оплате/ })).not.toBeInTheDocument();
  });

  it('показывает лимиты и дополнительный объём без слова тариф', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Лимиты и ресурсы' })).toBeInTheDocument();
    expect(screen.getByText('Пользователи')).toBeInTheDocument();
    expect(screen.getByText('2 из 3')).toBeInTheDocument();
    expect(screen.getByText('Проекты')).toBeInTheDocument();
    expect(screen.getByText('8 из 12')).toBeInTheDocument();
    expect(screen.getByText('Дополнительные пользователи')).toBeInTheDocument();
    expect(screen.queryByText(/тариф/i)).not.toBeInTheDocument();
  });

  it('размещает покупку дополнительного объёма перед историей оплат', async () => {
    renderPage();

    const historySection = (await screen.findByRole('heading', { name: 'История оплат' })).closest('section');
    const resourcePurchaseSection = screen.getByRole('heading', { name: 'Купить дополнительный объём' }).closest('section');

    expect(historySection).not.toBeNull();
    expect(resourcePurchaseSection).not.toBeNull();
    expect(
      resourcePurchaseSection?.compareDocumentPosition(historySection as HTMLElement),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it('пересчитывает стоимость дополнительных пользователей через stepper', async () => {
    renderPage();

    const usersResource = await screen.findByRole('group', { name: 'Дополнительные пользователи' });
    fireEvent.click(within(usersResource).getByRole('button', { name: 'Увеличить Дополнительные пользователи' }));

    expect(await screen.findByText('300 ₽/мес')).toBeInTheDocument();
  });

  it('показывает, что ресурс требует подключенный пакет', async () => {
    renderPage();

    const pagesResource = await screen.findByRole('group', { name: 'Дополнительные страницы распознавания' });
    expect(within(pagesResource).getAllByText(/Нужен пакет/).length).toBeGreaterThan(0);
    expect(within(pagesResource).getByRole('button', { name: 'Увеличить Дополнительные страницы распознавания' })).toBeDisabled();
  });

  it('переводит большой дополнительный объём в обращение к менеджеру', async () => {
    renderPage();

    const usersResource = await screen.findByRole('group', { name: 'Дополнительные пользователи' });
    const input = within(usersResource).getByLabelText('Количество Дополнительные пользователи');
    fireEvent.change(input, { target: { value: '201' } });

    expect(await screen.findByText(/индивидуальные условия/)).toBeInTheDocument();
  });

  it('открывает состав пакета с названиями и описаниями возможностей', async () => {
    renderPage();
    const packageHeading = await screen.findByRole('heading', { name: 'Пакет 1' });
    fireEvent.click(within(packageHeading.closest('article') as HTMLElement).getByRole('button', { name: 'Подробнее' }));
    expect(await screen.findByText('Краткое описание возможности 1')).toBeInTheDocument();
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
    expect(screen.queryByRole('checkbox', { name: /Пакет/ })).not.toBeInTheDocument();
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
    expect(within(screen.getByRole('heading', { name: 'Пакет 2' }).closest('article') as HTMLElement).getByRole('button', { name: 'Добавить' })).toBeDisabled();
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
    fireEvent.click(within(screen.getByRole('heading', { name: 'Пакет 2' }).closest('article') as HTMLElement).getByRole('button', { name: 'Добавить' }));
    await act(() => new Promise((resolve) => setTimeout(resolve, 280)));
    fireEvent.click(within(screen.getByRole('heading', { name: 'Пакет 3' }).closest('article') as HTMLElement).getByRole('button', { name: 'Добавить' }));
    await waitFor(() => expect(screen.getByTestId('monthly-total')).toHaveTextContent('3 000 ₽'));
    await act(() => new Promise((resolve) => setTimeout(resolve, 350)));
    expect(screen.getByTestId('monthly-total')).toHaveTextContent('3 000 ₽');
  });

  it('не требует повторного согласия при уже настроенном автоплатеже', async () => {
    renderPage();
    const packageHeading = await screen.findByRole('heading', { name: 'Пакет 2' });
    fireEvent.click(within(packageHeading.closest('article') as HTMLElement).getByRole('button', { name: 'Добавить' }));
    const pay = await screen.findByRole('button', { name: /Перейти к оплате/ }, { timeout: 3000 });
    expect(pay).toBeEnabled();
    expect(screen.queryByRole('checkbox', { name: /Согласен на автоматическое списание/ })).not.toBeInTheDocument();
  });

  it('оплачивает полную сумму с баланса без перехода в платёжный сервис', async () => {
    let checkoutBody: Record<string, unknown> | null = null;
    server.use(http.post(`${baseUrl}/billing/commercial/checkout`, async ({ request }) => {
      checkoutBody = await request.json() as Record<string, unknown>;
      return HttpResponse.json({ success: true, data: {
        order_id: 'balance-order', status: 'paid', amount: '2000.00', amount_minor: 200000,
        currency: 'RUB', confirmation_url: null, payment_status: 'succeeded', payment_source: 'balance',
        auto_renew_consent: true, test_mode: false,
      } }, { status: 201 });
    }));

    renderPage();
    const packageHeading = await screen.findByRole('heading', { name: 'Пакет 2' });
    fireEvent.click(within(packageHeading.closest('article') as HTMLElement).getByRole('button', { name: 'Добавить' }));
    const balanceOption = await screen.findByRole('checkbox', { name: 'Оплатить с баланса' });
    expect(balanceOption).toBeEnabled();
    fireEvent.click(balanceOption);
    fireEvent.click(screen.getByRole('button', { name: 'Оплатить с баланса' }));

    expect(await screen.findByText(/Средства списаны с баланса организации/)).toBeInTheDocument();
    expect(checkoutBody).toMatchObject({ use_balance: true, auto_renew_consent: true });
    expect(sessionStorage.getItem('most:pending-commercial-order')).toBeNull();
  });

  it('всегда показывает крупной компании способ обсудить подключение', async () => {
    renderPage();
    expect(await screen.findByRole('heading', { name: 'Корпоративный уровень' })).toBeInTheDocument();
    const openForm = screen.getByRole('button', { name: /Обсудить подключение/ });
    fireEvent.click(openForm);
    expect(await screen.findByRole('dialog', { name: 'Обсудить корпоративное подключение' })).toBeInTheDocument();
    expect(screen.getByLabelText('Телефон для связи')).toBeInTheDocument();
    expect(screen.getByText('Что важно для вашей компании')).toBeInTheDocument();
  });

  it('отправляет корпоративную заявку в рабочее пространство поддержки', async () => {
    let requestBody: Record<string, unknown> | null = null;
    server.use(http.post(`${baseUrl}/billing/commercial/enterprise-inquiries`, async ({ request }) => {
      requestBody = await request.json() as Record<string, unknown>;
      return HttpResponse.json({ success: true, data: { request_id: 102 }, message: 'Заявка отправлена.' }, { status: 201 });
    }));

    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /Обсудить подключение/ }));
    fireEvent.change(screen.getByLabelText('Телефон для связи'), { target: { value: '+7 999 123-45-67' } });
    fireEvent.click(screen.getByRole('checkbox', { name: 'Несколько организаций и филиалов' }));
    fireEvent.click(screen.getByRole('button', { name: 'Отправить заявку' }));

    expect(await screen.findByText('Заявка отправлена')).toBeInTheDocument();
    expect(requestBody).toMatchObject({
      contact_phone: '+7 999 123-45-67',
      company_size: '51_200',
      preferred_contact: 'phone',
      needs: ['multi_organization'],
    });
    expect(String((requestBody as unknown as Record<string, unknown>).client_request_id)).toMatch(/^[0-9a-f-]{36}$/i);
  });

  it('требует согласие на автоплатёж перед первой покупкой', async () => {
    server.use(http.get(`${baseUrl}/billing/commercial/renewal`, () => HttpResponse.json({ success: true, data: {
      status: 'free', auto_renew_enabled: false, saved_method_available: false,
      next_billing_at: null, grace_started_at: null, grace_ends_at: null,
      retry_status: null, attempt_count: 0, next_attempt_at: null, scheduled_change: null,
    } })));
    renderPage();
    const packageHeading = await screen.findByRole('heading', { name: 'Пакет 2' });
    fireEvent.click(within(packageHeading.closest('article') as HTMLElement).getByRole('button', { name: 'Добавить' }));
    const pay = await screen.findByRole('button', { name: /Перейти к оплате/ }, { timeout: 4000 });
    expect(pay).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Согласен на автоматическое списание' }));
    expect(pay).toBeEnabled();
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
    const packageHeading = await screen.findByRole('heading', { name: 'Пакет 1' });
    fireEvent.click(within(packageHeading.closest('article') as HTMLElement).getByRole('button', { name: 'Отключить со следующего периода' }));
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
