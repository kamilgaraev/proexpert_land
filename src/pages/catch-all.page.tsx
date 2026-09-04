import App from '@/App';
import type { BlogArticle, BlogCategoryInitialData, BlogIndexInitialData, BlogTagInitialData } from '@/types/blog';

interface CatchAllPageProps {
  initialBlogIndexData?: BlogIndexInitialData;
  initialBlogCategoryData?: BlogCategoryInitialData;
  initialBlogTagData?: BlogTagInitialData;
  initialBlogArticle?: BlogArticle;
  initialBlogArticleNotFound?: boolean;
  initialBlogArticleNotFoundSlug?: string;
}

export const Page = (props: CatchAllPageProps) => <App {...props} />;
