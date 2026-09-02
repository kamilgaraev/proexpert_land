import App from '@/App';
import type { BlogArticle, BlogCategoryInitialData, BlogIndexInitialData } from '@/types/blog';

interface CatchAllPageProps {
  initialBlogIndexData?: BlogIndexInitialData;
  initialBlogCategoryData?: BlogCategoryInitialData;
  initialBlogArticle?: BlogArticle;
  initialBlogArticleNotFound?: boolean;
  initialBlogArticleNotFoundSlug?: string;
}

export const Page = (props: CatchAllPageProps) => <App {...props} />;
