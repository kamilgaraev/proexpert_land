import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { legalFixture } from '@/test/legalFixture';
import {
  getLegalManifestState,
  isLegalStaleError,
  LEGAL_MANIFEST_FAILED,
  loadLegalManifest,
  refreshLegalManifest,
  resetLegalManifestForTests,
} from '@/services/legalService';
import { saveCookieConsent } from '@/utils/marketingConsent';

const manifestResponse = () => new Response(JSON.stringify({ success: true, data: legalFixture }), {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
});

const isManifestRequest = (input: RequestInfo | URL) => String(input).endsWith('/api/public/legal');

describe('legal manifest loading', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'http://localhost/api/v1/landing');
    resetLegalManifestForTests();
    window.localStorage.clear();
    document.cookie = 'most_analytics_consent=; Max-Age=0; Path=/';
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it('shares one request between all forms on the page', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => manifestResponse());
    await Promise.all([loadLegalManifest(), loadLegalManifest(), loadLegalManifest()]);
    await loadLegalManifest();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(getLegalManifestState()).toEqual({ manifest: legalFixture, error: null });
  });

  it('retries a failed request before blocking forms', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response('<html>502 Bad Gateway</html>', { status: 502 }))
      .mockResolvedValueOnce(manifestResponse());
    const loading = loadLegalManifest();
    await vi.runAllTimersAsync();
    await loading;
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(getLegalManifestState().manifest).toEqual(legalFixture);
  });

  it('shows a clear message instead of a technical parsing error', async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('<html>502 Bad Gateway</html>', { status: 502 }));
    const loading = loadLegalManifest();
    await vi.runAllTimersAsync();
    await loading;
    expect(getLegalManifestState()).toEqual({ manifest: null, error: LEGAL_MANIFEST_FAILED });
  });

  it('loads again after a failure when asked', async () => {
    vi.useFakeTimers();
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('{}', { status: 503 }));
    const failed = loadLegalManifest();
    await vi.runAllTimersAsync();
    await failed;
    expect(getLegalManifestState().error).toBe(LEGAL_MANIFEST_FAILED);
    fetchMock.mockImplementation(async () => manifestResponse());
    await loadLegalManifest();
    expect(getLegalManifestState()).toEqual({ manifest: legalFixture, error: null });
  });

  it('rejects a manifest whose document edition differs from the site', async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({
      success: true,
      data: { ...legalFixture, content_sha256: 'b'.repeat(64) },
    }), { status: 200 }));
    const loading = loadLegalManifest();
    await vi.runAllTimersAsync();
    await loading;
    expect(getLegalManifestState()).toEqual({ manifest: null, error: LEGAL_MANIFEST_FAILED });
  });

  it('does not wait for the analytics check to open forms', async () => {
    saveCookieConsent(true, {
      receiptId: '11111111-1111-4111-8111-111111111111',
      visitorId: '22222222-2222-4222-8222-222222222222',
      documentHash: legalFixture.documents.cookies.sha256,
    });
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => (
      isManifestRequest(input) ? manifestResponse() : new Promise<Response>(() => undefined)
    ));
    await loadLegalManifest();
    expect(getLegalManifestState().manifest).toEqual(legalFixture);
  });

  it('replaces the manifest after documents were updated', async () => {
    const updated = { ...legalFixture, documents: { ...legalFixture.documents, contactConsent: { path: '/legal/consent', sha256: 'c'.repeat(64) } } };
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(manifestResponse())
      .mockResolvedValueOnce(new Response(JSON.stringify({ success: true, data: updated }), { status: 200 }));
    await loadLegalManifest();
    const refreshing = refreshLegalManifest();
    expect(getLegalManifestState().manifest).toBeNull();
    await refreshing;
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getLegalManifestState().manifest?.documents.contactConsent.sha256).toBe('c'.repeat(64));
  });

  it('recognises server answers about outdated documents', () => {
    expect(isLegalStaleError({ 'legal_documents.contactConsent': ['stale'] })).toBe(true);
    expect(isLegalStaleError({ legal_documents: ['stale'] })).toBe(true);
    expect(isLegalStaleError({ phone: ['invalid'] })).toBe(false);
    expect(isLegalStaleError(undefined)).toBe(false);
  });
});
