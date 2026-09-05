import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import '@/styles/workspace.css';
import { usePageTitle } from '@/hooks/useSEO';

interface PublicSupplierRequestLine {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  specification: string | null;
}

interface PublicSupplierRequest {
  request_number: string;
  status: string;
  status_label: string;
  sent_at: string | null;
  expires_at: string | null;
  can_submit: boolean;
  organization?: {
    name: string | null;
  };
  supplier: {
    name: string | null;
    contact_person: string | null;
  };
  comment: string | null;
  lines: PublicSupplierRequestLine[];
}

interface ProposalLineForm {
  supplier_request_line_id: number;
  name: string;
  quantity: number;
  unit: string;
  unit_price: string;
  comment: string;
}

interface ProposalFormState {
  currency: string;
  vat_mode: string;
  vat_rate: string;
  delivery_amount: string;
  valid_until: string;
  delivery_due_date: string;
  lead_time_days: string;
  payment_terms: string;
  delivery_terms: string;
  warranty_terms: string;
  notes: string;
  items: ProposalLineForm[];
}

const API_BASE_DOMAIN = (import.meta.env.VITE_API_BASE as string | undefined)
  ?? (import.meta.env.VITE_API_URL as string | undefined)
  ?? 'https://api.1мост.рф';

const todayPlus = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);

  return date.toISOString().slice(0, 10);
};

const money = (value: number): string => value.toLocaleString('ru-RU', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const moneyWithCurrency = (value: number, currency: string): string => (
  `${money(value)} ${currency}`
);

const roundMoney = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const calculateIncludedVatAmount = (amountWithVat: number, vatRate: number): number => {
  if (amountWithVat <= 0 || vatRate <= 0) {
    return 0;
  }

  return roundMoney((amountWithVat * vatRate) / (100 + vatRate));
};

const calculateExcludedVatAmount = (amountWithoutVat: number, vatRate: number): number => {
  if (amountWithoutVat <= 0 || vatRate <= 0) {
    return 0;
  }

  return roundMoney((amountWithoutVat * vatRate) / 100);
};

const SupplierRequestResponsePage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  usePageTitle('Предложение поставщика — МОСТ');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loadError, setLoadError] = useState<{ message: string; retryable: boolean } | null>(null);
  const [request, setRequest] = useState<PublicSupplierRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const submitButton = useRef<HTMLButtonElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState<ProposalFormState>({
    currency: 'RUB',
    vat_mode: 'included',
    vat_rate: '20',
    delivery_amount: '0',
    valid_until: todayPlus(7),
    delivery_due_date: todayPlus(3),
    lead_time_days: '',
    payment_terms: '',
    delivery_terms: '',
    warranty_terms: '',
    notes: '',
    items: [],
  });

  useEffect(() => {
    const controller = new AbortController();
    const loadRequest = async () => {
      if (!token) {
        setLoadError({ message: 'Ссылка недействительна. Попросите заказчика прислать новую.', retryable: false });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setLoadError(null);
        setRequest(null);
        const response = await fetch(`${API_BASE_DOMAIN}/api/v1/procurement/supplier-requests/${token}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        });
        if (controller.signal.aborted) return;
        if (response.status === 404 || response.status === 410) {
          setLoadError({
            message: response.status === 410
              ? 'Срок действия ссылки истёк. Попросите заказчика прислать новую.'
              : 'Заявка не найдена. Проверьте ссылку или обратитесь к заказчику.',
            retryable: false,
          });
          return;
        }
        if (!response.ok) throw new Error('request_failed');
        const payload = await response.json();
        if (controller.signal.aborted) return;
        if (payload.success === false || !Array.isArray(payload.data?.lines)) {
          throw new Error('invalid_response');
        }

        const data = payload.data as PublicSupplierRequest;
        setRequest(data);
        setForm((prev) => ({
          ...prev,
          items: data.lines.map((line) => ({
            supplier_request_line_id: line.id,
            name: line.name,
            quantity: line.quantity,
            unit: line.unit,
            unit_price: '',
            comment: '',
          })),
        }));
      } catch {
        if (!controller.signal.aborted) {
          setLoadError({ message: 'Не удалось загрузить заявку. Проверьте соединение и попробуйте ещё раз.', retryable: true });
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadRequest();
    return () => controller.abort();
  }, [token, loadAttempt]);

  const subtotalAmount = useMemo(() => (
    form.items.reduce((sum, item) => sum + (Number(item.unit_price || 0) * item.quantity), 0)
  ), [form.items]);
  const deliveryAmount = Number(form.delivery_amount || 0);
  const vatRate = Number(form.vat_rate || 0);
  const amountBeforeVat = roundMoney(subtotalAmount + deliveryAmount);
  const isVatExcluded = form.vat_mode === 'excluded';
  const vatAmount = isVatExcluded
    ? calculateExcludedVatAmount(amountBeforeVat, vatRate)
    : calculateIncludedVatAmount(amountBeforeVat, vatRate);
  const totalAmount = isVatExcluded ? roundMoney(amountBeforeVat + vatAmount) : amountBeforeVat;

  const updateItem = (index: number, patch: Partial<ProposalLineForm>) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, ...patch } : item
      )),
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!token || !request?.can_submit) {
      return;
    }

    setConfirmOpen(true);
  };

  const sendProposal = async () => {
    if (!token || !request?.can_submit) {
      return;
    }

    try {
      setSubmitting(true);
      setConfirmOpen(false);
      setError(null);
      setSuccess(null);

      const response = await fetch(`${API_BASE_DOMAIN}/api/v1/procurement/supplier-requests/${token}/proposals`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subtotal_amount: subtotalAmount,
          delivery_amount: deliveryAmount,
          total_amount: totalAmount,
          currency: form.currency,
          vat_mode: form.vat_mode,
          vat_rate: vatRate,
          valid_until: form.valid_until,
          delivery_due_date: form.delivery_due_date || null,
          lead_time_days: form.lead_time_days ? Number(form.lead_time_days) : null,
          payment_terms: form.payment_terms,
          delivery_terms: form.delivery_terms,
          warranty_terms: form.warranty_terms || null,
          notes: form.notes || null,
          items: form.items.map((item) => ({
            supplier_request_line_id: item.supplier_request_line_id,
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            unit_price: Number(item.unit_price || 0),
            total_amount: Number(item.unit_price || 0) * item.quantity,
            comment: item.comment || null,
          })),
        }),
      });
      if (!response.ok) {
        setError(response.status === 422
          ? 'Проверьте цены и условия предложения. Заполненные данные сохранены.'
          : response.status === 409 || response.status === 410
            ? 'По этой ссылке больше нельзя отправить предложение. Уточните статус заявки у заказчика.'
            : 'Не удалось подтвердить отправку. Уточните у заказчика, получено ли предложение, прежде чем отправлять его повторно.');
        return;
      }
      const payload = await response.json();
      if (payload.success === false) throw new Error('proposal_rejected');

      setSuccess('Предложение отправлено заказчику.');
      setRequest((prev) => prev ? { ...prev, can_submit: false, status: 'responded', status_label: 'Есть ответ' } : prev);
    } catch {
      setError('Не удалось подтвердить отправку. Уточните у заказчика, получено ли предложение, прежде чем отправлять его повторно.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="most-workspace min-h-screen bg-background flex items-center justify-center px-6" aria-busy="true">
        <div className="text-slate-600 font-medium">Загрузка заявки...</div>
      </main>
    );
  }

  return (
    <main className="most-workspace min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <img src="/logo.svg" alt="МОСТ" className="h-10 w-auto" />
          <div>
            <p className="text-sm text-slate-500">МОСТ</p>
            <h1 className="text-2xl font-bold text-slate-950">Коммерческое предложение</h1>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-5 border border-destructive/30 bg-card px-4 py-3 text-sm text-foreground">
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="mb-5 border border-border bg-card px-4 py-3 text-sm text-foreground">
            {success}
          </div>
        )}

        {!request ? (
          <section className="border border-border bg-card p-6 sm:p-8" aria-labelledby="supplier-request-error">
            <h2 id="supplier-request-error" className="text-xl font-semibold text-foreground">Не удалось открыть заявку</h2>
            <p role="alert" className="mt-3 text-muted-foreground">{loadError?.message}</p>
            {loadError?.retryable && (
              <Button className="mt-6" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Попробовать ещё раз</Button>
            )}
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="border border-border bg-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm text-slate-500">Заявка {request.request_number}</p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">
                    {request.organization?.name || 'Заказчик'}
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {request.comment || 'Заполните цены и условия поставки по позициям ниже.'}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">
                  <div>Статус: {request.status_label}</div>
                  {request.expires_at && <div>Ссылка активна до {new Date(request.expires_at).toLocaleDateString('ru-RU')}</div>}
                </div>
              </div>
            </section>

            <section className="border border-border bg-card p-5 sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Позиции</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Стоимость строк помогает сверить материалы, итоговая сумма и НДС указываются в условиях КП.
                  </p>
                </div>
                <div className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">
                  Материалы: <span className="font-semibold text-slate-950">{moneyWithCurrency(subtotalAmount, form.currency)}</span>
                </div>
              </div>
              <div className="mt-4 space-y-4">
                {form.items.map((item, index) => (
                  <div key={item.supplier_request_line_id} className="rounded-lg border border-slate-200 p-4">
                    <div className="grid gap-4 lg:grid-cols-[1fr_150px_170px]">
                      <div>
                        <div className="font-medium text-slate-950">{item.name}</div>
                        <div className="mt-1 text-sm text-slate-500">
                          {item.quantity} {item.unit}
                        </div>
                        {request.lines[index]?.specification && (
                          <div className="mt-2 text-sm text-slate-600">{request.lines[index].specification}</div>
                        )}
                      </div>
                      <label className="block text-sm">
                        <span className="text-slate-600">Цена за единицу</span>
                        <input
                          required
                          min="0"
                          step="0.01"
                          type="number"
                          value={item.unit_price}
                          onChange={(event) => updateItem(index, { unit_price: event.target.value })}
                          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                        />
                      </label>
                      <div className="text-sm text-slate-600">
                        <span>Стоимость позиции</span>
                        <div className="mt-3 text-base font-semibold text-slate-950">
                          {moneyWithCurrency(Number(item.unit_price || 0) * item.quantity, form.currency)}
                        </div>
                      </div>
                    </div>
                    <label className="mt-3 block text-sm">
                      <span className="text-slate-600">Комментарий к позиции</span>
                      <input
                        value={item.comment}
                        onChange={(event) => updateItem(index, { comment: event.target.value })}
                        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </section>

            <section className="border border-border bg-card p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-950">Условия</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <Field label="Валюта" value={form.currency} onChange={(value) => setForm((prev) => ({ ...prev, currency: value }))} />
                <Field label="КП действует до" type="date" required value={form.valid_until} onChange={(value) => setForm((prev) => ({ ...prev, valid_until: value }))} />
                <Field label="Дата поставки" type="date" value={form.delivery_due_date} onChange={(value) => setForm((prev) => ({ ...prev, delivery_due_date: value }))} />
                <Field label="Срок поставки, дней" type="number" value={form.lead_time_days} onChange={(value) => setForm((prev) => ({ ...prev, lead_time_days: value }))} />
                <Field label="Стоимость доставки" type="number" value={form.delivery_amount} onChange={(value) => setForm((prev) => ({ ...prev, delivery_amount: value }))} />
                <Field label="НДС, %" type="number" required value={form.vat_rate} onChange={(value) => setForm((prev) => ({ ...prev, vat_rate: value }))} />
                <div className="md:col-span-2">
                  <div className="text-sm text-slate-600">Режим НДС</div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, vat_mode: 'included' }))}
                      className={`rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${
                        form.vat_mode === 'included'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      С учетом НДС
                      <span className="mt-1 block text-xs font-normal text-slate-500">НДС уже входит в цены и доставку.</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, vat_mode: 'excluded' }))}
                      className={`rounded-lg border px-4 py-3 text-left text-sm font-semibold transition ${
                        form.vat_mode === 'excluded'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-300 bg-white text-slate-700 hover:border-slate-400'
                      }`}
                    >
                      Без учета НДС
                      <span className="mt-1 block text-xs font-normal text-slate-500">НДС будет начислен сверху.</span>
                    </button>
                  </div>
                </div>
                <TextArea label="Условия оплаты" required value={form.payment_terms} onChange={(value) => setForm((prev) => ({ ...prev, payment_terms: value }))} />
                <TextArea label="Условия доставки" required value={form.delivery_terms} onChange={(value) => setForm((prev) => ({ ...prev, delivery_terms: value }))} />
                <TextArea label="Гарантия" value={form.warranty_terms} onChange={(value) => setForm((prev) => ({ ...prev, warranty_terms: value }))} />
                <TextArea label="Комментарий" value={form.notes} onChange={(value) => setForm((prev) => ({ ...prev, notes: value }))} />
              </div>
            </section>

            <section className="border border-border bg-card p-5 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Итог КП</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Итог пересчитывается из позиций, доставки и выбранного режима НДС.
                  </p>
                  <div className="mt-4 min-w-0 space-y-2 text-sm">
                    <AmountRow label="Материалы" value={moneyWithCurrency(subtotalAmount, form.currency)} />
                    <AmountRow label="Доставка" value={moneyWithCurrency(deliveryAmount, form.currency)} />
                    <AmountRow label={isVatExcluded ? 'Сумма без НДС' : 'Сумма с НДС'} value={moneyWithCurrency(amountBeforeVat, form.currency)} />
                    <AmountRow label={`НДС ${vatRate || 0}%`} value={moneyWithCurrency(vatAmount, form.currency)} />
                    <div className="border-t border-slate-200 pt-3">
                      <AmountRow
                        label="Итого"
                        value={moneyWithCurrency(totalAmount, form.currency)}
                        strong
                      />
                    </div>
                  </div>
                </div>
                <Button ref={submitButton} type="submit" disabled={!request.can_submit || submitting}>
                  {submitting ? 'Отправка...' : 'Отправить КП'}
                </Button>
              </div>
            </section>

            <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                <DialogContent className="most-workspace max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto" onCloseAutoFocus={(event) => { event.preventDefault(); submitButton.current?.focus(); }}>
                  <DialogTitle>Подтвердите отправку КП</DialogTitle>
                  <DialogDescription>
                    Проверьте сумму и условия перед отправкой. После отправки изменить КП по этой ссылке нельзя.
                  </DialogDescription>
                  <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
                    <AmountRow label="Материалы" value={moneyWithCurrency(subtotalAmount, form.currency)} />
                    <AmountRow label="Доставка" value={moneyWithCurrency(deliveryAmount, form.currency)} />
                    <AmountRow label="НДС" value={moneyWithCurrency(vatAmount, form.currency)} />
                    <AmountRow label="Итого" value={moneyWithCurrency(totalAmount, form.currency)} strong />
                  </div>
                  <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
                      Вернуться к редактированию
                    </Button>
                    <Button type="button" onClick={() => void sendProposal()} disabled={submitting}>
                      {submitting ? 'Отправка...' : 'Подтвердить отправку'}
                    </Button>
                  </div>
                </DialogContent>
            </Dialog>
          </form>
        )}
      </div>
    </main>
  );
};

interface AmountRowProps {
  label: string;
  value: string;
  strong?: boolean;
}

const AmountRow: React.FC<AmountRowProps> = ({ label, value, strong = false }) => (
  <div className="flex items-center justify-between gap-6">
    <span className={strong ? 'text-base font-semibold text-slate-950' : 'text-slate-600'}>{label}</span>
    <span className={strong ? 'text-xl font-bold text-slate-950' : 'font-semibold text-slate-950'}>{value}</span>
  </div>
);

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange, type = 'text', required = false }) => (
  <label className="block text-sm">
    <span className="text-slate-600">{label}</span>
    <input
      required={required}
      type={type}
      value={value}
      min={type === 'number' ? '0' : undefined}
      step={type === 'number' ? '0.01' : undefined}
      onChange={(event) => onChange(event.target.value)}
      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
    />
  </label>
);

const TextArea: React.FC<FieldProps> = ({ label, value, onChange, required = false }) => (
  <label className="block text-sm">
    <span className="text-slate-600">{label}</span>
    <textarea
      required={required}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      rows={4}
      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
    />
  </label>
);

export default SupplierRequestResponsePage;
