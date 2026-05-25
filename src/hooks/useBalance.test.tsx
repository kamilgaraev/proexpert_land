import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getBalanceMock } = vi.hoisted(() => ({
  getBalanceMock: vi.fn(),
}));

vi.mock('@utils/api', () => ({
  billingService: {
    getBalance: getBalanceMock,
  },
  normalizeOrganizationBalanceResponse: vi.fn((value) => value?.data ?? value),
}));

import { useBalance } from './useBalance';

describe('useBalance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not request balance when disabled', async () => {
    const { result } = renderHook(() => useBalance({ enabled: false }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(getBalanceMock).not.toHaveBeenCalled();
  });
});
