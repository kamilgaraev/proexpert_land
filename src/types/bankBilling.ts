export interface BankBillingCapabilities {
  provider: 'tochka' | 'yookassa';
  ready: boolean;
  buyer_ready: boolean;
  card_payments_enabled: boolean;
  auto_invoice_enabled: boolean;
  sbp_b2b_enabled?: boolean;
}

export interface BankInvoice {
  id: string;
  number: string;
  order_id: string;
  status: string;
  amount_minor: number;
  paid_minor: number;
  refunded_minor: number;
  remaining_minor: number;
  overpayment_minor: number;
  currency: string;
  purpose: string;
  bank_transfer_qr_available?: boolean;
  description: string;
  bank: { account: string; bik: string; name: string; correspondent_account: string };
  seller: { name: string; inn: string };
  buyer: { name: string; inn: string };
  expires_at: string;
  paid_at: string | null;
  activated_at: string | null;
  created_at: string;
  documents: Array<{ id: string; kind: 'invoice' | 'closing' | 'correction'; status: string; signature_status: string; issued_at: string; provider?: 'tochka' | 'legacy_local' | 'local_notice'; failure_code?: string | null }>;
  refunds: Array<{ id: string; status: string; amount_minor: number; kind: string; created_at: string }>;
}

export interface BankInvoicePage {
  items: BankInvoice[];
  meta: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface BankQrPayment {
  type: 'sbp_b2b';
  url: string;
  image: string;
  amount_minor: number;
  expires_at: string;
}

export interface BankTransferQrPayment {
  type: 'bank_transfer';
  invoice_id: string;
  image: string;
  amount_minor: number;
  expires_at: string;
}
