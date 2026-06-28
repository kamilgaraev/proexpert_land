import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { knowledgeHubApi } from '@/utils/knowledgeHubApi';
import type { KnowledgeArticleSummary, KnowledgeHubFilters } from '@/types/knowledgeHub';

interface KnowledgeContextHelpLinkProps {
  contextKey: string;
  moduleSlug?: string;
  permissionKey?: string;
  className?: string;
}

export function KnowledgeContextHelpLink({
  contextKey,
  moduleSlug,
  permissionKey,
  className = '',
}: KnowledgeContextHelpLinkProps) {
  const [article, setArticle] = useState<KnowledgeArticleSummary | null>(null);

  useEffect(() => {
    let isMounted = true;

    const filters: KnowledgeHubFilters = {
      context_key: contextKey,
      module_slug: moduleSlug,
      permission_key: permissionKey,
      limit: 1,
    };

    knowledgeHubApi.getContextHelp(filters)
      .then((response) => {
        if (isMounted) {
          setArticle(response.primary ?? response.suggested[0] ?? null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setArticle(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [contextKey, moduleSlug, permissionKey]);

  if (!article) {
    return null;
  }

  return (
    <Link
      to={`/dashboard/help/knowledge/${article.slug}`}
      className={`inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-100 ${className}`}
    >
      <HelpCircle className="h-4 w-4" />
      Нужна помощь?
    </Link>
  );
}
