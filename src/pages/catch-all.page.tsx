import App from '@/App';
import type { BlogArticle, BlogIndexInitialData } from '@/types/blog';

interface CatchAllPageProps {
  initialBlogIndexData?: BlogIndexInitialData;
  initialBlogArticle?: BlogArticle;
  initialBlogArticleNotFound?: boolean;
  initialBlogArticleNotFoundSlug?: string;
}

export const Page = (props: CatchAllPageProps) => <App {...props} />;
