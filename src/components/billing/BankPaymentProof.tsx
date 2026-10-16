import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { bankBillingService } from '@/services/bankBillingService';
import type { BankInvoice } from '@/types/bankBilling';

const date = (value: string) => new Date(value).toLocaleString('ru-RU');
const labels = {
  pending: 'Ожидаем поступление денег', review: 'Поступление не подтверждено — требуется проверка',
  confirmed: 'Поступление подтверждено банком', rejected: 'Подтверждение отклонено', canceled: 'Счёт отменён',
};

export const BankPaymentProof = ({ invoice, canManage, onSubmitted }: {
  invoice: BankInvoice; canManage: boolean; onSubmitted: () => Promise<void>;
}) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  const proof = invoice.payment_proof;
  const eligible = canManage && invoice.payment_proof_available === true && !proof
    && ['awaiting_payment', 'partially_paid'].includes(invoice.status) && invoice.remaining_minor > 0
    && Date.parse(invoice.expires_at) > Date.now();

  const submit = async () => {
    if (!eligible || busy) return;
    if (!file || !['application/pdf', 'image/jpeg', 'image/png'].includes(file.type) || file.size < 1 || file.size > 5 * 1024 * 1024) {
      setError('Выберите платёжку в PDF, JPEG или PNG размером до 5 МБ.'); return;
    }
    if (!confirmed) { setError('Подтвердите отправку платежа с расчётного счёта плательщика.'); return; }
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 30_000);
    setBusy(true); setError(null);
    try {
      await bankBillingService.submitPaymentProof(invoice.id, file, controller.signal);
      if (controller.signal.aborted) return;
      setOpen(false);
      await onSubmitted();
    } catch (failure) {
      setError(controller.signal.aborted
        ? 'Ожидание ответа истекло. Обновите список счетов: платёжка могла сохраниться. Повторная отправка того же файла не продлевает доступ.'
        : failure instanceof Error ? failure.message : 'Не удалось отправить платёжку.');
    } finally { window.clearTimeout(timeout); request.current = null; setBusy(false); }
  };

  return <div className="space-y-2">
    {proof && <div role="status" className={`rounded-md border p-3 text-sm ${proof.status === 'review' || proof.status === 'rejected' ? 'border-amber-200 bg-amber-50 text-amber-950' : 'border-slate-200 bg-slate-50 text-slate-800'}`}>
      <p className="font-medium">{labels[proof.status]}</p>
      {proof.status === 'pending' && <p className="mt-1">{proof.temporary_access_active && Date.parse(proof.temporary_expires_at) > Date.now()
        ? `Временный доступ до ${date(proof.temporary_expires_at)}. Счёт пока не оплачен.`
        : 'Срок временного доступа закончился. Ожидаем проверку поступления.'}</p>}
      {proof.status === 'review' && <p className="mt-1">Временный доступ завершён. Поддержка проверит перевод; подтверждённая оплата будет зачтена отдельно.</p>}
      {proof.status === 'rejected' && <p className="mt-1">Обратитесь в поддержку для уточнения перевода. Срок временного доступа повторно не предоставляется по этому счёту.</p>}
    </div>}
    {eligible && <Button variant="outline" onClick={() => { setError(null); setFile(null); setConfirmed(false); setOpen(true); }}>Я оплатил</Button>}
    <Dialog open={open && eligible} onOpenChange={(value) => { if (!busy) setOpen(value); }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>Сообщить об оплате</DialogTitle><DialogDescription>Счёт {invoice.number}. Приложите платёжное поручение после отправки перевода.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); void submit(); }}>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
            Временный доступ предоставляется один раз на три дня без учёта субботы и воскресенья, в пределах периода покупки.
            Повторная загрузка срок не продлевает. Счёт станет оплаченным только после подтверждения поступления банком.
            Если деньги не поступят, временный доступ завершится, а платёж уйдёт на проверку.
          </div>
          <label className="block space-y-2 text-sm font-medium">Платёжное поручение
            <input type="file" accept="application/pdf,image/jpeg,image/png" disabled={busy} className="block w-full rounded-md border p-2 text-sm" onChange={(event) => { setFile(event.target.files?.[0] ?? null); setError(null); }} />
            <span className="block text-xs font-normal text-slate-500">PDF, JPEG или PNG, до 5 МБ. Файл доступен только вашей организации и уполномоченной поддержке.</span>
          </label>
          <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={confirmed} disabled={busy} onChange={(event) => setConfirmed(event.target.checked)} className="mt-1" /><span>Платёж отправлен с расчётного счёта {invoice.buyer.name}, ИНН {invoice.buyer.inn}, с номером {invoice.number} в назначении.</span></label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" disabled={busy} onClick={() => setOpen(false)}>Отмена</Button><Button type="submit" disabled={busy || !file || !confirmed}>{busy ? 'Отправляем…' : 'Отправить платёжку'}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
};
