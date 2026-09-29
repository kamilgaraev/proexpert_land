import { fireEvent, render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AiAssistantPage, { assistantSourceUrl, assistantUnits } from './AiAssistantPage';
import { aiAssistantService } from '@/services/aiAssistantService';
vi.mock('./AiAssistantCoveragePanel', () => ({ default: () => null }));
vi.mock('@/hooks/usePermissions', () => ({ useCanAccess: () => false }));
vi.mock('@/contexts/AuthContext', async () => ({ AuthContext: (await import('react')).createContext({ user: { id: 7 } }) }));
vi.mock('@/services/aiAssistantService', () => ({ AssistantApiError: class extends Error {}, createAiAssistantRequestId: () => 'uuid-request', aiAssistantService: { getConversations: vi.fn(), getMemory: vi.fn(), getBalance: vi.fn(), getUsage: vi.fn(), getHistory: vi.fn(), getParticipants: vi.fn(), getQuote: vi.fn(), chat: vi.fn(), cancelRequest: vi.fn(), getRequest: vi.fn(), previewAction: vi.fn(), executeAction: vi.fn() } }));
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
    expect(aiAssistantService.chat).toHaveBeenCalledWith({ ...vi.mocked(aiAssistantService.getQuote).mock.calls[0][0], quote_id: 'quote' }, expect.any(AbortSignal));
    fireEvent.click(screen.getByRole('button', { name: 'Отменить запрос' }));
    await waitFor(() => expect(aiAssistantService.cancelRequest).toHaveBeenCalledWith('uuid-request'));
    chat.resolve({ request_id: 'uuid-request', conversation_id: '11', message: { id: 'late', role: 'assistant', content: 'Поздний ответ' }, credit_usage: { charged_minor: 50, reserved_minor: 0, available_after_minor: 499950 } });
    await waitFor(() => expect(screen.queryByText('Поздний ответ')).not.toBeInTheDocument());
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

  it('shows source preview instead of linking an admin-only route in the cabinet', async () => {
    vi.mocked(aiAssistantService.getHistory).mockResolvedValue({ items: [{ id: 'preview', role: 'assistant', content: 'Ответ', metadata: { source_refs: [{ title: 'Шаблон отчёта', source_type: 'report_templates', entity_id: 8, excerpt: 'Настройка отчёта', navigation: { url: '/report-templates' } }] } }], meta: null });
    render(<AiAssistantPage />);
    await selectFirst();
    expect(await screen.findByText('Шаблон отчёта')).toBeInTheDocument();
    expect(screen.getByText('Предпросмотр источника')).toBeInTheDocument();
    expect(screen.getByText('Настройка отчёта')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Шаблон отчёта/ })).not.toBeInTheDocument();
  });
});
