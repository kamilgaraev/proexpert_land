import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { KnowledgeArticleDetail } from '@/types/knowledgeHub';
import { KnowledgeArticleCard } from './KnowledgeArticleCard';

interface KnowledgeArticleReaderProps {
  article: KnowledgeArticleDetail;
  backTo: string;
  relatedBasePath: string;
}

const formatDate = (value: string | null): string | null => {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
};

const addHeadingAnchors = (content: string | null, article: KnowledgeArticleDetail): string => {
  if (!content || article.table_of_contents.length === 0) {
    return content ?? '';
  }

  let index = 0;

  return content.replace(/<h([2-3])([^>]*)>/gi, (match, level: string, attributes: string) => {
    const tocItem = article.table_of_contents[index];
    index += 1;

    if (!tocItem || attributes.includes(' id=')) {
      return match;
    }

    return `<h${level}${attributes} id="${tocItem.anchor}">`;
  });
};

export function KnowledgeArticleReader({ article, backTo, relatedBasePath }: KnowledgeArticleReaderProps) {
  const publishedAt = formatDate(article.release_date ?? article.published_at);
  const content = useMemo(() => addHeadingAnchors(article.content, article), [article]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <Button asChild variant="ghost" className="gap-2 px-0">
        <Link to={backTo}>
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_240px]">
        <article className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="rounded-md">
                {article.kind_label}
              </Badge>
              {article.category && <span className="text-sm text-muted-foreground">{article.category.title}</span>}
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {article.reading_time} мин
              </span>
              {publishedAt && <span className="text-sm text-muted-foreground">{publishedAt}</span>}
            </div>
            <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl">{article.title}</h1>
            {article.excerpt && <p className="text-lg leading-8 text-muted-foreground">{article.excerpt}</p>}
          </div>

          <div
            className="prose prose-slate max-w-none prose-headings:scroll-mt-24 prose-headings:text-foreground prose-p:leading-8 prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>

        {article.table_of_contents.length > 0 && (
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-3 rounded-lg border border-border bg-background p-4">
              <p className="text-sm font-semibold text-foreground">В статье</p>
              <nav className="space-y-2">
                {article.table_of_contents.map((item) => (
                  <a
                    key={`${item.anchor}-${item.title}`}
                    href={`#${item.anchor}`}
                    className="block text-sm leading-5 text-muted-foreground hover:text-primary"
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        )}
      </div>

      {article.related.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Похожие материалы</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {article.related.map((related) => (
              <KnowledgeArticleCard
                key={related.slug}
                article={related}
                to={`${relatedBasePath}/${related.slug}`}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
