import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { KnowledgeArticleReader } from '@/components/support/KnowledgeArticleReader';
import { knowledgeHubApi } from '@/utils/knowledgeHubApi';
import type { KnowledgeArticleDetail } from '@/types/knowledgeHub';

const ChangelogDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [entry, setEntry] = useState<KnowledgeArticleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          setError('Обновление не найдено.');
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
  }, [slug]);

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
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-background p-8 text-center">
        <p className="text-sm text-muted-foreground">{error ?? 'Обновление не найдено.'}</p>
      </div>
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
