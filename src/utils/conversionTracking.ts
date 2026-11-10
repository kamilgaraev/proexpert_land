import { trackYandexGoal } from '@/components/analytics/YandexMetrika';
import { trackFunnelEventOnce, type FunnelEvent } from '@/utils/funnelTracking';

const sent = new Set<string>();

const FUNNEL_EVENTS: Record<string, FunnelEvent> = {
  registration: 'registration_completed',
  email_verified: 'email_verified',
  purchase: 'purchase',
};

const toFunnelData = (params?: Record<string, unknown>) => {
  const data: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') data[key] = value;
  }
  return data;
};

export const trackConversionOnce = (goal: string, key: string, params?: Record<string, unknown>): boolean => {
  if (typeof window === 'undefined' || !key) return false;
  const funnelEvent = FUNNEL_EVENTS[goal];
  if (funnelEvent) trackFunnelEventOnce(funnelEvent, key, toFunnelData(params));
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
