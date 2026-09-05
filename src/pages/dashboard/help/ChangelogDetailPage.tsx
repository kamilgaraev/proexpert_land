import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { KnowledgeArticleReader } from '@/components/support/KnowledgeArticleReader';
import { knowledgeHubApi } from '@/utils/knowledgeHubApi';
import type { KnowledgeArticleDetail } from '@/types/knowledgeHub';

const ChangelogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [entry, setEntry] = useState<KnowledgeArticleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!slug) {
      setError('Обновление не найдено.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    setIsLoading(true);
    knowledgeHubApi.getChangelogEntry(slug)
      .then((data) => {
        if (isMounted) {
          setEntry(data);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Не удалось загрузить обновление. Проверьте подключение и попробуйте ещё раз.');
          setEntry(null);
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
  }, [slug, revision]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 pb-20">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <section className="mx-auto max-w-3xl space-y-4 rounded-lg border border-border bg-card p-8">
        <h1 className="text-2xl font-semibold">Обновление недоступно</h1>
        <p role="alert" className="text-muted-foreground">{error ?? 'Обновление не найдено.'}</p>
        <div className="flex flex-wrap gap-3">
          {slug && <Button variant="outline" onClick={() => setRevision((current) => current + 1)}>Повторить загрузку</Button>}
          <Button asChild variant="ghost"><Link to="/dashboard/help/changelog">Все обновления</Link></Button>
        </div>
      </section>
    );
  }

  return (
    <div className="pb-20">
      <KnowledgeArticleReader
        article={entry}
        backTo="/dashboard/help/changelog"
        relatedBasePath="/dashboard/help/knowledge"
      />
    </div>
  );
};

export default ChangelogDetailPage;
