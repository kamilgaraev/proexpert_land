import { useEffect, useState } from 'react';
import { BookOpen, FileText, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { KnowledgeArticleCard } from '@/components/support/KnowledgeArticleCard';
import { KnowledgeHubSearch } from '@/components/support/KnowledgeHubSearch';
import { knowledgeHubApi } from '@/utils/knowledgeHubApi';
import type {
  KnowledgeArticleSummary,
  KnowledgeCategory,
  KnowledgeHubOverview,
  KnowledgeHubPaginationMeta,
} from '@/types/knowledgeHub';

const emptyMeta: KnowledgeHubPaginationMeta = {
  current_page: 1,
  per_page: 12,
  last_page: 1,
  total: 0,
};

const skeletons = Array.from({ length: 6 }, (_, index) => index);

const KnowledgeBasePage = () => {
  const [overview, setOverview] = useState<KnowledgeHubOverview | null>(null);
  const [articles, setArticles] = useState<KnowledgeArticleSummary[]>([]);
  const [meta, setMeta] = useState<KnowledgeHubPaginationMeta>(emptyMeta);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);
  const [isArticlesLoading, setIsArticlesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    setIsOverviewLoading(true);
    knowledgeHubApi.getOverview()
      .then((data) => {
        if (isMounted) {
          setOverview(data);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Не удалось загрузить базу знаний.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsOverviewLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    setIsArticlesLoading(true);
    knowledgeHubApi.getArticles({
      q: query.trim() || undefined,
      category: selectedCategory,
      page,
      per_page: 12,
    })
      .then((response) => {
        if (isMounted) {
          setArticles(response.data);
          setMeta(response.meta);
          setError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setError('Не удалось загрузить материалы.');
          setArticles([]);
          setMeta(emptyMeta);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsArticlesLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [page, query, selectedCategory]);

  const categories: KnowledgeCategory[] = overview?.categories ?? [];
  const featured = overview?.featured_articles ?? [];

  const handleCategoryChange = (slug?: string) => {
    setSelectedCategory(slug);
    setPage(1);
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <BookOpen className="h-5 w-5" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">База знаний</h1>
          <p className="max-w-2xl text-muted-foreground">
            Руководства, лучшие практики и советы по работе в личном кабинете.
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => setPage(1)}>
          <RefreshCw className="h-4 w-4" />
          Обновить
        </Button>
      </div>

      {isOverviewLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      ) : overview && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">{overview.summary.articles_count}</p>
                <p className="text-sm text-muted-foreground">Материалов</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <BookOpen className="h-6 w-6 text-blue-700" />
              <div>
                <p className="text-2xl font-bold text-foreground">{overview.summary.categories_count}</p>
                <p className="text-sm text-muted-foreground">Категорий</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-sm">
            <CardContent className="flex items-center gap-4 p-5">
              <RefreshCw className="h-6 w-6 text-emerald-700" />
              <div>
                <p className="text-2xl font-bold text-foreground">{overview.summary.changelog_count}</p>
                <p className="text-sm text-muted-foreground">Обновлений</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {featured.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Рекомендуемые материалы</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map((article) => (
              <KnowledgeArticleCard
                key={article.slug}
                article={article}
                to={`/dashboard/help/knowledge/${article.slug}`}
              />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-5">
        <KnowledgeHubSearch
          query={query}
          selectedCategory={selectedCategory}
          categories={categories}
          onQueryChange={handleQueryChange}
          onCategoryChange={handleCategoryChange}
          onSubmit={() => setPage(1)}
        />

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {isArticlesLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {skeletons.map((item) => (
              <Skeleton key={item} className="h-56" />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {articles.map((article) => (
              <KnowledgeArticleCard
                key={article.slug}
                article={article}
                to={`/dashboard/help/knowledge/${article.slug}`}
              />
            ))}
          </div>
        ) : (
          <Card className="border-border shadow-sm">
            <CardContent className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Материалы не найдены.</p>
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
      </section>
    </div>
  );
};

export default KnowledgeBasePage;
