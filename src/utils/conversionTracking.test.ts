import { beforeEach, describe, expect, it, vi } from 'vitest';
const analytics = vi.hoisted(() => ({ goal: vi.fn(() => true) }));
vi.mock('@/components/analytics/YandexMetrika', () => ({ trackYandexGoal: analytics.goal }));
import { trackConversionOnce, trackPaidOrder } from './conversionTracking';

const order = { orderId: 'paid-order', status: 'paid', amountMinor: 3990000, currency: 'RUB', testMode: false, paymentSource: 'yookassa' };

describe('confirmed conversions', () => {
  beforeEach(() => {
    window.localStorage.clear();
    analytics.goal.mockReset().mockReturnValue(true);
  });

  it.each(['pending_payment', 'canceled', 'failed', 'refunded'])('не считает %s оплатой', (status) => {
    expect(trackPaidOrder({ ...order, status })).toBe(false);
    expect(analytics.goal).not.toHaveBeenCalled();
  });

  it('исключает пробный доступ, тестовые и нулевые платежи', () => {
    expect(trackPaidOrder({ ...order, testMode: true })).toBe(false);
    expect(trackPaidOrder({ ...order, amountMinor: 0 })).toBe(false);
    expect(analytics.goal).not.toHaveBeenCalled();
  });

  it('считает подтверждённую оплату один раз и передаёт только сумму и способ', () => {
    expect(trackPaidOrder(order)).toBe(true);
    expect(trackPaidOrder(order)).toBe(false);
    expect(analytics.goal).toHaveBeenCalledExactlyOnceWith('purchase', { order_price: 39900, currency: 'RUB', payment_source: 'yookassa' });
  });

  it('не запоминает конверсию при отказе от аналитики', () => {
    analytics.goal.mockReturnValue(false);
    expect(trackConversionOnce('registration', 'register-without-consent')).toBe(false);
    expect(window.localStorage.length).toBe(0);
    analytics.goal.mockReturnValue(true);
    expect(trackConversionOnce('registration', 'register-without-consent')).toBe(true);
  });

  it('сбой аналитики не прерывает бизнес-сценарий', () => {
    analytics.goal.mockImplementation(() => { throw new Error('analytics unavailable'); });
    expect(() => trackPaidOrder({ ...order, orderId: 'failure-order' })).not.toThrow();
  });
});
