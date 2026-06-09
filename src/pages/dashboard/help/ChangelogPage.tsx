import { useEffect, useState } from 'react';
import { History, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChangelogTimeline } from '@/components/support/ChangelogTimeline';
import { knowledgeHubApi } from '@/utils/knowledgeHubApi';
import type { KnowledgeArticleSummary, KnowledgeHubPaginationMeta } from '@/types/knowledgeHub';

const emptyMeta: KnowledgeHubPaginationMeta = {
  current_page: 1,
  per_page: 10,
  last_page: 1,
  total: 0,
};

const ChangelogPage = () => {
  const [entries, setEntries] = useState<KnowledgeArticleSummary[]>([]);
  const [meta, setMeta] = useState<KnowledgeHubPaginationMeta>(emptyMeta);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    knowledgeHubApi.getChangelog({
      q: query.trim() || undefined,
      page,
      per_page: 10,
    })
      .then((response) => {
        if (isMounted) {
          setEntries(response.data);
          setMeta(response.meta);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setEntries([]);
          setMeta(emptyMeta);
          setError('Не удалось загрузить обновления.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [page, query]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-20">
      <div className="space-y-2">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
          <History className="h-5 w-5" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Обновления</h1>
        <p className="max-w-2xl text-muted-foreground">
          Изменения продукта, новые возможности и важные улучшения личного кабинета.
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          placeholder="Поиск по обновлениям"
          className="pl-9"
        />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : entries.length > 0 ? (
        <ChangelogTimeline entries={entries} />
      ) : (
        <Card className="border-border shadow-sm">
          <CardContent className="p-8 text-center">
            <p className="text-sm text-muted-foreground">Обновления не найдены.</p>
          </CardContent>
        </Card>
      )}

      {meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            disabled={meta.current_page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Назад
          </Button>
          <span className="text-sm text-muted-foreground">
            {meta.current_page} / {meta.last_page}
          </span>
          <Button
            variant="outline"
            disabled={meta.current_page >= meta.last_page}
            onClick={() => setPage((current) => Math.min(meta.last_page, current + 1))}
          >
            Вперед
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChangelogPage;
