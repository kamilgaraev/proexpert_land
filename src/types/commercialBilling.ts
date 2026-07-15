export type CommercialAccountStatus = 'free' | 'active' | 'grace' | 'suspended' | 'corporate';
export type CommercialOrderStatus = 'pending_payment' | 'paid' | 'canceled' | 'refunded' | 'failed';

export interface CommercialPackageModule {
  slug: string;
  name: string;
  description: string;
}

export interface CommercialPackage {
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  price: string;
  priceMinor: number;
  currency: string;
  billingPeriodDays: number;
  modules: CommercialPackageModule[];
  highlights: string[];
  businessOutcomes: string[];
  isActive: boolean;
  status: string | null;
  accessSource: string | null;
  currentPeriodStartAt: string | null;
  currentPeriodEndAt: string | null;
  trialEndsAt: string | null;
  trialAvailable: boolean;
  trialUsed: boolean;
}

export interface CommercialQuote {
  quoteVersion: number;
  currency: string;
  billingPeriodDays: number;
  offerType: 'packages' | 'full_suite';
  targetPackageSlugs: string[];
  currentPackageSlugs: string[];
  addedPackageSlugs: string[];
  removedPackageSlugs: string[];
  monthlyTotal: string;
  monthlyTotalMinor: number;
  amountDueNow: string;
  amountDueNowMinor: number;
  savingsAmount: string;
  savingsAmountMinor: number;
  savingsPercent: number;
  recommendation: 'full_suite' | null;
  periodStartAt: string;
  periodEndAt: string;
}

export interface CommercialRenewalState {
  status: CommercialAccountStatus;
  autoRenewEnabled: boolean;
  savedMethodAvailable: boolean;
  nextBillingAt: string | null;
  graceStartedAt: string | null;
  graceEndsAt: string | null;
  retryStatus: string | null;
  attemptCount: number;
  nextAttemptAt: string | null;
  scheduledChange: {
    status: 'scheduled';
    offerType: 'packages' | 'full_suite';
    targetPackageSlugs: string[];
    currentPackageSlugs: string[];
    applyAt: string;
    billingAnchorAt: string | null;
  } | null;
}

export interface CommercialOrder {
  orderId: string;
  kind: string | null;
  status: CommercialOrderStatus;
  paymentStatus: string | null;
  amount: string;
  amountMinor: number;
  currency: string;
  selectedPackageSlugs: string[];
  offerType: 'packages' | 'full_suite';
  periodStartAt: string | null;
  periodEndAt: string | null;
  autoRenewConsent: boolean;
  testMode: boolean;
  confirmationUrl: string | null;
  createdAt: string | null;
  paidAt: string | null;
  canceledAt: string | null;
  refundsSummary: { count: number; amount: string; amountMinor: number; currency: string; fullyRefunded: boolean };
  payments?: Array<Record<string, unknown>>;
  refunds?: Array<Record<string, unknown>>;
}

export interface CommercialHistory {
  items: CommercialOrder[];
  meta: { currentPage: number; perPage: number; lastPage: number; total: number };
}

export class CommercialApiError extends Error {
  constructor(message: string, public readonly status: number, public readonly errors?: unknown) {
    super(message);
    this.name = 'CommercialApiError';
  }
}
