import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useDaData } from './useDaData';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('useDaData', () => {
  it('aborts a superseded request and reuses a short-lived normalized cache entry', async () => {
    const requests: Array<{ signal: AbortSignal; resolve: (response: Response) => void }> = [];
    const fetchMock = vi.fn((_url: string, init?: RequestInit) => new Promise<Response>((resolve, reject) => {
      const requestSignal = init?.signal as AbortSignal;
      requestSignal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')));
      requests.push({ signal: requestSignal, resolve });
    }));
    vi.stubGlobal('fetch', fetchMock);
    const { result } = renderHook(() => useDaData());

    let first!: Promise<unknown>;
    let second!: Promise<unknown>;
    act(() => {
      first = result.current.searchOrganizations('Первая');
      second = result.current.searchOrganizations('  Вторая  ');
    });

    expect(requests[0].signal.aborted).toBe(true);
    requests[1].resolve(new Response(JSON.stringify({
      success: true,
      data: [{ value: 'Вторая', data: { name: { short: 'Вторая' } } }],
    }), { status: 200 }));

    await expect(first).resolves.toEqual([]);
    await expect(second).resolves.toHaveLength(1);
    await act(async () => {
      await result.current.searchOrganizations('вторая');
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('aborts an active request when the form is unmounted', () => {
    let signal!: AbortSignal;
    vi.stubGlobal('fetch', vi.fn((_url: string, init?: RequestInit) => {
      signal = init?.signal as AbortSignal;
      return new Promise<Response>(() => undefined);
    }));
    const { result, unmount } = renderHook(() => useDaData());

    act(() => {
      void result.current.searchAddresses('Москва');
    });
    unmount();

    expect(signal.aborted).toBe(true);
  });
});
