import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { KnowledgeArticleSummary } from '@/types/knowledgeHub';

interface KnowledgeArticleCardProps {
  article: KnowledgeArticleSummary;
  to: string;
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

export function KnowledgeArticleCard({ article, to }: KnowledgeArticleCardProps) {
  const publishedAt = formatDate(article.release_date ?? article.published_at);

  return (
    <Card className="h-full border-border shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="flex h-full flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="rounded-md">
            {article.kind_label}
          </Badge>
          {article.category && (
            <span className="text-xs font-medium text-muted-foreground">{article.category.title}</span>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold leading-snug text-foreground">{article.title}</h3>
          {article.excerpt && (
            <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{article.excerpt}</p>
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {article.reading_time} мин
          </span>
          {publishedAt && (
            <span className="inline-flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {publishedAt}
            </span>
          )}
        </div>

        <Link
          to={to}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
        >
          Открыть
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
