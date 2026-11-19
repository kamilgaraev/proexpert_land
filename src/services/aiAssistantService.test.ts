import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { saveAuthToken } from '@/utils/authTokenStorage';
import { aiAssistantService } from './aiAssistantService';
import type { AiAssistantChatInput } from '@/types/aiAssistant';
vi.mock('@/utils/api', () => ({ API_URL: 'https://api.example/api/v1/landing', userManagementService: { getOrganizationTeam: vi.fn() } }));
const respond = (data: unknown, meta?: unknown) => vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(JSON.stringify({ success: true, data, meta }), { status: 200 }));
const input: AiAssistantChatInput = { conversation_id: '11', message: 'Вопрос', request_id: '4b3a24d1-1b27-41e3-a364-5da772bd739b', profile: 'detailed', allow_actions: true, context: { entity_refs: [{ type: 'project', id: 8 }] } };
afterEach(() => vi.restoreAllMocks());
describe('aiAssistantService', () => {
  it('loads a citation by message and original public source index through the authenticated envelope', async () => {
    saveAuthToken('citation-token');
    const data = { message_id: '22', source_index: 1, kind: 'source_chunk_preview', content: 'Фрагмент' };
    const mock = respond(data);
    const signal = new AbortController().signal;
    await expect(aiAssistantService.getSourcePreview('11', '22', 1, signal)).resolves.toEqual(data);
    expect(mock.mock.calls[0][0]).toBe('https://api.example/api/v1/ai-assistant/conversations/11/messages/22/sources/1');
    expect(mock.mock.calls[0][1]).toMatchObject({ signal, headers: { Authorization: 'Bearer citation-token' } });
  });
  it('preserves pagination and normalizes numeric IDs without organization scope', async () => {
    const mock = respond([{ id: 11, title: 'Чат', user_id: 7 }], { current_page: 2, last_page: 3, per_page: 20, total: 41 });
    const result = await aiAssistantService.getConversations(2);
    expect(result.items[0]).toMatchObject({ id: '11', user_id: '7' });
    expect(result.meta?.last_page).toBe(3);
    expect(mock.mock.calls[0][0]).toBe('https://api.example/api/v1/ai-assistant/conversations?page=2&per_page=20');
  });
  it('accepts async request and completed status payloads while preserving the full synchronous result', async () => {
    const progress = [{ id: 31, code: 'estimates', state: 'completed' }, { id: 32, code: 'warehouse', state: 'started' }];
    const responses = [
      new Response(JSON.stringify({ success: true, data: { request_id: input.request_id, conversation_id: '11', status: 'running', stage: 'queued', progress } }), { status: 202 }),
      new Response(JSON.stringify({ success: true, data: { request_id: input.request_id, conversation_id: 11, message: { id: 22, role: 'assistant', content: 'Ответ' }, credit_usage: { charged_minor: 50 } } }), { status: 200 }),
      new Response(JSON.stringify({ success: true, data: { request_id: input.request_id, conversation_id: '11', status: 'completed', stage: 'completed', progress, response: { request_id: input.request_id, conversation_id: '11', message: { id: '22', role: 'assistant', content: 'Ответ' }, credit_usage: { charged_minor: 50 }, progress } } }), { status: 200 }),
    ];
    const mock = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => responses.shift()!);
    await expect(aiAssistantService.chat({ ...input, quote_id: 'quote' })).resolves.toMatchObject({ status: 'running', stage: 'queued', progress });
    await expect(aiAssistantService.chat({ ...input, quote_id: 'quote' })).resolves.toMatchObject({ conversation_id: '11', message: { id: '22' } });
    await expect(aiAssistantService.getRequest(input.request_id)).resolves.toMatchObject({ status: 'completed', progress, response: { message: { id: '22' }, credit_usage: { charged_minor: 50 }, progress } });
    expect(JSON.parse(String(mock.mock.calls[0][1]?.body))).toMatchObject({ ...input, quote_id: 'quote', async: true, contract_version: 1 });
  });
  describe('assistant chat and history HTTP contract', () => {
    const server = setupServer();
    const baseUrl = 'https://api.example/api/v1/ai-assistant';

    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
    afterEach(() => server.resetHandlers());
    afterAll(() => server.close());

    it('opts into v1 for quote, chat, status and cancel while reading legacy responses', async () => {
      const state = { request_id: input.request_id, conversation_id: 11, status: 'running', stage: 'queued' };
      server.use(
        http.post(`${baseUrl}/credits/quote`, async ({ request }) => {
          expect(await request.json()).toEqual({ ...input, contract_version: 1 });
          expect(request.headers.has('x-most-assistant-contract')).toBe(false);
          return HttpResponse.json({ success: true, data: { quote_id: 'quote' } });
        }),
        http.post(`${baseUrl}/chat`, async ({ request }) => {
          expect(await request.json()).toEqual({ ...input, quote_id: 'quote', async: true, contract_version: 1 });
          expect(request.headers.has('x-most-assistant-contract')).toBe(false);
          return HttpResponse.json({ success: true, data: state }, { status: 202 });
        }),
        http.get(`${baseUrl}/requests/${input.request_id}`, ({ request }) => {
          expect(Object.fromEntries(new URL(request.url).searchParams)).toEqual({ contract_version: '1' });
          expect(request.headers.has('x-most-assistant-contract')).toBe(false);
          return HttpResponse.json({ success: true, data: state });
        }),
        http.post(`${baseUrl}/requests/${input.request_id}/cancel`, async ({ request }) => {
          expect(await request.json()).toEqual({ contract_version: 1 });
          expect(request.headers.has('x-most-assistant-contract')).toBe(false);
          return HttpResponse.json({ success: true, data: { ...state, status: 'cancelled', stage: 'cancelled' } });
        }),
      );

      const quote = await aiAssistantService.getQuote(input);
      expect(quote.quote_id).toBe('quote');
      await expect(aiAssistantService.chat({ ...input, quote_id: quote.quote_id })).resolves.toMatchObject({
        ...state, conversation_id: '11', interim_result: null,
      });
      await expect(aiAssistantService.getRequest(input.request_id)).resolves.toMatchObject({
        ...state, conversation_id: '11', interim_result: null,
      });
      await expect(aiAssistantService.cancelRequest(input.request_id)).resolves.toMatchObject({ status: 'cancelled' });
    });

    it.each(['failed', 'cancelled'] as const)('returns an idempotent %s POST as a terminal status', async (status) => {
      const data = { request_id: input.request_id, conversation_id: 11, status, run_status: status, stage: status, error_code: 'terminal_error' };
      const requests: unknown[] = [];
      server.use(http.post(`${baseUrl}/chat`, async ({ request }) => {
        requests.push(await request.json());
        return HttpResponse.json({ success: true, data });
      }));
      await expect(aiAssistantService.chat({ ...input, quote_id: 'quote' })).resolves.toMatchObject({ ...data, conversation_id: '11' });
      expect(requests).toEqual([{ ...input, quote_id: 'quote', async: true, contract_version: 1 }]);
    });

    it('accepts canonical progress snapshots while filtering unsupported step data', async () => {
      const at = '2026-10-25T10:00:00Z';
      const step = { id: 2, key: 'record.1', code: 'record_check', state: 'failed', at };
      const search = { id: 3, key: 'position-search', code: 'estimate_position_search', state: 'completed', at };
      const read = { id: 4, key: 'position-read', code: 'estimate_position_read', state: 'started', at };
      const interim = {
        key: 'answer', revision: 1, text: 'Проверен график', scope: { kind: 'project', project_id: 8 },
        sources: [{ label: 'График' }], published_at: at,
      };
      const status = {
        request_id: input.request_id, conversation_id: 11, status: 'running',
        accepted_at: at, elapsed_seconds: 42,
      };
      server.use(http.get(`${baseUrl}/requests/${input.request_id}`, () => HttpResponse.json({
        success: true,
        data: {
          ...status,
          progress: [{ ...step, argument: 'internal' }, search, read, { ...step, id: 5, code: 'private_tool' }],
          interim_result: { ...interim, sources: [{ ...interim.sources[0], entity_id: 19 }, { label: 12 }] },
        },
      }), { once: true }), http.get(`${baseUrl}/requests/${input.request_id}`, () => HttpResponse.json({ success: true, data: status })));

      const current = await aiAssistantService.getRequest(input.request_id);
      expect(current).toMatchObject({ ...status, conversation_id: '11' });
      expect(current.progress).toEqual([step, search, read]);
      expect(current.interim_result).toEqual(interim);
      const next = await aiAssistantService.getRequest(input.request_id);
      expect(next.interim_result).toBeNull();
    });

    it('retains typed results in responses and history alongside the legacy fields', async () => {
      const result = {
        contract_version: 1, outcome: 'clarification', coverage: { status: 'partial' },
        evidence: [{ source_ref: { entity_type: 'project', entity_id: 8 } }],
        billing: { charged_minor: 0, reason: 'local_only' },
        ui_actions: [{ type: 'reveal_source', label: 'Открыть запись', surface: 'admin', target: 'signed' }],
      };
      const message = { id: 22, role: 'assistant', content: 'Ответ' };
      const activeRequest = { request_id: input.request_id, conversation_id: 11, status: 'running', run_status: 'queued', stage: 'queued' };
      server.use(
        http.post(`${baseUrl}/chat`, () => HttpResponse.json({
          success: true, data: { request_id: input.request_id, conversation_id: 11, ...result, message, credit_usage: {} },
        })),
        http.get(`${baseUrl}/conversations/11/history`, ({ request }) => {
          expect(Object.fromEntries(new URL(request.url).searchParams)).toEqual({ page: '1', per_page: '30', contract_version: '1' });
          return HttpResponse.json({
            success: true,
            data: [{ ...message, metadata: result }],
            meta: { current_page: 1, last_page: 2, per_page: 30, total: 31, active_request: activeRequest },
          });
        }),
      );
      await expect(aiAssistantService.chat({ ...input, quote_id: 'quote' })).resolves.toMatchObject({
        ...result, message: { id: '22', metadata: result }, credit_usage: {},
      });
      await expect(aiAssistantService.getHistory('11')).resolves.toMatchObject({
        items: [{ id: '22', metadata: result }], meta: { last_page: 2, active_request: { ...activeRequest, conversation_id: '11' } },
      });
    });
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
  it('drops malformed or unsupported progress entries and keeps legacy payloads valid', async () => {
    respond({ request_id: input.request_id, conversation_id: '11', status: 'running', progress: [{ id: 0, code: 'estimates', state: 'started' }, { id: 30, code: 'intent_guess', state: 'completed' }, { id: 31, code: 'warehouse', state: 'completed' }] });
    await expect(aiAssistantService.getRequest(input.request_id)).resolves.toMatchObject({ progress: [{ id: 31, code: 'warehouse', state: 'completed' }] });
    const longProgress = Array.from({ length: 26 }, (_, index) => ({ id: 31 + index, code: 'warehouse', state: 'completed' }));
    respond({ request_id: input.request_id, conversation_id: '11', status: 'running', progress: longProgress });
    const result = await aiAssistantService.getRequest(input.request_id);
    expect(result.progress ?? []).toHaveLength(24);
    expect(result.progress?.[0].id).toBe(33);
    expect(result.progress?.[23].id).toBe(56);
    respond({ request_id: input.request_id, conversation_id: '11', status: 'running' });
    await expect(aiAssistantService.getRequest(input.request_id)).resolves.toMatchObject({ progress: [] });
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
