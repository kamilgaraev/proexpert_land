import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blogPublicApi } from '@/utils/blogPublicApi';
import { useBlogArticleReading } from './useBlogArticleReading';

vi.mock('@/utils/blogPublicApi', () => ({ blogPublicApi: { recordReading: vi.fn() } }));

describe('useBlogArticleReading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    vi.spyOn(document, 'hasFocus').mockReturnValue(true);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('reports cumulative active time and keeps a stable anonymous browser identifier', () => {
    const { unmount } = renderHook(() => useBlogArticleReading('article'));
    const first = vi.mocked(blogPublicApi.recordReading).mock.calls[0][1];
    expect(first.active_seconds).toBe(0);
    act(() => vi.advanceTimersByTime(15_000));
    expect(blogPublicApi.recordReading).toHaveBeenLastCalledWith('article', { ...first, active_seconds: 15 });
    act(() => vi.advanceTimersByTime(1_000));
    unmount();
    expect(blogPublicApi.recordReading).toHaveBeenLastCalledWith('article', { ...first, active_seconds: 16 });
    const next = renderHook(() => useBlogArticleReading('another'));
    const last = vi.mocked(blogPublicApi.recordReading).mock.calls.at(-1)![1];
    expect(last.visitor_id).toBe(first.visitor_id);
    expect(last.session_id).not.toBe(first.session_id);
    next.unmount();
  });

  it('pauses in a hidden or unfocused tab and after inactivity', () => {
    const { unmount } = renderHook(() => useBlogArticleReading('article'));
    act(() => vi.advanceTimersByTime(15_000));
    act(() => window.dispatchEvent(new Event('blur')));
    act(() => vi.advanceTimersByTime(30_000));
    expect(vi.mocked(blogPublicApi.recordReading).mock.calls.at(-1)![1].active_seconds).toBe(15);
    act(() => window.dispatchEvent(new Event('focus')));
    act(() => vi.advanceTimersByTime(90_000));
    const idleSeconds = vi.mocked(blogPublicApi.recordReading).mock.calls.at(-1)![1].active_seconds;
    expect(idleSeconds).toBeGreaterThanOrEqual(73);
    expect(idleSeconds).toBeLessThanOrEqual(75);
    act(() => window.dispatchEvent(new Event('scroll')));
    act(() => vi.advanceTimersByTime(15_000));
    expect(vi.mocked(blogPublicApi.recordReading).mock.calls.at(-1)![1].active_seconds).toBe(idleSeconds + 15);
    vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    act(() => vi.advanceTimersByTime(30_000));
    expect(vi.mocked(blogPublicApi.recordReading).mock.calls.at(-1)![1].active_seconds).toBe(idleSeconds + 15);
    unmount();
  });

  it('does not send reports without a published article route', () => {
    const { unmount } = renderHook(() => useBlogArticleReading(null));
    act(() => vi.advanceTimersByTime(30_000));
    expect(blogPublicApi.recordReading).not.toHaveBeenCalled();
    unmount();
  });
});
