import { FormEvent } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { KnowledgeCategory } from '@/types/knowledgeHub';

interface KnowledgeHubSearchProps {
  query: string;
  selectedCategory?: string;
  categories: KnowledgeCategory[];
  onQueryChange: (value: string) => void;
  onCategoryChange: (value?: string) => void;
  onSubmit: () => void;
}

export function KnowledgeHubSearch({
  query,
  selectedCategory,
  categories,
  onQueryChange,
  onCategoryChange,
  onSubmit,
}: KnowledgeHubSearchProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <div className="space-y-4">
      <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Поиск по базе знаний"
            className="pl-9"
          />
        </div>
        <Button type="submit" className="gap-2">
          <Search className="h-4 w-4" />
          Найти
        </Button>
      </form>

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            onClick={() => onCategoryChange(undefined)}
          >
            Все
          </Button>
          {categories.map((category) => (
            <Button
              key={category.slug}
              type="button"
              variant={selectedCategory === category.slug ? 'default' : 'outline'}
              size="sm"
              onClick={() => onCategoryChange(category.slug)}
            >
              {category.title}
            </Button>
          ))}
          {(query || selectedCategory) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => {
                onQueryChange('');
                onCategoryChange(undefined);
              }}
            >
              <X className="h-4 w-4" />
              Сбросить
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
