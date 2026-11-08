import { LEGAL_VERSION } from '@/data/marketing/legal';
import { LEGAL_CONTENT_SHA256 } from '@/data/legal/contentHash';
import { getCookieConsent, setAnalyticsAvailability } from '@/utils/marketingConsent';

export interface LegalManifest {
  version: string;
  content_sha256: string;
  privacy_ready: boolean;
  commercial_ready: boolean;
  analytics_ready: boolean;
  provider: Record<string, string>;
  subprocessors: Array<Record<string, string>>;
  documents: Record<string, { path: string; sha256: string }>;
}

export const LEGAL_UNAVAILABLE = 'Отправка формы временно недоступна. Обратитесь к нам по контактам сайта.';
export const LEGAL_MANIFEST_FAILED = 'Не удалось проверить редакцию документов. Обновите страницу или попробуйте позже.';
export const LEGAL_STALE_MESSAGE = 'Документы обновились. Ознакомьтесь с ними и подтвердите согласие ещё раз — введённые данные сохранены.';
export const legalApiBase = () => ((import.meta.env.VITE_API_URL as string | undefined) ?? 'https://api.1мост.рф').replace(/\/api\/v1\/landing\/?$/, '');

const MANIFEST_TIMEOUT_MS = 10_000;
const ANALYTICS_STATUS_TIMEOUT_MS = 8_000;
const RETRY_DELAYS_MS = [1_000, 3_000];

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return null;
  }
};

const withTimeout = (timeoutMs: number, signal?: AbortSignal) => {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timeoutId = setTimeout(abort, timeoutMs);
  if (signal?.aborted) controller.abort();
  signal?.addEventListener('abort', abort, { once: true });
  return {
    signal: controller.signal,
    done: () => {
      clearTimeout(timeoutId);
      signal?.removeEventListener('abort', abort);
    },
  };
};

const isValidManifest = (data: LegalManifest | undefined): data is LegalManifest => Boolean(
  data && data.version === LEGAL_VERSION && data.content_sha256 === LEGAL_CONTENT_SHA256
  && data.documents && typeof data.documents === 'object'
  && typeof data.privacy_ready === 'boolean' && typeof data.commercial_ready === 'boolean'
  && typeof data.analytics_ready === 'boolean' && data.provider && Array.isArray(data.subprocessors),
);

export const fetchLegalManifest = async (signal?: AbortSignal): Promise<LegalManifest> => {
  const request = withTimeout(MANIFEST_TIMEOUT_MS, signal);
  try {
    const response = await fetch(`${legalApiBase()}/api/public/legal`, { headers: { Accept: 'application/json' }, signal: request.signal, cache: 'no-store' });
    const payload = await readJson(response) as { success?: boolean; data?: LegalManifest } | null;
    if (!response.ok || payload?.success !== true || !isValidManifest(payload.data)) {
      throw new Error(LEGAL_MANIFEST_FAILED);
    }
    return payload.data;
  } catch (cause) {
    if (signal?.aborted) throw cause;
    throw new Error(LEGAL_MANIFEST_FAILED);
  } finally {
    request.done();
  }
};

export const syncAnalyticsAvailability = async (manifest: LegalManifest, signal?: AbortSignal): Promise<boolean> => {
  const choice = getCookieConsent();
  const documentHash = manifest.documents.cookies?.sha256;
  let active = false;
  let checked = true;
  if (choice?.analytics && choice.receiptId && choice.visitorId && choice.documentHash === documentHash) {
    const request = withTimeout(ANALYTICS_STATUS_TIMEOUT_MS, signal);
    try {
      const statusResponse = await fetch(`${legalApiBase()}/api/public/legal/analytics-status`, { method: 'POST', signal: request.signal,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id: choice.visitorId, receipt_id: choice.receiptId }) });
      const status = await readJson(statusResponse) as { success?: boolean; data?: { active?: boolean } } | null;
      checked = statusResponse.ok && status?.success === true;
      active = checked && status?.data?.active === true;
    } catch {
      checked = false;
    } finally {
      request.done();
    }
  }
  if (signal?.aborted) return false;
  if (getCookieConsent()?.receiptId === choice?.receiptId) setAnalyticsAvailability(active, documentHash);
  return checked;
};

export interface LegalManifestState {
  manifest: LegalManifest | null;
  error: string | null;
}

let state: LegalManifestState = { manifest: null, error: null };
let inflight: Promise<void> | null = null;
let generation = 0;
let analyticsInflight: Promise<void> | null = null;
let analyticsCheckFailed = false;
const listeners = new Set<() => void>();

const publish = (next: LegalManifestState) => {
  state = next;
  listeners.forEach((listener) => listener());
};

const checkAnalytics = (manifest: LegalManifest): Promise<void> => {
  if (analyticsInflight) return analyticsInflight;
  const current = generation;
  analyticsInflight = syncAnalyticsAvailability(manifest)
    .then((checked) => { if (current === generation) analyticsCheckFailed = !checked; })
    .finally(() => { if (current === generation) analyticsInflight = null; });
  return analyticsInflight;
};

const wait = (ms: number) => new Promise<void>((resolve) => { setTimeout(resolve, ms); });

export const getLegalManifestState = (): LegalManifestState => state;

export const subscribeLegalManifest = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
};

export const loadLegalManifest = (options: { force?: boolean } = {}): Promise<void> => {
  if (inflight) return inflight;
  if (state.manifest && !options.force) {
    if (analyticsCheckFailed) void checkAnalytics(state.manifest);
    return Promise.resolve();
  }
  const current = ++generation;
  if (options.force) publish({ manifest: null, error: null });
  else if (state.error) publish({ manifest: null, error: null });
  inflight = (async () => {
    for (let attempt = 0; ; attempt += 1) {
      try {
        const manifest = await fetchLegalManifest();
        if (current !== generation) return;
        publish({ manifest, error: null });
        analyticsInflight = null;
        void checkAnalytics(manifest);
        return;
      } catch (cause) {
        if (current !== generation) return;
        const delay = RETRY_DELAYS_MS[attempt];
        if (delay === undefined) {
          setAnalyticsAvailability(false);
          publish({ manifest: null, error: cause instanceof Error ? cause.message : LEGAL_MANIFEST_FAILED });
          return;
        }
        await wait(delay);
      }
    }
  })().finally(() => {
    if (current === generation) inflight = null;
  });
  return inflight;
};

export const refreshLegalManifest = (): Promise<void> => {
  inflight = null;
  return loadLegalManifest({ force: true });
};

export const resetLegalManifestForTests = (): void => {
  generation += 1;
  inflight = null;
  analyticsInflight = null;
  analyticsCheckFailed = false;
  state = { manifest: null, error: null };
  listeners.clear();
};

export const isLegalStaleError = (errors: unknown): boolean => Boolean(
  errors && typeof errors === 'object'
  && Object.keys(errors).some((key) => key === 'legal_documents' || key.startsWith('legal_documents.')),
);

export const recordAnalyticsChoice = async (analytics: boolean, manifest: LegalManifest | null, visitorId: string, receiptId?: string): Promise<string> => {
  const response = await fetch(`${legalApiBase()}/api/public/legal/analytics-consent`, {
    method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ analytics, visitor_id: visitorId, receipt_id: receiptId, event_id: crypto.randomUUID(),
      ...(analytics && manifest ? legalAcceptancePayload(manifest, ['cookies']) : {}) }),
  });
  const payload = await readJson(response) as { success?: boolean; data?: { receipt_id?: string } } | null;
  if (!response.ok || payload?.success !== true || !payload.data?.receipt_id) throw new Error('Не удалось зафиксировать выбор. Аналитика остаётся отключённой.');
  return payload.data.receipt_id;
};

export const legalAcceptancePayload = (manifest: LegalManifest, keys: string[]) => ({
  legal_documents: Object.fromEntries(keys.map((key) => [key, manifest.documents[key]?.sha256])),
});
