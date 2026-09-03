import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import BlogArticleCard from "./BlogArticleCard";
import BlogPublicLayout from "./BlogPublicLayout";
import BlogSidebar from "./BlogSidebar";
import { getBlogListMeta } from "./blogPresentation";
import {
  filterBlogArticlesByTagSlug,
  getBlogTagDisplayName,
  getBlogTagSearchTerm,
  resolveBlogTagBySlug,
} from "./blogTags";
import { useSEO } from "@/hooks/useSEO";
import type { BlogArticle, BlogTag } from "@/types/blog";
import { blogPublicApi } from "@/utils/blogPublicApi";

const BlogTagPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<BlogArticle[]>([]);
  const [tag, setTag] = useState<BlogTag | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const tagDisplayName = tag ? getBlogTagDisplayName(slug, tag) : "";

  useSEO({
    title: tagDisplayName
      ? `Тег #${tagDisplayName} - блог МОСТ`
      : "Теги блога МОСТ",
    description: tagDisplayName
      ? `Подборка статей МОСТ по тегу #${tagDisplayName}.`
      : "Подборка статей МОСТ по тегам.",
    keywords: tagDisplayName
      ? `${tagDisplayName}, блог МОСТ, строительство`
      : "теги блога МОСТ",
    noIndex: true,
    type: "website",
  });

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        setTag(null);

        if (!slug) {
          setArticles([]);
          setHasMore(false);
          setCurrentPage(1);
          return;
        }

        const tagsResponse = await blogPublicApi.getTags(50);
        const tagsData = (tagsResponse.data as { data: BlogTag[] }).data;
        const resolvedTag = resolveBlogTagBySlug(tagsData, slug);
        setTag(resolvedTag);

        const response = await blogPublicApi.searchArticles(
          getBlogTagSearchTerm(slug, resolvedTag),
          12,
        );
        const payload = response.data as { data?: BlogArticle[] };
        const rawArticles = payload.data || [];
        const nextArticles = filterBlogArticlesByTagSlug(rawArticles, slug);

        setArticles(nextArticles);
        setCurrentPage(1);
        setHasMore(rawArticles.length === 12);
      } catch (fetchError) {
        console.error("Error fetching articles by tag:", fetchError);
        setError("Не удалось загрузить подборку по тегу.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [slug]);

  const handleLoadMore = async () => {
    const searchTerm = getBlogTagSearchTerm(slug, tag);

    if (!searchTerm) {
      return;
    }

    try {
      setLoadingMore(true);

      const nextPage = currentPage + 1;
      const response = await blogPublicApi.searchArticles(
        searchTerm,
        nextPage * 12,
      );
      const payload = response.data as { data?: BlogArticle[] };
      const rawArticles = payload.data || [];
      const nextArticles = filterBlogArticlesByTagSlug(rawArticles, slug);

      setArticles(nextArticles);
      setCurrentPage(nextPage);
      setHasMore(rawArticles.length === nextPage * 12);
    } catch (fetchError) {
      console.error("Error loading more tag articles:", fetchError);
      setError("Не удалось загрузить дополнительные статьи по тегу.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <BlogPublicLayout
      title={tagDisplayName ? `Статьи: ${tagDisplayName}` : "Статьи по теме"}
      description="Практические материалы о работе строительной команды."
      nav={[
        { label: "Статьи по теме", href: "#blog-feed" },
        { label: "Все статьи", href: "#blog-tag-actions" },
        { label: "Контакты", href: "#blog-cta" },
      ]}
    >
      <section id="blog-tag-actions" className="most-blog-filters">
        <div className="most-container">
          <Link to="/blog" className="most-blog-read">
            Открыть все статьи
          </Link>
        </div>
      </section>
      <section id="blog-feed" className="most-blog-section">
        <div className="most-container most-blog-list-layout">
          <div>
            <div className="most-blog-feed-intro">
              <h2>Статьи по теме</h2>
              {!error ? <p>{getBlogListMeta(articles.length)}</p> : null}
            </div>
            {loading ? (
              <div className="most-blog-grid" aria-label="Загружаем статьи">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="most-blog-skeleton">
                    <div className="aspect-[16/10] animate-pulse bg-concrete-100" />
                    <div className="mt-5 h-4 w-32 animate-pulse bg-concrete-100" />
                    <div className="mt-4 h-8 w-4/5 animate-pulse bg-concrete-100" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="most-blog-notice" role="alert">
                {error}
              </div>
            ) : articles.length ? (
              <>
                <div className="most-blog-grid">
                  {articles.map((article) => (
                    <BlogArticleCard key={article.id} article={article} />
                  ))}
                </div>
                {hasMore ? (
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="most-blog-button"
                  >
                    {loadingMore ? "Загружаем статьи" : "Показать еще"}
                  </button>
                ) : null}
              </>
            ) : (
              <div className="most-blog-notice">
                <h3>По этому тегу пока нет материалов</h3>
                <p>Вернитесь к общей ленте или выберите другую тему.</p>
              </div>
            )}
          </div>
          <BlogSidebar />
        </div>
      </section>
    </BlogPublicLayout>
  );
};

export default BlogTagPage;
