import { useContext, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { KnowledgeArticleReader } from '@/components/support/KnowledgeArticleReader';
import { AuthContext } from '@/contexts/AuthContext';
import { aiAssistantService, AssistantApiError } from '@/services/aiAssistantService';
import { getAuthSessionVersion } from '@/utils/authTokenStorage';
import { KNOWLEDGE_ARTICLES_PATH } from '@/utils/knowledgeArticleRoutes';
import type { KnowledgeArticleDetail } from '@/types/knowledgeHub';

const KnowledgeArticleView = ({ slug }: { slug?: string }) => {
  const [article, setArticle] = useState<KnowledgeArticleDetail | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(slug));
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const controller = new AbortController();

    setIsLoading(true);
    aiAssistantService.getKnowledgeArticle(slug, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setArticle(data);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError(reason instanceof AssistantApiError && [403, 404].includes(reason.status)
            ? 'Материал не найден или недоступен.'
            : 'Не удалось загрузить материал. Проверьте подключение и попробуйте ещё раз.');
          setArticle(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
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
          <Button asChild variant="outline"><Link to={KNOWLEDGE_ARTICLES_PATH}>Все инструкции</Link></Button>
        </div>
      </section>
    );
  }

  return (
    <div className="pb-20">
      <KnowledgeArticleReader
        article={article}
        backTo={KNOWLEDGE_ARTICLES_PATH}
        relatedBasePath={KNOWLEDGE_ARTICLES_PATH}
      />
    </div>
  );
};

const KnowledgeArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, token } = useContext(AuthContext);
  const activeSlug = user?.current_organization_id && token ? slug : undefined;
  const scope = JSON.stringify([user?.id, user?.current_organization_id, activeSlug, getAuthSessionVersion()]);

  return <KnowledgeArticleView key={scope} slug={activeSlug} />;
};

export default KnowledgeArticlePage;
