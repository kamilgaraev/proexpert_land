import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Check, Clock3, CreditCard, History, Loader2, LockKeyhole, PackageCheck, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCanAccess } from '@/hooks/usePermissions';
import { consumeCommercialIntent } from '@/utils/commercialIntent';
import {
  commercialBillingService,
  createCheckoutIntentKey,
  forgetCheckoutIntentKey,
  pollCommercialOrder,
} from '@/services/commercialBillingService';
import type { CommercialHistory as CommercialHistoryData, CommercialOrder, CommercialPackage, CommercialQuote, CommercialRenewalState } from '@/types/commercialBilling';
import { CommercialApiError } from '@/types/commercialBilling';

const pendingOrderStorageKey = 'most:pending-commercial-order';

const formatMoney = (minor: number, currency = 'RUB') => new Intl.NumberFormat('ru-RU', {
  style: 'currency', currency, maximumFractionDigits: 0,
}).format(minor / 100);

const formatDateTime = (value: string | null) => value
  ? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Moscow' }).format(new Date(value))
  : '—';

const remaining = (value: string | null, now: number) => {
  if (!value) return null;
  const seconds = Math.max(0, Math.floor((new Date(value).getTime() - now) / 1000));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return days > 0 ? `${days} дн. ${hours} ч.` : `${hours} ч. ${minutes} мин.`;
};

const errorText = (error: unknown) => {
  if (!(error instanceof CommercialApiError)) return 'Сервис временно недоступен. Попробуйте ещё раз.';
  if (error.status === 403) return 'У вас нет права просматривать коммерческий контур этой организации.';
  if (error.status === 409) return 'Состав пакетов уже изменился или сейчас действует льготный период. Обновите данные.';
  if (error.status === 422) return 'Проверьте выбранные пакеты и повторите действие.';
  if (error.status === 502) return 'Платёжный сервис временно недоступен. Повторите оплату позже.';
  return error.message;
};

const orderStatusLabel: Record<string, string> = {
  pending_payment: 'Ожидает оплаты', paid: 'Оплачен', canceled: 'Отменён', refunded: 'Возврат', failed: 'Ошибка оплаты',
};

const BillingPage = () => {
  const canManage = useCanAccess({ permission: 'billing.manage' });
  const [packages, setPackages] = useState<CommercialPackage[]>([]);
  const [renewal, setRenewal] = useState<CommercialRenewalState | null>(null);
  const [history, setHistory] = useState<CommercialHistoryData | null>(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [selected, setSelected] = useState<string[]>([]);
  const [fullSuite, setFullSuite] = useState(false);
  const [quote, setQuote] = useState<CommercialQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionBusy, setActionBusy] = useState<string | null>(null);
  const [autoRenewConsent, setAutoRenewConsent] = useState(false);
  const [usedTrials, setUsedTrials] = useState<Set<string>>(() => new Set());
  const [paymentOrder, setPaymentOrder] = useState<CommercialOrder | null>(null);
  const [paymentState, setPaymentState] = useState<'idle' | 'waiting' | 'success' | 'canceled' | 'error'>('idle');
  const [now, setNow] = useState(() => Date.now());
  const quoteSequence = useRef(0);

  const currentPaidSlugs = useMemo(() => packages
    .filter((item) => item.isActive && ['paid_package', 'full_suite', 'corporate'].includes(item.accessSource ?? ''))
    .map((item) => item.slug)
    .sort(), [packages]);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [packageItems, renewalState, historyData] = await Promise.all([
        commercialBillingService.getPackages(),
        commercialBillingService.getRenewal(),
        commercialBillingService.getHistory(1),
      ]);
      if (packageItems.length !== 10) throw new Error('Каталог пакетов временно недоступен.');
      setPackages(packageItems);
      setRenewal(renewalState);
      setHistory(historyData);
      setHistoryPage(1);
      const active = packageItems.filter((item) => item.isActive && ['paid_package', 'full_suite', 'corporate'].includes(item.accessSource ?? '')).map((item) => item.slug);
      const intent = consumeCommercialIntent();
      if (intent.includes('full-suite')) {
        setFullSuite(true);
        setSelected(packageItems.map((item) => item.slug));
      } else {
        const allowed = new Set(packageItems.map((item) => item.slug));
        setSelected(Array.from(new Set([...active, ...intent.filter((slug) => allowed.has(slug))])));
      }
    } catch (requestError) {
      setError(errorText(requestError));
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshCommercialState = useCallback(async () => {
    const [packageItems, renewalState] = await Promise.all([
      commercialBillingService.getPackages(),
      commercialBillingService.getRenewal(),
    ]);
    setPackages(packageItems);
    setRenewal(renewalState);
    setSelected(packageItems.filter((item) => item.isActive && ['paid_package', 'full_suite', 'corporate'].includes(item.accessSource ?? '')).map((item) => item.slug));
    setFullSuite(false);
  }, []);

  useEffect(() => { void loadOverview(); }, [loadOverview]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loading || packages.length === 0 || renewal?.status === 'grace') return;
    const controller = new AbortController();
    const sequence = ++quoteSequence.current;
    const timer = window.setTimeout(async () => {
      setQuoteLoading(true);
      setQuoteError(null);
      try {
        const result = await commercialBillingService.quote({ targetPackageSlugs: fullSuite ? [] : selected, fullSuite }, controller.signal);
        if (sequence === quoteSequence.current) setQuote(result);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        if (sequence === quoteSequence.current) {
          setQuote(null);
          setQuoteError(errorText(requestError));
        }
      } finally {
        if (sequence === quoteSequence.current) setQuoteLoading(false);
      }
    }, 220);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [fullSuite, loading, packages.length, renewal?.status, selected]);

  useEffect(() => {
    const orderId = window.sessionStorage.getItem(pendingOrderStorageKey);
    if (!orderId) return;
    const controller = new AbortController();
    setPaymentState('waiting');
    void pollCommercialOrder(orderId, { signal: controller.signal }).then(async (order) => {
      setPaymentOrder(order);
      if (order.status === 'paid' || order.status === 'refunded') {
        setPaymentState('success');
        window.sessionStorage.removeItem(pendingOrderStorageKey);
        await refreshCommercialState();
      } else if (order.status === 'canceled') {
        setPaymentState('canceled');
        window.sessionStorage.removeItem(pendingOrderStorageKey);
      } else {
        setPaymentState('waiting');
      }
    }).catch((requestError) => {
      if (controller.signal.aborted) return;
      setPaymentState('error');
      setActionError(errorText(requestError));
    });
    return () => controller.abort();
  }, [refreshCommercialState]);

  const togglePackage = (slug: string) => {
    setFullSuite(false);
    setSelected((current) => current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]);
    setAutoRenewConsent(false);
    setActionError(null);
  };

  const selectFullSuite = () => {
    setFullSuite(true);
    setSelected(packages.map((item) => item.slug));
    setAutoRenewConsent(false);
  };

  const startTrial = async (packageSlug: string) => {
    setActionBusy(`trial:${packageSlug}`);
    setActionError(null);
    try {
      await commercialBillingService.startTrial(packageSlug);
      const updated = await commercialBillingService.getPackages();
      setPackages(updated);
    } catch (requestError) {
      if (requestError instanceof CommercialApiError && requestError.status === 409) {
        setUsedTrials((current) => new Set(current).add(packageSlug));
      }
      setActionError(errorText(requestError));
    } finally {
      setActionBusy(null);
    }
  };

  const submitContour = async () => {
    if (!quote || !canManage) return;
    setActionBusy('checkout');
    setActionError(null);
    const fingerprint = JSON.stringify({ target: quote.targetPackageSlugs, current: quote.currentPackageSlugs, fullSuite, quoteVersion: quote.quoteVersion, autoRenewConsent });
    const key = createCheckoutIntentKey(fingerprint);
    try {
      if (quote.amountDueNowMinor === 0 && quote.removedPackageSlugs.length > 0) {
        await commercialBillingService.scheduleContour({ targetPackageSlugs: quote.targetPackageSlugs, quoteVersion: quote.quoteVersion, clientIdempotencyKey: key });
        forgetCheckoutIntentKey(fingerprint);
        await refreshCommercialState();
        setActionError('Сокращение состава запланировано на конец уже оплаченного периода.');
        return;
      }
      if (!autoRenewConsent) {
        setActionError('Подтвердите условия автопродления перед оплатой.');
        return;
      }
      const checkout = await commercialBillingService.checkout({
        targetPackageSlugs: quote.targetPackageSlugs,
        currentPackageSlugs: quote.currentPackageSlugs,
        fullSuite,
        quoteVersion: quote.quoteVersion,
        clientIdempotencyKey: key,
        autoRenewConsent,
      });
      if (!checkout.confirmationUrl) throw new Error('Платёжная ссылка ещё не готова. Повторите действие.');
      window.sessionStorage.setItem(pendingOrderStorageKey, checkout.orderId);
      window.location.assign(checkout.confirmationUrl);
    } catch (requestError) {
      setActionError(errorText(requestError));
    } finally {
      setActionBusy(null);
    }
  };

  const disableRenewal = async () => {
    setActionBusy('renewal');
    setActionError(null);
    try {
      setRenewal(await commercialBillingService.disableRenewal());
    } catch (requestError) {
      setActionError(errorText(requestError));
    } finally {
      setActionBusy(null);
    }
  };

  const loadHistoryPage = async (page: number) => {
    setActionBusy('history');
    try {
      setHistory(await commercialBillingService.getHistory(page));
      setHistoryPage(page);
    } catch (requestError) {
      setActionError(errorText(requestError));
    } finally {
      setActionBusy(null);
    }
  };

  if (loading) return <div className="flex min-h-[420px] items-center justify-center" role="status"><Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="sr-only">Загрузка коммерческого контура</span></div>;
  if (error) return <Card className="border-red-200 bg-red-50"><CardContent className="flex flex-col items-start gap-4 p-6"><AlertCircle className="h-7 w-7 text-red-600" /><p className="font-medium text-red-900">{error}</p><Button variant="outline" onClick={() => void loadOverview()}><RefreshCw className="mr-2 h-4 w-4" />Повторить</Button></CardContent></Card>;

  const isGrace = renewal?.status === 'grace';
  const currentPeriodStart = packages.find((item) => item.currentPeriodStartAt)?.currentPeriodStartAt ?? null;
  const currentPeriodEnd = packages.find((item) => item.currentPeriodEndAt)?.currentPeriodEndAt ?? renewal?.nextBillingAt ?? null;
  const hasReduction = Boolean(quote && quote.amountDueNowMinor === 0 && quote.removedPackageSlugs.length > 0 && quote.addedPackageSlugs.length === 0);

  return (
    <main className="space-y-8 pb-24">
      <header className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 px-6 py-7 text-white shadow-xl sm:px-8">
        <div className="absolute inset-y-0 right-0 w-2/5 bg-[radial-gradient(circle_at_center,rgba(249,115,22,.28),transparent_65%)]" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-orange-300">МОСТ · управление доступом</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Коммерческий контур</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Соберите рабочую систему из пакетов. Бесплатная основа остаётся доступной всегда, а сервер точно рассчитает доплату и следующий период.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:flex">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><span className="block text-xs text-slate-400">Состояние</span><strong>{isGrace ? 'Льготный период' : currentPaidSlugs.length ? 'Оплачено' : 'Бесплатная основа'}</strong></div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"><span className="block text-xs text-slate-400">Следующая дата</span><strong>{formatDateTime(renewal?.nextBillingAt ?? null)}</strong></div>
          </div>
        </div>
      </header>

      {isGrace ? <section className="rounded-[24px] border-2 border-orange-300 bg-orange-50 p-6" aria-labelledby="grace-title">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="max-w-3xl"><Badge className="mb-3 bg-orange-600">Требуется действие</Badge><h2 id="grace-title" className="text-2xl font-semibold text-orange-950">Льготный период</h2><p className="mt-2 text-orange-900">Автоматическая оплата не прошла. Доступ сохранён до <strong>{formatDateTime(renewal?.graceEndsAt ?? null)}</strong> — осталось {remaining(renewal?.graceEndsAt ?? null, now)}. Изменение состава временно заблокировано.</p><p className="mt-3 text-sm leading-6 text-orange-800">Расчётная дата не переносится: поздняя оплата закрывает пропущенный фиксированный 30-дневный период. При оплате на шестой день останется около 24 дней до следующей расчётной даты.</p></div>
          <Button size="lg" onClick={() => document.getElementById('order-summary')?.scrollIntoView({ behavior: 'smooth' })}>Оплатить сейчас<ArrowRight className="ml-2 h-4 w-4" /></Button>
        </div>
      </section> : null}

      {paymentState !== 'idle' ? <section className="rounded-2xl border bg-white p-5" role="status">
        <div className="flex items-center gap-3">{paymentState === 'waiting' ? <Loader2 className="h-5 w-5 animate-spin" /> : paymentState === 'success' ? <Check className="h-5 w-5 text-emerald-600" /> : <AlertCircle className="h-5 w-5 text-orange-600" />}<strong>{paymentState === 'waiting' ? 'Проверяем оплату на сервере' : paymentState === 'success' ? 'Оплата подтверждена' : paymentState === 'canceled' ? 'Оплата отменена' : 'Не удалось проверить оплату'}</strong></div>
        {paymentState === 'success' && paymentOrder ? <p className="mt-2 text-sm text-muted-foreground">Оплачено {formatMoney(paymentOrder.amountMinor, paymentOrder.currency)}. Период до {formatDateTime(paymentOrder.periodEndAt)}. Доступ обновлён после подтверждения сервера.</p> : null}
      </section> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1"><CardContent className="p-6"><ShieldCheck className="h-7 w-7 text-emerald-600" /><h2 className="mt-4 text-xl font-semibold">Бесплатная основа</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Организация, сотрудники, проекты и базовые рабочие данные остаются доступны без оплаты.</p><Badge variant="secondary" className="mt-4">Доступна всегда</Badge></CardContent></Card>
        <Card className="md:col-span-2"><CardContent className="grid gap-5 p-6 sm:grid-cols-3"><div><span className="text-xs uppercase tracking-wider text-muted-foreground">Источник доступа</span><p className="mt-2 font-semibold">{currentPaidSlugs.length ? 'Оплаченные пакеты' : 'Бесплатная основа'}</p></div><div><span className="text-xs uppercase tracking-wider text-muted-foreground">Текущий период</span><p className="mt-2 font-semibold">{formatDateTime(currentPeriodStart)} — {formatDateTime(currentPeriodEnd)}</p></div><div><span className="text-xs uppercase tracking-wider text-muted-foreground">Способ оплаты</span><p className="mt-2 font-semibold">{renewal?.savedMethodAvailable ? 'Сохранён' : 'Не сохранён'}</p></div><div className="sm:col-span-3 flex flex-wrap items-center justify-between gap-3 border-t pt-4"><p className="text-sm text-muted-foreground">Бонусы и компенсации учитываются отдельно и не используются для покупки пакетов.</p>{renewal?.autoRenewEnabled && canManage ? <Button variant="outline" onClick={() => void disableRenewal()} disabled={actionBusy === 'renewal'}>Отключить автопродление</Button> : <Badge variant="outline">Автопродление отключено</Badge>}</div></CardContent></Card>
      </section>

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Система 01—10</p><h2 className="mt-2 text-2xl font-semibold">Конструктор пакетов</h2><p className="mt-1 text-sm text-muted-foreground">Каждый узел — самостоятельный бизнес-процесс.</p></div>{!canManage ? <Badge variant="outline">Доступен просмотр без изменения состава</Badge> : null}</div>
          <div className="grid gap-3 md:grid-cols-2">
            {packages.map((item, index) => {
              const checked = fullSuite || selected.includes(item.slug);
              const trialLeft = remaining(item.trialEndsAt, now);
              return <article key={item.slug} className={`relative rounded-[22px] border p-5 transition ${checked ? 'border-slate-900 bg-slate-950 text-white shadow-lg' : 'border-slate-200 bg-white hover:border-slate-400'}`}>
                <label className="flex cursor-pointer items-start gap-4">
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-mono text-sm ${checked ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'}`}>{String(index + 1).padStart(2, '0')}</span>
                  <span className="min-w-0 flex-1"><span className="flex items-start justify-between gap-3"><strong className="text-base">{item.name}</strong><span className="whitespace-nowrap text-sm font-semibold">{formatMoney(item.priceMinor, item.currency)}</span></span><span className={`mt-2 block text-sm leading-5 ${checked ? 'text-slate-300' : 'text-muted-foreground'}`}>{item.description}</span><span className={`mt-3 block text-xs ${checked ? 'text-orange-300' : 'text-primary'}`}>{item.businessOutcomes[0] ?? item.highlights[0]}</span></span>
                  <input type="checkbox" className="mt-1 h-5 w-5 accent-orange-500" checked={checked} disabled={!canManage || isGrace} onChange={() => togglePackage(item.slug)} aria-label={`${item.name}, ${formatMoney(item.priceMinor, item.currency)}`} />
                </label>
                {item.status === 'trialing' ? <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-100 px-3 py-2 text-xs font-medium text-amber-900"><Clock3 className="h-4 w-4" />Пробный доступ: {trialLeft ?? 'завершён'}</div> : !item.isActive && canManage ? <Button variant={checked ? 'secondary' : 'outline'} size="sm" className="mt-4" disabled={usedTrials.has(item.slug) || actionBusy === `trial:${item.slug}`} onClick={() => void startTrial(item.slug)}>{usedTrials.has(item.slug) ? 'Пробный доступ уже использован' : 'Попробовать на 72 часа'}</Button> : null}
              </article>;
            })}
          </div>
        </div>

        <aside id="order-summary" className="space-y-4 xl:sticky xl:top-6">
          <Card className="overflow-hidden border-slate-300 shadow-xl"><div className="bg-orange-500 px-5 py-3 text-sm font-semibold text-white">Расчёт сервера</div><CardContent className="space-y-5 p-5">
            <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Выбрано</span><strong>{fullSuite ? 'Полный комплект' : `${selected.length} из 10`}</strong></div>
            {quote?.recommendation === 'full_suite' && !fullSuite ? <button type="button" onClick={selectFullSuite} disabled={!canManage || isGrace} className="w-full rounded-2xl border border-orange-300 bg-orange-50 p-4 text-left text-sm text-orange-950"><Sparkles className="mb-2 h-5 w-5 text-orange-600" /><strong>Полный комплект выгоднее</strong><span className="mt-1 block text-xs">Рекомендация не меняет выбор автоматически.</span></button> : null}
            {quoteLoading ? <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Пересчитываем</div> : quoteError ? <p className="text-sm text-red-700">{quoteError}</p> : quote ? <>
              <div className="space-y-3 border-y py-4"><div className="flex justify-between text-sm"><span>В месяц</span><strong data-testid="monthly-total">{formatMoney(quote.monthlyTotalMinor, quote.currency)}</strong></div><div className="flex justify-between text-sm"><span>К оплате сейчас</span><strong className="text-lg">{formatMoney(quote.amountDueNowMinor, quote.currency)}</strong></div>{quote.savingsAmountMinor > 0 ? <div className="flex justify-between text-sm text-emerald-700"><span>Экономия</span><strong>{formatMoney(quote.savingsAmountMinor, quote.currency)} · {quote.savingsPercent}%</strong></div> : null}</div>
              <div className="space-y-2 text-xs text-muted-foreground"><p>Добавляется: {quote.addedPackageSlugs.length || 'нет'}</p><p>Убирается со следующего периода: {quote.removedPackageSlugs.length || 'нет'}</p><p>Следующая дата: {formatDateTime(quote.periodEndAt)}</p></div>
              {hasReduction ? <p className="rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-900">Сокращение бесплатно и будет применено в следующую фиксированную дату. Уже оплаченный доступ сохранится до конца периода.</p> : null}
              {canManage && !isGrace && !hasReduction ? <label className="flex items-start gap-3 rounded-xl border p-3 text-xs leading-5"><input type="checkbox" className="mt-1 h-4 w-4" checked={autoRenewConsent} onChange={(event) => setAutoRenewConsent(event.target.checked)} /><span>Согласен на автоматическое списание <strong>{formatMoney(quote.monthlyTotalMinor, quote.currency)}</strong> каждые 30 дней. Отключить можно здесь же, в разделе коммерческого контура.</span></label> : null}
              {canManage ? <Button className="w-full" size="lg" onClick={() => void submitContour()} disabled={isGrace || actionBusy === 'checkout' || (!hasReduction && !autoRenewConsent)}>{isGrace ? <><LockKeyhole className="mr-2 h-4 w-4" />Изменение заблокировано</> : hasReduction ? 'Запланировать сокращение' : <><CreditCard className="mr-2 h-4 w-4" />Перейти к оплате</>}</Button> : null}
            </> : <p className="text-sm text-muted-foreground">Выберите состав, чтобы получить расчёт.</p>}
            {actionError ? <p className={`rounded-xl p-3 text-sm ${actionError.startsWith('Сокращение') ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>{actionError}</p> : null}
          </CardContent></Card>
        </aside>
      </section>

      <section className="space-y-4" aria-labelledby="history-title">
        <div className="flex items-center gap-3"><History className="h-6 w-6" /><div><h2 id="history-title" className="text-2xl font-semibold">История оплат</h2><p className="text-sm text-muted-foreground">Безопасный журнал заказов, оплат и возвратов.</p></div></div>
        {!history?.items.length ? <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground"><PackageCheck className="mx-auto mb-3 h-7 w-7" />Операций пока нет</div> : <div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-muted-foreground"><tr><th className="p-4">Дата</th><th className="p-4">Состав</th><th className="p-4">Сумма</th><th className="p-4">Состояние</th><th className="p-4">Возвраты</th></tr></thead><tbody>{history.items.map((order) => <tr key={order.orderId} className="border-t"><td className="p-4">{formatDateTime(order.createdAt)}</td><td className="p-4">{order.offerType === 'full_suite' ? 'Полный комплект' : `${order.selectedPackageSlugs.length} пак.`}</td><td className="p-4 font-medium">{formatMoney(order.amountMinor, order.currency)}</td><td className="p-4"><Badge variant="outline">{orderStatusLabel[order.status] ?? order.status}</Badge></td><td className="p-4">{order.refundsSummary.count ? formatMoney(order.refundsSummary.amountMinor, order.currency) : '—'}</td></tr>)}</tbody></table></div>}
        {history && history.meta.lastPage > 1 ? <div className="flex justify-end gap-2"><Button variant="outline" disabled={historyPage <= 1 || actionBusy === 'history'} onClick={() => void loadHistoryPage(historyPage - 1)}>Назад</Button><Button variant="outline" disabled={historyPage >= history.meta.lastPage || actionBusy === 'history'} onClick={() => void loadHistoryPage(historyPage + 1)}>Далее</Button></div> : null}
      </section>
    </main>
  );
};

export default BillingPage;
