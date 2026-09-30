import { API_URL, authApi, userManagementService } from '@/utils/api';
import { getJsonAuthHeaders } from '@/utils/authTokenStorage';
import type { OrganizationTeamPage } from '@/types/organization-team';
import type { AiAssistantAction, AiAssistantActionPreview, AiAssistantAttachment, AiAssistantChatInput, AiAssistantChatResult, AiAssistantChatSubmission, AiAssistantRequestAccepted, AiAssistantConversation, AiAssistantCreditsBalance, AiAssistantMemory, AiAssistantMessage, AiAssistantPaginationMeta, AiAssistantParticipant, AiAssistantQuote, AiAssistantRequestStatus, AiAssistantDocumentSettings, AiAssistantRagStatus, AiAssistantUsage } from '@/types/aiAssistant';

type LandingResponse<T> = { success: boolean; message?: string; data: T; meta?: AiAssistantPaginationMeta };
const assistantBaseUrl = API_URL.replace(/\/landing$/, '') + '/ai-assistant';
export class AssistantApiError extends Error { constructor(message: string, public status: number) { super(message); } }
const request = async <T>(path: string, options: RequestInit = {}): Promise<LandingResponse<T>> => {
  const response = await fetch(`${assistantBaseUrl}${path}`, { ...options, headers: { ...getJsonAuthHeaders(), ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers } });
  const payload = await response.json().catch(() => ({})) as Partial<LandingResponse<T>>;
  if (!response.ok || payload.success === false || payload.data === undefined) throw new AssistantApiError(payload.message || 'Не удалось выполнить запрос к помощнику.', response.status);
  return payload as LandingResponse<T>;
};
const normalizeConversation = (item: AiAssistantConversation): AiAssistantConversation => ({ ...item, id: String(item.id), user_id: String(item.user_id) });
const normalizeMessage = (item: AiAssistantMessage): AiAssistantMessage => ({ ...item, id: String(item.id) });
const normalizeParticipant = (item: AiAssistantParticipant): AiAssistantParticipant => ({ ...item, user_id: String(item.user_id) });
const post = (input: unknown, signal?: AbortSignal): RequestInit => ({ method: 'POST', body: JSON.stringify(input), signal });
const fetchJsonWithTimeout = async <T,>(url: string, options: RequestInit, timeoutMs: number): Promise<{ response: Response; payload: T }> => {
  const controller = new AbortController();
  const sourceSignal = options.signal;
  const abort = () => controller.abort();
  if (sourceSignal?.aborted) abort();
  else sourceSignal?.addEventListener('abort', abort, { once: true });
  const timer = setTimeout(abort, timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const payload = await response.json().catch(() => ({})) as T;
    return { response, payload };
  }
  finally { clearTimeout(timer); sourceSignal?.removeEventListener('abort', abort); }
};
export const createAiAssistantRequestId = (): string => crypto.randomUUID();
export const aiAssistantService = {
  uploadAttachment: async (file: File, conversationId?: string, signal?: AbortSignal, onProgress?: (percent: number) => void): Promise<AiAssistantAttachment> => {
    const form = new FormData(); form.append('image', file); if (conversationId) form.append('conversation_id', conversationId);
    const response = await authApi.post(`${assistantBaseUrl}/attachments`, form, { signal, headers: { ...getJsonAuthHeaders(), 'Content-Type': 'multipart/form-data' }, onUploadProgress: (event) => { if (event.total) onProgress?.(Math.round(event.loaded / event.total * 100)); } });
    return (response.data?.data ?? response.data) as AiAssistantAttachment;
  },
  getAttachmentContent: async (id: string, signal?: AbortSignal): Promise<Blob> => {
    const response = await authApi.get<Blob>(`${assistantBaseUrl}/attachments/${encodeURIComponent(id)}/content`, { signal, responseType: 'blob', headers: getJsonAuthHeaders() });
    const blob = response.data;
    const mime = String(response.headers['content-type'] ?? blob.type).split(';')[0].trim().toLowerCase();
    if (!blob || !['image/jpeg', 'image/png', 'image/webp'].includes(mime)) throw new AssistantApiError('Изображение недоступно.', response.status);
    return blob;
  },
  getUsage: async (signal?: AbortSignal) => (await request<AiAssistantUsage>('/usage', { signal })).data,
  getRagStatus: async (signal?: AbortSignal) => {
    const status = (await request<AiAssistantRagStatus>('/rag/status', { signal })).data;
    if (status.status_available === false) return {
      status_available: false, enabled: false, ready: false, source_count: null, chunk_count: null,
      expected_source_count: null, indexed_source_count: null, pending_source_count: null, stale_source_count: null,
      eligible_count_known: false, coverage_complete: false, processing: false, lag_seconds: null, lag_exceeded: false,
      source_catalog: [], can_manage_document_settings: false,
    } satisfies AiAssistantRagStatus;
    return { ...status, status_available: true, source_count: Number.isFinite(status.source_count) ? status.source_count : null, chunk_count: Number.isFinite(status.chunk_count) ? status.chunk_count : null, can_manage_document_settings: status.can_manage_document_settings === true, coverage_complete: status.coverage_complete === true && status.eligible_count_known === true && Number.isInteger(status.expected_source_count) && Number.isInteger(status.indexed_source_count) && Number(status.expected_source_count) >= 0 && Number(status.indexed_source_count) >= 0 };
  },
  getDocumentSettings: async (signal?: AbortSignal) => (await request<AiAssistantDocumentSettings>('/documents/settings', { signal })).data,
  setDocumentSettings: async (input: Pick<AiAssistantDocumentSettings, 'enabled' | 'scope' | 'limit_minor'>) => (await request<AiAssistantDocumentSettings>('/documents/settings', { method: 'PUT', body: JSON.stringify({ ...input, confirmed: true }) })).data,
  downloadReport: async (downloadUrl: string, signal?: AbortSignal) => {
    const apiOrigin = new URL(API_URL).origin;
    const url = new URL(downloadUrl, apiOrigin);
    if (url.origin !== apiOrigin || !/^\/api\/v1\/ai-assistant\/reports\/[A-Za-z0-9_-]+\/download$/.test(url.pathname) || url.search || url.hash) throw new Error('Некорректная ссылка отчёта.');
    const response = await fetch(url.href, { headers: getJsonAuthHeaders(), signal, redirect: 'error' });
    if (!response.ok) throw new AssistantApiError('Не удалось скачать отчёт.', response.status);
    return response.blob();
  },
  getConversations: async (page = 1, signal?: AbortSignal) => { const response = await request<AiAssistantConversation[]>(`/conversations?page=${page}&per_page=20`, { signal }); return { items: response.data.map(normalizeConversation), meta: response.meta ?? null }; },
  createConversation: async (title?: string, signal?: AbortSignal) => normalizeConversation((await request<AiAssistantConversation>('/conversations', post({ title }, signal))).data),
  deleteConversation: async (id: string) => { await request<null>(`/conversations/${encodeURIComponent(id)}`, { method: 'DELETE' }); },
  getHistory: async (id: string, page = 1, signal?: AbortSignal) => { const response = await request<AiAssistantMessage[]>(`/conversations/${encodeURIComponent(id)}/history?page=${page}&per_page=30`, { signal }); return { items: response.data.map(normalizeMessage), meta: response.meta ?? null }; },
  getParticipants: async (id: string, signal?: AbortSignal) => (await request<AiAssistantParticipant[]>(`/conversations/${encodeURIComponent(id)}/participants`, { signal })).data.map(normalizeParticipant),
  setParticipants: async (id: string, participants: AiAssistantParticipant[]) => (await request<AiAssistantParticipant[]>(`/conversations/${encodeURIComponent(id)}/participants`, { method: 'PUT', body: JSON.stringify({ participants: participants.map(({ user_id, role }) => ({ user_id, role })) }) })).data.map(normalizeParticipant),
  getActiveMembers: async (page: number, signal?: AbortSignal) => { const response = await userManagementService.getOrganizationTeam({ search: '', page, per_page: 50 }, signal ?? new AbortController().signal) as OrganizationTeamPage; if (!Array.isArray(response.data)) throw new Error('Не удалось загрузить сотрудников.'); return { items: response.data.filter((item) => item.is_active), meta: response.meta }; },
  getMemory: async (signal?: AbortSignal) => (await request<AiAssistantMemory[]>('/memory', { signal })).data,
  createMemory: async (content: string, conversation_id?: string) => (await request<AiAssistantMemory>('/memory', post({ content, conversation_id, confirmed: true }))).data,
  updateMemory: async (id: string, content: string) => (await request<AiAssistantMemory>(`/memory/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ content, confirmed: true }) })).data,
  deleteMemory: async (id: string) => { await request<null>(`/memory/${encodeURIComponent(id)}`, { method: 'DELETE' }); },
  getBalance: async (signal?: AbortSignal) => (await request<AiAssistantCreditsBalance>('/credits/balance', { signal })).data,
  getQuote: async (input: AiAssistantChatInput, signal?: AbortSignal) => (await request<AiAssistantQuote>('/credits/quote', post(input, signal))).data,
  purchase: async (pack_id: string) => (await request<{ order_id: string; confirmation_url: string }>('/credits/purchase', post({ pack_id }))).data,
  chat: async (input: AiAssistantChatInput & { quote_id: string }, signal?: AbortSignal): Promise<AiAssistantChatSubmission> => {
    const { response, payload } = await fetchJsonWithTimeout<{ success?: boolean; message?: string; data?: unknown }>(`${assistantBaseUrl}/chat`, { ...post({ ...input, async: true }, signal), headers: { ...getJsonAuthHeaders(), 'Content-Type': 'application/json' } }, 30_000);
    const data = payload.data ?? payload;
    if (!response.ok || payload.success === false) throw new AssistantApiError(payload.message || 'Не удалось выполнить запрос к помощнику.', response.status);
    if (response.status === 202) {
      const accepted = data as Partial<Extract<AiAssistantChatSubmission, { status: string }>>;
      if (!accepted || typeof accepted.request_id !== 'string' || accepted.status !== 'running') throw new AssistantApiError('Не удалось подтвердить запуск запроса.', response.status);
      return accepted as AiAssistantRequestAccepted;
    }
    const result = data as AiAssistantChatResult;
    if (!result || result.request_id === undefined || result.conversation_id === undefined || !result.message || !result.credit_usage) throw new AssistantApiError(payload.message || 'Не удалось выполнить запрос к помощнику.', response.status);
    return { ...result, conversation_id: String(result.conversation_id), message: normalizeMessage(result.message) };
  },
  getRequest: async (id: string, signal?: AbortSignal) => {
    const path = `/requests/${encodeURIComponent(id)}`;
    const { response, payload } = await fetchJsonWithTimeout<Partial<LandingResponse<AiAssistantRequestStatus>>>(`${assistantBaseUrl}${path}`, { headers: getJsonAuthHeaders(), signal }, 15_000);
    if (!response.ok || payload.success === false || payload.data === undefined) throw new AssistantApiError(payload.message || 'Не удалось проверить состояние запроса.', response.status);
    return payload.data;
  },
  cancelRequest: async (id: string) => (await request<AiAssistantRequestStatus>(`/requests/${encodeURIComponent(id)}/cancel`, post({}))).data,
  previewAction: async (conversation_id: string, action: AiAssistantAction) => (await request<AiAssistantActionPreview>('/actions/preview', post({ conversation_id, action }))).data,
  executeAction: async (conversation_id: string, preview: AiAssistantActionPreview) => (await request<{ message?: string }>('/actions/execute', post({ conversation_id, action: { id: preview.action.id, preview_token: preview.preview_token, confirmed: true } }))).data,
};
