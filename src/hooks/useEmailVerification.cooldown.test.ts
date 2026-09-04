import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { resend, warning } = vi.hoisted(() => ({ resend: vi.fn(), warning: vi.fn() }));
vi.mock('@/utils/api', () => ({ authService: { resendVerificationEmail: resend } }));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn(), warning } }));

import { useEmailVerification } from './useEmailVerification';

const storageKey = 'email_verification_cooldown';

describe('email verification resend cooldown', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    vi.setSystemTime(new Date('2026-09-04T09:00:00Z'));
    localStorage.clear();
    resend.mockReset();
    warning.mockReset();
    resend.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => { vi.useRealTimers(); localStorage.clear(); });

  it('запускает отсчёт после отправки и разрешает следующую отправку через минуту', async () => {
    const { result } = renderHook(() => useEmailVerification());
    await act(async () => { await result.current.resendVerificationEmail(); });
    expect(result.current.canResend).toBe(false);
    expect(result.current.resendCooldown).toBe(60);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.resendCooldown).toBe(59);
    await act(async () => { await result.current.resendVerificationEmail(); });
    expect(resend).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(59000); });
    expect(result.current.canResend).toBe(true);
    expect(result.current.resendCooldown).toBe(0);
    await act(async () => { await result.current.resendVerificationEmail(); });
    expect(resend).toHaveBeenCalledTimes(2);
    act(() => { vi.advanceTimersByTime(1000); });
    expect(result.current.resendCooldown).toBe(59);
  });

  it('восстанавливает оставшееся время после открытия экрана', () => {
    localStorage.setItem(storageKey, String(Date.now() + 30000));
    const { result, unmount } = renderHook(() => useEmailVerification());
    expect(result.current.resendCooldown).toBe(30);
    act(() => { vi.advanceTimersByTime(30000); });
    expect(result.current.canResend).toBe(true);
    expect(localStorage.getItem(storageKey)).toBeNull();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
