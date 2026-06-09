import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { KnowledgeArticleReader } from '@/components/support/KnowledgeArticleReader';
import { knowledgeHubApi } from '@/utils/knowledgeHubApi';
import type { KnowledgeArticleDetail } from '@/types/knowledgeHub';

const KnowledgeArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<KnowledgeArticleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError('Материал не найден.');
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    setIsLoading(true);
    knowledgeHubApi.getArticle(slug)
      .then((data) => {
        if (isMounted) {
          setArticle(data);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Материал не найден.');
          setArticle(null);
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
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg border border-border bg-background p-8 text-center">
        <p className="text-sm text-muted-foreground">{error ?? 'Материал не найден.'}</p>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <KnowledgeArticleReader
        article={article}
        backTo="/dashboard/help/knowledge"
        relatedBasePath="/dashboard/help/knowledge"
      />
    </div>
  );
};

export default KnowledgeArticlePage;
