import { useContext, useEffect, useRef, useState, type FormEvent } from 'react';
import { Bot, Loader2, Paperclip, Plus, Send, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AiAssistantCoveragePanel from './AiAssistantCoveragePanel';
import AiAssistantAttachmentImage from './AiAssistantAttachmentImage';
import { AuthContext } from '@/contexts/AuthContext';
import { useCanAccess } from '@/hooks/usePermissions';
import { aiAssistantService, AssistantApiError, createAiAssistantRequestId } from '@/services/aiAssistantService';
import type { AiAssistantAction, AiAssistantActionPreview, AiAssistantAttachment, AiAssistantChatInput, AiAssistantConversation, AiAssistantCreditsBalance, AiAssistantMemory, AiAssistantMessage, AiAssistantPaginationMeta, AiAssistantParticipant, AiAssistantProfile, AiAssistantProgress, AiAssistantQuote, AiAssistantRequestStatus, AiAssistantSource, AiAssistantUsage } from '@/types/aiAssistant';
import type { OrganizationTeamMember } from '@/types/organization-team';

export const assistantUnits = (minor: number) => (minor / 100).toLocaleString('ru-RU', { maximumFractionDigits: 2 });
const sourceProjectIdPattern = /^(?:[1-9]\d*|[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}|[0-9A-HJKMNP-TV-Z]{26})$/i;
export const assistantSourceUrl = (value?: string, projectId?: string | number | null): string | undefined => {
  let url: URL | undefined;
  if (value) {
    try { url = new URL(value, window.location.origin); } catch { return undefined; }
    if (!['http:', 'https:'].includes(url.protocol) || !(url.origin === window.location.origin || url.hostname === 'admin.1мост.рф' || url.hostname === 'admin.xn--1-ymb3c.xn--p1ai')) return undefined;
  }

  const projectPath = url?.pathname.match(/^\/(?:dashboard\/)?projects\/([^/]+)\/?$/)
    ?? url?.pathname.match(/^\/projects\/([^/]+)\/video-monitoring\/?$/);
  const candidate = projectPath?.[1] ?? (projectId == null ? undefined : String(projectId));
  if (!candidate || !sourceProjectIdPattern.test(candidate)) return undefined;

  return new URL(`/dashboard/projects/${encodeURIComponent(candidate)}`, window.location.origin).href;
};
const assistantSourceProjectId = (source: AiAssistantSource): string | number | null | undefined => source.project_id
  ?? (['project', 'projects'].includes(source.entity_type ?? source.source_type ?? '') ? source.entity_id : undefined);

const failureText = (error: unknown) => error instanceof AssistantApiError && error.status === 403 ? 'У вас нет прав для этого действия.' : error instanceof Error ? error.message : 'Не удалось выполнить запрос.';
const mergeMessages = (items: AiAssistantMessage[]) => [...new Map(items.map((item) => [item.id, item])).values()];
const stages: Record<string, string> = { queued: 'В очереди', reading: 'Анализирует данные', generating: 'Формирует ответ', tools: 'Проверяет данные', verifying: 'Проверяет ответ', completed: 'Ответ готов', cancel_requested: 'Останавливает обработку', cancelled: 'Запрос отменён', failed: 'Не удалось завершить', sending: 'Отправляет запрос', recovering: 'Проверяет состояние запроса' };
const stageDescriptions: Record<string, string> = { queued: 'Запрос принят и ждёт обработки.', reading: 'Собирает данные, нужные для ответа.', generating: 'Формирует ответ по собранным данным.', tools: 'Проверяет связанные данные и действия.', verifying: 'Проверяет точность ответа.', cancel_requested: 'Останавливает обработку запроса.', sending: 'Передаёт запрос помощнику.', recovering: 'Проверяет, принят ли запрос сервером.' };
const progressStages = new Set(['queued', 'reading', 'generating', 'tools', 'verifying', 'completed', 'cancel_requested']);
const progressLabels: Record<AiAssistantProgress['code'], { started: string; completed: string }> = {
  rag_search: { started: 'Ищу информацию', completed: 'Информация собрана' }, estimates: { started: 'Проверяю сметы', completed: 'Сметы проверены' }, warehouse: { started: 'Проверяю склад', completed: 'Склад проверен' }, projects: { started: 'Проверяю проекты', completed: 'Проекты проверены' }, contracts: { started: 'Проверяю договоры', completed: 'Договоры проверены' }, procurement: { started: 'Проверяю закупки', completed: 'Закупки проверены' }, schedule: { started: 'Проверяю график', completed: 'График проверен' }, work_volumes: { started: 'Проверяю объёмы работ', completed: 'Объёмы работ проверены' }, materials: { started: 'Проверяю материалы', completed: 'Материалы проверены' }, reports: { started: 'Проверяю отчёты', completed: 'Отчёты проверены' }, financial_data: { started: 'Проверяю финансовые данные', completed: 'Финансовые данные проверены' },
};
const mergeProgress = (current: AiAssistantProgress[], incoming: AiAssistantProgress[]) => [...new Map([...current, ...incoming].map((item) => [item.id, item])).values()].sort((left, right) => left.id - right.id).slice(-24);
const progressLabel = (item: AiAssistantProgress) => progressLabels[item.code][item.state];
class AiAssistantRequestTerminalError extends Error {}
type ApprovedQuote = { input: AiAssistantChatInput; quote: AiAssistantQuote };
type DraftAttachment = { file: File; preview: string; metadata?: AiAssistantAttachment; progress: number; error?: string };
const attachmentError = (file: File) => !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ? 'Поддерживаются JPEG, PNG и WebP.' : file.size > 5 * 1024 * 1024 ? 'Размер изображения не должен превышать 5 МБ.' : null;

const AiAssistantPage = () => {
  const { user } = useContext(AuthContext);
  const canManageBilling = useCanAccess({ permission: 'billing.manage' });
  const [conversations, setConversations] = useState<AiAssistantConversation[]>([]);
  const [listMeta, setListMeta] = useState<AiAssistantPaginationMeta | null>(null);
  const [conversation, setConversation] = useState<AiAssistantConversation | null>(null);
  const [messages, setMessages] = useState<AiAssistantMessage[]>([]);
  const [historyMeta, setHistoryMeta] = useState<AiAssistantPaginationMeta | null>(null);
  const [participants, setParticipants] = useState<AiAssistantParticipant[]>([]);
  const [members, setMembers] = useState<OrganizationTeamMember[]>([]);
  const [memberMeta, setMemberMeta] = useState<AiAssistantPaginationMeta | null>(null);
  const [sharing, setSharing] = useState(false);
  const [memory, setMemory] = useState<AiAssistantMemory[]>([]);
  const [memoryText, setMemoryText] = useState('');
  const [editingMemory, setEditingMemory] = useState<string | null>(null);
  const [balance, setBalance] = useState<AiAssistantCreditsBalance | null>(null);
  const [usage, setUsage] = useState<AiAssistantUsage | null>(null);
  const [question, setQuestion] = useState('');
  const [attachments, setAttachments] = useState<DraftAttachment[]>([]);
  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;
  const [isUploadingAttachments, setIsUploadingAttachments] = useState(false);
  const attachmentControllers = useRef(new Map<string, AbortController>());
  const uploadingAttachments = useRef<symbol | null>(null);
  const [profile, setProfile] = useState<AiAssistantProfile>('normal');
  const [allowActions, setAllowActions] = useState(false);
  const [approved, setApproved] = useState<ApprovedQuote | null>(null);
  const [preview, setPreview] = useState<AiAssistantActionPreview | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState('');
  const [requestStartedAt, setRequestStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [receivedStages, setReceivedStages] = useState<string[]>([]);
  const [activeProgress, setActiveProgress] = useState<AiAssistantProgress[]>([]);
  const activeProgressRef = useRef<AiAssistantProgress[]>([]);
  const [completedProgress, setCompletedProgress] = useState<Record<string, AiAssistantProgress[]>>({});
  const epoch = useRef(0);
  const mounted = useRef(false);
  const busyRef = useRef(false);
  const historyController = useRef<AbortController | null>(null);
  const activeRequest = useRef<{ id: string; controller: AbortController; cancelled: boolean; deadline: number; timer?: ReturnType<typeof setTimeout> } | null>(null);
  const isOwner = conversation?.can_manage_participants ?? (conversation?.user_id === String(user?.id));
  const canEdit = !!conversation && (conversation.can_edit ?? (isOwner || participants.some((item) => item.user_id === String(user?.id) && item.role === 'editor')));
  const canPurchaseCredits = balance?.billing_mode !== 'shadow' && balance?.charging_enabled === true && balance?.pack_purchase_enabled !== false && (balance?.can_purchase ?? balance?.can_manage_billing ?? canManageBilling);
  const current = (version: number) => mounted.current && version === epoch.current;
  useEffect(() => {
    if (requestStartedAt === null) return;
    const updateElapsed = () => setElapsedSeconds(Math.floor((Date.now() - requestStartedAt) / 1000));
    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [requestStartedAt]);
  const run = async (operation: () => Promise<void>) => {
    if (busyRef.current) return;
    busyRef.current = true; setBusy(true); setError('');
    const version = epoch.current;
    try { await operation(); } catch (reason) { if (current(version)) setError(failureText(reason)); }
    finally { busyRef.current = false; if (mounted.current) setBusy(false); }
  };
  const selectConversation = async (selected: AiAssistantConversation) => {
    if (activeRequest.current || busyRef.current) return;
    historyController.current?.abort();
    const controller = new AbortController(); historyController.current = controller;
    const version = ++epoch.current;
    attachmentControllers.current.forEach((item) => item.abort()); attachmentControllers.current.clear(); uploadingAttachments.current = null; setIsUploadingAttachments(false); setAttachments((items) => { items.forEach((item) => URL.revokeObjectURL(item.preview)); return []; });
    setConversation(selected); setMessages([]); setParticipants([]); setHistoryMeta(null); setApproved(null); setPreview(null); setSharing(false); setQuestion(''); setError(''); setLoading(true); setStage(''); setRequestStartedAt(null); setReceivedStages([]); setActiveProgress([]); activeProgressRef.current = []; setCompletedProgress({});
    try {
      const [history, people] = await Promise.all([aiAssistantService.getHistory(selected.id, 1, controller.signal), aiAssistantService.getParticipants(selected.id, controller.signal)]);
      if (current(version)) { setMessages(history.items); setHistoryMeta(history.meta); setParticipants(people); }
    } catch (reason) { if (current(version) && !controller.signal.aborted) setError(failureText(reason)); }
    finally { if (current(version)) setLoading(false); }
  };
  useEffect(() => {
    mounted.current = true;
    const controller = new AbortController();
    void Promise.all([aiAssistantService.getConversations(1, controller.signal), aiAssistantService.getMemory(controller.signal), aiAssistantService.getBalance(controller.signal), aiAssistantService.getUsage(controller.signal).catch(() => null)]).then(([list, personalMemory, wallet, statistics]) => {
      if (controller.signal.aborted) return;
      setConversations(list.items); setListMeta(list.meta); setMemory(personalMemory); setBalance(wallet); setUsage(statistics); setLoading(false);
    }).catch((reason) => { if (!controller.signal.aborted) { setError(failureText(reason)); setLoading(false); } });
    return () => { mounted.current = false; epoch.current++; controller.abort(); historyController.current?.abort(); attachmentControllers.current.forEach((item) => item.abort()); attachmentControllers.current.clear(); attachmentsRef.current.forEach((item) => URL.revokeObjectURL(item.preview)); const request = activeRequest.current; if (request) { request.cancelled = true; clearTimeout(request.timer); request.controller.abort(); void aiAssistantService.cancelRequest(request.id).catch(() => undefined); } };
  }, []);
  const addImages = async (files: FileList | null) => {
    if (!files || !conversation || uploadingAttachments.current || attachments.length >= 2) return;
    const batchId = Symbol(); uploadingAttachments.current = batchId; setIsUploadingAttachments(true); setApproved(null);
    const version = epoch.current; const targetConversationId: string = conversation.id;
    try {
      for (const file of Array.from(files).slice(0, 2 - attachments.length)) {
        if (!current(version) || conversation?.id !== targetConversationId) break;
        const errorText = attachmentError(file); const preview = URL.createObjectURL(file); const entry: DraftAttachment = { file, preview, progress: 0, ...(errorText ? { error: errorText } : {}) };
        setAttachments((items) => [...items, entry]);
        if (errorText) continue;
        const controller = new AbortController(); attachmentControllers.current.set(preview, controller);
        try {
          const metadata = await aiAssistantService.uploadAttachment(file, targetConversationId, controller.signal, (progress) => { if (current(version) && conversation?.id === targetConversationId) setAttachments((items) => items.map((item) => item.preview === preview ? { ...item, progress } : item)); });
          if (!current(version) || controller.signal.aborted || conversation?.id !== targetConversationId) { URL.revokeObjectURL(preview); continue; }
          setAttachments((items) => items.map((item) => item.preview === preview ? { ...item, metadata, progress: 100 } : item)); setApproved(null);
        } catch (reason) { if (!controller.signal.aborted && current(version)) setAttachments((items) => items.map((item) => item.preview === preview ? { ...item, error: failureText(reason) } : item)); }
        finally { attachmentControllers.current.delete(preview); }
      }
    } finally { if (uploadingAttachments.current === batchId) { uploadingAttachments.current = null; setIsUploadingAttachments(false); } }
  };
  const removeAttachment = (preview: string) => { attachmentControllers.current.get(preview)?.abort(); attachmentControllers.current.delete(preview); setAttachments((items) => { const item = items.find((entry) => entry.preview === preview); if (item) URL.revokeObjectURL(item.preview); return items.filter((entry) => entry.preview !== preview); }); setApproved(null); };
  async function requestQuote() {
    return run(async () => {
      const readyAttachments = attachments.filter((item) => item.metadata && !item.error);
      if (!conversation || !canEdit || (!question.trim() && readyAttachments.length === 0) || attachments.some((item) => !item.metadata || item.error)) return;
      const input: AiAssistantChatInput = { conversation_id: conversation.id, message: question.trim() || 'Проанализируй прикреплённое изображение.', request_id: createAiAssistantRequestId(), profile, allow_actions: allowActions, context: {}, ...(readyAttachments.length ? { attachment_ids: readyAttachments.map((item) => item.metadata!.id) } : {}) };
      const version = epoch.current;
      const quote = await aiAssistantService.getQuote(input);
      const approvedQuote = { input, quote };
      if (current(version) && quote.min_units_minor === 0 && quote.max_units_minor === 0) {
        setApproved(null);
        await sendApproved(approvedQuote);
      } else if (current(version)) setApproved(approvedQuote);
    });
  }
  const waitForRequest = async (active: NonNullable<typeof activeRequest.current>, version: number) => {
    const pause = () => new Promise<void>((resolve) => {
      const finish = () => {
        clearTimeout(timer);
        active.controller.signal.removeEventListener('abort', finish);
        if (active.timer === timer) active.timer = undefined;
        resolve();
      };
      const timer = setTimeout(finish, 1500);
      active.timer = timer;
      active.controller.signal.addEventListener('abort', finish, { once: true });
      if (active.controller.signal.aborted) finish();
    });
    while (Date.now() < active.deadline && activeRequest.current === active && !active.cancelled) {
      let state: AiAssistantRequestStatus;
      try {
        state = await aiAssistantService.getRequest(active.id, active.controller.signal);
      } catch (reason) {
        if (active.cancelled || active.controller.signal.aborted) throw reason;
        await pause();
        continue;
      }
      if (!current(version) || active.cancelled) throw new Error('Запрос остановлен.');
      if (state.request_id !== active.id) throw new Error('Не удалось проверить состояние запроса.');
      const progress = mergeProgress(activeProgressRef.current, state.progress ?? []);
      activeProgressRef.current = progress;
      setActiveProgress(progress);
      const receivedStage = state.stage ?? state.status;
      setStage(receivedStage);
      if (state.stage && progressStages.has(state.stage)) setReceivedStages((items) => items.includes(state.stage!) ? items : [...items, state.stage!]);
      if (state.status === 'completed' && state.response) return { ...state.response, progress: mergeProgress(progress, state.response.progress ?? []) };
      if (state.status === 'completed') throw new AiAssistantRequestTerminalError('Сервер не вернул результат запроса.');
      if (state.status === 'failed') throw new AiAssistantRequestTerminalError(state.error_code === 'insufficient_credits' ? 'Недостаточно кредитов для выполнения запроса.' : 'Не удалось завершить запрос. Попробуйте ещё раз.');
      if (state.status === 'cancelled') throw new AiAssistantRequestTerminalError('Запрос отменён.');
      await pause();
    }
    if (active.cancelled || active.controller.signal.aborted) throw new Error('Запрос отменён.');
    throw new Error('Запрос занимает больше обычного. Проверьте чат позже.');
  };
  async function sendApproved(approvedQuote: ApprovedQuote) {
    if (!canEdit || approvedQuote.input.conversation_id !== conversation?.id) return;
    const readyAttachments = attachments.filter((item) => item.metadata && approvedQuote.input.attachment_ids?.includes(item.metadata.id));
    if (Date.parse(approvedQuote.quote.expires_at) <= Date.now()) { setApproved(null); throw new Error('Оценка истекла. Рассчитайте стоимость снова.'); }
    const version = epoch.current;
    const active = { id: approvedQuote.input.request_id, controller: new AbortController(), cancelled: false, deadline: Date.now() + 9 * 60 * 1000, timer: undefined as ReturnType<typeof setTimeout> | undefined };
    activeRequest.current = active;
    setRequestStartedAt(Date.now()); setElapsedSeconds(0); setReceivedStages([]); setActiveProgress([]); activeProgressRef.current = []; setStage('sending');
    try {
      const result = await aiAssistantService.chat({ ...approvedQuote.input, quote_id: approvedQuote.quote.quote_id }, active.controller.signal);
      if (result.request_id !== active.id) throw new Error('Не удалось проверить состояние запроса.');
      if (!('message' in result)) {
        setStage(result.stage);
        const progress = mergeProgress(activeProgressRef.current, result.progress ?? []);
        activeProgressRef.current = progress;
        setActiveProgress(progress);
      }
      const chatResult = 'message' in result ? result : await waitForRequest(active, version);
      if (chatResult.request_id !== active.id || String(chatResult.conversation_id) !== approvedQuote.input.conversation_id) throw new Error('Результат запроса не совпадает с выбранным чатом.');
      if (current(version) && !active.cancelled) {
        const finalProgress = mergeProgress(activeProgressRef.current, chatResult.progress ?? []);
        if (chatResult.message.id && finalProgress.length) setCompletedProgress((items) => ({ ...items, [chatResult.message.id]: finalProgress }));
        setMessages((items) => mergeMessages([...items, { id: `user-${active.id}`, role: 'user', content: approvedQuote.input.message, metadata: { attachments: readyAttachments.map((item) => item.metadata!) } }, chatResult.message]));
        setAttachments((items) => { readyAttachments.forEach((item) => URL.revokeObjectURL(item.preview)); return items.filter((item) => !readyAttachments.includes(item)); }); setQuestion(''); setApproved(null); setBalance((wallet) => wallet && chatResult.credit_usage.available_after_minor != null ? { ...wallet, available_minor: Number(chatResult.credit_usage.available_after_minor) } : wallet);
        void aiAssistantService.getUsage().then(setUsage).catch(() => undefined);
      }
    } catch (reason) {
      if (!active.cancelled && !(reason instanceof AssistantApiError) && !(reason instanceof AiAssistantRequestTerminalError)) {
        try {
          setStage('recovering');
          const recovered = await waitForRequest(active, version);
          if (recovered.request_id !== active.id || String(recovered.conversation_id) !== approvedQuote.input.conversation_id) throw new Error('Результат запроса не совпадает с выбранным чатом.');
          if (current(version) && !active.cancelled) {
            const finalProgress = mergeProgress(activeProgressRef.current, recovered.progress ?? []);
            if (recovered.message.id && finalProgress.length) setCompletedProgress((items) => ({ ...items, [recovered.message.id]: finalProgress }));
            setMessages((items) => mergeMessages([...items, { id: `user-${active.id}`, role: 'user', content: approvedQuote.input.message, metadata: { attachments: readyAttachments.map((item) => item.metadata!) } }, recovered.message]));
            setAttachments((items) => { readyAttachments.forEach((item) => URL.revokeObjectURL(item.preview)); return items.filter((item) => !readyAttachments.includes(item)); });
            setQuestion(''); setApproved(null); setBalance((wallet) => wallet && recovered.credit_usage.available_after_minor != null ? { ...wallet, available_minor: Number(recovered.credit_usage.available_after_minor) } : wallet);
            void aiAssistantService.getUsage().then(setUsage).catch(() => undefined);
          }
        } catch (recoveryError) { throw recoveryError; }
      } else if (!active.cancelled) throw reason;
    }
    finally { clearTimeout(active.timer); if (activeRequest.current === active) activeRequest.current = null; if (current(version)) { setStage(''); setRequestStartedAt(null); setReceivedStages([]); setActiveProgress([]); activeProgressRef.current = []; } }
  }
  const send = () => approved ? run(() => sendApproved(approved)) : undefined;
  const cancel = async () => {
    const active = activeRequest.current; if (!active || active.cancelled) return;
    try { await aiAssistantService.cancelRequest(active.id); active.cancelled = true; clearTimeout(active.timer); active.controller.abort(); setApproved(null); setStage('Отменено'); }
    catch (reason) { setError(failureText(reason)); }
  };
  const loadOlder = () => run(async () => {
    if (!conversation || !historyMeta || historyMeta.current_page >= historyMeta.last_page) return;
    const version = epoch.current;
    const history = await aiAssistantService.getHistory(conversation.id, historyMeta.current_page + 1);
    if (current(version)) { setMessages((items) => mergeMessages([...history.items, ...items])); setHistoryMeta(history.meta); }
  });
  const openSharing = () => run(async () => {
    if (!isOwner) return;
    const result = await aiAssistantService.getActiveMembers(1); setMembers(result.items); setMemberMeta(result.meta); setSharing(true);
  });
  const prepareAction = (action: AiAssistantAction) => run(async () => { if (conversation && canEdit) setPreview(await aiAssistantService.previewAction(conversation.id, action)); });
  const downloadArtifact = (url: string, filename: string) => run(async () => {
    const blob = await aiAssistantService.downloadReport(url);
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl; link.download = filename.replace(/[\\/]/g, '_').split('').filter((character) => character.charCodeAt(0) > 31).join('');
    document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  });
  const submit = (event: FormEvent) => { event.preventDefault(); void (approved ? send() : requestQuote()); };
  return <div className="mx-auto grid max-w-6xl gap-6 pb-16 lg:grid-cols-[280px_minmax(0,1fr)]">
    <aside className="space-y-4"><AiAssistantCoveragePanel />
      <Card><CardContent className="space-y-3 p-4"><p className="font-medium">Ваши чаты</p><p className="text-xs text-muted-foreground">Новый чат виден только вам. Доступ другим сотрудникам предоставляется явно.</p>
        <Button className="w-full" variant="outline" disabled={busy} onClick={() => void run(async () => { const created = await aiAssistantService.createConversation(); setConversations((items) => [created, ...items]); busyRef.current = false; await selectConversation(created); })}><Plus className="mr-2 h-4 w-4" />Новый чат</Button>
        {conversations.map((item) => <Button key={item.id} variant={conversation?.id === item.id ? 'secondary' : 'ghost'} className="h-auto w-full justify-start whitespace-normal text-left" disabled={busy} onClick={() => void selectConversation(item)}>{item.title || 'Новый разговор'}</Button>)}
        {listMeta && listMeta.current_page < listMeta.last_page && <Button variant="ghost" disabled={busy} onClick={() => void run(async () => { const list = await aiAssistantService.getConversations(listMeta.current_page + 1); setConversations((items) => [...new Map([...items, ...list.items].map((item) => [item.id, item])).values()]); setListMeta(list.meta); })}>Ещё чаты</Button>}
      </CardContent></Card>
      <Card><CardContent className="space-y-3 p-4"><p className="font-medium">Статистика помощника</p><p>Запросов: {usage?.used ?? '—'}</p>{usage?.tokens_used !== undefined && <p className="text-xs text-muted-foreground">Токенов: {usage.tokens_used.toLocaleString('ru-RU')}{usage.cost_rub !== undefined ? ` · ${usage.cost_rub.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ₽` : ''}</p>}</CardContent></Card>
      <Card><CardContent className="space-y-3 p-4"><p className="font-medium">Кредиты МОСТ</p><p>Доступно: {balance ? assistantUnits(balance.available_minor) : '—'} ед.</p><p className="text-xs text-muted-foreground">За период: {balance ? assistantUnits(balance.included_minor) : '—'} · куплено: {balance ? assistantUnits(balance.purchased_minor) : '—'} · зарезервировано: {balance ? assistantUnits(balance.reserved_minor) : '—'}</p>{balance?.base_period_expires_at && <p className="text-xs">Кредиты периода действуют до {new Date(balance.base_period_expires_at).toLocaleDateString('ru-RU')}</p>}{balance?.billing_mode === 'shadow' ? <p className="text-xs text-muted-foreground">Тестовый режим: списания выключены. Показана оценка расхода, фактическое списание — 0.</p> : balance && !balance.charging_enabled ? <p className="text-xs text-muted-foreground">Списания пока не включены.</p> : null}
        {canPurchaseCredits ? balance?.packs.map((pack) => <Button key={pack.id} className="w-full" variant="outline" disabled={busy} onClick={() => void run(async () => { const order = await aiAssistantService.purchase(pack.id); const url = new URL(order.confirmation_url); if (url.protocol !== 'https:') throw new Error('Некорректная платёжная ссылка.'); window.location.assign(url.href); })}>{assistantUnits(pack.units_minor)} ед. · {assistantUnits(pack.amount_minor)} ₽</Button>) : <p className="text-xs text-muted-foreground">Покупка кредитов сейчас недоступна.</p>}
      </CardContent></Card>
      <Card><CardContent className="space-y-2 p-4"><p className="font-medium">Личная память</p><p className="text-xs text-muted-foreground">Только для ваших ответов в текущей организации.</p><label htmlFor="assistant-memory" className="sr-only">Факт для памяти</label><textarea id="assistant-memory" value={memoryText} onChange={(event) => setMemoryText(event.target.value)} maxLength={1000} rows={3} className="w-full rounded-md border bg-background p-2 text-sm" /><Button size="sm" variant="outline" disabled={busy || !memoryText.trim()} onClick={() => void run(async () => { const saved = editingMemory ? await aiAssistantService.updateMemory(editingMemory, memoryText.trim()) : await aiAssistantService.createMemory(memoryText.trim(), conversation?.id); setMemory((items) => [saved, ...items.filter((item) => item.id !== saved.id)]); setMemoryText(''); setEditingMemory(null); })}>Подтверждаю, сохранить</Button>{editingMemory && <Button size="sm" variant="ghost" onClick={() => { setEditingMemory(null); setMemoryText(''); }}>Отмена редактирования</Button>}
        {memory.map((item) => <div key={item.id} className="rounded border p-2 text-xs"><p>{item.content}</p><Button variant="ghost" size="sm" disabled={busy} onClick={() => { setEditingMemory(item.id); setMemoryText(item.content); }}>Изменить</Button><Button variant="ghost" size="sm" disabled={busy} onClick={() => void run(async () => { await aiAssistantService.deleteMemory(item.id); setMemory((items) => items.filter((entry) => entry.id !== item.id)); })}>Удалить</Button></div>)}
      </CardContent></Card>
    </aside>
    <section className="min-w-0 space-y-5"><header><Bot className="mb-3 h-8 w-8 text-primary" /><h1 className="text-3xl font-bold">Помощник МОСТ</h1><p className="mt-2 text-muted-foreground">Помощник анализирует данные организации и помогает перейти к нужным разделам. Изменения выполняются после вашего подтверждения.</p></header>{error && <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
      <Card><CardContent className="space-y-5 p-5">{loading ? <p><Loader2 className="inline h-4 w-4 animate-spin" /> Загружаем…</p> : !conversation ? <p>Выберите или создайте чат.</p> : <>
        {isOwner && <div className="flex flex-wrap gap-2"><Button variant="outline" disabled={busy} onClick={() => void openSharing()}>Настроить доступ</Button><Button variant="outline" disabled={busy} onClick={() => void run(async () => { await aiAssistantService.deleteConversation(conversation.id); epoch.current++; setConversations((items) => items.filter((item) => item.id !== conversation.id)); setConversation(null); setMessages([]); setApproved(null); setPreview(null); })}>Удалить чат</Button></div>}
        {sharing && <div className="space-y-3 rounded border p-3"><p>Доступ к чату не расширяет права на данные. Без участников чат личный.</p>{members.filter((member) => String(member.id) !== String(user?.id)).map((member) => <label key={member.id} className="flex items-center justify-between gap-3"><span>{member.name}</span><select aria-label={`Доступ: ${member.name}`} value={participants.find((item) => item.user_id === String(member.id))?.role ?? ''} onChange={(event) => { const role = event.target.value; setParticipants((items) => [...items.filter((item) => item.user_id !== String(member.id)), ...(role === 'viewer' || role === 'editor' ? [{ user_id: String(member.id), name: member.name, role } satisfies AiAssistantParticipant] : [])]); }}><option value="">Нет доступа</option><option value="viewer">Читатель</option><option value="editor">Участник</option></select></label>)}{memberMeta && memberMeta.current_page < memberMeta.last_page && <Button variant="ghost" disabled={busy} onClick={() => void run(async () => { const next = await aiAssistantService.getActiveMembers(memberMeta.current_page + 1); setMembers((items) => [...items, ...next.items]); setMemberMeta(next.meta); })}>Ещё сотрудники</Button>}<Button disabled={busy} onClick={() => void run(async () => { setParticipants(await aiAssistantService.setParticipants(conversation.id, participants)); setSharing(false); })}>Подтвердить доступ</Button><Button variant="ghost" disabled={busy} onClick={() => void run(async () => { setParticipants(await aiAssistantService.getParticipants(conversation.id)); setSharing(false); })}>Отмена</Button></div>}
        {historyMeta && historyMeta.current_page < historyMeta.last_page && <Button variant="outline" disabled={busy} onClick={() => void loadOlder()}>Предыдущие сообщения</Button>}
        <div className="max-h-[52vh] space-y-4 overflow-y-auto pr-1">{messages.length === 0 && attachments.length === 0 && <p className="text-sm text-muted-foreground">Задайте вопрос помощнику или прикрепите изображение.</p>}{messages.map((item) => <article key={item.id} className={item.role === 'user' ? 'ml-4 rounded-lg bg-primary p-3 text-primary-foreground' : 'mr-4 rounded-lg bg-muted p-3'}><p className="whitespace-pre-wrap">{item.content}</p>{completedProgress[item.id]?.length > 0 && <ol aria-label="Использованные источники" className="mt-3 space-y-1 border-t pt-2 text-xs text-muted-foreground">{completedProgress[item.id].map((step) => <li key={step.id}>{progressLabel(step)}</li>)}</ol>}{item.metadata?.attachments?.map((attachment) => <AiAssistantAttachmentImage key={attachment.id} attachment={attachment} />)}{[...(item.metadata?.source_refs ?? []), ...(item.metadata?.rag_context?.sources ?? []), ...(item.metadata?.entity_references ?? [])].map((source, index) => { const sourceUrl = source.navigation?.url ?? source.url; const reportUrl = sourceUrl?.includes('/api/v1/ai-assistant/reports/') ? sourceUrl : undefined; const href = reportUrl ? undefined : assistantSourceUrl(sourceUrl, assistantSourceProjectId(source)); if (reportUrl) return <div key={`${source.source_type ?? source.entity_type ?? 'source'}-${source.entity_id ?? index}`} className="mt-2"><Button size="sm" variant="outline" disabled={busy} onClick={() => void downloadArtifact(reportUrl, source.title ?? 'Отчёт')}>Скачать отчёт: {source.title ?? 'Отчёт'}</Button></div>; return href ? <div key={`${source.source_type ?? source.entity_type ?? 'source'}-${source.entity_id ?? index}`} className="mt-2 text-xs"><a href={href} className="underline" target="_blank" rel="noreferrer">Открыть проект: {source.title ?? source.name ?? 'Источник'}</a></div> : null; })}{item.metadata?.artifacts?.map((artifact, index) => { const url = artifact.download_url ?? artifact.url; return url ? <Button key={`artifact-${index}`} className="mt-2" variant="outline" disabled={busy} onClick={() => void downloadArtifact(url, artifact.filename ?? artifact.file_name ?? 'Отчёт')}>Скачать: {artifact.title ?? artifact.filename ?? 'Отчёт'}</Button> : null; })}{(item.metadata?.proposed_actions ?? item.metadata?.suggested_actions ?? item.metadata?.actions ?? []).map((action, index) => <Button key={index} className="mt-2" variant="outline" disabled={busy || !canEdit} onClick={() => void prepareAction(action)}>Проверить действие: {action.label ?? 'Предложенное изменение'}</Button>)}</article>)}</div>
        {preview && <div className="space-y-2 rounded border border-amber-500 p-3"><p className="font-medium">{preview.title}</p><p>{preview.description}</p><details open><summary>Изменения</summary><pre className="overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify({ before: preview.before, after: preview.after }, null, 2)}</pre></details>{preview.warnings?.map((warning) => <p key={warning}>{warning}</p>)}<Button disabled={busy || !canEdit || preview.executable === false} onClick={() => void run(async () => { if (Date.parse(preview.expires_at) <= Date.now()) throw new Error('Подготовка истекла. Проверьте действие снова.'); await aiAssistantService.executeAction(conversation.id, preview); setPreview(null); const history = await aiAssistantService.getHistory(conversation.id); setMessages(history.items); setHistoryMeta(history.meta); })}>Подтверждаю изменение</Button><Button variant="ghost" disabled={busy} onClick={() => setPreview(null)}>Отмена</Button></div>}
        {canEdit && <form onSubmit={submit} className="space-y-3"><label htmlFor="assistant-question" className="sr-only">Вопрос помощнику</label><textarea id="assistant-question" value={question} onChange={(event) => { setQuestion(event.target.value); setApproved(null); }} disabled={busy} maxLength={4000} rows={4} className="w-full rounded-md border bg-background p-3" placeholder="Опишите задачу или задайте вопрос" />{attachments.map((item) => <AiAssistantAttachmentImage key={item.preview} preview={item.preview} progress={item.progress} error={item.error} attachment={item.metadata} onRemove={() => removeAttachment(item.preview)} />)}<label className="inline-flex cursor-pointer items-center gap-2 text-sm"><Paperclip className="h-4 w-4" />Прикрепить изображение<input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy || isUploadingAttachments || attachments.length >= 2} onChange={(event) => { void addImages(event.target.files); event.currentTarget.value = ''; }} /></label><span className="text-xs text-muted-foreground">До 2 изображений JPEG, PNG или WebP; каждое до 5 МБ, сторона до 2048 пикселей.</span><div className="flex flex-wrap items-center gap-3"><label>Подробность <select aria-label="Подробность ответа" value={profile} disabled={busy} onChange={(event) => { setProfile(event.target.value as AiAssistantProfile); setApproved(null); }}><option value="short">Кратко</option><option value="normal">Обычно</option><option value="detailed">Подробно</option></select></label><label className="text-sm"><input type="checkbox" checked={allowActions} disabled={busy} onChange={(event) => { setAllowActions(event.target.checked); setApproved(null); }} /> Предлагать изменения с подтверждением</label></div>{approved && <div className="rounded bg-amber-50 p-3 text-sm text-amber-950">Оценка расхода: от {assistantUnits(approved.quote.min_units_minor)} до {assistantUnits(approved.quote.max_units_minor)} ед. МОСТ. {balance?.billing_mode === 'shadow' ? 'Тестовый режим: списания выключены, фактическое списание — 0. ' : ''}Подтвердите максимальную оценку. Оценка до {new Date(approved.quote.expires_at).toLocaleTimeString('ru-RU')}.</div>}{busy && requestStartedAt !== null && <div role="status" aria-live="polite" className="space-y-1 rounded-md bg-muted p-3 text-sm"><p className="font-medium">{stages[stage] ?? 'Выполняет запрос'}</p>{stageDescriptions[stage] && <p className="text-muted-foreground">{stageDescriptions[stage]}</p>}{activeProgress.length > 0 && <ol aria-label="Источники запроса" className="space-y-1">{activeProgress.map((item) => <li key={item.id}>{progressLabel(item)}</li>)}</ol>}<p className="text-muted-foreground">Прошло {elapsedSeconds < 60 ? `${elapsedSeconds} сек.` : `${Math.floor(elapsedSeconds / 60)} мин ${String(elapsedSeconds % 60).padStart(2, '0')} сек.`}</p>{receivedStages.length > 0 && <p className="text-xs text-muted-foreground">Этапы: {receivedStages.map((item) => stages[item]).join(' · ')}</p>}</div>}<div className="flex flex-wrap items-center gap-2"><Button type="submit" disabled={busy || (!question.trim() && attachments.length === 0) || attachments.some((item) => !item.metadata || item.error)}><Send className="mr-2 h-4 w-4" />{approved ? 'Подтвердить и отправить' : 'Рассчитать стоимость'}</Button>{activeRequest.current && <Button type="button" variant="outline" onClick={() => void cancel()}><Square className="mr-2 h-4 w-4" />Отменить запрос</Button>}</div></form>}
      </>}</CardContent></Card>
    </section>
  </div>;
};
export default AiAssistantPage;
