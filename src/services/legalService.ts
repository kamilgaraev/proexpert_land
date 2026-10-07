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
export const legalApiBase = () => ((import.meta.env.VITE_API_URL as string | undefined) ?? 'https://api.1мост.рф').replace(/\/api\/v1\/landing\/?$/, '');

export const fetchLegalManifest = async (signal?: AbortSignal): Promise<LegalManifest> => {
  const response = await fetch(`${legalApiBase()}/api/public/legal`, { headers: { Accept: 'application/json' }, signal, cache: 'no-store' });
  const payload = await response.json() as { success?: boolean; data?: LegalManifest };
  if (!response.ok || payload.success !== true || payload.data?.version !== LEGAL_VERSION
    || payload.data.content_sha256 !== LEGAL_CONTENT_SHA256 || !payload.data.documents
    || typeof payload.data.privacy_ready !== 'boolean' || typeof payload.data.commercial_ready !== 'boolean'
    || typeof payload.data.analytics_ready !== 'boolean' || !payload.data.provider || !Array.isArray(payload.data.subprocessors)) {
    setAnalyticsAvailability(false);
    throw new Error('Не удалось проверить редакцию документов. Обновите страницу или попробуйте позже.');
  }
  const choice = getCookieConsent();
  let active = false;
  if (choice?.analytics && choice.receiptId && choice.visitorId
    && choice.documentHash === payload.data.documents.cookies?.sha256) {
    try {
      const statusResponse = await fetch(`${legalApiBase()}/api/public/legal/analytics-status`, { method: 'POST', signal,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitor_id: choice.visitorId, receipt_id: choice.receiptId }) });
      const status = await statusResponse.json() as { success?: boolean; data?: { active?: boolean } };
      active = statusResponse.ok && status.success === true && status.data?.active === true;
    } catch { active = false; }
  }
  if (getCookieConsent()?.receiptId === choice?.receiptId) setAnalyticsAvailability(active, payload.data.documents.cookies?.sha256);
  return payload.data;
};

export const recordAnalyticsChoice = async (analytics: boolean, manifest: LegalManifest | null, visitorId: string, receiptId?: string): Promise<string> => {
  const response = await fetch(`${legalApiBase()}/api/public/legal/analytics-consent`, {
    method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ analytics, visitor_id: visitorId, receipt_id: receiptId, event_id: crypto.randomUUID(),
      ...(analytics && manifest ? legalAcceptancePayload(manifest, ['cookies']) : {}) }),
  });
  const payload = await response.json() as { success?: boolean; data?: { receipt_id?: string } };
  if (!response.ok || payload.success !== true || !payload.data?.receipt_id) throw new Error('Не удалось зафиксировать выбор. Аналитика остаётся отключённой.');
  return payload.data.receipt_id;
};

export const legalAcceptancePayload = (manifest: LegalManifest, keys: string[]) => ({
  legal_documents: Object.fromEntries(keys.map((key) => [key, manifest.documents[key]?.sha256])),
});
