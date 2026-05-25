import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getSubscriptionLimitsMock } = vi.hoisted(() => ({
  getSubscriptionLimitsMock: vi.fn(),
}));

vi.mock('@utils/api', () => ({
  billingService: {
    getSubscriptionLimits: getSubscriptionLimitsMock,
  },
}));

import { useSubscriptionLimits } from './useSubscriptionLimits';

describe('useSubscriptionLimits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not request subscription limits when disabled', async () => {
    const { result } = renderHook(() => useSubscriptionLimits({ enabled: false }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(getSubscriptionLimitsMock).not.toHaveBeenCalled();
  });
});
