import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blogPublicApi } from '@/utils/blogPublicApi';
import { COOKIE_CONSENT_EVENT } from '@/utils/marketingConsent';
import { useBlogArticleReading } from './useBlogArticleReading';

const consent = vi.hoisted(() => ({ allowed: true, choice: true as boolean | null }));
vi.mock('@/utils/marketingConsent', () => ({ hasAnalyticsConsent: () => consent.allowed, getCookieConsent: () => consent.choice === null ? null : { analytics: consent.choice }, COOKIE_CONSENT_EVENT: 'prohelper:cookie-consent-change', BLOG_READING_VISITOR_KEY: 'most.blog.visitor.v1' }));

vi.mock('@/utils/blogPublicApi', () => ({ blogPublicApi: { recordReading: vi.fn() } }));

describe('useBlogArticleReading', () => {
  beforeEach(() => {
    consent.allowed = true;
    consent.choice = true;
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
  it('waits for analytics consent and stops without a final report when consent is revoked', () => {
    consent.allowed = false;
    consent.choice = false;
    const { unmount } = renderHook(() => useBlogArticleReading('article'));
    act(() => vi.advanceTimersByTime(30_000));
    expect(blogPublicApi.recordReading).not.toHaveBeenCalled();
    expect(localStorage.getItem('most.blog.visitor.v1')).toBeNull();
    consent.allowed = true;
    consent.choice = true;
    act(() => window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT)));
    expect(blogPublicApi.recordReading).toHaveBeenCalledTimes(1);
    act(() => vi.advanceTimersByTime(15_000));
    expect(blogPublicApi.recordReading).toHaveBeenCalledTimes(2);
    consent.allowed = false;
    consent.choice = false;
    act(() => window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT)));
    expect(localStorage.getItem('most.blog.visitor.v1')).toBeNull();
    act(() => vi.advanceTimersByTime(30_000));
    unmount();
    expect(blogPublicApi.recordReading).toHaveBeenCalledTimes(2);
  });

  it('honors cross-tab consent withdrawal and checks consent immediately before sending', () => {
    const { unmount } = renderHook(() => useBlogArticleReading('article'));
    consent.allowed = false;
    consent.choice = false;
    act(() => window.dispatchEvent(new Event('pagehide')));
    expect(blogPublicApi.recordReading).toHaveBeenCalledTimes(1);
    act(() => window.dispatchEvent(new Event('storage')));
    expect(localStorage.getItem('most.blog.visitor.v1')).toBeNull();
    unmount();
    expect(blogPublicApi.recordReading).toHaveBeenCalledTimes(1);
  });

  it('preserves an existing reader identifier while asynchronous consent verification is pending', () => {
    consent.allowed = false;
    consent.choice = true;
    const visitor = 'b86802e9-c60d-4a09-a646-4e2ff6c2b199';
    localStorage.setItem('most.blog.visitor.v1', visitor);
    const { unmount } = renderHook(() => useBlogArticleReading('article'));
    expect(blogPublicApi.recordReading).not.toHaveBeenCalled();
    expect(localStorage.getItem('most.blog.visitor.v1')).toBe(visitor);
    consent.allowed = true;
    act(() => window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT)));
    expect(blogPublicApi.recordReading).toHaveBeenLastCalledWith('article', expect.objectContaining({ visitor_id: visitor }));
    unmount();
  });

});
