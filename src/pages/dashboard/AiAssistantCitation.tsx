import { useEffect, useId, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { aiAssistantService } from '@/services/aiAssistantService';
import type { AiAssistantSource, AiAssistantSourcePreview } from '@/types/aiAssistant';

export const isDocumentCitation = (source: AiAssistantSource, version?: string): boolean =>
  version === 'ordinary-publication-locator/1' && source.entity_type === 'assistant_document'
  && [source.document_id, source.unit_id, source.chunk_id, source.project_id].every((id) => typeof id === 'number' && Number.isSafeInteger(id) && id > 0)
  && source.entity_id === source.document_id;

type PreviewState = { key: string; loading: boolean; preview?: AiAssistantSourcePreview; error?: string };

export default function AiAssistantCitation({ conversationId, messageId, sourceIndex, source, version }: {
  conversationId: string; messageId: string; sourceIndex: number; source: AiAssistantSource; version?: string;
}) {
  const [state, setState] = useState<PreviewState | null>(null);
  const controller = useRef<AbortController | null>(null);
  const regionId = useId();
  const key = JSON.stringify([conversationId, messageId, sourceIndex, source, version]);
  const active = state?.key === key ? state : null;
  useEffect(() => () => { controller.current?.abort(); }, [key]);

  const load = async () => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setState({ key, loading: true });
    try {
      const preview = await aiAssistantService.getSourcePreview(conversationId, messageId, sourceIndex, current.signal);
      if (!current.signal.aborted) setState({ key, loading: false, preview });
    } catch {
      if (!current.signal.aborted) setState({ key, loading: false, error: 'Источник недоступен. Возможно, права доступа или документ изменились.' });
    }
  };

  if (!isDocumentCitation(source, version)) return null;

  return <div className="mt-3 space-y-2 text-sm">
    <Button size="sm" variant="outline" aria-expanded={active !== null} aria-controls={regionId} onClick={() => {
      if (active) { controller.current?.abort(); setState(null); } else { void load(); }
    }}>{active ? 'Закрыть источник' : 'Открыть источник'}</Button>
    {active && <section id={regionId} aria-label="Фрагмент источника" className="space-y-2 rounded-md border bg-background p-3">
      {active.loading && <p role="status">Загружаем источник…</p>}
      {active.error && <><p role="alert">{active.error}</p><Button size="sm" variant="outline" onClick={() => void load()}>Повторить загрузку</Button></>}
      {active.preview && <><h4 className="break-words font-medium">{active.preview.title || 'Фрагмент документа'}</h4>
        <p className="whitespace-pre-wrap break-words">{active.preview.content}</p>
        {active.preview.content_range.truncated && <p className="text-xs text-muted-foreground">Показано начало фрагмента.</p>}
      </>}
    </section>}
  </div>;
}
