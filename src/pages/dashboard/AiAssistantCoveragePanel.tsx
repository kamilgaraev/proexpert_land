import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { aiAssistantService } from '@/services/aiAssistantService';
import type { AiAssistantDocumentSettings, AiAssistantRagStatus } from '@/types/aiAssistant';
const units = (minor: number) => (minor / 100).toLocaleString('ru-RU', { maximumFractionDigits: 2 });
const sourceNames: Record<string, string> = { projects: 'Проекты', estimates: 'Сметы', contracts: 'Договоры', files: 'Файлы', documents: 'Документы', materials: 'Материалы', work_schedules: 'Графики работ', completed_works: 'Выполненные работы' };
export const assistantOcrLimit = (value: string): number | null => {
  const text = value.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(text)) return null;
  const [whole, decimal = ''] = text.split('.');
  const minor = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
  return Number.isSafeInteger(minor) && minor <= 1000000000 ? minor : null;
};
const AiAssistantCoveragePanel = () => {
  const [status, setStatus] = useState<AiAssistantRagStatus | null>(null);
  const [settings, setSettings] = useState<AiAssistantDocumentSettings | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [scope, setScope] = useState<'new' | 'archive'>('new');
  const [limit, setLimit] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setBusy(true); setError('');
    void aiAssistantService.getRagStatus(controller.signal).then(async (result) => {
      if (controller.signal.aborted) return;
      setStatus(result);
      if (result.can_manage_document_settings) {
        const budget = await aiAssistantService.getDocumentSettings(controller.signal);
        if (controller.signal.aborted) return;
        setSettings(budget); setEnabled(budget.enabled); setScope(budget.scope); setLimit(String(budget.limit_minor / 100)); setConfirmed(false);
      } else setSettings(null);
    }).catch((reason: unknown) => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Не удалось проверить состояние документов.'); })
      .finally(() => { if (!controller.signal.aborted) setBusy(false); });
    return () => controller.abort();
  }, [version]);
  const save = async () => {
    const minor = assistantOcrLimit(limit);
    if (!confirmed || busy || !status?.can_manage_document_settings || minor === null) return;
    if (settings && minor < settings.spent_minor + settings.reserved_minor) { setError('Лимит не может быть меньше уже потраченных и зарезервированных кредитов.'); return; }
    setBusy(true); setError('');
    try { const saved = await aiAssistantService.setDocumentSettings({ enabled, scope, limit_minor: minor }); setSettings(saved); setConfirmed(false); setVersion((value) => value + 1); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось сохранить бюджет.'); }
    finally { setBusy(false); }
  };
  const documents = status?.document_coverage;
  const archive = status?.archive_scan;
  return <Card><CardContent className="space-y-3 p-4"><div className="flex items-center justify-between gap-2"><p className="font-medium">Готовность данных</p><Button size="sm" variant="ghost" disabled={busy} onClick={() => setVersion((value) => value + 1)}>Обновить</Button></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}{!status ? <p className="text-xs text-muted-foreground">{busy ? 'Проверяем данные…' : 'Состояние пока неизвестно.'}</p> : <>
    <p className="text-sm">{!status.enabled ? 'Поиск по данным отключён.' : status.coverage_complete && status.eligible_count_known ? 'Все доступные источники обработаны.' : status.processing ? 'Источники обрабатываются.' : 'Часть данных может отсутствовать в поиске.'}</p>
    <p className="text-xs">Источники: {status.eligible_count_known && status.indexed_source_count !== null && status.expected_source_count !== null ? `${status.indexed_source_count} из ${status.expected_source_count}` : 'полнота пока неизвестна'}. Ожидают: {status.pending_source_count ?? 'неизвестно'}. Устарели: {status.stale_source_count ?? 'неизвестно'}.</p>
    {status.lag_seconds !== null && <p className="text-xs">Задержка обновления: {status.lag_seconds} с.{status.lag_exceeded && ' Данные требуют обновления.'}</p>}
    {!!status.source_catalog?.length && <details className="text-xs"><summary>Покрытие разделов</summary>{status.source_catalog.map((source) => <p key={source.type}>{sourceNames[source.type] ?? 'Данные организации'}: {source.indexed_count ?? '—'} из {source.expected_count ?? '—'}{!source.enabled && ' · отключён'}{source.error && ' · ошибка обработки'}</p>)}</details>}
    {documents ? <div className="space-y-1 text-xs"><p className="font-medium">Документы: готово {documents.ready} из {documents.total}</p><p>Ожидают обработки: {documents.pending}. Нужно распознавание: {documents.ocr_required}. Распознаются: {documents.ocr_processing}.</p><p>Ошибки: {documents.failed}. Формат не поддерживается: {documents.unsupported}. Пустые: {documents.empty}.</p><p>Обработано фрагментов: {documents.processed_units}. Распознано страниц: {documents.ocr_completed_pages} из {documents.total_pages}.</p></div> : <p className="text-xs">Покрытие документов пока неизвестно.</p>}
    {archive && <p className="text-xs">Архив: проверено {archive.scanned_file_count ?? '—'} из {archive.expected_file_count ?? '—'} файлов. {archive.processing ? 'Проверка продолжается.' : archive.completed_at ? `Проверка завершена ${new Date(archive.completed_at).toLocaleString('ru-RU')}.` : 'Проверка ещё не завершена.'}</p>}
    {status.can_manage_document_settings && settings && <form className="space-y-2 border-t pt-3" onSubmit={(event) => { event.preventDefault(); void save(); }}><p className="text-sm font-medium">Бюджет распознавания</p><p className="text-xs">Потрачено: {units(settings.spent_minor)} ед. · зарезервировано: {units(settings.reserved_minor)} ед. · осталось: {units(settings.available_minor)} ед.</p><label className="block text-xs"><input type="checkbox" checked={enabled} disabled={busy} onChange={(event) => { setEnabled(event.target.checked); setConfirmed(false); }} /> Разрешить фоновое распознавание</label><label className="block text-xs">Документы <select aria-label="Область распознавания" value={scope} disabled={busy} onChange={(event) => { setScope(event.target.value === 'archive' ? 'archive' : 'new'); setConfirmed(false); }}><option value="new">Только новые</option><option value="archive">Новые и архив</option></select></label><label className="block text-xs" htmlFor="assistant-ocr-limit">Общий лимит, единиц</label><input id="assistant-ocr-limit" className="w-full rounded border bg-background p-2 text-sm" value={limit} inputMode="decimal" disabled={busy} onChange={(event) => { setLimit(event.target.value); setConfirmed(false); }} /><p className="text-xs">Распознавание расходует кредиты в пределах подтверждённого лимита.</p><label className="block text-xs"><input type="checkbox" checked={confirmed} disabled={busy} onChange={(event) => setConfirmed(event.target.checked)} /> Подтверждаю бюджет и область обработки</label><Button size="sm" type="submit" disabled={busy || !confirmed || assistantOcrLimit(limit) === null}>Сохранить бюджет</Button></form>}
  </>}</CardContent></Card>;
};
export default AiAssistantCoveragePanel;
