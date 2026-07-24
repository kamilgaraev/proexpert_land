import { API_URL } from '@/utils/api';
import { getJsonAuthHeaders } from '@/utils/authTokenStorage';
import type {
  CommercialHistory,
  CommercialLimitsSummary,
  CommercialOrder,
  CommercialPackage,
  CommercialQuote,
  CommercialResourceAddonQuote,
  CommercialRenewalState,
} from '@/types/commercialBilling';
import { CommercialApiError } from '@/types/commercialBilling';

type JsonRecord = Record<string, any>;

const checkoutIntentKeys = new Map<string, string>();

const uuid = (): string => globalThis.crypto.randomUUID();

export const createCheckoutIntentKey = (fingerprint: string): string => {
  const existing = checkoutIntentKeys.get(fingerprint);
  if (existing) return existing;
  const key = uuid();
  checkoutIntentKeys.set(fingerprint, key);
  return key;
};

export const forgetCheckoutIntentKey = (fingerprint: string): void => {
  checkoutIntentKeys.delete(fingerprint);
};

const request = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getJsonAuthHeaders(),
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers ?? {}),
    },
  });
  const payload = await response.json().catch(() => ({})) as JsonRecord;
  if (!response.ok || payload.success === false) {
    throw new CommercialApiError(payload.message || 'Не удалось выполнить запрос.', response.status, payload.errors);
  }
  return payload.data as T;
};

const packageFromApi = (item: JsonRecord): CommercialPackage => ({
  slug: item.slug,
  name: item.name,
  description: item.description,
  sortOrder: item.sort_order,
  price: item.price,
  priceMinor: item.price_minor,
  currency: item.currency,
  billingPeriodDays: item.billing_period_days,
  modules: Array.isArray(item.modules)
    ? item.modules
      .filter((module: unknown): module is JsonRecord => (
        typeof module === 'object'
        && module !== null
        && typeof (module as JsonRecord).slug === 'string'
        && typeof (module as JsonRecord).name === 'string'
        && typeof (module as JsonRecord).description === 'string'
      ))
      .map((module: JsonRecord) => ({
        slug: module.slug,
        name: module.name,
        description: module.description,
      }))
    : [],
  highlights: Array.isArray(item.highlights) ? item.highlights : [],
  businessOutcomes: Array.isArray(item.business_outcomes) ? item.business_outcomes : [],
  isActive: Boolean(item.is_active),
  status: item.status ?? null,
  accessSource: item.access_source ?? null,
  currentPeriodStartAt: item.current_period_start_at ?? null,
  currentPeriodEndAt: item.current_period_end_at ?? null,
  trialEndsAt: item.trial_ends_at ?? null,
  trialAvailable: Boolean(item.trial_available),
  trialUsed: Boolean(item.trial_used),
});

const quoteFromApi = (item: JsonRecord): CommercialQuote => ({
  quoteVersion: item.quote_version,
  currency: item.currency,
  billingPeriodDays: item.billing_period_days,
  offerType: item.offer_type,
  targetPackageSlugs: item.target_package_slugs ?? [],
  currentPackageSlugs: item.current_package_slugs ?? [],
  addedPackageSlugs: item.added_package_slugs ?? [],
  removedPackageSlugs: item.removed_package_slugs ?? [],
  monthlyTotal: item.monthly_total,
  monthlyTotalMinor: item.monthly_total_minor,
  amountDueNow: item.amount_due_now,
  amountDueNowMinor: item.amount_due_now_minor,
  savingsAmount: item.savings_amount,
  savingsAmountMinor: item.savings_amount_minor,
  savingsPercent: item.savings_percent,
  recommendation: item.recommendation ?? null,
  periodStartAt: item.period_start_at,
  periodEndAt: item.period_end_at,
});

const renewalFromApi = (item: JsonRecord): CommercialRenewalState => ({
  status: item.status,
  autoRenewEnabled: Boolean(item.auto_renew_enabled),
  savedMethodAvailable: Boolean(item.saved_method_available),
  nextBillingAt: item.next_billing_at ?? null,
  graceStartedAt: item.grace_started_at ?? null,
  graceEndsAt: item.grace_ends_at ?? null,
  retryStatus: item.retry_status ?? null,
  attemptCount: item.attempt_count ?? 0,
  nextAttemptAt: item.next_attempt_at ?? null,
  scheduledChange: item.scheduled_change ? {
    status: item.scheduled_change.status,
    offerType: item.scheduled_change.offer_type,
    targetPackageSlugs: item.scheduled_change.target_package_slugs ?? [],
    currentPackageSlugs: item.scheduled_change.current_package_slugs ?? [],
    applyAt: item.scheduled_change.apply_at,
    billingAnchorAt: item.scheduled_change.billing_anchor_at ?? null,
  } : null,
});

const orderFromApi = (item: JsonRecord): CommercialOrder => ({
  orderId: item.order_id,
  kind: item.kind ?? null,
  status: item.status,
  paymentStatus: item.payment_status ?? null,
  paymentSource: item.payment_source ?? null,
  amount: item.amount,
  amountMinor: item.amount_minor,
  currency: item.currency,
  selectedPackageSlugs: item.selected_package_slugs ?? [],
  offerType: item.offer_type,
  periodStartAt: item.period_start_at ?? null,
  periodEndAt: item.period_end_at ?? null,
  autoRenewConsent: Boolean(item.auto_renew_consent),
  testMode: Boolean(item.test_mode),
  confirmationUrl: item.confirmation_url ?? null,
  createdAt: item.created_at ?? null,
  paidAt: item.paid_at ?? null,
  canceledAt: item.canceled_at ?? null,
  refundsSummary: {
    count: item.refunds_summary?.count ?? 0,
    amount: item.refunds_summary?.amount ?? '0.00',
    amountMinor: item.refunds_summary?.amount_minor ?? 0,
    currency: item.refunds_summary?.currency ?? item.currency,
    fullyRefunded: Boolean(item.refunds_summary?.fully_refunded),
  },
  payments: item.payments,
  refunds: item.refunds,
});

const limitsFromApi = (item: JsonRecord): CommercialLimitsSummary => ({
  accountStatus: item.account_status,
  offerType: item.offer_type,
  monthlyPackageAmountMinor: item.monthly_package_amount_minor ?? 0,
  monthlyPackageAmount: item.monthly_package_amount ?? '0.00',
  monthlyResourceAmountMinor: item.monthly_resource_amount_minor ?? 0,
  monthlyResourceAmount: item.monthly_resource_amount ?? '0.00',
  currency: item.currency ?? 'RUB',
  period: {
    startAt: item.period?.start_at ?? null,
    endAt: item.period?.end_at ?? null,
  },
  limits: Array.isArray(item.limits) ? item.limits.map((limit: JsonRecord) => ({
    key: limit.key,
    name: limit.name,
    unit: limit.unit,
    used: Number(limit.used ?? 0),
    limit: limit.limit === null ? null : Number(limit.limit ?? 0),
    remaining: limit.remaining === null ? null : Number(limit.remaining ?? 0),
    percent: Number(limit.percent ?? 0),
    status: limit.status,
    enforcement: limit.enforcement,
    sources: {
      freeBase: Number(limit.sources?.free_base ?? 0),
      packages: Number(limit.sources?.packages ?? 0),
      paidAddons: Number(limit.sources?.paid_addons ?? 0),
      corporateOverride: limit.sources?.corporate_override === null ? null : Number(limit.sources?.corporate_override ?? 0),
    },
  })) : [],
  resourceAddons: Array.isArray(item.resource_addons) ? item.resource_addons.map((resource: JsonRecord) => ({
    slug: resource.slug,
    limitKey: resource.limit_key,
    name: resource.name,
    unit: resource.unit,
    currentQuantity: Number(resource.current_quantity ?? 0),
    step: Number(resource.step ?? 1),
    min: Number(resource.min ?? 0),
    maxSelfService: Number(resource.max_self_service ?? 0),
    requiresPackage: resource.requires_package ?? null,
    available: Boolean(resource.available),
    pricing: {
      model: resource.pricing?.model ?? 'linear',
      currency: resource.pricing?.currency ?? 'RUB',
      priceMinor: Number(resource.pricing?.price_minor ?? 0),
      amount: resource.pricing?.amount ?? '0.00',
    },
  })) : [],
});

const resourceAddonQuoteFromApi = (item: JsonRecord): CommercialResourceAddonQuote => ({
  amountMinor: Number(item.amount_minor ?? 0),
  amount: item.amount ?? '0.00',
  currency: item.currency ?? 'RUB',
  requiresManager: Boolean(item.requires_manager),
  quoteVersion: Number(item.quote_version ?? 1),
  items: Array.isArray(item.items) ? item.items.map((quoteItem: JsonRecord) => ({
    slug: quoteItem.slug,
    limitKey: quoteItem.limit_key,
    quantity: Number(quoteItem.quantity ?? 0),
    amountMinor: Number(quoteItem.amount_minor ?? 0),
    amount: quoteItem.amount ?? '0.00',
    currency: quoteItem.currency ?? item.currency ?? 'RUB',
    status: quoteItem.status,
    requiresPackage: quoteItem.requires_package ?? null,
  })) : [],
});

export const commercialBillingService = {
  getPackages: async (signal?: AbortSignal) => (await request<JsonRecord[]>('/packages', { signal })).map(packageFromApi),
  getLimits: async (signal?: AbortSignal) => limitsFromApi(await request<JsonRecord>('/billing/limits', { signal })),
  quoteResourceAddons: async (input: { resources: Array<{ slug: string; quantity: number }> }, signal?: AbortSignal) => resourceAddonQuoteFromApi(await request<JsonRecord>('/billing/resource-addons/quote', {
    method: 'POST', signal, body: JSON.stringify({ resources: input.resources }),
  })),
  quote: async (input: { targetPackageSlugs: string[]; fullSuite: boolean }, signal?: AbortSignal) => quoteFromApi(await request<JsonRecord>('/billing/commercial/quote', {
    method: 'POST', signal, body: JSON.stringify({ target_package_slugs: input.targetPackageSlugs, full_suite: input.fullSuite }),
  })),
  checkout: async (input: { targetPackageSlugs: string[]; currentPackageSlugs: string[]; fullSuite: boolean; quoteVersion: number; clientIdempotencyKey: string; autoRenewConsent: boolean; useBalance: boolean }) => {
    const item = await request<JsonRecord>('/billing/commercial/checkout', { method: 'POST', body: JSON.stringify({
      target_package_slugs: input.fullSuite ? [] : input.targetPackageSlugs,
      current_package_slugs: input.currentPackageSlugs,
      full_suite: input.fullSuite,
      quote_version: input.quoteVersion,
      client_idempotency_key: input.clientIdempotencyKey,
      auto_renew_consent: input.autoRenewConsent,
      use_balance: input.useBalance,
    }) });
    return {
      orderId: item.order_id as string,
      status: item.status as string,
      amount: item.amount as string,
      amountMinor: item.amount_minor as number,
      currency: item.currency as string,
      confirmationUrl: item.confirmation_url as string | null,
      paymentStatus: item.payment_status as string | null,
      paymentSource: item.payment_source as 'yookassa' | 'balance' | null,
      autoRenewConsent: Boolean(item.auto_renew_consent),
      testMode: Boolean(item.test_mode),
    };
  },
  scheduleContour: async (input: { targetPackageSlugs: string[]; quoteVersion: number; clientIdempotencyKey: string }) => request<JsonRecord>('/billing/commercial/contour/schedule', { method: 'POST', body: JSON.stringify({ target_package_slugs: input.targetPackageSlugs, full_suite: false, quote_version: input.quoteVersion, client_idempotency_key: input.clientIdempotencyKey }) }),
  getOrder: async (orderId: string, signal?: AbortSignal) => orderFromApi(await request<JsonRecord>(`/billing/commercial/orders/${encodeURIComponent(orderId)}`, { signal })),
  getHistory: async (page = 1) => {
    const response = await fetch(`${API_URL}/billing/commercial/history?page=${page}&per_page=20`, { headers: getJsonAuthHeaders() });
    const payload = await response.json().catch(() => ({})) as JsonRecord;
    if (!response.ok || payload.success === false) throw new CommercialApiError(payload.message || 'Не удалось загрузить историю.', response.status, payload.errors);
    return {
      items: (Array.isArray(payload.data) ? payload.data : []).map(orderFromApi),
      meta: { currentPage: payload.meta?.current_page ?? 1, perPage: payload.meta?.per_page ?? 20, lastPage: payload.meta?.last_page ?? 1, total: payload.meta?.total ?? 0 },
    } satisfies CommercialHistory;
  },
  getRenewal: async () => renewalFromApi(await request<JsonRecord>('/billing/commercial/renewal')),
  disableRenewal: async () => renewalFromApi(await request<JsonRecord>('/billing/commercial/renewal/disable', { method: 'POST' })),
  createManualPayment: async (clientIdempotencyKey: string) => {
    const item = await request<JsonRecord>('/billing/commercial/renewal/manual-payment', {
      method: 'POST', body: JSON.stringify({ client_idempotency_key: clientIdempotencyKey }),
    });
    return {
      orderId: item.order_id as string,
      status: item.status as string,
      paymentStatus: item.payment_status as string,
      amount: item.amount as string,
      amountMinor: item.amount_minor as number,
      currency: item.currency as string,
      confirmationUrl: item.confirmation_url as string | null,
      selectedPackageSlugs: (item.selected_package_slugs ?? []) as string[],
      periodStartAt: item.period_start_at as string | null,
      periodEndAt: item.period_end_at as string | null,
      graceDeadlineAt: item.grace_deadline_at as string | null,
      testMode: Boolean(item.test_mode),
    };
  },
  startTrial: async (packageSlug: string) => request<JsonRecord>(`/packages/${encodeURIComponent(packageSlug)}/trial`, { method: 'POST' }),
};

export class CommercialPollingTimeoutError extends Error {
  constructor(public readonly orderId: string, public readonly latest: CommercialOrder) {
    super('Подтверждение ещё не получено. Повторите проверку.');
    this.name = 'CommercialPollingTimeoutError';
  }
}

export const COMMERCIAL_PAYMENT_POLL_DELAYS_MS: readonly number[] = [0, 500, 1000, 1500, 2500, 4000, 6000, 9000, 12000, 15000];

export const pollCommercialOrder = async (
  orderId: string,
  options: { delaysMs?: number[]; signal?: AbortSignal } = {},
): Promise<CommercialOrder> => {
  const delays = options.delaysMs ?? COMMERCIAL_PAYMENT_POLL_DELAYS_MS;
  let latest: CommercialOrder | null = null;
  for (const delayMs of delays) {
    if (delayMs > 0) await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(resolve, delayMs);
      options.signal?.addEventListener('abort', () => { window.clearTimeout(timer); reject(new DOMException('Aborted', 'AbortError')); }, { once: true });
    });
    latest = await commercialBillingService.getOrder(orderId, options.signal);
    if (latest.status !== 'pending_payment') return latest;
  }
  if (!latest) throw new Error('Не удалось проверить состояние оплаты.');
  throw new CommercialPollingTimeoutError(orderId, latest);
};
