import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AiAssistantCitation from './AiAssistantCitation';
import { aiAssistantService } from '@/services/aiAssistantService';
import type { AiAssistantSourcePreview } from '@/types/aiAssistant';

vi.mock('@/services/aiAssistantService', () => ({ aiAssistantService: { getSourcePreview: vi.fn() } }));
const source = { entity_type: 'assistant_document', entity_id: 159, project_id: 52, document_id: 159, unit_id: 4, chunk_id: 219753, chunk_index: 0 };
const props = { conversationId: '11', messageId: '22', sourceIndex: 1, source, version: 'ordinary-publication-locator/1' };
const preview: AiAssistantSourcePreview = { message_id: '22', source_index: 1, source, kind: 'source_chunk_preview', title: 'Документ', content: '<script>Недоверенный текст</script>', content_range: { offset: 0, length: 44, total_length: 80, truncated: true } };
const deferred = <T,>() => { let resolve!: (value: T) => void; const promise = new Promise<T>((done) => { resolve = done; }); return { promise, resolve }; };
afterEach(() => { cleanup(); vi.resetAllMocks(); });

describe('document citation', () => {
  it('loads only on explicit click, uses original public index and renders content as plain text', async () => {
    const pending = deferred<AiAssistantSourcePreview>();
    vi.mocked(aiAssistantService.getSourcePreview).mockReturnValue(pending.promise);
    const { container } = render(<AiAssistantCitation {...props} />);
    expect(aiAssistantService.getSourcePreview).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Открыть источник' }));
    expect(screen.getByRole('status')).toHaveTextContent('Загружаем источник');
    expect(aiAssistantService.getSourcePreview).toHaveBeenCalledWith('11', '22', 1, expect.any(AbortSignal));
    await act(async () => { pending.resolve(preview); });
    expect(await screen.findByText(preview.content)).toBeInTheDocument();
    expect(container.querySelector('script')).toBeNull();
    expect(screen.getByText('Показано начало фрагмента.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Закрыть источник' }));
    expect(screen.queryByText(preview.content)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Открыть источник' }));
    await waitFor(() => expect(aiAssistantService.getSourcePreview).toHaveBeenCalledTimes(2));
  });

  it('shows unavailable source without stale content and allows an explicit retry', async () => {
    vi.mocked(aiAssistantService.getSourcePreview).mockRejectedValueOnce(new Error('Forbidden')).mockResolvedValueOnce(preview);
    render(<AiAssistantCitation {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Открыть источник' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Источник недоступен');
    expect(screen.queryByText(preview.content)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
    expect(await screen.findByText(preview.content)).toBeInTheDocument();
  });

  it('aborts and hides a previous conversation response', async () => {
    const pending = deferred<AiAssistantSourcePreview>();
    vi.mocked(aiAssistantService.getSourcePreview).mockReturnValue(pending.promise);
    const { rerender } = render(<AiAssistantCitation {...props} />);
    fireEvent.click(screen.getByRole('button', { name: 'Открыть источник' }));
    const signal = vi.mocked(aiAssistantService.getSourcePreview).mock.calls[0][3];
    rerender(<AiAssistantCitation {...props} conversationId="12" />);
    expect(signal?.aborted).toBe(true);
    await act(async () => { pending.resolve(preview); });
    expect(screen.queryByText(preview.content)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Открыть источник' })).toBeInTheDocument();
  });

  it('does not offer a preview for legacy, project-only or incomplete locators', () => {
    const { rerender } = render(<AiAssistantCitation {...props} version={undefined} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(<AiAssistantCitation {...props} source={{ entity_type: 'project', entity_id: 52, project_id: 52 }} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(<AiAssistantCitation {...props} source={{ ...source, chunk_id: undefined }} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(aiAssistantService.getSourcePreview).not.toHaveBeenCalled();
  });
});
