import { act, fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AiAssistantPage, { assistantSourceUrl, assistantUnits } from './AiAssistantPage';
import { aiAssistantService } from '@/services/aiAssistantService';
import getEcho from '@/services/echo';
import { createAiAssistantRequestId } from '@/services/aiAssistantService';
import type { AiAssistantProgress } from '@/types/aiAssistant';
vi.mock('./AiAssistantCoveragePanel', () => ({ default: () => null }));
vi.mock('@/hooks/usePermissions', () => ({ useCanAccess: () => false }));
vi.mock('@/contexts/AuthContext', async () => ({ AuthContext: (await import('react')).createContext({ user: { id: 7, current_organization_id: 44 } }) }));
vi.mock('@/services/aiAssistantService', () => ({ AssistantApiError: class extends Error {}, createAiAssistantRequestId: vi.fn(() => 'uuid-request'), aiAssistantService: { getConversations: vi.fn(), getMemory: vi.fn(), getBalance: vi.fn(), getUsage: vi.fn(), getHistory: vi.fn(), getParticipants: vi.fn(), getQuote: vi.fn(), chat: vi.fn(), cancelRequest: vi.fn(), getRequest: vi.fn(), previewAction: vi.fn(), executeAction: vi.fn() } }));
vi.mock('@/services/echo', () => ({ default: vi.fn() }));
const deferred = <T,>() => { let resolve!: (value: T) => void; const promise = new Promise<T>((done) => { resolve = done; }); return { promise, resolve }; };
beforeEach(() => {
  vi.mocked(aiAssistantService.getConversations).mockResolvedValue({ items: [{ id: '11', user_id: '7', title: 'Первый' }, { id: '12', user_id: '7', title: 'Второй' }], meta: null });
  vi.mocked(aiAssistantService.getMemory).mockResolvedValue([]);
  vi.mocked(aiAssistantService.getBalance).mockResolvedValue({ included_minor: 500000, purchased_minor: 0, available_minor: 500000, reserved_minor: 0, total_minor: 500000, packs: [], charging_enabled: false });
  vi.mocked(aiAssistantService.getUsage).mockResolvedValue({ billing_contract_version: 2, limiting_resource: 'organization_ai_credits', usage_kind: 'statistics', monthly_limit: null, remaining: null, percentage_used: null, used: 12, tokens_used: 960, cost_rub: 1.2 });
  vi.mocked(aiAssistantService.getParticipants).mockResolvedValue([]);
  vi.mocked(aiAssistantService.getHistory).mockResolvedValue({ items: [], meta: null });
  vi.mocked(aiAssistantService.getQuote).mockResolvedValue({ quote_id: 'quote', min_units_minor: 50, max_units_minor: 200, expires_at: '2099-01-01T00:00:00Z', profile: 'normal', price_version: '1' });
});
afterEach(() => { cleanup(); vi.clearAllMocks(); });
const selectFirst = async () => { await screen.findByRole('button', { name: 'Первый' }); fireEvent.click(screen.getByRole('button', { name: 'Первый' })); await screen.findByLabelText('Вопрос помощнику'); };
describe('AiAssistantPage', () => {
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
  it('polls accepted request to completion once and renders its complete response', async () => {
    vi.mocked(aiAssistantService.chat).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status: 'running', stage: 'queued' });
    vi.mocked(aiAssistantService.getRequest).mockResolvedValue({ request_id: 'uuid-request', conversation_id: '11', status: 'completed', stage: 'completed', response: { request_id: 'uuid-request', conversation_id: '11', message: { id: 'answer-async', role: 'assistant', content: 'Асинхронный ответ' }, credit_usage: { charged_minor: 50, available_after_minor: 499950 } } });
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Вопрос' } }); fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    const submit = await screen.findByRole('button', { name: 'Подтвердить и отправить' }); fireEvent.click(submit); fireEvent.click(submit);
    expect(await screen.findByText('Асинхронный ответ')).toBeInTheDocument();
    expect(aiAssistantService.chat).toHaveBeenCalledTimes(1);
    expect(aiAssistantService.getRequest).toHaveBeenCalledWith('uuid-request', expect.any(AbortSignal));
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
    expect(screen.queryByRole('button', { name: 'Отменить запрос' })).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.queryByText('Ответ готов')).not.toBeInTheDocument();
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
    vi.mocked(aiAssistantService.getQuote).mockResolvedValue({ quote_id: 'free-greeting', min_units_minor: 0, max_units_minor: 0, expires_at: '2099-01-01T00:00:00Z', profile: 'normal', price_version: '1' });
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
  it('shows the server deadline only for a detailed quote', async () => {
    vi.mocked(aiAssistantService.getQuote).mockResolvedValue({ quote_id: 'detailed-quote', min_units_minor: 50, max_units_minor: 200, expires_at: '2099-01-01T00:00:00Z', profile: 'detailed', price_version: '1', metadata: { processing_deadline_seconds: 630 } });
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Подробность ответа'), { target: { value: 'detailed' } });
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Вопрос' } });
    fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    expect(await screen.findByText('Подробный анализ: ожидание до 10 мин 30 сек.')).toBeInTheDocument();
    expect(screen.getByText(/Оценка расхода/)).toBeInTheDocument();
  });
  it('does not show the optional deadline for a normal quote', async () => {
    vi.mocked(aiAssistantService.getQuote).mockResolvedValue({ quote_id: 'normal-quote', min_units_minor: 50, max_units_minor: 200, expires_at: '2099-01-01T00:00:00Z', profile: 'normal', price_version: '1', metadata: { processing_deadline_seconds: 630 } });
    render(<AiAssistantPage />); await selectFirst();
    fireEvent.change(screen.getByLabelText('Вопрос помощнику'), { target: { value: 'Вопрос' } });
    fireEvent.click(screen.getByRole('button', { name: 'Рассчитать стоимость' }));
    expect(await screen.findByText(/Оценка расхода/)).toBeInTheDocument();
    expect(screen.queryByText(/Подробный анализ: ожидание/)).not.toBeInTheDocument();
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
