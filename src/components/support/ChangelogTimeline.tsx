import { Link } from 'react-router-dom';
import { CalendarDays, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { KnowledgeArticleSummary } from '@/types/knowledgeHub';

interface ChangelogTimelineProps {
  entries: KnowledgeArticleSummary[];
}

const formatDate = (value: string | null): string => {
  if (!value) {
    return 'Дата не указана';
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
};

export function ChangelogTimeline({ entries }: ChangelogTimelineProps) {
  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.slug} className="border-border shadow-sm transition-shadow hover:shadow-md">
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-start md:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(entry.release_date ?? entry.published_at)}
                </span>
                {entry.release_version && (
                  <Badge variant="outline" className="rounded-md">
                    {entry.release_version}
                  </Badge>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold leading-snug text-foreground">{entry.title}</h3>
                {entry.excerpt && <p className="mt-1 text-sm leading-6 text-muted-foreground">{entry.excerpt}</p>}
              </div>
            </div>
            <Link
              to={`/dashboard/help/changelog/${entry.slug}`}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Подробнее
              <ChevronRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
