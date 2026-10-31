import { describe, expect, it } from 'vitest';
import type { AiAssistantMessage, AiAssistantTypedFactsLocator } from '@/types/aiAssistant';
import { assistantTypedFactsScope, assistantTypedFactsSnapshot, emptyAssistantTypedFacts, receiveAssistantTypedFacts } from './assistantTypedFacts';

const now = Date.parse('2026-10-25T10:00:00Z');
const scope = assistantTypedFactsScope(7, 44, '11');
const locator: AiAssistantTypedFactsLocator = { version: 'ordinary-typed-facts-context/1', receipt_id: 'a1111111-1111-1111-1111-111111111111', receipt_hash: 'a'.repeat(64) };
const message = (overrides: Partial<AiAssistantMessage> = {}): AiAssistantMessage => ({ id: '20', role: 'assistant', content: 'Ответ', created_at: '2026-10-25T09:59:00Z', metadata: { typed_facts: locator }, ...overrides });
const initial = () => receiveAssistantTypedFacts(emptyAssistantTypedFacts(scope), scope, [message()], now);

describe('ordinary assistant typed facts context', () => {
  it('copies only the exact server locator into a detached quote snapshot', () => {
    const state = initial();
    const snapshot = assistantTypedFactsSnapshot(state, scope, now);
    expect(snapshot.context).toEqual({ typed_facts: locator });
    expect(Object.keys(snapshot.context.typed_facts!)).toEqual(['version', 'receipt_id', 'receipt_hash']);
    const updated = receiveAssistantTypedFacts(state, scope, [message({ created_at: '2026-10-25T10:00:00Z', metadata: { typed_facts: { ...locator, receipt_id: 'b1111111-1111-1111-1111-111111111111' } } })], now);
    expect(updated.receipt?.locator.receipt_id).not.toBe(locator.receipt_id);
    expect(snapshot.context.typed_facts).toEqual(locator);
    expect(snapshot.context.typed_facts).not.toBe(state.receipt?.locator);
  });

  it('retains original receipt and expiry across inherited-only second and third replies', () => {
    const state = initial();
    const second = receiveAssistantTypedFacts(state, scope, [message({ id: '21', created_at: '2026-10-25T10:01:00Z', metadata: {} })], now + 60_000);
    const third = receiveAssistantTypedFacts(second, scope, [message({ id: '22', created_at: '2026-10-25T10:02:00Z', metadata: {} })], now + 120_000);
    expect(third).toBe(state);
    expect(assistantTypedFactsSnapshot(third, scope, now + 13 * 60_000).context).toEqual({ typed_facts: locator });
    expect(assistantTypedFactsSnapshot(third, scope, now + 14 * 60_000).context).toEqual({});
  });

  it('does not renew the same locator when repeated with a later timestamp', () => {
    const state = initial();
    const repeated = receiveAssistantTypedFacts(state, scope, [message({ created_at: '2026-10-25T10:02:00Z' })], now + 120_000);
    expect(repeated).toBe(state);
    expect(assistantTypedFactsSnapshot(repeated, scope, now + 14 * 60_000).context).toEqual({});
  });

  it.each([false, true])('uses the earliest original timestamp before checking history expiry, reversed=%s', (reverse) => {
    const original = message();
    const repeated = message({ id: '21', created_at: '2026-10-25T10:02:00Z' });
    const history = reverse ? [original, repeated] : [repeated, original];
    const restored = receiveAssistantTypedFacts(emptyAssistantTypedFacts(scope), scope, history, now + 15 * 60_000);
    expect(assistantTypedFactsSnapshot(restored, scope, now + 15 * 60_000).context).toEqual({});
  });

  it('shortens an already restored duplicate when an older history page contains its expired original', () => {
    const later = now + 15 * 60_000;
    const repeated = message({ id: '21', created_at: '2026-10-25T10:02:00Z' });
    const restored = receiveAssistantTypedFacts(emptyAssistantTypedFacts(scope), scope, [repeated], later);
    expect(assistantTypedFactsSnapshot(restored, scope, later).context).toEqual({ typed_facts: locator });
    const withOriginal = receiveAssistantTypedFacts(restored, scope, [message()], later);
    expect(withOriginal.receipt?.expiresAt).toBe(now + 14 * 60_000);
    expect(assistantTypedFactsSnapshot(withOriginal, scope, later).context).toEqual({});
  });

  it.each([assistantTypedFactsScope(8, 44, '11'), assistantTypedFactsScope(7, 45, '11'), assistantTypedFactsScope(7, 44, '12'), null])('does not carry context to changed scope %s or restore it from stale history', (nextScope) => {
    expect(assistantTypedFactsSnapshot(initial(), nextScope, now).context).toEqual({});
    const changed = emptyAssistantTypedFacts(nextScope);
    expect(receiveAssistantTypedFacts(changed, scope, [message()], now)).toBe(changed);
    expect(assistantTypedFactsSnapshot(changed, nextScope, now).context).toEqual({});
  });

  it.each([
    { ...locator, facts: [] }, { ...locator, expires_at: '2099-01-01T00:00:00Z' }, { ...locator, proof: {} },
    { ...locator, receipt_hash: 'A'.repeat(64) }, { ...locator, receipt_id: 'invalid' },
    { ...locator, version: 'ordinary-typed-facts/1' }, { receipt_id: locator.receipt_id, receipt_hash: locator.receipt_hash }, [], null,
  ])('rejects malformed or expanded metadata locator %j', (typed_facts) => {
    const malformed = message({ metadata: { typed_facts } as unknown as AiAssistantMessage['metadata'] });
    expect(receiveAssistantTypedFacts(emptyAssistantTypedFacts(scope), scope, [malformed], now).receipt).toBeNull();
  });

  it.each([
    { role: 'user' }, { role: 'system' }, { created_at: undefined }, { created_at: 'invalid' },
    { created_at: '2026-10-25T10:01:00Z' }, { created_at: '2026-02-30T10:00:00Z' }, { created_at: '2026-10-25T09:45:00Z' },
    { metadata: { request_id: locator.receipt_id } }, { content: JSON.stringify(locator), metadata: {} },
  ])('ignores non-assistant, expired or undated inputs %j', (overrides) => {
    expect(receiveAssistantTypedFacts(emptyAssistantTypedFacts(scope), scope, [message(overrides)], now).receipt).toBeNull();
  });

  it('selects latest eligible assistant receipt regardless of history page ordering', () => {
    const previous = message({ id: '19', created_at: '2026-10-25T09:58:00Z', metadata: { typed_facts: { ...locator, receipt_id: 'b1111111-1111-1111-1111-111111111111' } } });
    const state = receiveAssistantTypedFacts(emptyAssistantTypedFacts(scope), scope, [message(), previous, message({ role: 'user' })], now);
    expect(state.receipt?.locator).toEqual(locator);
    expect(receiveAssistantTypedFacts(state, scope, [previous], now)).toBe(state);
  });
});
