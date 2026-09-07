import api from './api';

export interface KnowledgeAssistantMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface KnowledgeAssistantAnswer {
  needs_clarification?: boolean;
  answer: string;
  status: 'answered' | 'insufficient_knowledge';
  sources: Array<{ id: number; title: string }>;
}

export const askKnowledgeAssistant = async (
  question: string,
  signal: AbortSignal,
  contextKey?: string,
  history: KnowledgeAssistantMessage[] = [],
): Promise<KnowledgeAssistantAnswer> => {
  const response = await api.post<{ data: KnowledgeAssistantAnswer }>(
    '/knowledge-hub/assistant',
    { question, history: history.slice(-8), ...(contextKey ? { context_key: contextKey } : {}) },
    { signal, timeout: 60000 },
  );
  const result = response.data.data;
  if (
    !result || typeof result.answer !== 'string'
    || !['answered', 'insufficient_knowledge'].includes(result.status)
    || !Array.isArray(result.sources)
    || !result.sources.every((source) => Number.isInteger(source.id) && typeof source.title === 'string')
  ) {
    throw new Error('Не удалось получить ответ. Попробуйте ещё раз.');
  }
  return result;
};
