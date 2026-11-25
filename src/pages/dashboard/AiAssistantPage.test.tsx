import { act, fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AiAssistantPage, { assistantSourceUrl, assistantUnits } from './AiAssistantPage';
import { aiAssistantService, AssistantApiError } from '@/services/aiAssistantService';
import getEcho from '@/services/echo';
import { createAiAssistantRequestId } from '@/services/aiAssistantService';
import type { AiAssistantProgress } from '@/types/aiAssistant';
import { AuthContext, type AuthContextType } from '@/contexts/AuthContext';
import type { AiAssistantMessage, AiAssistantTypedFactsLocator } from '@/types/aiAssistant';
vi.mock('./AiAssistantCoveragePanel', () => ({ default: () => null }));
vi.mock('@/hooks/usePermissions', () => ({ useCanAccess: () => false }));
vi.mock('@/contexts/AuthContext', async () => ({ AuthContext: (await import('react')).createContext({ user: { id: 7, current_organization_id: 44 } }) }));
vi.mock('@/services/aiAssistantService', () => ({ AssistantApiError: class extends Error {}, createAiAssistantRequestId: vi.fn(() => 'uuid-request'), aiAssistantService: { getConversations: vi.fn(), getConversation: vi.fn(), getMemory: vi.fn(), getBalance: vi.fn(), getUsage: vi.fn(), getHistory: vi.fn(), getParticipants: vi.fn(), getQuote: vi.fn(), chat: vi.fn(), cancelRequest: vi.fn(), getRequest: vi.fn(), previewAction: vi.fn(), executeAction: vi.fn(), cancelAction: vi.fn(), getSourcePreview: vi.fn(), uploadAttachment: vi.fn() } }));
vi.mock('@/services/echo', () => ({ default: vi.fn() }));
const deferred = <T,>() => { let resolve!: (value: T) => void; const promise = new Promise<T>((done) => { resolve = done; }); return { promise, resolve }; };
beforeEach(() => {
  vi.mocked(aiAssistantService.getConversations).mockResolvedValue({ items: [{ id: '11', user_id: '7', title: 'Первый' }, { id: '12', user_id: '7', title: 'Второй' }], meta: null });
  vi.mocked(aiAssistantService.getMemory).mockResolvedValue([]);
  vi.mocked(aiAssistantService.getBalance).mockResolvedValue({ included_minor: 500000, purchased_minor: 0, available_minor: 500000, reserved_minor: 0, total_minor: 500000, packs: [], charging_enabled: false });
  vi.mocked(aiAssistantService.getUsage).mockResolvedValue({ billing_contract_version: 2, limiting_resource: 'organization_ai_credits', usage_kind: 'statistics', monthly_limit: null, remaining: null, percentage_used: null, used: 12, tokens_used: 960, cost_rub: 1.2 });
  vi.mocked(aiAssistantService.getParticipants).mockResolvedValue([]);
  vi.mocked(aiAssistantService.getHistory).mockResolvedValue({ items: [], meta: null });
  vi.mocked(aiAssistantService.getQuote).mockResolvedValue({ quote_id: 'quote', min_units_minor: 50, max_units_minor: 200, expires_at: '2099-01-01T00:00:00Z', price_version: '1' });
});
afterEach(() => { cleanup(); sessionStorage.clear(); vi.unstubAllGlobals(); vi.clearAllMocks(); });
const selectFirst = async () => { await screen.findByRole('button', { name: 'Первый' }); fireEvent.click(screen.getByRole('button', { name: 'Первый' })); await screen.findByLabelText('Вопрос помощнику'); };
describe('AiAssistantPage', () => {
  const factsLocator: AiAssistantTypedFactsLocator = { version: 'ordinary-typed-facts-context/1', receipt_id: 'a1111111-1111-1111-1111-111111111111', receipt_hash: 'a'.repeat(64) };
  const factsNow = Date.parse('2026-10-25T10:00:00Z');
  const factsMessage = (): AiAssistantMessage => ({ id: 'facts', role: 'assistant', content: 'Первый ответ с данными', created_at: '2026-10-25T09:59:00Z', metadata: { typed_facts: factsLocator } });
  const quoteQuestion = async (value: string) => {
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    await screen.findByRole('button', { name: 'Подтвердить и отправить' });
  };

  it('renders only verified structured knowledge links with an exact local article path', async () => {
    const path = '/dashboard/help/knowledge';
    const ref = (display_label: string, url: string) => ({
      source_type: 'knowledge', entity_type: 'knowledge_article', display_label, navigation: { url },
    });
    const article = ref('Настройка ЛК', `${path}/LK_guide-%D0%9C%D0%9E%D0%A1%D0%A2`);
    const rejected = [
      `https://untrusted.example${path}/article`, `//untrusted.example${path}/article`,
      `${path}/article?a=1`, `${path}/article#section`, `${path}/nested/article`, `${path}/article/`,
      `${path}/../article`, `${path}/%2E%2E`, `${path}/article%2Fother`, `${path}/article%5Cother`,
      `${path}/article%252Fother`, `${path}/article%3Fquery`, `${path}/article%23section`, `${path}/article%00`, `${path}/article%E2%80%AE`,
    ];
    vi.mocked(aiAssistantService.getHistory).mockResolvedValue({
      items: [
        { id: 'verified', role: 'assistant', content: `[Ссылка из текста](${path}/markdown)`, metadata: {
          contract_version: 1, validation_status: 'verified',
          source_refs: [article, ...rejected.map((url, index) => ref(`Недопустимая ссылка ${index}`, url)),
            { ...ref('Другой тип источника', `${path}/other`), source_type: 'other' }],
          rag_context: { sources: [ref('Ссылка из RAG', `${path}/rag`)] },
        } },
        { id: 'partial', role: 'assistant', content: 'Статья найдена, другие данные недоступны.', metadata: {
          contract_version: 1, decision_contract: 3, validation_status: 'partial', coverage: { status: 'partial' },
          source_refs: [ref('Статья подтверждена', `${path}/confirmed`)],
        } },
        { id: 'unverified', role: 'assistant', content: 'Непроверенный ответ', metadata: {
          contract_version: 1, validation_status: 'unverified', source_refs: [ref('Непроверенная статья', `${path}/unverified`)],
        } },
        { id: 'legacy', role: 'assistant', content: 'Старый ответ', metadata: {
          validation_status: 'verified', source_refs: [ref('Старая статья', `${path}/legacy`)],
        } },
        { id: 'user', role: 'user', content: 'Вопрос', metadata: {
          contract_version: 1, validation_status: 'verified', source_refs: [ref('Статья от пользователя', `${path}/user`)],
        } },
      ],
      meta: null,
    });

    render(<MemoryRouter><AiAssistantPage /></MemoryRouter>);
    await selectFirst();
    expect(await screen.findByRole('link', { name: 'Настройка ЛК' })).toHaveAttribute('href', article.navigation.url);
    expect(screen.getByRole('link', { name: 'Статья подтверждена' })).toHaveAttribute('href', `${path}/confirmed`);
    expect(screen.queryByRole('link', { name: /Недопустимая ссылка|Другой тип источника|Ссылка из RAG|Ссылка из текста|Непроверенная статья|Старая статья|Статья от пользователя/ }))
      .not.toBeInTheDocument();
    expect(screen.getByText(/\[Ссылка из текста\]/)).toBeInTheDocument();
  });

  it('keeps the new draft and removes only sent attachments after manually checking a timed-out request', async () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(factsNow);
    let previewNumber = 0;
    vi.stubGlobal('URL', class extends URL {
      static createObjectURL = () => `blob:attachment-${++previewNumber}`;
      static revokeObjectURL = vi.fn();
    });
    vi.mocked(aiAssistantService.uploadAttachment)
      .mockResolvedValueOnce({ id: 'sent-image', name: 'sent.png', mime: 'image/png', size: 3, width: 1, height: 1 })
      .mockResolvedValueOnce({ id: 'new-image', name: 'new.png', mime: 'image/png', size: 3, width: 1, height: 1 });
    vi.mocked(aiAssistantService.chat).mockResolvedValueOnce({ request_id: 'uuid-request', conversation_id: '11', status: 'running', stage: 'reading' });
    vi.mocked(aiAssistantService.getRequest)
      .mockImplementationOnce(async () => {
        clock.mockReturnValue(factsNow + 10 * 60_000);
        return { request_id: 'uuid-request', conversation_id: '11', status: 'running' };
      })
      .mockResolvedValueOnce({
        request_id: 'uuid-request', conversation_id: '11', status: 'completed',
        response: { request_id: 'uuid-request', conversation_id: '11', message: { id: 'recovered', role: 'assistant', content: 'Ответ с изображением' }, credit_usage: {} },
      });

    render(<AiAssistantPage />);
    await selectFirst();
    const addImage = async (name: string) => {
      fireEvent.change(screen.getByLabelText('Прикрепить изображение'), { target: { files: [new File(['png'], name, { type: 'image/png' })] } });
      await screen.findByRole('img', { name });
    };
    await addImage('sent.png');
    await quoteQuestion('Проверь отправленное изображение');
    expect(vi.mocked(aiAssistantService.getQuote).mock.calls[0][0].attachment_ids).toEqual(['sent-image']);
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить и отправить' }));
    const check = await screen.findByRole('button', { name: 'Проверить состояние запроса' }, { timeout: 3500 });
    expect(sessionStorage.getItem('most.assistant.pending.v1:[7,44]')).toBe(JSON.stringify([{ id: 'uuid-request', conversationId: '11', startedAt: factsNow }]));
    const nextQuestion = 'Проверь новое изображение';
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: nextQuestion } });
    await addImage('new.png');
    fireEvent.click(check);
    await screen.findByText('Ответ с изображением');
    await waitFor(() => expect(screen.getByLabelText('Вопрос помощнику')).toBeEnabled());
    expect(screen.getByLabelText('Вопрос помощнику')).toHaveValue(nextQuestion);
    fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    await screen.findByRole('button', { name: 'Подтвердить и отправить' });

    expect(aiAssistantService.getQuote).toHaveBeenLastCalledWith(expect.objectContaining({ message: nextQuestion, attachment_ids: ['new-image'] }));
    expect(aiAssistantService.chat).toHaveBeenCalledTimes(1);
  });

  it('keeps a new draft when recovering a request loaded from session storage', async () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(factsNow);
    sessionStorage.setItem('most.assistant.pending.v1:[7,44]', JSON.stringify([{ id: 'previous-request', conversationId: '11', startedAt: factsNow }]));
    vi.mocked(aiAssistantService.getRequest)
      .mockImplementationOnce(async () => {
        clock.mockReturnValue(factsNow + 10 * 60_000);
        return { request_id: 'previous-request', conversation_id: '11', status: 'running' };
      })
      .mockResolvedValueOnce({
        request_id: 'previous-request', conversation_id: '11', status: 'completed',
        response: { request_id: 'previous-request', conversation_id: '11', message: { id: 'recovered', role: 'assistant', content: 'Ответ прежнего сеанса' }, credit_usage: {} },
      });

    render(<AiAssistantPage />);
    const check = await screen.findByRole('button', { name: 'Проверить состояние запроса' }, { timeout: 3500 });
    const input = screen.getByLabelText('Вопрос помощнику');
    fireEvent.change(input, { target: { value: 'Новый вопрос в этом сеансе' } });
    fireEvent.click(check);
    await screen.findByText('Ответ прежнего сеанса');

    expect(input).toHaveValue('Новый вопрос в этом сеансе');
    expect(aiAssistantService.chat).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('most.assistant.pending.v1:[7,44]')).toBeNull();
  });

  it('quotes with completed response locator and carries the original receipt into a third turn without renewal', async () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(factsNow);
    vi.mocked(aiAssistantService.chat)
      .mockResolvedValueOnce({ request_id: 'uuid-request', conversation_id: '11', message: factsMessage(), credit_usage: {} })
      .mockResolvedValueOnce({ request_id: 'uuid-request', conversation_id: '11', message: { id: 'inherited', role: 'assistant', content: 'Ответ на уточнение', created_at: '2026-10-25T10:01:00Z' }, credit_usage: {} });
    render(<AiAssistantPage />); await selectFirst();
    await quoteQuestion('Первый вопрос');
    expect(vi.mocked(aiAssistantService.getQuote).mock.calls[0][0].context).toEqual({});
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить и отправить' }));
    await screen.findByText('Первый ответ с данными');
    await waitFor(() => expect(screen.getByLabelText('Вопрос помощнику')).toBeEnabled());
    await quoteQuestion('Уточни ответ');
    const quoted = vi.mocked(aiAssistantService.getQuote).mock.calls[1][0];
    expect(quoted.context).toEqual({ typed_facts: factsLocator });
    clock.mockReturnValue(factsNow + 60_000);
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить и отправить' }));
    await screen.findByText('Ответ на уточнение');
    expect(vi.mocked(aiAssistantService.chat).mock.calls[1][0]).toEqual({ ...quoted, quote_id: 'quote' });
    await waitFor(() => expect(screen.getByLabelText('Вопрос помощнику')).toBeEnabled());
    await quoteQuestion('Ещё уточни');
    expect(vi.mocked(aiAssistantService.getQuote).mock.calls[2][0].context).toEqual({ typed_facts: factsLocator });
  });

  it('does not use a late history locator from another conversation', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(factsNow);
    const first = deferred<{ items: AiAssistantMessage[]; meta: null }>();
    vi.mocked(aiAssistantService.getHistory).mockImplementation((id) => id === '11' ? first.promise : Promise.resolve({ items: [], meta: null }));
    render(<AiAssistantPage />);
    await screen.findByRole('button', { name: 'Первый' });
    fireEvent.click(screen.getByRole('button', { name: 'Первый' }));
    fireEvent.click(screen.getByRole('button', { name: 'Второй' }));
    await screen.findByLabelText('Вопрос помощнику');
    await act(async () => first.resolve({ items: [factsMessage()], meta: null }));
    await quoteQuestion('Новый вопрос');
    expect(vi.mocked(aiAssistantService.getQuote).mock.calls[0][0]).toMatchObject({ conversation_id: '12', context: {} });
  });

  it.each([{ id: 8, current_organization_id: 44 }, { id: 7, current_organization_id: 45 }])('clears locator and ignores pending quote on identity change %j', async (nextUser) => {
    vi.spyOn(Date, 'now').mockReturnValue(factsNow);
    vi.mocked(aiAssistantService.getHistory).mockResolvedValueOnce({ items: [factsMessage()], meta: null }).mockResolvedValue({ items: [], meta: null });
    const pending = deferred<Awaited<ReturnType<typeof aiAssistantService.getQuote>>>();
    vi.mocked(aiAssistantService.getQuote).mockReturnValueOnce(pending.promise);
    const view = (value: { id: number; current_organization_id: number }) => <AuthContext.Provider value={{ user: value } as unknown as AuthContextType}><AiAssistantPage /></AuthContext.Provider>;
    const rendered = render(view({ id: 7, current_organization_id: 44 }));
    await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Вопрос в прежней организации' } });
    fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    expect(vi.mocked(aiAssistantService.getQuote).mock.calls[0][0].context).toEqual({ typed_facts: factsLocator });
    vi.mocked(aiAssistantService.getConversations).mockResolvedValue({ items: [{ id: '11', user_id: '7', title: 'Первый', can_edit: true }], meta: null });
    rendered.rerender(view(nextUser));
    await screen.findByRole('button', { name: 'Первый' });
    fireEvent.click(screen.getByRole('button', { name: 'Первый' }));
    await screen.findByLabelText('Вопрос помощнику');
    await act(async () => pending.resolve({ quote_id: 'old', min_units_minor: 50, max_units_minor: 200, expires_at: '2099-01-01T00:00:00Z', price_version: '1' }));
    expect(screen.queryByRole('button', { name: 'Подтвердить и отправить' })).not.toBeInTheDocument();
    await quoteQuestion('Новый вопрос');
    expect(vi.mocked(aiAssistantService.getQuote).mock.calls[1][0].context).toEqual({});
    expect(aiAssistantService.chat).not.toHaveBeenCalled();
  });

  it('invalidates an expired receipt approval without silently sending a stripped context', async () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(factsNow);
    vi.mocked(aiAssistantService.getHistory).mockResolvedValue({ items: [factsMessage()], meta: null });
    render(<AiAssistantPage />); await selectFirst();
    await quoteQuestion('Уточни ответ');
    clock.mockReturnValue(factsNow + 14 * 60_000);
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить и отправить' }));
    expect(await screen.findByText('Срок использования предыдущего ответа истёк. Рассчитайте стоимость снова.')).toBeInTheDocument();
    expect(aiAssistantService.chat).not.toHaveBeenCalled();
    expect(aiAssistantService.getQuote).toHaveBeenCalledTimes(1);
    await quoteQuestion('Новый вопрос после срока');
    expect(vi.mocked(aiAssistantService.getQuote).mock.calls[1][0].context).toEqual({});
  });

  it('does not retry a permission failure or remove its approved context', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(factsNow);
    vi.mocked(aiAssistantService.getHistory).mockResolvedValue({ items: [factsMessage()], meta: null });
    vi.mocked(aiAssistantService.chat).mockRejectedValue(Object.assign(new AssistantApiError('Нет прав.', 403), { status: 403 }));
    render(<AiAssistantPage />); await selectFirst();
    await quoteQuestion('Уточни ответ');
    const input = vi.mocked(aiAssistantService.getQuote).mock.calls[0][0];
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить и отправить' }));
    expect(await screen.findByText('У вас нет прав для этого действия.')).toBeInTheDocument();
    expect(aiAssistantService.chat).toHaveBeenCalledTimes(1);
    expect(aiAssistantService.getRequest).not.toHaveBeenCalled();
    expect(aiAssistantService.getQuote).toHaveBeenCalledTimes(1);
    expect(vi.mocked(aiAssistantService.chat).mock.calls[0][0]).toEqual({ ...input, quote_id: 'quote' });
    expect(input.context).toEqual({ typed_facts: factsLocator });
  });

  it('ignores a late completed response after switching organizations and keeps the new quote', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(factsNow);
    const late = deferred<Awaited<ReturnType<typeof aiAssistantService.chat>>>();
    vi.mocked(aiAssistantService.chat).mockReturnValueOnce(late.promise);
    vi.mocked(aiAssistantService.cancelRequest).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status: 'cancelled' });
    const view = (organizationId: number) => <AuthContext.Provider value={{ user: { id: 7, current_organization_id: organizationId } } as unknown as AuthContextType}><AiAssistantPage /></AuthContext.Provider>;
    const rendered = render(view(44)); await selectFirst();
    await quoteQuestion('Вопрос в прежней организации');
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить и отправить' }));
    await screen.findByRole('button', { name: 'Отменить запрос' });
    rendered.rerender(view(45));
    expect(aiAssistantService.cancelRequest).not.toHaveBeenCalled();
    await screen.findByRole('button', { name: 'Первый' });
    fireEvent.click(screen.getByRole('button', { name: 'Первый' }));
    await screen.findByLabelText('Вопрос помощнику');
    await quoteQuestion('Вопрос в новой организации');
    await act(async () => late.resolve({ request_id: 'uuid-request', conversation_id: '11', message: factsMessage(), credit_usage: {} }));
    expect(screen.queryByText('Первый ответ с данными')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Подтвердить и отправить' })).toBeEnabled();
    expect(vi.mocked(aiAssistantService.getQuote).mock.calls[1][0].context).toEqual({});
  });

  it.each([
    {
      name: 'legacy',
      publication: { source_refs_version: 'ordinary-publication-locator/1' },
      locator: { entity_type: 'assistant_document', entity_id: 159, project_id: 52, document_id: 159, unit_id: 4, chunk_id: 219753 },
    },
    {
      name: 'V3',
      publication: { contract_version: 1 as const, decision_contract: 3 as const },
      locator: { entity_type: 'assistant_document', display_label: 'Подтверждённый документ', preview_kind: 'source_chunk_preview' as const },
    },
  ])('opens only original $name citations and preserves the public source index', async ({ publication, locator }) => {
    vi.mocked(aiAssistantService.getHistory).mockResolvedValue({ items: [{ id: '22', role: 'assistant', content: 'Ответ', metadata: {
      ...publication, source_refs: [{ entity_type: 'project', entity_id: 52, project_id: 52 }, locator],
      rag_context: { sources: [locator] },
    } }], meta: null });
    vi.mocked(aiAssistantService.getSourcePreview).mockResolvedValue({ message_id: '22', source_index: 1, source: locator, kind: 'source_chunk_preview', title: 'Источник', content: 'Подтверждённый текст', content_range: { offset: 0, length: 19, total_length: 19, truncated: false } });
    render(<AiAssistantPage />);
    await selectFirst();
    const buttons = await screen.findAllByRole('button', { name: 'Открыть источник' });
    expect(buttons).toHaveLength(1);
    fireEvent.click(buttons[0]);
    expect(await screen.findByText('Подтверждённый текст')).toBeInTheDocument();
    expect(aiAssistantService.getSourcePreview).toHaveBeenCalledWith('11', '22', 1, expect.any(AbortSignal));
  });
  it('shows usage statistics and the shared wallet balance without a request quota', async () => {
    render(<AiAssistantPage />);
    expect(await screen.findByText('Запросов: 12')).toBeInTheDocument();
    const balance = await screen.findByText(/Доступно:/);
    expect(balance.textContent).toContain('5');
    expect(balance.textContent).toContain('ед.');
    expect(screen.queryByText(/осталось запросов/i)).not.toBeInTheDocument();
  });

  it('explains shadow billing and hides credit purchase', async () => {
    vi.mocked(aiAssistantService.getBalance).mockResolvedValue({ included_minor: 500000, purchased_minor: 0, available_minor: 500000, reserved_minor: 0, total_minor: 500000, packs: [{ id: 'ai-credits-1000', units_minor: 100000, amount_minor: 50000 }], charging_enabled: false, billing_mode: 'shadow', can_purchase: false, can_manage_billing: true, pack_purchase_enabled: false });
    render(<AiAssistantPage />);
    expect(await screen.findByText(/Тестовый режим: списания выключены/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ед\. · .* ₽/ })).not.toBeInTheDocument();
  });

  it('ignores history response for a previous conversation', async () => {
    const first = deferred<{ items: { id: string; role: string; content: string }[]; meta: null }>();
    vi.mocked(aiAssistantService.getHistory).mockImplementation((id) => id === '11' ? first.promise : Promise.resolve({ items: [{ id: 'new', role: 'assistant', content: 'Текущий ответ' }], meta: null }));
    render(<AiAssistantPage />);
    await screen.findByRole('button', { name: 'Первый' }); fireEvent.click(screen.getByRole('button', { name: 'Первый' })); fireEvent.click(screen.getByRole('button', { name: 'Второй' }));
    await screen.findByText('Текущий ответ'); first.resolve({ items: [{ id: 'old', role: 'assistant', content: 'Старый ответ' }], meta: null });
    await waitFor(() => expect(screen.queryByText('Старый ответ')).not.toBeInTheDocument());
  });
  it('invalidates quote when canonical question changes', async () => {
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Вопрос' } }); fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    await screen.findByRole('button', { name: 'Подтвердить и отправить' });
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Другой вопрос' } });
    expect(screen.queryByRole('button', { name: 'Подтвердить и отправить' })).not.toBeInTheDocument();
    expect(aiAssistantService.chat).not.toHaveBeenCalled();
  });
  it('uses quote request identity and server cancellation, ignores late result', async () => {
    const chat = deferred<Awaited<ReturnType<typeof aiAssistantService.chat>>>();
    vi.mocked(aiAssistantService.chat).mockReturnValue(chat.promise);
    vi.mocked(aiAssistantService.cancelRequest).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status: 'cancelled' });
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Вопрос' } }); fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Подтвердить и отправить' }));
    await screen.findByRole('button', { name: 'Отменить запрос' });
    expect(screen.getByRole('button', { name: 'Второй' })).toBeDisabled();
    expect(aiAssistantService.chat).toHaveBeenCalledWith({ ...vi.mocked(aiAssistantService.getQuote).mock.calls[0][0], quote_id: 'quote' }, expect.any(AbortSignal));
    fireEvent.click(screen.getByRole('button', { name: 'Отменить запрос' }));
    await waitFor(() => expect(aiAssistantService.cancelRequest).toHaveBeenCalledWith('uuid-request'));
    chat.resolve({ request_id: 'uuid-request', conversation_id: '11', message: { id: 'late', role: 'assistant', content: 'Поздний ответ' }, credit_usage: { charged_minor: 50, reserved_minor: 0, available_after_minor: 499950 } });
    await waitFor(() => expect(screen.queryByText('Поздний ответ')).not.toBeInTheDocument());
  });
  it('detaches polling on close and resumes the same request on reopen without reposting', async () => {
    const pending = deferred<Awaited<ReturnType<typeof aiAssistantService.getRequest>>>();
    const answer = { id: 'reopened-answer', role: 'assistant', content: 'Ответ после возвращения' };
    vi.mocked(aiAssistantService.chat).mockResolvedValueOnce({ request_id: 'uuid-request', conversation_id: '11', status: 'running', stage: 'queued' });
    vi.mocked(aiAssistantService.getRequest).mockReturnValueOnce(pending.promise).mockResolvedValueOnce({
      request_id: 'uuid-request', conversation_id: '11', status: 'completed', run_status: 'completed',
      response: { request_id: 'uuid-request', conversation_id: '11', message: answer, credit_usage: {} },
    });
    const firstView = render(<AiAssistantPage />);
    await selectFirst();
    await quoteQuestion('Сколько материалов?');
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить и отправить' }));
    await waitFor(() => expect(aiAssistantService.getRequest).toHaveBeenCalledTimes(1));
    const signal = vi.mocked(aiAssistantService.getRequest).mock.calls[0][1];
    firstView.unmount();
    expect(signal?.aborted).toBe(true);
    expect(aiAssistantService.cancelRequest).not.toHaveBeenCalled();

    vi.mocked(aiAssistantService.getHistory).mockResolvedValue({ items: [{ id: 'original-question', role: 'user', content: 'Сколько материалов?' }, answer], meta: null });
    render(<AiAssistantPage />);
    expect(await screen.findByText(answer.content)).toBeInTheDocument();
    await waitFor(() => expect(aiAssistantService.getRequest).toHaveBeenCalledTimes(2));
    expect(screen.getAllByText(answer.content)).toHaveLength(1);
    expect(aiAssistantService.getRequest).toHaveBeenLastCalledWith('uuid-request', expect.any(AbortSignal));
    expect(aiAssistantService.chat).toHaveBeenCalledTimes(1);
  });

  it('resumes the server active request from history without a local reference', async () => {
    vi.mocked(aiAssistantService.getHistory).mockResolvedValueOnce({
      items: [],
      meta: { current_page: 1, last_page: 1, per_page: 30, total: 0, active_request: { request_id: 'server-id', conversation_id: '11', status: 'running', stage: 'queued' } },
    });
    vi.mocked(aiAssistantService.getRequest).mockResolvedValueOnce({
      request_id: 'server-id', conversation_id: '11', status: 'completed',
      response: { request_id: 'server-id', conversation_id: '11', message: { id: 'updated', role: 'assistant', content: 'Ответ из другого сеанса' }, credit_usage: {} },
    });
    render(<AiAssistantPage />);
    await selectFirst();
    expect(await screen.findByText('Ответ из другого сеанса')).toBeInTheDocument();
    expect(aiAssistantService.getRequest).toHaveBeenCalledWith('server-id', expect.any(AbortSignal));
    expect(aiAssistantService.chat).not.toHaveBeenCalled();
  });

  it.each(['same chat', 'another chat', 'another organization'] as const)('refreshes the wallet after recovery and guards late responses in %s', async (destination) => {
    const originalWallet = { included_minor: 500000, purchased_minor: 0, available_minor: 500000, reserved_minor: 0, total_minor: 500000, packs: [], charging_enabled: false };
    const freshBalance = deferred<Awaited<ReturnType<typeof aiAssistantService.getBalance>>>();
    let balanceCalls = 0;
    vi.mocked(aiAssistantService.getBalance).mockImplementation(() => {
      balanceCalls++;
      if (balanceCalls === 2) return freshBalance.promise;
      return Promise.resolve(balanceCalls === 1 ? originalWallet : { ...originalWallet, available_minor: 800000 });
    });
    vi.mocked(aiAssistantService.getHistory).mockResolvedValueOnce({
      items: [],
      meta: { current_page: 1, last_page: 1, per_page: 30, total: 0, active_request: { request_id: 'server-id', conversation_id: '11', status: 'running', stage: 'queued' } },
    });
    vi.mocked(aiAssistantService.getRequest).mockResolvedValueOnce({
      request_id: 'server-id', conversation_id: '11', status: 'completed',
      response: { request_id: 'server-id', conversation_id: '11', message: { id: 'updated', role: 'assistant', content: 'Восстановленный ответ с расходом' }, credit_usage: { available_after_minor: 50000 } },
    });
    const view = (organizationId: number) => <AuthContext.Provider value={{ user: { id: 7, current_organization_id: organizationId } } as unknown as AuthContextType}><AiAssistantPage /></AuthContext.Provider>;
    const rendered = render(view(44));
    await selectFirst();
    expect(await screen.findByText('Восстановленный ответ с расходом')).toBeInTheDocument();
    expect(screen.getByText(/Доступно:/)).toHaveTextContent(/5\s000/);
    expect(aiAssistantService.getBalance).toHaveBeenCalledTimes(2);

    if (destination === 'another chat') {
      fireEvent.click(screen.getByRole('button', { name: 'Второй' }));
      await screen.findByLabelText('Вопрос помощнику');
    } else if (destination === 'another organization') {
      rendered.rerender(view(45));
      await waitFor(() => expect(screen.getByText(/Доступно:/)).toHaveTextContent(/8\s000/));
    }
    await act(async () => freshBalance.resolve({ ...originalWallet, available_minor: 720000 }));

    const expected = destination === 'same chat' ? /7\s200/ : destination === 'another chat' ? /5\s000/ : /8\s000/;
    expect(screen.getByText(/Доступно:/)).toHaveTextContent(expected);
  });

  it('renders the typed result and leaves unsupported actions inactive', async () => {
    vi.mocked(aiAssistantService.getHistory).mockResolvedValue({
      items: [{
        id: 'typed', role: 'assistant', content: 'Уточните название проекта.',
        metadata: {
          contract_version: 1, outcome: 'clarification', coverage: { status: 'partial' },
          billing: { charged_minor: 0, reason: 'no_model_usage' },
          export_task: { status: 'building_export', title: 'Отчёт по работам', task_id: 'export-id', url: '/ai-assistant/report-tasks/export-id' },
          evidence: [{ source_ref: { title: 'График работ' } }],
          ui_actions: [{ type: 'reveal_source', label: 'Открыть запись', surface: 'admin', target: 'https://example.com/', auto_open: true }],
        },
      }],
      meta: null,
    });
    render(<AiAssistantPage />);
    await selectFirst();
    expect(screen.getByText('Уточните название проекта.')).toBeInTheDocument();
    expect(screen.getByText('Нужно уточнение')).toBeInTheDocument();
    expect(screen.getByText('Проверена часть доступных данных.')).toBeInTheDocument();
    expect(screen.getByText('Списано единиц МОСТ: 0')).toBeInTheDocument();
    expect(screen.getByText('Запрос обработан без вызова модели.')).toBeInTheDocument();
    expect(screen.getByText('Отчёт по работам')).toBeInTheDocument();
    expect(screen.getByText('Отчёт готовится.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Скачать: Отчёт по работам' })).not.toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Источники' })).toHaveTextContent('График работ');
    expect(screen.getByText('Открытие записи из ответа недоступно в личном кабинете.')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Открыть запись' })).not.toBeInTheDocument();
  });

  it('renders the queued answer once, with model blocks in order before sources', async () => {
    const content = 'Даты графика проверены.';
    const starts = { key: 'planned', label: 'Начало', value: { kind: 'date', value: '2026-12-03' } };
    const message: AiAssistantMessage = {
      id: 'answer-async', role: 'assistant', content,
      metadata: {
        contract_version: 1, decision_contract: 3, coverage: { status: 'partial' },
        source_refs: [{ entity_type: 'schedule', display_label: 'График корпуса' }],
        evidence: [{ source_ref: { entity_type: 'schedule', display_label: 'График корпуса' } }],
        presentation: { version: 1, blocks: [
          { id: 'answer', type: 'text', source_refs: [0], data: { text: content } },
          { id: 'lead', type: 'facts', source_refs: [0], data: { items: [starts] } },
          { id: 'stage', type: 'list', source_refs: [0], data: { items: [{ id: '1', title: 'Подготовительные работы' }] } },
          { id: 'cost', type: 'table', source_refs: [0], data: {
            columns: [{ key: 'amount', label: 'Итого' }],
            rows: [{ id: '1', cells: { amount: { kind: 'decimal', value: '1234567890123456789.70', currency: 'RUB', vat: 'included' } } }],
          } },
          { id: 'sources', type: 'sources', source_refs: [0], data: {} },
        ] },
      },
    };
    vi.mocked(aiAssistantService.chat).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status: 'running', stage: 'queued' });
    vi.mocked(aiAssistantService.getRequest).mockResolvedValue({
      request_id: 'uuid-request', conversation_id: '11', status: 'completed', stage: 'completed',
      response: { request_id: 'uuid-request', conversation_id: '11', message, credit_usage: { charged_minor: 50, available_after_minor: 499950 } },
    });
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Вопрос' } }); fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    const submit = await screen.findByRole('button', { name: 'Подтвердить и отправить' }); fireEvent.click(submit); fireEvent.click(submit);
    const answer = await screen.findByText(content);
    expect(screen.getAllByText(content)).toHaveLength(1);
    const coverage = screen.getByText('Проверена часть доступных данных.');
    const fact = screen.getByText('03.12.2026');
    const listItem = screen.getByText('Подготовительные работы');
    const table = screen.getByRole('table');
    const source = screen.getByText('График корпуса');
    expect(fact).toHaveAttribute('datetime', '2026-12-03');
    expect(screen.getByRole('columnheader', { name: 'Итого' })).toHaveAttribute('scope', 'col');
    expect(screen.getByRole('cell', { name: '1234567890123456789,70 RUB с НДС' })).toBeInTheDocument();
    const ordered = [answer, coverage, fact, listItem, table, source];
    ordered.slice(1).forEach((node, index) => {
      expect(ordered[index].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING).not.toBe(0);
    });
    expect(aiAssistantService.chat).toHaveBeenCalledTimes(1);
    expect(aiAssistantService.getRequest).toHaveBeenCalledWith('uuid-request', expect.any(AbortSignal));
  });
  it('keeps verified text and sources for unsupported or malformed historical blocks', async () => {
    const source = { source_type: 'project', project_id: 7, display_label: 'Корпус А' };
    const valid = { id: 'valid', type: 'list', source_refs: [0], data: { items: [{ id: '1', title: 'Совместимый блок' }] } };
    vi.mocked(aiAssistantService.getHistory).mockResolvedValue({
      items: [
        { id: 'mixed', role: 'assistant', content: 'Проверенные даты.', metadata: {
          contract_version: 1, decision_contract: 3, source_refs: [source],
          presentation: { version: 1, blocks: [
            { id: 'unsupported', type: 'timeline', data: { label: 'Неподдерживаемый блок' } },
            { id: 'malformed', type: 'facts', data: { items: [{ key: 'invalid', label: 'Неверный блок', value: { kind: 'text', value: {} } }] } },
            valid,
          ] },
        } },
        { id: 'unknown-version', role: 'assistant', content: 'Проверенный текст после обновления.', metadata: {
          contract_version: 1, decision_contract: 3, source_refs: [{ ...source, display_label: 'Корпус Б' }],
          presentation: { version: 2, blocks: [{ ...valid, data: { items: [{ id: '2', title: 'Несовместимая версия' }] } }] },
        } },
      ], meta: null,
    });
    render(<AiAssistantPage />);
    await selectFirst();
    expect(screen.getByText('Проверенные даты.')).toBeInTheDocument();
    expect(screen.getByText('Совместимый блок')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Открыть проект: Корпус А' })).toHaveAttribute('href', expect.stringContaining('/dashboard/projects/7'));
    expect(screen.getByText('Проверенный текст после обновления.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Открыть проект: Корпус Б' })).toBeInTheDocument();
    expect(screen.queryByText(/Неподдерживаемый блок|Неверный блок|Несовместимая версия/)).not.toBeInTheDocument();
  });

  it('shows one generic activity line and an elapsed timer for legacy progress', async () => {
    const progress = deferred<Awaited<ReturnType<typeof aiAssistantService.getRequest>>>();
    vi.mocked(aiAssistantService.chat).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status: 'running', stage: 'queued' });
    vi.mocked(aiAssistantService.getRequest).mockReturnValue(progress.promise);
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Вопрос' } }); fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Подтвердить и отправить' }));
    expect(await screen.findByText('В очереди')).toBeInTheDocument();
    expect(screen.getByText('Прошло 0 сек.')).toBeInTheDocument();
    expect(screen.queryByText('Запрос принят и ждёт обработки.')).not.toBeInTheDocument();
    progress.resolve({ request_id: 'uuid-request', conversation_id: '11', status: 'running', stage: 'reading' });
    expect(await screen.findByText('Анализирует данные')).toBeInTheDocument();
    expect(screen.queryByText(/Этапы:/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Формирует ответ/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Отменить запрос' }));
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });
  it('uses scoped Echo events to wake status polling and ignores another request', async () => {
    let realtimeHandler: ((payload: unknown) => void) | undefined;
    const channel = { listen: vi.fn((event: string, handler: (payload: unknown) => void) => { if (event === '.assistant.request.changed') realtimeHandler = handler; return channel; }), stopListening: vi.fn() };
    const echo = { private: vi.fn(() => channel), leave: vi.fn() };
    vi.mocked(getEcho).mockReturnValue(echo as never);
    vi.mocked(aiAssistantService.chat).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status: 'running', stage: 'queued' });
    vi.mocked(aiAssistantService.getRequest)
      .mockResolvedValueOnce({ request_id: 'uuid-request', conversation_id: '11', status: 'running', stage: 'generating', progress: [{ id: 1, code: 'estimates', state: 'started' }, { id: 2, code: 'estimates', state: 'completed' }] })
      .mockResolvedValueOnce({ request_id: 'uuid-request', conversation_id: '11', status: 'completed', response: { request_id: 'uuid-request', conversation_id: '11', message: { id: 'event-answer', role: 'assistant', content: 'Ответ после события' }, credit_usage: {} } });
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Вопрос' } }); fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Подтвердить и отправить' }));
    await waitFor(() => expect(realtimeHandler).toBeTypeOf('function'));
    expect(echo.private).toHaveBeenCalledWith('App.Models.User.7.lk.org.44');
    expect(await screen.findByText('Формирует ответ')).toBeInTheDocument();
    expect(screen.queryByText('Проверяю сметы')).not.toBeInTheDocument();
    expect(aiAssistantService.getRequest).toHaveBeenCalledTimes(1);
    act(() => realtimeHandler?.({ request_id: 'another-request' }));
    expect(aiAssistantService.getRequest).toHaveBeenCalledTimes(1);
    act(() => realtimeHandler?.({ request_id: 'uuid-request' }));
    expect(await screen.findByText('Ответ после события')).toBeInTheDocument();
    expect(aiAssistantService.getRequest).toHaveBeenCalledTimes(2);
    expect(channel.stopListening).toHaveBeenCalledWith('.assistant.request.changed', realtimeHandler);
    expect(echo.leave).not.toHaveBeenCalled();
  });
  it('follows long-running snapshots, replaces interim revisions and publishes the final answer once', async () => {
    let wake: ((payload: unknown) => void) | undefined;
    const channel = { listen: vi.fn((_event: string, handler: (payload: unknown) => void) => { wake = handler; return channel; }), stopListening: vi.fn() };
    vi.mocked(getEcho).mockReturnValueOnce({ private: () => channel } as never);
    const interim = {
      key: 'answer', revision: 1, text: 'Проверено две записи', scope: { kind: 'project', project_id: 72 },
      sources: [{ label: 'График работ' }], published_at: '2026-10-25T10:00:00Z',
    } as const;
    const running = { request_id: 'uuid-request', conversation_id: '11', status: 'running', stage: 'reading', elapsed_seconds: 75 };
    const recordCheck = { id: 1, key: 'records.internal-id', code: 'record_check', state: 'started' } as const;
    const finalText = 'Проверено три записи';
    vi.mocked(aiAssistantService.chat).mockResolvedValueOnce({ ...running, status: 'running' });
    vi.mocked(aiAssistantService.getRequest)
      .mockResolvedValueOnce({ ...running, progress: [recordCheck], interim_result: { ...interim, sources: [...interim.sources] } })
      .mockRejectedValueOnce(new Error('Соединение прервано'))
      .mockResolvedValueOnce({
        ...running, progress: [
          { ...recordCheck, id: 2, state: 'completed' },
          { id: 3, code: 'composing', key: 'composing.internal-id', state: 'failed' },
          { id: 4, code: 'estimate_position_search', key: 'position-search.internal-id', state: 'completed' },
          { id: 5, code: 'estimate_position_read', key: 'position-read.internal-id', state: 'started' },
        ],
        interim_result: { ...interim, revision: 2, text: finalText, sources: [] },
      })
      .mockResolvedValueOnce(running)
      .mockResolvedValueOnce({ ...running, interim_result: { ...interim, revision: 3, text: finalText, sources: [] } })
      .mockResolvedValueOnce({
        ...running, status: 'completed', run_status: 'completed',
        response: { result_key: 'answer', request_id: 'uuid-request', conversation_id: '11', message: { id: 'final', role: 'assistant', content: finalText }, credit_usage: {} },
      });
    render(<AiAssistantPage />);
    await selectFirst();
    await quoteQuestion('Проверьте график');
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить и отправить' }));

    const interimCard = await screen.findByRole('article', { name: 'Промежуточный результат' });
    expect(interimCard).toHaveTextContent('Данные проекта');
    expect(interimCard).toHaveTextContent('График работ');
    expect(interimCard).toHaveTextContent('Работа продолжается.');
    expect(await screen.findByText('Проверяю записи')).toBeInTheDocument();
    expect(screen.getByText('Прошло 1 мин 15 сек.')).toBeInTheDocument();
    const steps = screen.getByText('Этапы обработки');
    expect(steps.closest('details')).not.toHaveAttribute('open');
    steps.closest('details')?.setAttribute('open', '');
    expect(screen.getByText('Проверка записей · Выполняется')).toBeVisible();

    const notify = async () => act(async () => wake?.({ request_id: 'uuid-request' }));
    await notify();
    expect(aiAssistantService.getRequest).toHaveBeenCalledTimes(2);
    expect(screen.getByText(interim.text)).toBeInTheDocument();
    await notify();
    expect(await screen.findByText(finalText)).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Промежуточный результат' })).toBe(interimCard);
    expect(screen.queryByText(interim.text)).not.toBeInTheDocument();
    expect(screen.queryByText('Проверка записей · Выполняется')).not.toBeInTheDocument();
    expect(screen.getByText('Проверка записей · Завершён')).toBeVisible();
    expect(screen.getByText('Подготовка ответа · Не удалось завершить')).toBeVisible();
    expect(screen.getByText('Поиск позиций сметы · Завершён')).toBeVisible();
    expect(screen.getByText('Чтение позиции сметы · Выполняется')).toBeVisible();
    expect(screen.getByRole('status')).toHaveTextContent('Чтение позиции сметы');
    expect(document.body).not.toHaveTextContent('internal-id');

    await notify();
    expect(screen.queryByRole('article', { name: 'Промежуточный результат' })).not.toBeInTheDocument();
    await notify();
    expect(await screen.findByRole('article', { name: 'Промежуточный результат' })).toHaveTextContent(finalText);
    await notify();
    expect(screen.queryByRole('article', { name: 'Промежуточный результат' })).not.toBeInTheDocument();
    expect(screen.getAllByText(finalText)).toHaveLength(1);
    expect(screen.queryByText('Этапы обработки')).not.toBeInTheDocument();
    expect(aiAssistantService.chat).toHaveBeenCalledTimes(1);
  });

  it('restores server time and checked interim data and removes the card on cancellation', async () => {
    vi.mocked(aiAssistantService.getHistory).mockResolvedValueOnce({
      items: [],
      meta: { current_page: 1, last_page: 1, per_page: 30, total: 0, active_request: { request_id: 'restore-id', conversation_id: '11', status: 'running', stage: 'reading' } },
    });
    vi.mocked(aiAssistantService.getRequest).mockResolvedValueOnce({
      request_id: 'restore-id', conversation_id: '11', status: 'running', stage: 'reading',
      accepted_at: new Date(Date.now() - 90_000).toISOString(),
      interim_result: {
        key: 'answer', revision: 1, text: 'Проверен остаток', scope: { kind: 'organization' },
        sources: [], published_at: '2026-10-25T10:00:00Z',
      },
    });
    vi.mocked(aiAssistantService.cancelRequest).mockResolvedValueOnce({
      request_id: 'restore-id', conversation_id: '11', status: 'cancelled',
    });
    render(<AiAssistantPage />);
    await selectFirst();
    expect(await screen.findByRole('article', { name: 'Промежуточный результат' })).toHaveTextContent('Данные организации');
    expect(screen.getByText('Прошло 1 мин 30 сек.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Отменить запрос' }));
    expect(screen.queryByRole('article', { name: 'Промежуточный результат' })).not.toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent('Запрос отменён.');
    expect(aiAssistantService.cancelRequest).toHaveBeenCalledWith('restore-id');
    expect(aiAssistantService.chat).not.toHaveBeenCalled();
  });

  it('shows backend progress immediately and retains completed sources with a fast response', async () => {
    const progress = deferred<Awaited<ReturnType<typeof aiAssistantService.getRequest>>>();
    vi.mocked(aiAssistantService.chat).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status: 'running', stage: 'queued', progress: [{ id: 31, code: 'estimates', state: 'started' }] });
    vi.mocked(aiAssistantService.getRequest).mockReturnValue(progress.promise);
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Вопрос про бетон' } }); fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Подтвердить и отправить' }));
    expect(await screen.findByText('Проверяю сметы')).toBeInTheDocument();
    expect(screen.queryByText('В очереди')).not.toBeInTheDocument();
    const completedProgress: AiAssistantProgress[] = [{ id: 31, code: 'estimates', state: 'completed' }, { id: 32, code: 'warehouse', state: 'completed' }, { id: 33, code: 'warehouse', state: 'completed' }, { id: 34, code: 'projects', state: 'started' }];
    progress.resolve({ request_id: 'uuid-request', conversation_id: '11', status: 'completed', progress: completedProgress, response: { request_id: 'uuid-request', conversation_id: '11', message: { id: 'fast-answer', role: 'assistant', content: 'Ответ про бетон' }, credit_usage: {}, progress: completedProgress } });
    expect(await screen.findByText('Ответ про бетон')).toBeInTheDocument();
    expect(screen.getByText('Сметы проверены')).toBeInTheDocument();
    expect(screen.getAllByText('Склад проверен')).toHaveLength(1);
    expect(screen.queryByText('Проверяю проекты')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
  it('clears all progress UI after a synchronous greeting response and leaves input usable', async () => {
    vi.mocked(aiAssistantService.chat).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', message: { id: 'greeting', role: 'assistant', content: 'Привет' }, credit_usage: {} });
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Привет' } }); fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Подтвердить и отправить' }));
    expect(await screen.findByText('Привет')).toBeInTheDocument();
    const input = screen.getByLabelText('Вопрос помощнику');
    await waitFor(() => expect(input).toBeEnabled());
    expect(input).toHaveValue('');
    expect(screen.queryByRole('button', { name: 'Отменить запрос' })).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText('Ответ готов')).not.toBeInTheDocument();
    expect(screen.queryByRole('article', { name: 'Промежуточный результат' })).not.toBeInTheDocument();
    expect(screen.queryByText('Этапы обработки')).not.toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'Следующий вопрос' } });
    expect(screen.getByRole('button', { name: 'Рассчитать стоимость' })).toBeEnabled();
  });
  it('clears loading and terminal stage after a completed greeting status', async () => {
    vi.mocked(aiAssistantService.chat).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status: 'running', stage: 'queued' });
    vi.mocked(aiAssistantService.getRequest).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status: 'completed', stage: 'completed', response: { request_id: 'uuid-request', conversation_id: '11', message: { id: 'greeting-complete', role: 'assistant', content: 'Привет' }, credit_usage: {} } });
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Привет' } }); fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Подтвердить и отправить' }));
    expect(await screen.findByText('Привет')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Вопрос помощнику')).toBeEnabled());
    expect(screen.queryByText('Ответ готов')).not.toBeInTheDocument();
    expect(screen.queryByText(/Прошло/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Отменить запрос' })).not.toBeInTheDocument();
    expect(aiAssistantService.getRequest).toHaveBeenCalledTimes(1);
  });
  it('sends a zero-cost greeting quote immediately without confirmation', async () => {
    vi.mocked(aiAssistantService.getQuote).mockResolvedValue({ quote_id: 'free-greeting', min_units_minor: 0, max_units_minor: 0, expires_at: '2099-01-01T00:00:00Z', price_version: '1' });
    vi.mocked(aiAssistantService.chat).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status: 'running', stage: 'queued' });
    vi.mocked(aiAssistantService.getRequest).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status: 'completed', stage: 'completed', response: { request_id: 'uuid-request', conversation_id: '11', message: { id: 'greeting', role: 'assistant', content: 'Привет', metadata: { response_kind: 'greeting', validation_status: 'verified' } }, credit_usage: {} } });
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Привет' } }); fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    expect(await screen.findByText('Привет')).toBeInTheDocument();
    expect(aiAssistantService.chat).toHaveBeenCalledTimes(1);
    expect(aiAssistantService.chat).toHaveBeenCalledWith({ ...vi.mocked(aiAssistantService.getQuote).mock.calls[0][0], quote_id: 'free-greeting' }, expect.any(AbortSignal));
    expect(screen.queryByRole('button', { name: 'Подтвердить и отправить' })).not.toBeInTheDocument();
    expect(screen.queryByText(/Оценка расхода/)).not.toBeInTheDocument();
    expect(screen.queryByText('Подтверждено источниками')).not.toBeInTheDocument();
    expect(screen.queryByText('Подтверждено частично')).not.toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText('Вопрос помощнику')).toBeEnabled());
    expect(screen.queryByRole('button', { name: 'Отменить запрос' })).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText('Ответ готов')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Новый вопрос' } });
    expect(screen.getByRole('button', { name: 'Рассчитать стоимость' })).toBeEnabled();
  });
  it('keeps the draft and requires separate approval when processing invalidates a quote', async () => {
    vi.mocked(createAiAssistantRequestId).mockReturnValueOnce('previous-request').mockReturnValueOnce('current-request');
    vi.mocked(aiAssistantService.getQuote)
      .mockResolvedValueOnce({ quote_id: 'previous-quote', min_units_minor: 50, max_units_minor: 1150, expires_at: '2099-01-01T00:00:00Z', price_version: 'previous' })
      .mockResolvedValueOnce({ quote_id: 'current-quote', min_units_minor: 50, max_units_minor: 1700, expires_at: '2099-01-01T00:00:00Z', price_version: 'current' });
    const changed = Object.assign(new AssistantApiError('Способ обработки изменился. Обновите оценку и отправьте запрос снова.', 409), { status: 409, code: 'quote_execution_changed' });
    vi.mocked(aiAssistantService.chat).mockRejectedValueOnce(changed).mockResolvedValueOnce({ request_id: 'current-request', conversation_id: '11', message: { id: 'auto-result', role: 'assistant', content: 'Ответ готов.' }, credit_usage: {} });

    render(<AiAssistantPage />); await selectFirst();
    expect(screen.queryByLabelText('Подробность ответа')).not.toBeInTheDocument();
    await quoteQuestion('Мой вопрос');
    const input = { conversation_id: '11', message: 'Мой вопрос', allow_actions: false, context: {} };
    expect(aiAssistantService.getQuote).toHaveBeenNthCalledWith(1, { ...input, request_id: 'previous-request' });
    expect(aiAssistantService.chat).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить и отправить' }));
    expect(await screen.findByText(changed.message)).toBeInTheDocument();
    expect(screen.getByLabelText('Вопрос помощнику')).toHaveValue('Мой вопрос');
    expect(screen.queryByRole('button', { name: 'Подтвердить и отправить' })).not.toBeInTheDocument();
    expect(aiAssistantService.getQuote).toHaveBeenCalledTimes(1);
    expect(aiAssistantService.chat).toHaveBeenNthCalledWith(1, { ...input, request_id: 'previous-request', quote_id: 'previous-quote' }, expect.any(AbortSignal));
    expect(aiAssistantService.getRequest).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    const confirm = await screen.findByRole('button', { name: 'Подтвердить и отправить' });
    expect(screen.getByText(/Оценка расхода: от 0,5 до 17 ед\. МОСТ/)).toBeInTheDocument();
    expect(aiAssistantService.getQuote).toHaveBeenNthCalledWith(2, { ...input, request_id: 'current-request' });
    expect(aiAssistantService.chat).toHaveBeenCalledTimes(1);
    fireEvent.click(confirm);
    expect(await screen.findByText('Ответ готов.')).toBeInTheDocument();
    expect(aiAssistantService.chat).toHaveBeenNthCalledWith(2, { ...input, request_id: 'current-request', quote_id: 'current-quote' }, expect.any(AbortSignal));
  });
  it('recovers a lost POST acknowledgement through existing request ID without reposting', async () => {
    vi.mocked(aiAssistantService.chat).mockRejectedValue(new TypeError('Network error'));
    vi.mocked(aiAssistantService.getRequest).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status: 'completed', response: { request_id: 'uuid-request', conversation_id: '11', message: { id: 'recovered', role: 'assistant', content: 'Восстановленный ответ' }, credit_usage: {} } });
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Вопрос' } }); fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Подтвердить и отправить' }));
    expect(await screen.findByText('Восстановленный ответ')).toBeInTheDocument();
    expect(aiAssistantService.chat).toHaveBeenCalledTimes(1);
    expect(aiAssistantService.getRequest).toHaveBeenCalledWith('uuid-request', expect.any(AbortSignal));
  });

  it.each([
    { recover: false, status: 'cancelled', errorCode: 'request_cancelled', text: 'Запрос отменён.' },
    { recover: true, status: 'failed', errorCode: 'insufficient_credits', text: 'Недостаточно единиц МОСТ для выполнения запроса.' },
  ] as const)('stops observing when POST returns the existing $status request', async ({ recover, status, errorCode, text }) => {
    if (recover) {
      vi.mocked(aiAssistantService.chat).mockRejectedValueOnce(new Error('Соединение прервано'));
      vi.mocked(aiAssistantService.getRequest).mockResolvedValueOnce({ request_id: 'uuid-request', conversation_id: null, status: 'not_submitted' });
    }
    vi.mocked(aiAssistantService.chat).mockResolvedValueOnce({
      request_id: 'uuid-request', conversation_id: '11', status, run_status: status, stage: status, error_code: errorCode,
    });
    vi.mocked(aiAssistantService.getRequest).mockResolvedValue({
      request_id: 'uuid-request', conversation_id: '11', status: 'failed', error_code: 'unexpected_poll',
    });
    render(<AiAssistantPage />);
    await selectFirst();
    await quoteQuestion('Вопрос для повторной отправки');
    fireEvent.click(screen.getByRole('button', { name: 'Подтвердить и отправить' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(text);
    expect(aiAssistantService.chat).toHaveBeenCalledTimes(recover ? 2 : 1);
    expect(aiAssistantService.getRequest).toHaveBeenCalledTimes(recover ? 1 : 0);
    expect(screen.getByLabelText('Вопрос помощнику')).toHaveValue('Вопрос для повторной отправки');
    expect(screen.getByRole('button', { name: 'Рассчитать стоимость' })).toBeEnabled();
  });

  it('resends an unaccepted request with the same quote and refreshes chat titles and order', async () => {
    vi.mocked(aiAssistantService.chat).mockRejectedValueOnce(new TypeError('Network error'))
      .mockResolvedValueOnce({ request_id: 'uuid-request', conversation_id: '11', message: { id: 'retry-answer', role: 'assistant', content: 'Повтор принят' }, credit_usage: {} });
    vi.mocked(aiAssistantService.getRequest).mockResolvedValueOnce({ request_id: 'uuid-request', conversation_id: null, status: 'not_submitted', stage: 'not_submitted' });
    render(<AiAssistantPage />); await selectFirst();
    vi.mocked(aiAssistantService.getConversations).mockResolvedValueOnce({ items: [{ id: '12', user_id: '7', title: 'Второй' }, { id: '11', user_id: '7', title: 'Название после ответа' }], meta: null });
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Вопрос' } });
    fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Подтвердить и отправить' }));
    expect(await screen.findByText('Повтор принят')).toBeInTheDocument();
    expect(aiAssistantService.chat).toHaveBeenCalledTimes(2);
    expect(vi.mocked(aiAssistantService.chat).mock.calls[1][0]).toEqual(vi.mocked(aiAssistantService.chat).mock.calls[0][0]);
    expect(aiAssistantService.getQuote).toHaveBeenCalledTimes(1);
    await screen.findByRole('button', { name: 'Название после ответа' });
    const buttons = screen.getAllByRole('button');
    expect(buttons.indexOf(screen.getByRole('button', { name: 'Второй' }))).toBeLessThan(buttons.indexOf(screen.getByRole('button', { name: 'Название после ответа' })));
  });

  it('preserves the question and requires a new quote after an expired unaccepted request', async () => {
    vi.mocked(aiAssistantService.chat).mockRejectedValueOnce(new TypeError('Network error'));
    const expired = Object.assign(new AssistantApiError('expired', 404), { status: 404 });
    vi.mocked(aiAssistantService.getRequest).mockRejectedValueOnce(expired);
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Сохранённый вопрос' } });
    fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Подтвердить и отправить' }));
    await screen.findByText('Запрос не принят или оценка истекла. Рассчитайте стоимость снова.');
    expect(screen.getByLabelText('Вопрос помощнику')).toHaveValue('Сохранённый вопрос');
    expect(screen.getByRole('button', { name: 'Рассчитать стоимость' })).toBeEnabled();
    expect(aiAssistantService.chat).toHaveBeenCalledTimes(1);
  });
  it('releases pending poll on cancel and allows a new request', async () => {
    const cancel = deferred<Awaited<ReturnType<typeof aiAssistantService.cancelRequest>>>();
    vi.mocked(createAiAssistantRequestId).mockReturnValueOnce('uuid-first').mockReturnValueOnce('uuid-second');
    vi.mocked(aiAssistantService.chat)
      .mockResolvedValueOnce({ request_id: 'uuid-first', conversation_id: '11', status: 'running', stage: 'queued' })
      .mockResolvedValueOnce({ request_id: 'uuid-second', conversation_id: '11', status: 'running', stage: 'queued' });
    vi.mocked(aiAssistantService.getRequest)
      .mockResolvedValueOnce({ request_id: 'uuid-first', conversation_id: '11', status: 'running', stage: 'reading' })
      .mockResolvedValueOnce({ request_id: 'uuid-second', conversation_id: '11', status: 'completed', response: { request_id: 'uuid-second', conversation_id: '11', message: { id: 'after-cancel', role: 'assistant', content: 'Ответ после отмены' }, credit_usage: {} } });
    vi.mocked(aiAssistantService.cancelRequest).mockReturnValue(cancel.promise);
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Первый вопрос' } }); fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Подтвердить и отправить' }));
    await screen.findByText('Анализирует данные');
    fireEvent.click(screen.getByRole('button', { name: 'Отменить запрос' }));
    await waitFor(() => expect(aiAssistantService.cancelRequest).toHaveBeenCalledWith('uuid-first'));
    cancel.resolve({ request_id: 'uuid-first', conversation_id: '11', status: 'cancelled' });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Рассчитать стоимость' })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Подтвердить и отправить' }));
    expect(await screen.findByText('Ответ после отмены')).toBeInTheDocument();
    expect(aiAssistantService.chat).toHaveBeenCalledTimes(2);
    expect(aiAssistantService.getRequest).toHaveBeenLastCalledWith('uuid-second', expect.any(AbortSignal));
  });
  it.each(['failed', 'cancelled'] as const)('shows safe terminal state for %s request', async (status) => {
    vi.mocked(aiAssistantService.chat).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status: 'running', stage: 'queued' });
    vi.mocked(aiAssistantService.getRequest).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status, error_code: 'internal_error' });
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Вопрос' } }); fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Подтвердить и отправить' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(status === 'failed' ? 'Не удалось завершить запрос.' : 'Запрос отменён.');
  });
  it('requires server preview before confirming a proposed mutation', async () => {
    const action = { tool_name: 'update_project', arguments: { project_id: 3, title: 'Новое' }, label: 'Название' };
    vi.mocked(aiAssistantService.getHistory).mockResolvedValue({ items: [{ id: 'answer', role: 'assistant', content: 'Предлагаю изменение', metadata: { proposed_actions: [action], validation_status: 'verified', source_refs: [{ title: 'Проект', navigation: { url: '/dashboard/projects/3' }, fetched_at: '2026-09-29T00:00:00Z' }] } }], meta: null });
    const preview = { title: 'Новое название', action: { id: 'prepared' }, preview_token: 'token', expires_at: '2099-01-01', before: { title: 'Старое' }, after: { title: 'Новое' } };
    vi.mocked(aiAssistantService.previewAction).mockResolvedValue(preview);
    vi.mocked(aiAssistantService.executeAction).mockResolvedValue({ message: 'Готово' });
    render(<AiAssistantPage />); await selectFirst();
    expect(screen.getByRole('link', { name: 'Открыть проект: Проект' })).toHaveAttribute('href', expect.stringContaining('/dashboard/projects/3'));
    fireEvent.click(screen.getByRole('button', { name: 'Проверить действие: Название' }));
    await screen.findByRole('button', { name: 'Подтверждаю изменение' });
    expect(aiAssistantService.previewAction).toHaveBeenCalledWith('11', action);
    expect(aiAssistantService.executeAction).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Подтверждаю изменение' }));
    await waitFor(() => expect(aiAssistantService.executeAction).toHaveBeenCalledWith('11', preview));
  });
  it('can close the preview locally and waits for server confirmation to cancel a prepared action', async () => {
    const action = { tool_name: 'update_project', arguments: { project_id: 3, title: 'Новое' }, label: 'Название' };
    const preview = { title: 'Новое название', action: { id: 'prepared' }, preview_token: 'token', expires_at: '2099-01-01' };
    vi.mocked(aiAssistantService.getHistory).mockResolvedValue({ items: [{
      id: 'answer', role: 'assistant', content: 'Предлагаю изменение', metadata: { proposed_actions: [action] },
    }], meta: null });
    vi.mocked(aiAssistantService.previewAction).mockResolvedValue(preview);
    const cancellation = deferred<void>();
    vi.mocked(aiAssistantService.cancelAction)
      .mockRejectedValueOnce(new Error('Не удалось отменить действие.'))
      .mockReturnValueOnce(cancellation.promise);
    render(<AiAssistantPage />);
    await selectFirst();

    const open = screen.getByRole('button', { name: 'Проверить действие: Название' });
    fireEvent.click(open);
    fireEvent.click(await screen.findByRole('button', { name: 'Закрыть предпросмотр' }));
    expect(screen.queryByText(preview.title)).not.toBeInTheDocument();
    expect(aiAssistantService.cancelAction).not.toHaveBeenCalled();

    fireEvent.click(open);
    fireEvent.click(await screen.findByRole('button', { name: 'Отменить действие' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось отменить действие.');
    expect(screen.getByText(preview.title)).toBeInTheDocument();

    const retry = screen.getByRole('button', { name: 'Отменить действие' });
    expect(retry).toBeEnabled();
    fireEvent.click(retry);
    fireEvent.click(retry);
    expect(screen.getByText(preview.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Подтверждаю изменение' })).toBeDisabled();
    expect(aiAssistantService.cancelAction).toHaveBeenCalledTimes(2);
    expect(aiAssistantService.cancelAction).toHaveBeenLastCalledWith('11', preview);
    expect(aiAssistantService.executeAction).not.toHaveBeenCalled();

    await act(async () => cancellation.resolve(undefined));
    expect(screen.queryByText(preview.title)).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
  it('formats hundredths and rejects unsafe source navigation', () => {
    expect(assistantUnits(125)).toBe('1,25');
    expect(assistantSourceUrl('javascript:alert(1)')).toBeUndefined();
    expect(assistantSourceUrl('https://untrusted.example/')).toBeUndefined();
    expect(assistantSourceUrl('/dashboard/projects/3')).toContain('/dashboard/projects/3');
    expect(assistantSourceUrl('/projects/550e8400-e29b-41d4-a716-446655440000')).toContain('/dashboard/projects/550e8400-e29b-41d4-a716-446655440000');
    expect(assistantSourceUrl('/tenders')).toBeUndefined();
    expect(assistantSourceUrl('/report-templates', 'not/a/project')).toBeUndefined();
    expect(assistantSourceUrl('https://untrusted.example/', '3')).toBeUndefined();
  });

  it('hides technical message metadata but keeps safe project links', async () => {
    vi.mocked(aiAssistantService.getHistory).mockResolvedValue({ items: [{ id: 'preview', role: 'assistant', content: 'Ответ', metadata: { validation_status: 'partial', fetched_at: '2026-09-29T00:00:00Z', financial_provenance: { source: 'internal' }, source_refs: [{ title: 'Проект', source_type: 'projects', entity_id: 8, excerpt: 'служебный фрагмент', provenance: 'internal', fetched_at: '2026-09-29T00:00:00Z', navigation: { url: '/dashboard/projects/8' } }, { title: 'Шаблон отчёта', source_type: 'report_templates', entity_id: 9, excerpt: 'Скрытый фрагмент', navigation: { url: '/report-templates' } }] } }], meta: null });
    render(<AiAssistantPage />);
    await selectFirst();
    expect(await screen.findByRole('link', { name: 'Открыть проект: Проект' })).toHaveAttribute('href', expect.stringContaining('/dashboard/projects/8'));
    expect(screen.queryByText('частично')).not.toBeInTheDocument();
    expect(screen.queryByText(/Данные получены/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Происхождение финансовых данных/)).not.toBeInTheDocument();
    expect(screen.queryByText('служебный фрагмент')).not.toBeInTheDocument();
    expect(screen.queryByText('Скрытый фрагмент')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Шаблон отчёта/ })).not.toBeInTheDocument();
    expect(screen.queryByText('Вам доступно чтение этого чата.')).not.toBeInTheDocument();
  });
});
