import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getKnowledgeAssistantActions, askKnowledgeAssistant, type KnowledgeAssistantAnswer, type KnowledgeAssistantMessage } from '@/utils/knowledgeAssistantApi';

const examples = ['Как пригласить сотрудника?', 'Как включить нужный модуль?', 'Как восстановить пароль?'];

const KnowledgeBasePage = () => {
  const [searchParams] = useSearchParams();
  const contextKey = searchParams.get('context_key')?.slice(0, 120);
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<KnowledgeAssistantAnswer | null>(null);
  const [turns, setTurns] = useState<Array<{ question: string; result: KnowledgeAssistantAnswer }>>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const pending = useRef<AbortController | null>(null);

  useEffect(() => {
    pending.current?.abort();
    pending.current = null;
    setTurns([]);
    setQuestion('');
    setResult(null);
    setError('');
    setLoading(false);
    return () => pending.current?.abort();
  }, [contextKey]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const normalized = question.trim();
    if (normalized.length < 1 || pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const history: KnowledgeAssistantMessage[] = turns.flatMap(turn => [
        { role: 'user', content: turn.question },
        { role: 'assistant', content: turn.result.answer },
      ]);
      const answer = await askKnowledgeAssistant(normalized, controller.signal, contextKey, history);
      if (!controller.signal.aborted) {
        setResult(answer);
        setTurns(previous => [...previous, { question: normalized, result: answer }].slice(-4));
        setQuestion('');
      }
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
            <Button type="submit" disabled={loading || question.trim().length < 1} className="gap-2">
              <Send className="h-4 w-4" aria-hidden="true" />
              {loading ? 'Готовим ответ…' : 'Спросить'}
            </Button>
          </form>
          {turns.length > 0 && <Button variant="outline" disabled={loading} onClick={() => {
            setTurns([]); setResult(null); setQuestion(''); setError('');
          }}>Новый разговор</Button>}
          {turns.length === 0 && !result && !loading && (
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
      {turns.map((turn, index) => (
        <Card key={index}>
          <CardContent className="space-y-4 p-6" role="status">
            <p className="text-sm text-muted-foreground">{turn.question}</p>
            <h2 className="font-semibold">{turn.result.status === 'answered' ? 'Что нужно сделать' : turn.result.needs_clarification ? 'Уточните, пожалуйста' : 'Ответ не найден'}</h2>
            <p className="whitespace-pre-wrap leading-relaxed">{turn.result.answer}</p>
            <div className="flex flex-wrap gap-2">
              {getKnowledgeAssistantActions(turn.result).map(action => (
                <Button key={action.to} asChild variant="outline">
                  <Link to={action.to}>{action.label}</Link>
                </Button>
              ))}
            </div>
            {turn.result.sources.length > 0 && (
              <p className="text-sm text-muted-foreground">По материалам: {turn.result.sources.map((source) => source.title).join(', ')}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KnowledgeBasePage;
