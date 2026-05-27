import App from '@/App';
import type { BlogArticle } from '@/types/blog';

interface CatchAllPageProps {
  initialBlogArticle?: BlogArticle;
  initialBlogArticleNotFound?: boolean;
  initialBlogArticleNotFoundSlug?: string;
}

export const Page = (props: CatchAllPageProps) => <App {...props} />;
