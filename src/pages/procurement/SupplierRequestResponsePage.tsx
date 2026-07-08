import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

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
  const [request, setRequest] = useState<PublicSupplierRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
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
    const loadRequest = async () => {
      if (!token) {
        setError('Ссылка недействительна');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_DOMAIN}/api/v1/procurement/supplier-requests/${token}`, {
          headers: { Accept: 'application/json' },
        });
        const payload = await response.json();

        if (!response.ok || payload.success === false) {
          throw new Error(payload.message || 'Не удалось загрузить заявку');
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
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить заявку');
      } finally {
        setLoading(false);
      }
    };

    void loadRequest();
  }, [token]);

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
      const payload = await response.json();

      if (!response.ok || payload.success === false) {
        throw new Error(payload.message || 'Не удалось отправить КП');
      }

      setSuccess(payload.message || 'КП отправлено');
      setRequest((prev) => prev ? { ...prev, can_submit: false, status: 'responded', status_label: 'Есть ответ' } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить КП');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-slate-600 font-medium">Загрузка заявки...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <img src="/logo.svg" alt="МОСТ" className="h-10 w-auto" />
          <div>
            <p className="text-sm text-slate-500">МОСТ</p>
            <h1 className="text-2xl font-bold text-slate-950">Коммерческое предложение</h1>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {!request ? (
          <section className="rounded-xl bg-white p-8 shadow-sm">
            <p className="text-slate-700">Заявка не найдена.</p>
          </section>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="rounded-xl bg-white p-6 shadow-sm">
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

            <section className="rounded-xl bg-white p-6 shadow-sm">
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

            <section className="rounded-xl bg-white p-6 shadow-sm">
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

            <section className="rounded-xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950">Итог КП</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Итог пересчитывается из позиций, доставки и выбранного режима НДС.
                  </p>
                  <div className="mt-4 min-w-[18rem] space-y-2 text-sm">
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
                <button
                  type="submit"
                  disabled={!request.can_submit || submitting}
                  className="rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {submitting ? 'Отправка...' : 'Отправить КП'}
                </button>
              </div>
            </section>

            {confirmOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
                <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                  <h2 className="text-lg font-semibold text-slate-950">Подтвердите отправку КП</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    Проверьте сумму и условия перед отправкой. После отправки изменить КП по этой ссылке нельзя.
                  </p>
                  <div className="mt-4 space-y-2 rounded-lg bg-slate-50 p-4 text-sm">
                    <AmountRow label="Материалы" value={moneyWithCurrency(subtotalAmount, form.currency)} />
                    <AmountRow label="Доставка" value={moneyWithCurrency(deliveryAmount, form.currency)} />
                    <AmountRow label="НДС" value={moneyWithCurrency(vatAmount, form.currency)} />
                    <AmountRow label="Итого" value={moneyWithCurrency(totalAmount, form.currency)} strong />
                  </div>
                  <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setConfirmOpen(false)}
                      disabled={submitting}
                      className="rounded-lg border border-slate-300 px-4 py-2 font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Вернуться к редактированию
                    </button>
                    <button
                      type="button"
                      onClick={() => void sendProposal()}
                      disabled={submitting}
                      className="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {submitting ? 'Отправка...' : 'Подтвердить отправку'}
                    </button>
                  </div>
                </div>
              </div>
            )}
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
