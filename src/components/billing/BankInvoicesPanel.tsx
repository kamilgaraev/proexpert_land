import { useCallback, useEffect, useRef, useState } from 'react';
import { bankBillingService } from '@/services/bankBillingService';
import type { BankInvoice, BankInvoicePage } from '@/types/bankBilling';
import { Button } from '@/components/ui/button';

const money = (value: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(value / 100);
const statuses: Record<string, string> = { awaiting_payment: 'Ожидает оплаты', partially_paid: 'Оплачен частично', paid: 'Оплачен', canceled: 'Отменён', refunded: 'Возвращён' };
const refundStatuses: Record<string, string> = { requested: 'На рассмотрении', awaiting_bank: 'Согласован, ожидается перевод', completed: 'Возвращён', rejected: 'Отклонён' };
const documentLabels = { invoice: 'Скачать счёт PDF', closing: 'Скачать акт предоставления доступа', correction: 'Скачать уведомление о возврате' };

export const BankInvoicesPanel = ({ canManage, revision = 0, onPaid }: { canManage: boolean; revision?: number; onPaid?: () => void | Promise<void> }) => {
  const [data, setData] = useState<BankInvoicePage | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [refundInvoice, setRefundInvoice] = useState<BankInvoice | null>(null);
  const [amount, setAmount] = useState('');
  const [kind, setKind] = useState<'payment' | 'overpayment'>('payment');
  const [reason, setReason] = useState('');
  const [refundKey, setRefundKey] = useState('');
  const seen = useRef<Map<string, boolean>>(new Map());
  const generation = useRef(0);
  const paidCallback = useRef(onPaid);
  paidCallback.current = onPaid;

  const load = useCallback(async (signal?: AbortSignal) => {
    const requestGeneration = ++generation.current;
    try {
      const result = await bankBillingService.invoices(page, signal);
      if (signal?.aborted || requestGeneration !== generation.current) return;
      const newlyActivated = result.items.some((invoice) => !seen.current.get(invoice.id) && invoice.activated_at);
      setData(result); setError(null);
      if (newlyActivated) await paidCallback.current?.();
      if (signal?.aborted || requestGeneration !== generation.current) return;
      for (const invoice of result.items) seen.current.set(invoice.id, Boolean(invoice.activated_at));
    } catch (failure) {
      if (!signal?.aborted && requestGeneration === generation.current) setError(failure instanceof Error ? failure.message : 'Не удалось загрузить счета.');
    } finally { if (!signal?.aborted && requestGeneration === generation.current) setLoading(false); }
  }, [page]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setData(null);
    void load(controller.signal);
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void load(controller.signal); }, 30_000);
    return () => { generation.current += 1; controller.abort(); window.clearInterval(timer); };
  }, [load, revision]);

  const perform = async (key: string, action: () => Promise<void>) => {
    setBusy(key); setError(null);
    try { await action(); await load(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Не удалось выполнить действие.'); }
    finally { setBusy(null); }
  };

  const download = async (id: string) => {
    const blob = await bankBillingService.download(id);
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = href; anchor.download = `MOST-${id}.pdf`; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(href), 1000);
  };

  const submitRefund = async () => {
    if (!canManage) return;
    if (!refundInvoice || !/^\d+(?:[.,]\d{1,2})?$/.test(amount)) { setError('Укажите сумму в рублях, не более двух знаков после запятой.'); return; }
    const [rubles, cents = ''] = amount.replace(',', '.').split('.');
    const minor = Number(rubles) * 100 + Number(cents.padEnd(2, '0'));
    if (!Number.isSafeInteger(minor) || minor <= 0 || reason.trim().length < 10) { setError('Укажите положительную сумму и причину не короче 10 символов.'); return; }
    await perform('refund', async () => {
      await bankBillingService.refund(refundInvoice.id, minor, kind, reason, refundKey);
      setRefundInvoice(null);
    });
  };

  return <section id="bank-invoices" aria-labelledby="bank-invoices-title" className="space-y-4 rounded-lg border border-slate-200 bg-white p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="bank-invoices-title" className="text-xl font-semibold">Счета и документы</h2><Button variant="outline" disabled={loading || busy !== null} onClick={() => void load()}>Проверить оплату</Button></div>
    <p className="text-sm text-slate-600">Оплачивайте с расчётного счёта организации или ИП. Сохраните номер счёта в назначении. Доступ подключится после подтверждения поступления банком.</p>
    <p className="text-xs text-slate-500">PDF акта — копия без подписи. Подписанный оригинал можно запросить через поддержку по ЭДО или на бумаге.</p>
    {error && <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {loading && <p role="status">Загружаем счета…</p>}
    {!loading && data?.items.length === 0 && <p className="text-sm text-slate-500">Счетов пока нет. Выберите состав пакетов или кредиты ИИ.</p>}
    {data?.items.map((invoice) => <article key={invoice.id} className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold">{invoice.number}</h3><p className="text-sm">{statuses[invoice.status] ?? 'Требуется проверка'}{invoice.paid_at && !invoice.activated_at && invoice.status === 'paid' ? ' · доступ ожидает начала периода или обработки' : ''}</p></div><strong>{money(invoice.amount_minor)}</strong></div>
      <p className="text-sm">{invoice.description}</p>
      <p className="text-sm">Зачтено: {money(invoice.paid_minor)} · К доплате: {money(invoice.remaining_minor)} · Переплата: {money(invoice.overpayment_minor)}{invoice.refunded_minor > 0 ? ` · Возвращено: ${money(invoice.refunded_minor)}` : ''}</p>
      {['awaiting_payment', 'partially_paid'].includes(invoice.status) && <details><summary className="cursor-pointer text-sm font-medium">Реквизиты и назначение платежа</summary><dl className="mt-3 space-y-2 break-words text-sm"><div><dt>Получатель</dt><dd>{invoice.seller.name}, ИНН {invoice.seller.inn}</dd></div><div><dt>Плательщик</dt><dd>{invoice.buyer.name}, ИНН {invoice.buyer.inn}</dd></div><div><dt>Банк</dt><dd>{invoice.bank.name} · БИК {invoice.bank.bik}</dd></div><div><dt>Расчётный счёт</dt><dd>{invoice.bank.account}</dd></div><div><dt>Корреспондентский счёт</dt><dd>{invoice.bank.correspondent_account}</dd></div><div><dt>Назначение</dt><dd>{invoice.purpose}</dd></div><div><dt>Оплатить до</dt><dd>{new Date(invoice.expires_at).toLocaleDateString('ru-RU')}</dd></div></dl></details>}
      <div className="flex flex-wrap gap-2">{invoice.documents.map((doc) => <Button key={doc.id} variant="outline" disabled={busy !== null} onClick={() => void perform(doc.id, () => download(doc.id))}>{documentLabels[doc.kind]}</Button>)}
        {canManage && invoice.paid_minor === 0 && invoice.status === 'awaiting_payment' && <Button variant="outline" disabled={busy !== null} onClick={() => void perform(invoice.id, async () => { await bankBillingService.cancel(invoice.id); })}>Отменить неоплаченный счёт</Button>}
        {canManage && (invoice.paid_minor > 0 || invoice.overpayment_minor > 0) && <Button variant="outline" disabled={busy !== null} onClick={() => { setRefundInvoice(invoice); setAmount(''); setReason(''); setKind(invoice.overpayment_minor > 0 ? 'overpayment' : 'payment'); setRefundKey(crypto.randomUUID()); }}>Запросить возврат</Button>}
      </div>
      {invoice.refunds.map((refund) => <p key={refund.id} className="text-sm text-slate-600">Возврат {money(refund.amount_minor)}: {refundStatuses[refund.status] ?? 'Проверяется'}</p>)}
    </article>)}
    {data && data.meta.last_page > 1 && <nav aria-label="Страницы счетов" className="flex items-center gap-3"><Button variant="outline" disabled={page <= 1 || loading} onClick={() => setPage(page - 1)}>Назад</Button><span>{page} из {data.meta.last_page}</span><Button variant="outline" disabled={page >= data.meta.last_page || loading} onClick={() => setPage(page + 1)}>Далее</Button></nav>}
    {canManage && refundInvoice && <form className="space-y-3 rounded border p-4" onSubmit={(event) => { event.preventDefault(); void submitRefund(); }}>
      <h3 className="font-semibold">Запрос возврата по {refundInvoice.number}</h3><p className="text-sm text-slate-600">Возврат согласует оператор. Деньги переводятся на исходный счёт плательщика.</p>
      <label className="block text-sm">Основание<select className="mt-1 block w-full rounded border p-2" value={kind} onChange={(event) => { setKind(event.target.value as 'payment' | 'overpayment'); setRefundKey(crypto.randomUUID()); }}><option value="payment">Возврат зачтённой оплаты</option><option value="overpayment">Возврат переплаты</option></select></label>
      <label className="block text-sm">Сумма, руб.<input className="mt-1 block w-full rounded border p-2" inputMode="decimal" value={amount} onChange={(event) => { setAmount(event.target.value); setRefundKey(crypto.randomUUID()); }} required /></label>
      <label className="block text-sm">Причина<textarea className="mt-1 block w-full rounded border p-2" minLength={10} maxLength={1000} value={reason} onChange={(event) => { setReason(event.target.value); setRefundKey(crypto.randomUUID()); }} required /></label>
      <div className="flex gap-2"><Button disabled={busy !== null} type="submit">Отправить запрос</Button><Button variant="outline" type="button" disabled={busy !== null} onClick={() => setRefundInvoice(null)}>Закрыть</Button></div>
    </form>}
  </section>;
};
