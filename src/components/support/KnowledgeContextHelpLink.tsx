import { Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';

interface KnowledgeContextHelpLinkProps {
  contextKey: string;
  moduleSlug?: string;
  permissionKey?: string;
  className?: string;
}

export function KnowledgeContextHelpLink({ contextKey, className = '' }: KnowledgeContextHelpLinkProps) {
  return (
    <Link
      to={`/dashboard/help/knowledge?context_key=${encodeURIComponent(contextKey)}`}
      className={`inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-primary transition hover:bg-secondary ${className}`}
    >
      <HelpCircle className="h-4 w-4" aria-hidden="true" />
      Нужна помощь?
    </Link>
  );
}
