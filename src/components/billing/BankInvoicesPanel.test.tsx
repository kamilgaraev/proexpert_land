import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { BankInvoicesPanel } from './BankInvoicesPanel';
import { bankBillingService } from '@/services/bankBillingService';
import { saveAuthToken, clearAuthToken } from '@/utils/authTokenStorage';
import type { BankInvoice } from '@/types/bankBilling';

const base = 'https://api.xn--1-xtbgmf.xn--p1ai/api/v1/landing/billing/bank';
const invoice: BankInvoice = {
  id: '11111111-1111-4111-8111-111111111111', number: 'MOST-0000000001', order_id: 'order-1', status: 'partially_paid',
  amount_minor: 10000, paid_minor: 4000, remaining_minor: 6000, overpayment_minor: 0, refunded_minor: 0,
  currency: 'RUB', purpose: 'Оплата по счёту MOST-0000000001. Без НДС.', description: 'Доступ к МОСТ',
  bank: { account: '40802810000000000001', bik: '044525104', name: 'Точка', correspondent_account: '30101810000000000001' },
  seller: { name: 'ИП Продавец', inn: '500100732259' }, buyer: { name: 'ООО Покупатель', inn: '7707083893' },
  expires_at: '2026-10-22T12:00:00Z', paid_at: null, activated_at: null, created_at: '2026-10-15T12:00:00Z',
  documents: [{ id: '22222222-2222-4222-8222-222222222222', kind: 'invoice', status: 'pending', signature_status: 'requires_signature', issued_at: '2026-10-15T12:00:00Z' }], refunds: [],
};
const server = setupServer(http.get(`${base}/invoices`, () => HttpResponse.json({ success: true, data: { items: [invoice], meta: { current_page: 1, last_page: 1, total: 1, per_page: 20 } } })));
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => { cleanup(); server.resetHandlers(); clearAuthToken(); vi.restoreAllMocks(); });
afterAll(() => server.close());

describe('Счета МОСТ', () => {
  it('показывает обычный QR на остаток без включения СБП и без POST в банк', async () => {
    saveAuthToken('bank-test-token');
    server.use(http.get(`${base}/invoices`, () => HttpResponse.json({ success: true, data: {
      items: [{ ...invoice, bank_transfer_qr_available: true, expires_at: new Date(Date.now() + 86_400_000).toISOString() }],
      meta: { current_page: 1, last_page: 1, total: 1, per_page: 20 },
    } })), http.get(`${base}/invoices/${invoice.id}/transfer-qr`, ({ request }) => {
      expect(request.headers.get('authorization')).toBe('Bearer bank-test-token');
      return HttpResponse.json({ success: true, data: { type: 'bank_transfer', invoice_id: invoice.id,
        image: 'data:image/png;base64,iVBORw0KGgo=', amount_minor: 6000,
        expires_at: new Date(Date.now() + 86_400_000).toISOString() } });
    }));
    render(<BankInvoicesPanel canManage={false} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Показать QR банковского перевода' }));
    expect(await screen.findByRole('img', { name: 'QR с реквизитами банковского перевода' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Оплатить по QR' })).not.toBeInTheDocument();
    expect(screen.getByText(/В PDF указана полная сумма/)).toBeInTheDocument();
  });

  it('не предлагает QR для доплаты, если backend его не поддерживает', async () => {
    render(<BankInvoicesPanel canManage />);
    await screen.findByText('MOST-0000000001');
    expect(screen.queryByRole('button', { name: 'Показать QR банковского перевода' })).not.toBeInTheDocument();
    expect(screen.getByText('В PDF указана полная сумма счёта. Для доплаты используйте реквизиты.')).toBeInTheDocument();
    expect(screen.queryByText(/Для доплаты используйте QR в кабинете/)).not.toBeInTheDocument();
  });

  it.each(['paid', 'canceled', 'expired', 'refunded'])('не показывает платёжный QR для %s', async (status) => {
    server.use(http.get(`${base}/invoices`, () => HttpResponse.json({ success: true, data: {
      items: [{ ...invoice, status, bank_transfer_qr_available: true, expires_at: new Date(Date.now() + 86_400_000).toISOString() }],
      meta: { current_page: 1, last_page: 1, total: 1, per_page: 20 },
    } })));
    render(<BankInvoicesPanel canManage />);
    await screen.findByText('MOST-0000000001');
    expect(screen.queryByRole('button', { name: 'Показать QR банковского перевода' })).not.toBeInTheDocument();
  });

  it('показывает QR и ссылку СБП B2B только после ответа банка', async () => {
    saveAuthToken('bank-test-token');
    server.use(http.get(`${base}/invoices`, () => HttpResponse.json({ success: true, data: { items: [{ ...invoice,
      status: 'awaiting_payment', paid_minor: 0, remaining_minor: 10000, expires_at: new Date(Date.now() + 86_400_000).toISOString(),
    }], meta: { current_page: 1, last_page: 1, total: 1, per_page: 20 } } })),
    http.post(`${base}/invoices/${invoice.id}/qr`, ({ request }) => {
      expect(request.headers.get('authorization')).toBe('Bearer bank-test-token');
      return HttpResponse.json({ success: true, data: { type: 'sbp_b2b', url: 'https://qr.nspk.ru/AS123',
        image: 'data:image/png;base64,iVBORw0KGgo=', amount_minor: 10000, expires_at: new Date(Date.now() + 86_400_000).toISOString() } });
    }));
    render(<BankInvoicesPanel canManage sbpEnabled />);
    fireEvent.click(await screen.findByRole('button', { name: 'Оплатить по QR' }));
    expect(await screen.findByRole('img', { name: 'QR для оплаты счёта через СБП B2B' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Открыть оплату в банке компании или ИП' })).toHaveAttribute('href', 'https://qr.nspk.ru/AS123');
    expect(screen.queryByText('Оплачен')).not.toBeInTheDocument();
  });

  it('отклоняет посторонний адрес из ответа QR и сохраняет оплату по реквизитам', async () => {
    server.use(http.get(`${base}/invoices`, () => HttpResponse.json({ success: true, data: { items: [{ ...invoice,
      status: 'awaiting_payment', paid_minor: 0, expires_at: new Date(Date.now() + 86_400_000).toISOString(),
    }], meta: { current_page: 1, last_page: 1, total: 1, per_page: 20 } } })),
    http.post(`${base}/invoices/${invoice.id}/qr`, () => HttpResponse.json({ success: true, data: {
      type: 'sbp_b2b', url: 'https://example.test/payment', image: 'data:image/png;base64,iVBORw0KGgo=',
      amount_minor: 10000, expires_at: new Date(Date.now() + 86_400_000).toISOString(),
    } })));
    render(<BankInvoicesPanel canManage sbpEnabled />);
    fireEvent.click(await screen.findByRole('button', { name: 'Оплатить по QR' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Оплатите по реквизитам');
    expect(screen.queryByRole('link', { name: /Открыть оплату/ })).not.toBeInTheDocument();
  });

  it('останавливает повторный выпуск документа с неопределённым результатом', async () => {
    server.use(http.get(`${base}/invoices`, () => HttpResponse.json({ success: true, data: { items: [{ ...invoice,
      documents: [{ ...invoice.documents[0], provider: 'tochka', status: 'creation_unknown', signature_status: 'not_confirmed_by_api' }],
    }], meta: { current_page: 1, last_page: 1, total: 1, per_page: 20 } } })));
    render(<BankInvoicesPanel canManage sbpEnabled />);
    expect(await screen.findByRole('button', { name: 'Скачать счёт PDF' })).toBeDisabled();
    expect(screen.getByText(/повторный выпуск остановлен/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Оплатить по QR' })).not.toBeInTheDocument();
  });

  it('показывает частичную оплату и документы без управляющих действий для наблюдателя', async () => {
    render(<BankInvoicesPanel canManage={false} />);
    expect(await screen.findByText('MOST-0000000001')).toBeInTheDocument();
    expect(screen.getByText('Оплачен частично')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Скачать счёт PDF' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Запросить возврат' })).not.toBeInTheDocument();
    expect(screen.getByText(/копия без подписи/)).toBeInTheDocument();
  });

  it('отправляет возврат в копейках с неизменным ключом при повторе после ошибки', async () => {
    const requests: Array<Record<string, unknown>> = [];
    saveAuthToken('bank-test-token');
    server.use(http.post(`${base}/invoices/${invoice.id}/refunds`, async ({ request }) => {
      expect(request.headers.get('authorization')).toBe('Bearer bank-test-token');
      requests.push(await request.json() as Record<string, unknown>);
      return requests.length === 1 ? HttpResponse.json({ success: false, message: 'Повторите запрос' }, { status: 503 }) : HttpResponse.json({ success: true, data: { items: [] } });
    }));
    render(<BankInvoicesPanel canManage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Запросить возврат' }));
    fireEvent.change(screen.getByLabelText('Сумма, руб.'), { target: { value: '12,34' } });
    fireEvent.change(screen.getByLabelText('Причина'), { target: { value: 'Просим вернуть ошибочный платёж' } });
    fireEvent.click(screen.getByRole('button', { name: 'Отправить запрос' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Повторите запрос');
    fireEvent.click(screen.getByRole('button', { name: 'Отправить запрос' }));
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(requests[0]).toEqual(requests[1]);
    expect(requests[0].amount_minor).toBe(1234);
  });

  it('после подтверждения оплаты обновляет состояние доступа', async () => {
    const onPaid = vi.fn();
    render(<BankInvoicesPanel canManage={false} onPaid={onPaid} />);
    await screen.findByText('MOST-0000000001');
    server.use(http.get(`${base}/invoices`, () => HttpResponse.json({ success: true, data: { items: [{ ...invoice, status: 'paid', activated_at: '2026-10-15T13:00:00Z' }], meta: { current_page: 1, last_page: 1, total: 1, per_page: 20 } } })));
    fireEvent.click(screen.getByRole('button', { name: 'Проверить оплату' }));
    await waitFor(() => expect(onPaid).toHaveBeenCalledOnce());
  });

  it.each(['cancel', 'refund'])('сохраняет успех %s и убирает устаревшие действия при сбое обновления', async (action) => {
    let mutations = 0;
    const currentInvoice = action === 'cancel' ? { ...invoice, status: 'awaiting_payment', paid_minor: 0 } : invoice;
    server.use(
      http.get(`${base}/invoices`, () => mutations > 0
        ? HttpResponse.text('Bad Gateway', { status: 502 })
        : HttpResponse.json({ success: true, data: { items: [currentInvoice], meta: { current_page: 1, last_page: 1, total: 1, per_page: 20 } } })),
      http.post(`${base}/invoices/${invoice.id}/${action === 'cancel' ? 'cancel' : 'refunds'}`, () => {
        mutations++;
        return HttpResponse.json({ success: true, data: { items: [] } });
      }),
    );
    render(<BankInvoicesPanel canManage />);
    if (action === 'cancel') {
      fireEvent.click(await screen.findByRole('button', { name: 'Отменить неоплаченный счёт' }));
    } else {
      fireEvent.click(await screen.findByRole('button', { name: 'Запросить возврат' }));
      fireEvent.change(screen.getByLabelText('Сумма, руб.'), { target: { value: '12,34' } });
      fireEvent.change(screen.getByLabelText('Причина'), { target: { value: 'Просим вернуть ошибочный платёж' } });
      fireEvent.click(screen.getByRole('button', { name: 'Отправить запрос' }));
    }
    expect(await screen.findByText(action === 'cancel' ? /Счёт отменён/ : /Запрос возврата принят/)).toBeInTheDocument();
    await screen.findByRole('alert');
    expect(screen.queryByText('MOST-0000000001')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Запросить возврат' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Отменить неоплаченный счёт' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Отправить запрос' })).not.toBeInTheDocument();
    server.use(http.get(`${base}/invoices`, () => HttpResponse.json({ success: true, data: { items: [], meta: { current_page: 1, last_page: 1, total: 0, per_page: 20 } } })));
    fireEvent.click(screen.getByRole('button', { name: 'Проверить оплату' }));
    await screen.findByText(/Счетов пока нет/);
    expect(mutations).toBe(1);
  });

  it('не допускает произвольные адреса при скачивании документа', async () => {
    await expect(bankBillingService.download('https://example.test/key')).rejects.toThrow('Некорректный номер документа');
  });

  it('повторяет обновление доступа, если первая попытка после оплаты не удалась', async () => {
    server.use(http.get(`${base}/invoices`, () => HttpResponse.json({ success: true, data: {
      items: [{ ...invoice, status: 'paid', activated_at: '2026-10-15T13:00:00Z' }],
      meta: { current_page: 1, last_page: 1, total: 1, per_page: 20 },
    } })));
    const onPaid = vi.fn().mockRejectedValueOnce(new Error('Повторите проверку доступа')).mockResolvedValueOnce(undefined);
    render(<BankInvoicesPanel canManage={false} onPaid={onPaid} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Повторите проверку доступа');
    fireEvent.click(screen.getByRole('button', { name: 'Проверить оплату' }));
    await waitFor(() => expect(onPaid).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });

  it('обновляет доступ для уже активированного счёта из первого ответа', async () => {
    server.use(http.get(`${base}/invoices`, () => HttpResponse.json({ success: true, data: {
      items: [{ ...invoice, status: 'paid', activated_at: '2026-10-15T13:00:00Z' }],
      meta: { current_page: 1, last_page: 1, total: 1, per_page: 20 },
    } })));
    const onPaid = vi.fn();
    render(<BankInvoicesPanel canManage={false} onPaid={onPaid} />);
    await waitFor(() => expect(onPaid).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole('button', { name: 'Проверить оплату' }));
    await waitFor(() => expect(onPaid).toHaveBeenCalledOnce());
  });

  it('сохраняет новый оплаченный статус при запоздавшем ответе старой проверки', async () => {
    const onPaid = vi.fn();
    render(<BankInvoicesPanel canManage={false} onPaid={onPaid} />);
    await screen.findByText('Оплачен частично');
    let resolveOlder!: (value: { items: BankInvoice[]; meta: { current_page: number; last_page: number; total: number; per_page: number } }) => void;
    const older = new Promise<{ items: BankInvoice[]; meta: { current_page: number; last_page: number; total: number; per_page: number } }>((resolve) => { resolveOlder = resolve; });
    const meta = { current_page: 1, last_page: 1, total: 1, per_page: 20 };
    vi.spyOn(bankBillingService, 'invoices').mockReturnValueOnce(older)
      .mockResolvedValueOnce({ items: [{ ...invoice, status: 'paid', activated_at: '2026-10-15T13:00:00Z' }], meta });
    fireEvent.click(screen.getByRole('button', { name: 'Проверить оплату' }));
    fireEvent.click(screen.getByRole('button', { name: 'Проверить оплату' }));
    await screen.findByText('Оплачен');
    await act(async () => { resolveOlder({ items: [invoice], meta }); await older; });
    expect(screen.getByText('Оплачен')).toBeInTheDocument();
    expect(screen.queryByText('Оплачен частично')).not.toBeInTheDocument();
    expect(onPaid).toHaveBeenCalledOnce();
  });

  it('показывает понятную ошибку вместо HTML ответа прокси', async () => {
    server.use(http.get(`${base}/invoices`, () => HttpResponse.text('<html>Bad Gateway</html>', { status: 502 })));
    render(<BankInvoicesPanel canManage={false} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось выполнить запрос. Повторите попытку позже.');
  });

  it('показывает понятную ошибку при потере сети', async () => {
    server.use(http.get(`${base}/invoices`, () => HttpResponse.error()));
    await expect(bankBillingService.invoices()).rejects.toThrow('Не удалось связаться с сервером');
  });

  it('не выдаёт старые счета за следующую страницу при ошибке', async () => {
    server.use(http.get(`${base}/invoices`, ({ request }) => new URL(request.url).searchParams.get('page') === '2'
      ? HttpResponse.text('Bad Gateway', { status: 502 })
      : HttpResponse.json({ success: true, data: { items: [invoice], meta: { current_page: 1, last_page: 3, total: 41, per_page: 20 } } })));
    render(<BankInvoicesPanel canManage={false} />);
    await screen.findByText('MOST-0000000001');
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    await screen.findByRole('alert');
    expect(screen.queryByText('MOST-0000000001')).not.toBeInTheDocument();
    expect(screen.queryByText('2 из 3')).not.toBeInTheDocument();
  });

  it.each([false, true])('блокирует страницы при отмене и обновляет актуальную при смене revision %s', async (revise) => {
    const requestedPages: number[] = [];
    server.use(http.get(`${base}/invoices`, ({ request }) => {
      const page = Number(new URL(request.url).searchParams.get('page') ?? 1);
      requestedPages.push(page);
      return HttpResponse.json({ success: true, data: { items: [{ ...invoice, status: 'awaiting_payment', paid_minor: 0 }], meta: { current_page: page, last_page: 3, total: 41, per_page: 20 } } });
    }));
    let finish!: (value: { canceled: boolean }) => void;
    const cancellation = new Promise<{ canceled: boolean }>((resolve) => { finish = resolve; });
    vi.spyOn(bankBillingService, 'cancel').mockReturnValueOnce(cancellation);
    const { rerender } = render(<BankInvoicesPanel canManage />);
    fireEvent.click(await screen.findByRole('button', { name: 'Далее' }));
    await screen.findByText('2 из 3');
    expect(screen.getByRole('button', { name: 'Назад' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Отменить неоплаченный счёт' }));
    expect(screen.getByRole('button', { name: 'Назад' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Далее' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    if (revise) {
      rerender(<BankInvoicesPanel canManage revision={1} />);
      await screen.findByText('1 из 3');
    }
    await act(async () => { finish({ canceled: true }); await cancellation; });
    await screen.findByText(revise ? '1 из 3' : '2 из 3');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Далее' })).toBeEnabled());
    expect(requestedPages).toEqual(revise ? [1, 2, 1, 1] : [1, 2, 2]);
  });

  it('после создания счёта возвращается на первую страницу и обновляет права его оплаты', async () => {
    let revised = false;
    const requestedPages: number[] = [];
    server.use(http.get(`${base}/invoices`, ({ request }) => {
      const page = Number(new URL(request.url).searchParams.get('page') ?? 1);
      requestedPages.push(page);
      const currentInvoice = revised && page === 1 ? { ...invoice, id: '33333333-3333-4333-8333-333333333333', number: 'MOST-0000000002', status: 'paid', activated_at: '2026-10-15T13:00:00Z' } : invoice;
      return HttpResponse.json({ success: true, data: { items: [currentInvoice], meta: { current_page: page, last_page: 3, total: 41, per_page: 20 } } });
    }));
    const onPaid = vi.fn();
    const { rerender } = render(<BankInvoicesPanel canManage onPaid={onPaid} />);
    fireEvent.click(await screen.findByRole('button', { name: 'Далее' }));
    await screen.findByText('2 из 3');
    revised = true;
    rerender(<BankInvoicesPanel canManage onPaid={onPaid} revision={1} />);
    await screen.findByText('MOST-0000000002');
    expect(screen.getByText('1 из 3')).toBeInTheDocument();
    await waitFor(() => expect(onPaid).toHaveBeenCalledOnce());
    expect(requestedPages).toEqual([1, 2, 1]);
  });
});
