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

  it('не допускает произвольные адреса при скачивании документа', async () => {
    await expect(bankBillingService.download('https://example.test/key')).rejects.toThrow('Некорректный номер документа');
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
});
