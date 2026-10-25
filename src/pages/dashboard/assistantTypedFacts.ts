import type { AiAssistantMessage, AiAssistantTypedFactsLocator } from '@/types/aiAssistant';

const lifetime = 15 * 60 * 1000;
type Receipt = { locator: AiAssistantTypedFactsLocator; createdAt: number; expiresAt: number };
export type AssistantTypedFactsState = { scope: string | null; receipt: Receipt | null };

export const assistantTypedFactsScope = (actorId: string | number | undefined, organizationId: number | undefined, conversationId: string | undefined): string | null =>
  actorId != null && organizationId != null && conversationId ? JSON.stringify([String(actorId), organizationId, conversationId]) : null;

export const emptyAssistantTypedFacts = (scope: string | null): AssistantTypedFactsState => ({ scope, receipt: null });

const parseLocator = (value: unknown): AiAssistantTypedFactsLocator | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length !== 3) return null;
  const fields = value as Record<string, unknown>;
  if (!['version', 'receipt_id', 'receipt_hash'].every((key) => Object.prototype.hasOwnProperty.call(fields, key))
    || fields.version !== 'ordinary-typed-facts-context/1'
    || typeof fields.receipt_id !== 'string' || !/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(fields.receipt_id)
    || typeof fields.receipt_hash !== 'string' || !/^[0-9a-f]{64}$/.test(fields.receipt_hash)) return null;
  return { version: fields.version, receipt_id: fields.receipt_id, receipt_hash: fields.receipt_hash };
};

export const receiveAssistantTypedFacts = (state: AssistantTypedFactsState, expectedScope: string | null, messages: AiAssistantMessage[], now: number): AssistantTypedFactsState => {
  if (!expectedScope || state.scope !== expectedScope) return state;
  let receipt = state.receipt;
  for (const message of messages) {
    if (message.role !== 'assistant' || !message.created_at) continue;
    const locator = parseLocator(message.metadata?.typed_facts);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?Z$/.test(message.created_at)) continue;
    const createdAt = Date.parse(message.created_at);
    if (!locator || !Number.isFinite(createdAt) || new Date(createdAt).toISOString().slice(0, 19) !== message.created_at.slice(0, 19) || createdAt > now || createdAt + lifetime <= now) continue;
    if (receipt?.locator.receipt_id === locator.receipt_id && receipt.locator.receipt_hash === locator.receipt_hash) continue;
    if (!receipt || createdAt > receipt.createdAt) receipt = { locator, createdAt, expiresAt: createdAt + lifetime };
  }
  return receipt === state.receipt ? state : { ...state, receipt };
};

export const assistantTypedFactsSnapshot = (state: AssistantTypedFactsState, scope: string | null, now: number): { context: { typed_facts?: AiAssistantTypedFactsLocator }; expiresAt?: number } => {
  if (!scope || state.scope !== scope || !state.receipt || state.receipt.expiresAt <= now) return { context: {} };
  return { context: { typed_facts: { ...state.receipt.locator } }, expiresAt: state.receipt.expiresAt };
};
