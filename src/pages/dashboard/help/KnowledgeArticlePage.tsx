import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { KnowledgeArticleReader } from '@/components/support/KnowledgeArticleReader';
import { knowledgeHubApi } from '@/utils/knowledgeHubApi';
import type { KnowledgeArticleDetail } from '@/types/knowledgeHub';

const KnowledgeArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<KnowledgeArticleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [revision, setRevision] = useState(0);
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
          setError('Не удалось загрузить материал. Проверьте подключение и попробуйте ещё раз.');
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
  }, [slug, revision]);

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
      <section className="space-y-4 border border-border bg-background p-6">
        <h1 className="text-2xl font-semibold">Материал недоступен</h1>
        <p role="alert" className="text-base text-muted-foreground">{error ?? 'Материал не найден.'}</p>
        <div className="flex flex-wrap gap-3">
          {slug && <Button onClick={() => setRevision((value) => value + 1)}>Повторить загрузку</Button>}
          <Button asChild variant="outline"><Link to="/dashboard/help/knowledge">Все инструкции</Link></Button>
        </div>
      </section>
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
