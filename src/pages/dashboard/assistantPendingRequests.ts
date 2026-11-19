export interface PendingAssistantRequest {
  id: string;
  conversationId: string;
  startedAt: number;
}

const storageKey = (identity: string) => `most.assistant.pending.v1:${identity}`;

export const readPendingAssistantRequests = (identity: string): PendingAssistantRequest[] => {
  try {
    const values: unknown = JSON.parse(sessionStorage.getItem(storageKey(identity)) ?? '[]');
    if (!Array.isArray(values)) return [];
    return values.filter((item): item is PendingAssistantRequest => typeof item?.id === 'string'
      && item.id.length > 0
      && typeof item.conversationId === 'string'
      && item.conversationId.length > 0
      && Number.isFinite(item.startedAt));
  } catch {
    return [];
  }
};

export const updatePendingAssistantRequest = (identity: string, request: PendingAssistantRequest, keep: boolean) => {
  try {
    const pending = readPendingAssistantRequests(identity).filter((item) => keep
      ? item.conversationId !== request.conversationId
      : item.id !== request.id);
    if (keep) pending.push(request);
    if (pending.length) sessionStorage.setItem(storageKey(identity), JSON.stringify(pending));
    else sessionStorage.removeItem(storageKey(identity));
  } catch {
    return;
  }
};
