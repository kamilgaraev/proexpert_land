import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { askKnowledgeAssistant, type KnowledgeAssistantAnswer } from '@/utils/knowledgeAssistantApi';

const examples = ['Как пригласить сотрудника?', 'Как включить нужный модуль?', 'Как восстановить пароль?'];

const KnowledgeBasePage = () => {
  const [searchParams] = useSearchParams();
  const contextKey = searchParams.get('context_key')?.slice(0, 120);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<KnowledgeAssistantAnswer | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pending = useRef<AbortController | null>(null);

  useEffect(() => {
    pending.current?.abort();
    pending.current = null;
    setQuestion('');
    setResult(null);
    setError('');
    setLoading(false);
    return () => pending.current?.abort();
  }, [contextKey]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const normalized = question.trim();
    if (normalized.length < 3 || pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const answer = await askKnowledgeAssistant(normalized, controller.signal, contextKey);
      if (!controller.signal.aborted) setResult(answer);
    } catch (failure) {
      if (!controller.signal.aborted) setError(isAxiosError(failure) && failure.response?.status === 429
        ? 'Лимит обращений к помощнику временно исчерпан. Попробуйте позже.'
        : 'Не удалось получить ответ. Попробуйте ещё раз немного позже.');
    } finally {
      if (!controller.signal.aborted) {
        pending.current = null;
        setLoading(false);
      }
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      <header className="space-y-3">
        <MessageCircle className="h-8 w-8 text-primary" aria-hidden="true" />
        <h1 className="text-3xl font-bold text-foreground">Помощник МОСТ</h1>
        <p className="text-muted-foreground">Опишите, что хотите сделать. Помощник подскажет шаги по работе в системе.</p>
      </header>
      <Card>
        <CardContent className="space-y-5 p-6">
          <form onSubmit={submit} className="space-y-4">
            <label htmlFor="help-question" className="block font-medium">Ваш вопрос</label>
            <textarea
              id="help-question"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              maxLength={1000}
              rows={4}
              disabled={loading}
              className="w-full resize-y rounded-md border border-input bg-background p-3 text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
              placeholder="Например, как пригласить сотрудника?"
            />
            <Button type="submit" disabled={loading || question.trim().length < 3} className="gap-2">
              <Send className="h-4 w-4" aria-hidden="true" />
              {loading ? 'Готовим ответ…' : 'Спросить'}
            </Button>
          </form>
          {!result && !loading && (
            <div className="flex flex-wrap gap-2">
              {examples.map((example) => (
                <Button key={example} variant="outline" className="h-auto whitespace-normal text-left" onClick={() => setQuestion(example)}>{example}</Button>
              ))}
            </div>
          )}
          {loading && <p role="status" className="text-sm text-muted-foreground">Ищем подходящие инструкции…</p>}
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>
      {result && (
        <Card>
          <CardContent className="space-y-4 p-6" role="status">
            <h2 className="font-semibold">{result.status === 'answered' ? 'Что нужно сделать' : 'Нужно уточнение'}</h2>
            <p className="whitespace-pre-wrap leading-relaxed">{result.answer}</p>
            {result.sources.length > 0 && (
              <p className="text-sm text-muted-foreground">По материалам: {result.sources.map((source) => source.title).join(', ')}</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default KnowledgeBasePage;
