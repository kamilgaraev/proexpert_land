import { API_URL } from '@/utils/api';
import { getJsonAuthHeaders } from '@/utils/authTokenStorage';
import type { BankBillingCapabilities, BankInvoice, BankInvoicePage, BankQrPayment, BankTransferQrPayment } from '@/types/bankBilling';

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const headers = new Headers(getJsonAuthHeaders());
  if (options.body instanceof FormData) headers.delete('Content-Type');
  else if (options.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${API_URL}/billing/bank${path}`, {
    ...options, redirect: 'error', headers,
  }).catch(() => { throw new Error('Не удалось связаться с сервером. Повторите попытку позже.'); });
  const payload = await response.json().catch(() => { throw new Error('Не удалось выполнить запрос. Повторите попытку позже.'); }) as { success?: boolean; message?: string; data?: T };
  if (!payload || typeof payload !== 'object') throw new Error('Не удалось выполнить запрос. Повторите попытку позже.');
  if (!response.ok || payload.success === false || payload.data === undefined) throw new Error(payload.message || 'Не удалось загрузить счета.');
  return payload.data;
};

const uuid = (id: string): string => {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) throw new Error('Некорректный номер документа.');
  return id;
};

export const bankBillingService = {
  submitPaymentProof: (id: string, file: File, signal?: AbortSignal) => {
    const body = new FormData();
    body.append('file', file);
    body.append('b2b_payment', '1');
    return request<BankInvoice>(`/invoices/${uuid(id)}/payment-proof`, { method: 'POST', body, signal });
  },
  capabilities: (signal?: AbortSignal) => request<BankBillingCapabilities>('/capabilities', { signal }),
  invoices: (page = 1, signal?: AbortSignal) => request<BankInvoicePage>(`/invoices?page=${page}`, { signal }),
  cancel: (id: string) => request<{ canceled: boolean }>(`/invoices/${uuid(id)}/cancel`, { method: 'POST' }),
  qr: (id: string, signal?: AbortSignal) => request<BankQrPayment>(`/invoices/${uuid(id)}/qr`, { method: 'POST', signal }),
  transferQr: (id: string, signal?: AbortSignal) => request<BankTransferQrPayment>(`/invoices/${uuid(id)}/transfer-qr`, { signal }),
  refund: (id: string, amount: number, kind: 'payment' | 'overpayment', reason: string, key: string) => request<{ items: Array<{ id: string; status: string }> }>(`/invoices/${uuid(id)}/refunds`, {
    method: 'POST', body: JSON.stringify({ amount_minor: amount, kind, reason, client_idempotency_key: key }),
  }),
  download: async (id: string): Promise<Blob> => {
    const response = await fetch(`${API_URL}/billing/bank/documents/${uuid(id)}`, { headers: getJsonAuthHeaders(), redirect: 'error' })
      .catch(() => { throw new Error('Не удалось скачать документ. Повторите попытку позже.'); });
    if (!response.ok || !response.headers.get('content-type')?.includes('application/pdf')) throw new Error('Не удалось скачать документ.');
    return response.blob();
  },
};
