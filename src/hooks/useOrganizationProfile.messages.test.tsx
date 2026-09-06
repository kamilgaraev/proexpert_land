import { act, renderHook } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { useOrganizationProfile } from './useOrganizationProfile';

const api = vi.hoisted(() => ({ updateCapabilities: vi.fn(), updateBusinessType: vi.fn(), updateSpecializations: vi.fn(), updateCertifications: vi.fn(), completeOnboarding: vi.fn() }));
const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock('@/utils/api', () => ({ organizationProfileService: api }));
vi.mock('react-toastify', () => ({ toast }));
beforeEach(() => vi.resetAllMocks());

it.each([
  ['updateCapabilities', [[]]],
  ['updateBusinessType', ['general_contracting']],
  ['updateSpecializations', [[]]],
  ['updateCertifications', [[]]],
  ['completeOnboarding', []],
] as const)('%s hides technical errors while preserving rejection for the form', async (method, args) => {
  const failure = new Error('SQLSTATE Internal exception secret-payload');
  api[method].mockRejectedValue(failure);
  const { result } = renderHook(() => useOrganizationProfile());
  await act(async () => {
    await expect((result.current[method] as (...values: unknown[]) => Promise<void>)(...args)).rejects.toBe(failure);
  });
  expect(toast.error).toHaveBeenCalledTimes(1);
  expect(toast.error.mock.calls[0][0]).toMatch(/^Не удалось/);
  expect(toast.error.mock.calls[0][0]).not.toMatch(/SQLSTATE|Internal|secret|payload/);
  expect(result.current.error).toBe(toast.error.mock.calls[0][0]);
  expect(result.current.loading).toBe(false);
});

it('uses a Russian completion message even when the response contains an internal label', async () => {
  api.completeOnboarding.mockResolvedValue({ data: { success: true, data: {}, message: 'Onboarding complete' } });
  const { result } = renderHook(() => useOrganizationProfile());
  await act(async () => { await result.current.completeOnboarding(); });
  expect(toast.success).toHaveBeenCalledWith('Настройка компании завершена');
});
