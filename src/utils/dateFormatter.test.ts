import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { formatDistanceToNow } from './dateFormatter';

describe('formatDistanceToNow', () => {
  const now = new Date('2026-10-04T12:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.each([
    ['2026-09-07T12:00:00Z', '3 нед. назад'],
    ['2026-09-06T12:00:00Z', '4 нед. назад'],
    ['2026-09-05T12:00:00Z', '4 нед. назад'],
    ['2026-09-04T12:00:00Z', '1 мес. назад'],
    ['2026-09-03T12:00:00Z', '1 мес. назад'],
  ])('formats %s as %s at the week/month boundary', (date, expected) => {
    expect(formatDistanceToNow(date)).toBe(expected);
  });

  it.each([
    [0, 'только что'],
    [59, 'только что'],
    [60, '1 мин. назад'],
    [3599, '59 мин. назад'],
    [3600, '1 ч. назад'],
    [86399, '23 ч. назад'],
    [86400, '1 дн. назад'],
    [6 * 86400, '6 дн. назад'],
    [7 * 86400, '1 нед. назад'],
    [14 * 86400, '2 нед. назад'],
    [21 * 86400, '3 нед. назад'],
    [59 * 86400, '1 мес. назад'],
    [60 * 86400, '2 мес. назад'],
    [359 * 86400, '11 мес. назад'],
    [360 * 86400, '9 октября 2025 г.'],
  ])('preserves formatting for %s elapsed seconds', (seconds, expected) => {
    const date = new Date(now.getTime() - seconds * 1000).toISOString();
    expect(formatDistanceToNow(date)).toBe(expected);
  });

  it('accepts a Date at the four-week boundary', () => {
    expect(formatDistanceToNow(new Date('2026-09-06T12:00:00Z'))).toBe('4 нед. назад');
  });
});
