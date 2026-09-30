import { useContext, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { aiAssistantService } from '@/services/aiAssistantService';
import { AuthContext } from '@/contexts/AuthContext';
import type { AiAssistantDocumentSettings, AiAssistantRagStatus } from '@/types/aiAssistant';
const statusRetryDelays = [1500, 3000, 5000] as const;
const statusRetryWindow = 90_000;
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
  const { user } = useContext(AuthContext);
  const scopeKey = `${user?.id ?? 'guest'}:${user?.current_organization_id ?? 'none'}`;
  const [status, setStatus] = useState<AiAssistantRagStatus | null>(null);
  const [statusScope, setStatusScope] = useState('');
  const [settings, setSettings] = useState<AiAssistantDocumentSettings | null>(null);
  const [settingsScope, setSettingsScope] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [scope, setScope] = useState<'new' | 'archive'>('new');
  const [limit, setLimit] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [statusRetrying, setStatusRetrying] = useState(false);
  const [error, setError] = useState('');
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let retryResolver: (() => void) | undefined;
    const deadlineTimer = setTimeout(() => {
      controller.abort();
      retryResolver?.();
    }, statusRetryWindow);
    const waitForRetry = (delay: number) => new Promise<void>((resolve) => {
      retryResolver = resolve;
      retryTimer = setTimeout(() => {
        retryTimer = undefined;
        retryResolver = undefined;
        resolve();
      }, delay);
    });
    const isCurrent = () => active && !controller.signal.aborted;
    const startedAt = Date.now();
    setBusy(true); setError(''); setStatusRetrying(false);
    void (async () => {
      try {
        let result = await aiAssistantService.getRagStatus(controller.signal);
        if (!isCurrent()) return;
        setStatus(result); setStatusScope(scopeKey); setBusy(false);
        let attempt = 0;
        while (!result.status_available) {
          const remaining = statusRetryWindow - (Date.now() - startedAt);
          if (remaining <= 0) break;
          setStatusRetrying(true);
          await waitForRetry(Math.min(statusRetryDelays[attempt] ?? 5000, remaining));
          if (!isCurrent()) return;
          result = await aiAssistantService.getRagStatus(controller.signal);
          if (!isCurrent()) return;
          setStatus(result); setStatusScope(scopeKey); attempt++;
        }
        setStatusRetrying(false);
        if (result.can_manage_document_settings) {
          setBusy(true);
          const budget = await aiAssistantService.getDocumentSettings(controller.signal);
          if (!isCurrent()) return;
          setSettings(budget); setSettingsScope(scopeKey); setEnabled(budget.enabled); setScope(budget.scope); setLimit(String(budget.limit_minor / 100)); setConfirmed(false);
        } else {
          setSettings(null); setSettingsScope(scopeKey);
        }
      } catch (reason: unknown) {
        if (isCurrent()) setError(reason instanceof Error ? reason.message : 'Не удалось проверить состояние документов.');
      } finally {
        clearTimeout(deadlineTimer);
        if (retryTimer) clearTimeout(retryTimer);
        retryResolver?.();
        if (active) { setBusy(false); setStatusRetrying(false); }
      }
    })();
    return () => {
      active = false;
      controller.abort();
      clearTimeout(deadlineTimer);
      if (retryTimer) clearTimeout(retryTimer);
      retryResolver?.();
    };
  }, [version, scopeKey]);
  const visibleStatus = statusScope === scopeKey ? status : null;
  const visibleSettings = settingsScope === scopeKey ? settings : null;
  const save = async () => {
    const minor = assistantOcrLimit(limit);
    if (!confirmed || busy || !visibleStatus?.can_manage_document_settings || minor === null) return;
    if (visibleSettings && minor < visibleSettings.spent_minor + visibleSettings.reserved_minor) { setError('Лимит не может быть меньше уже потраченных и зарезервированных кредитов.'); return; }
    setBusy(true); setError('');
    try { const saved = await aiAssistantService.setDocumentSettings({ enabled, scope, limit_minor: minor }); setSettings(saved); setConfirmed(false); setVersion((value) => value + 1); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Не удалось сохранить бюджет.'); }
    finally { setBusy(false); }
  };
  const documents = visibleStatus?.document_coverage;
  const archive = visibleStatus?.archive_scan;
  return <Card><CardContent className="space-y-3 p-4"><div className="flex items-center justify-between gap-2"><p className="font-medium">Готовность данных</p><Button size="sm" variant="ghost" disabled={busy} onClick={() => setVersion((value) => value + 1)}>Обновить</Button></div>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}{!visibleStatus ? <p className="text-xs text-muted-foreground">{busy ? 'Проверяем данные…' : 'Состояние пока неизвестно.'}</p> : <>
    {!visibleStatus.status_available ? <><p className="text-sm">{statusRetrying ? 'Получаем актуальную статистику…' : 'Статистика временно недоступна.'}</p><p className="text-xs">Недоступность статистики сама по себе не означает, что помощник не отвечает.</p></> : <>
    <p className="text-sm">{!visibleStatus.enabled ? 'Поиск по данным отключён.' : visibleStatus.coverage_complete && visibleStatus.eligible_count_known ? 'Все доступные источники обработаны.' : visibleStatus.processing ? 'Источники обрабатываются.' : 'Часть данных может отсутствовать в поиске.'}</p>
    <p className="text-xs">Источники: {visibleStatus.eligible_count_known && visibleStatus.indexed_source_count !== null && visibleStatus.expected_source_count !== null ? `${visibleStatus.indexed_source_count} из ${visibleStatus.expected_source_count}` : 'полнота пока неизвестна'}. Ожидают: {visibleStatus.pending_source_count ?? 'неизвестно'}. Устарели: {visibleStatus.stale_source_count ?? 'неизвестно'}.</p>
    {visibleStatus.lag_seconds !== null && <p className="text-xs">Задержка обновления: {visibleStatus.lag_seconds} с.{visibleStatus.lag_exceeded && ' Данные требуют обновления.'}</p>}
    {!!visibleStatus.source_catalog?.length && <details className="text-xs"><summary>Покрытие разделов</summary>{visibleStatus.source_catalog.map((source) => <p key={source.type}>{sourceNames[source.type] ?? 'Данные организации'}: {source.indexed_count ?? '—'} из {source.expected_count ?? '—'}{!source.enabled && ' · отключён'}{source.error && ' · ошибка обработки'}</p>)}</details>}
    {documents ? <div className="space-y-1 text-xs"><p className="font-medium">Документы: готово {documents.ready} из {documents.total}</p><p>Ожидают обработки: {documents.pending}. Нужно распознавание: {documents.ocr_required}. Распознаются: {documents.ocr_processing}.</p><p>Ошибки: {documents.failed}. Формат не поддерживается: {documents.unsupported}. Пустые: {documents.empty}.</p><p>Обработано фрагментов: {documents.processed_units}. Распознано страниц: {documents.ocr_completed_pages} из {documents.total_pages}.</p></div> : <p className="text-xs">Покрытие документов пока неизвестно.</p>}
    </>}
    {archive && <p className="text-xs">Архив: проверено {archive.scanned_file_count ?? '—'} из {archive.expected_file_count ?? '—'} файлов. {archive.processing ? 'Проверка продолжается.' : archive.completed_at ? `Проверка завершена ${new Date(archive.completed_at).toLocaleString('ru-RU')}.` : 'Проверка ещё не завершена.'}</p>}
    {visibleStatus.can_manage_document_settings && visibleSettings && <form className="space-y-2 border-t pt-3" onSubmit={(event) => { event.preventDefault(); void save(); }}><p className="text-sm font-medium">Бюджет распознавания</p><p className="text-xs">Потрачено: {units(visibleSettings.spent_minor)} ед. · зарезервировано: {units(visibleSettings.reserved_minor)} ед. · осталось: {units(visibleSettings.available_minor)} ед.</p><label className="block text-xs"><input type="checkbox" checked={enabled} disabled={busy} onChange={(event) => { setEnabled(event.target.checked); setConfirmed(false); }} /> Разрешить фоновое распознавание</label><label className="block text-xs">Документы <select aria-label="Область распознавания" value={scope} disabled={busy} onChange={(event) => { setScope(event.target.value === 'archive' ? 'archive' : 'new'); setConfirmed(false); }}><option value="new">Только новые</option><option value="archive">Новые и архив</option></select></label><label className="block text-xs" htmlFor="assistant-ocr-limit">Общий лимит, единиц</label><input id="assistant-ocr-limit" className="w-full rounded border bg-background p-2 text-sm" value={limit} inputMode="decimal" disabled={busy} onChange={(event) => { setLimit(event.target.value); setConfirmed(false); }} /><p className="text-xs">Распознавание расходует кредиты в пределах подтверждённого лимита.</p><label className="block text-xs"><input type="checkbox" checked={confirmed} disabled={busy} onChange={(event) => setConfirmed(event.target.checked)} /> Подтверждаю бюджет и область обработки</label><Button size="sm" type="submit" disabled={busy || !confirmed || assistantOcrLimit(limit) === null}>Сохранить бюджет</Button></form>}
  </>}</CardContent></Card>;
};
export default AiAssistantCoveragePanel;
