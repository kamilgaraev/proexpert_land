import { afterEach, describe, expect, it, vi } from 'vitest';
import { saveAuthToken } from '@/utils/authTokenStorage';
import { aiAssistantService } from './aiAssistantService';
import type { AiAssistantChatInput } from '@/types/aiAssistant';
vi.mock('@/utils/api', () => ({ API_URL: 'https://api.example/api/v1/landing', userManagementService: { getOrganizationTeam: vi.fn() } }));
const respond = (data: unknown, meta?: unknown) => vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ success: true, data, meta }), { status: 200 }));
const input: AiAssistantChatInput = { conversation_id: '11', message: 'Вопрос', request_id: '4b3a24d1-1b27-41e3-a364-5da772bd739b', profile: 'detailed', allow_actions: true, context: { project_id: 8 } };
afterEach(() => vi.restoreAllMocks());
describe('aiAssistantService', () => {
  it('preserves pagination and normalizes numeric IDs without organization scope', async () => {
    const mock = respond([{ id: 11, title: 'Чат', user_id: 7 }], { current_page: 2, last_page: 3, per_page: 20, total: 41 });
    const result = await aiAssistantService.getConversations(2);
    expect(result.items[0]).toMatchObject({ id: '11', user_id: '7' });
    expect(result.meta?.last_page).toBe(3);
    expect(mock.mock.calls[0][0]).toBe('https://api.example/api/v1/ai-assistant/conversations?page=2&per_page=20');
  });
  it('sends identical canonical request fields in quote and approved chat', async () => {
    const mock = respond({ request_id: input.request_id, quote_id: 'quote', conversation_id: 11, message: { id: 22, role: 'assistant', content: 'Ответ' }, credit_usage: {} });
    await aiAssistantService.getQuote(input);
    await aiAssistantService.chat({ ...input, quote_id: 'quote' });
    expect(JSON.parse(String(mock.mock.calls[0][1]?.body))).toEqual(input);
    expect(JSON.parse(String(mock.mock.calls[1][1]?.body))).toEqual({ ...input, quote_id: 'quote', async: true });
  });
  it('accepts async request and completed status payloads while preserving the full synchronous result', async () => {
    const responses = [
      new Response(JSON.stringify({ success: true, data: { request_id: input.request_id, conversation_id: '11', status: 'running', stage: 'queued' } }), { status: 202 }),
      new Response(JSON.stringify({ success: true, data: { request_id: input.request_id, conversation_id: 11, message: { id: 22, role: 'assistant', content: 'Ответ' }, credit_usage: { charged_minor: 50 } } }), { status: 200 }),
      new Response(JSON.stringify({ success: true, data: { request_id: input.request_id, conversation_id: '11', status: 'completed', stage: 'completed', response: { request_id: input.request_id, conversation_id: '11', message: { id: '22', role: 'assistant', content: 'Ответ' }, credit_usage: { charged_minor: 50 } } } }), { status: 200 }),
    ];
    const mock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => responses.shift()!);
    await expect(aiAssistantService.chat({ ...input, quote_id: 'quote' })).resolves.toMatchObject({ status: 'running', stage: 'queued' });
    await expect(aiAssistantService.chat({ ...input, quote_id: 'quote' })).resolves.toMatchObject({ conversation_id: '11', message: { id: '22' } });
    await expect(aiAssistantService.getRequest(input.request_id)).resolves.toMatchObject({ status: 'completed', response: { message: { id: '22' }, credit_usage: { charged_minor: 50 } } });
    expect(JSON.parse(String(mock.mock.calls[0][1]?.body))).toMatchObject({ ...input, quote_id: 'quote', async: true });
  });
  it('executes only persisted preview reference and explicit confirmation', async () => {
    const mock = respond({ message: 'Готово' });
    await aiAssistantService.executeAction('11', { title: 'Изменение', action: { id: 'action' }, preview_token: 'secret', expires_at: '2099-01-01' });
    expect(JSON.parse(String(mock.mock.calls[0][1]?.body))).toEqual({ conversation_id: '11', action: { id: 'action', preview_token: 'secret', confirmed: true } });
  });
  it('confirms personal memory and never adds organization-wide scope', async () => {
    const mock = respond({ id: 'memory', content: 'Факт' });
    await aiAssistantService.createMemory('Факт', '11');
    await aiAssistantService.updateMemory('memory', 'Новый факт');
    expect(JSON.parse(String(mock.mock.calls[0][1]?.body))).toEqual({ content: 'Факт', conversation_id: '11', confirmed: true });
    expect(JSON.parse(String(mock.mock.calls[1][1]?.body))).toEqual({ content: 'Новый факт', confirmed: true });
  });
  it('serializes explicit participant roles and commercial pack identifier', async () => {
    const mock = respond([]);
    await aiAssistantService.setParticipants('11', [{ user_id: '7', name: 'Имя', role: 'viewer' }]);
    expect(JSON.parse(String(mock.mock.calls[0][1]?.body))).toEqual({ participants: [{ user_id: '7', role: 'viewer' }] });
    await aiAssistantService.purchase('ai-credits-1000');
    expect(JSON.parse(String(mock.mock.calls[1][1]?.body))).toEqual({ pack_id: 'ai-credits-1000' });
  });
  it('loads actor-scoped coverage and confirms the exact OCR settings contract', async () => {
    const mock = respond({ ready: true, eligible_count_known: false, coverage_complete: true, expected_source_count: null, indexed_source_count: null });
    await expect(aiAssistantService.getRagStatus()).resolves.toMatchObject({ coverage_complete: false });
    expect(mock.mock.calls[0][0]).toContain('/ai-assistant/rag/status');
    await aiAssistantService.setDocumentSettings({ enabled: true, scope: 'archive', limit_minor: 12550 });
    expect(mock.mock.calls[1][1]?.method).toBe('PUT');
    expect(JSON.parse(String(mock.mock.calls[1][1]?.body))).toEqual({ enabled: true, scope: 'archive', limit_minor: 12550, confirmed: true });
  });
  it('marks unavailable statistics without retaining diagnostic fields and accepts legacy payloads', async () => {
    respond({ status_available: false, enabled: true, ready: true, source_count: 7, chunk_count: 11, source_catalog: [{ type: 'files' }], document_coverage: { total: 4 }, archive_scan: { scanned_file_count: 4 } });
    await expect(aiAssistantService.getRagStatus()).resolves.toMatchObject({ status_available: false, enabled: false, ready: false, source_count: null, chunk_count: null, eligible_count_known: false, coverage_complete: false, source_catalog: [] });
    const legacy = respond({ enabled: true, ready: true, coverage_complete: true, eligible_count_known: true, expected_source_count: 2, indexed_source_count: 2 });
    await expect(aiAssistantService.getRagStatus()).resolves.toMatchObject({ status_available: true, coverage_complete: true, source_count: null, chunk_count: null });
    expect(legacy.mock.calls[0][0]).toContain('/ai-assistant/rag/status');
  });
  it('downloads protected reports with Authorization and rejects external or token-query URLs', async () => {
    saveAuthToken('session-token');
    const mock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('pdf', { status: 200 }));
    const result = await aiAssistantService.downloadReport('/api/v1/ai-assistant/reports/report-id/download');
    expect(await result.text()).toBe('pdf');
    expect(mock.mock.calls[0][0]).toBe('https://api.example/api/v1/ai-assistant/reports/report-id/download');
    expect(mock.mock.calls[0][1]).toMatchObject({ headers: { Authorization: 'Bearer session-token' }, redirect: 'error' });
    await expect(aiAssistantService.downloadReport('https://evil.example/api/v1/ai-assistant/reports/report-id/download')).rejects.toThrow();
    await expect(aiAssistantService.downloadReport('/api/v1/ai-assistant/reports/report-id/download?token=session-token')).rejects.toThrow();
    expect(mock).toHaveBeenCalledTimes(1);
    saveAuthToken(null);
  });
  it('cancels server request and propagates history abort signals', async () => {
    const mock = respond([]);
    const controller = new AbortController();
    await aiAssistantService.getHistory('11', 2, controller.signal);
    expect(mock.mock.calls[0][1]?.signal).toBe(controller.signal);
    await aiAssistantService.cancelRequest(input.request_id);
    expect(mock.mock.calls[1][0]).toContain(`/requests/${input.request_id}/cancel`);
    expect(mock.mock.calls[1][1]?.method).toBe('POST');
  });
});
