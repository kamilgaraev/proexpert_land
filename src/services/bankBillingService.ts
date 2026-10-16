import { API_URL } from '@/utils/api';
import { getJsonAuthHeaders } from '@/utils/authTokenStorage';
import type { BankBillingCapabilities, BankInvoicePage, BankQrPayment } from '@/types/bankBilling';

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_URL}/billing/bank${path}`, {
    ...options, redirect: 'error', headers: { ...getJsonAuthHeaders(), ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
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
  capabilities: (signal?: AbortSignal) => request<BankBillingCapabilities>('/capabilities', { signal }),
  invoices: (page = 1, signal?: AbortSignal) => request<BankInvoicePage>(`/invoices?page=${page}`, { signal }),
  cancel: (id: string) => request<{ canceled: boolean }>(`/invoices/${uuid(id)}/cancel`, { method: 'POST' }),
  qr: (id: string, signal?: AbortSignal) => request<BankQrPayment>(`/invoices/${uuid(id)}/qr`, { method: 'POST', signal }),
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
