import { trackYandexGoal } from '@/components/analytics/YandexMetrika';

const sent = new Set<string>();

export const trackConversionOnce = (goal: string, key: string, params?: Record<string, unknown>): boolean => {
  if (typeof window === 'undefined' || !key) return false;
  const storageKey = `most.conversion.${goal}.${key}`;
  try {
    if (sent.has(storageKey) || window.localStorage.getItem(storageKey)) return false;
    if (!trackYandexGoal(goal, params)) return false;
    sent.add(storageKey);
    window.localStorage.setItem(storageKey, '1');
    return true;
  } catch {
    return false;
  }
};

interface PaidOrder {
  orderId: string;
  status: string;
  amountMinor: number;
  currency: string;
  testMode: boolean;
  paymentSource?: string | null;
}

export const trackPaidOrder = (order: PaidOrder): boolean => {
  if (order.status !== 'paid' || order.testMode !== false || order.amountMinor <= 0 || !Number.isFinite(order.amountMinor)) return false;
  return trackConversionOnce('purchase', order.orderId, {
    order_price: order.amountMinor / 100,
    currency: order.currency,
    payment_source: order.paymentSource,
  });
};
