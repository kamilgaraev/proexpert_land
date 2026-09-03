import { ClockIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import BlogArticleCard from "./BlogArticleCard";
import BlogPublicLayout from "./BlogPublicLayout";
import BlogSidebar from "./BlogSidebar";
import { formatBlogDate, getBlogReadingTime } from "./blogPresentation";
import { useSEO } from "@/hooks/useSEO";
import type { BlogArticle } from "@/types/blog";
import { generateArticleSchema, normalizeArticleTitleBrand } from "@/utils/seo";
import { blogPublicApi } from "@/utils/blogPublicApi";

interface BlogArticlePageProps {
  initialArticle?: BlogArticle;
  initialArticleNotFound?: boolean;
  initialArticleNotFoundSlug?: string;
}

const ARTICLE_NOT_FOUND_MESSAGE = "Статья не найдена или временно недоступна.";
const BASE_URL = "https://1мост.рф";

const isNotFoundResponse = (error: unknown) => {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return false;
  }

  const response = error.response;
  return Boolean(
    response &&
    typeof response === "object" &&
    "status" in response &&
    response.status === 404,
  );
};

const BlogArticlePage = ({
  initialArticle,
  initialArticleNotFound = false,
  initialArticleNotFoundSlug,
}: BlogArticlePageProps) => {
  const { slug, articleId } = useParams<{
    slug?: string;
    articleId?: string;
  }>();
  const [searchParams] = useSearchParams();
  const isPreview = Boolean(articleId);
  const hasInitialArticle = !isPreview && initialArticle?.slug === slug;
  const hasInitialNotFound =
    !isPreview && initialArticleNotFound && initialArticleNotFoundSlug === slug;
  const currentRouteKey = isPreview
    ? `preview:${articleId ?? ""}`
    : `article:${slug ?? ""}`;
  const [article, setArticle] = useState<BlogArticle | null>(() =>
    hasInitialArticle ? (initialArticle ?? null) : null,
  );
  const [relatedArticles, setRelatedArticles] = useState<BlogArticle[]>([]);
  const [loading, setLoading] = useState(
    () => !(hasInitialArticle || hasInitialNotFound),
  );
  const [error, setError] = useState<string | null>(() =>
    hasInitialNotFound ? ARTICLE_NOT_FOUND_MESSAGE : null,
  );
  const [notFoundRouteKey, setNotFoundRouteKey] = useState<string | null>(() =>
    hasInitialNotFound ? currentRouteKey : null,
  );
  const articleMatchesRoute = Boolean(
    article &&
    (isPreview ? `${article.id}` === articleId : article.slug === slug),
  );
  const seoArticle = articleMatchesRoute ? article : null;
  const articleNotFound =
    hasInitialNotFound || notFoundRouteKey === currentRouteKey;
  const articleImage =
    seoArticle?.og_image || seoArticle?.featured_image || undefined;
  const publishedTime =
    seoArticle?.published_at || seoArticle?.created_at || undefined;
  const modifiedTime = seoArticle?.updated_at || undefined;

  useSEO(
    seoArticle
      ? {
          title: normalizeArticleTitleBrand(
            seoArticle.meta_title || seoArticle.og_title || seoArticle.title,
          ),
          description:
            seoArticle.meta_description ||
            seoArticle.og_description ||
            seoArticle.excerpt ||
            "Статья МОСТ",
          keywords:
            seoArticle.meta_keywords?.join(", ") ||
            seoArticle.tags.map((tag) => tag.name).join(", "),
          ogImage: articleImage,
          type: "article",
          author: seoArticle.author.name,
          publishedTime,
          modifiedTime,
          noIndex: isPreview || seoArticle.noindex,
          canonicalUrl: isPreview
            ? `${BASE_URL}/blog/preview/${seoArticle.id}`
            : `${BASE_URL}/blog/${seoArticle.slug}`,
          structuredData: generateArticleSchema({
            title: seoArticle.title,
            description:
              seoArticle.meta_description ||
              seoArticle.og_description ||
              seoArticle.excerpt ||
              seoArticle.title,
            author: seoArticle.author.name,
            publishedTime,
            modifiedTime,
            image: articleImage,
            category: seoArticle.category.name,
            tags: seoArticle.tags.map((tag) => tag.name),
            url: isPreview
              ? `${BASE_URL}/blog/preview/${seoArticle.id}`
              : `${BASE_URL}/blog/${seoArticle.slug}`,
          }),
        }
      : articleNotFound
        ? {
            title: "Статья не найдена | МОСТ",
            description:
              "Материал блога МОСТ не найден или еще не опубликован.",
            type: "website",
            noIndex: true,
            statusCode: 404,
            canonicalUrl: `${BASE_URL}/blog`,
          }
        : {
            title: "Блог МОСТ",
            description:
              "Материалы МОСТ о строительных процессах и управлении проектами.",
            type: "website",
          },
  );

  useEffect(() => {
    const fetchRelatedArticles = async (articleData: BlogArticle) => {
      if (isPreview || !articleData.id) {
        setRelatedArticles([]);
        return;
      }

      try {
        const relatedResponse = await blogPublicApi.getRelatedArticles(
          articleData.id,
          3,
        );
        setRelatedArticles(
          (relatedResponse.data as { data: BlogArticle[] }).data,
        );
      } catch {
        setRelatedArticles([]);
      }
    };

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        setArticle(null);
        setNotFoundRouteKey(null);

        const response = isPreview
          ? await blogPublicApi.getPreviewArticle(articleId!, searchParams)
          : await blogPublicApi.getArticle(slug!);
        const articleData = (response.data as { data: BlogArticle }).data;
        setArticle(articleData);
        setNotFoundRouteKey(null);
        await fetchRelatedArticles(articleData);
      } catch (fetchError) {
        console.error("Error fetching article:", fetchError);
        setArticle(null);
        setRelatedArticles([]);
        setNotFoundRouteKey(
          isNotFoundResponse(fetchError) ? currentRouteKey : null,
        );
        setError(ARTICLE_NOT_FOUND_MESSAGE);
      } finally {
        setLoading(false);
      }
    };

    if (hasInitialArticle && initialArticle) {
      setArticle(initialArticle);
      setNotFoundRouteKey(null);
      setError(null);
      setLoading(false);
      void fetchRelatedArticles(initialArticle);
      return;
    }

    if (hasInitialNotFound) {
      setArticle(null);
      setRelatedArticles([]);
      setNotFoundRouteKey(currentRouteKey);
      setError(ARTICLE_NOT_FOUND_MESSAGE);
      setLoading(false);
      return;
    }

    if ((isPreview && articleId) || (!isPreview && slug)) {
      fetchArticle();
    }
  }, [
    articleId,
    currentRouteKey,
    hasInitialArticle,
    hasInitialNotFound,
    initialArticle,
    isPreview,
    searchParams,
    slug,
  ]);

  if (loading || (!articleMatchesRoute && !error && !articleNotFound)) {
    return (
      <BlogPublicLayout
        title="Загружаем материал"
        description="Подготавливаем статью и связанные материалы."
      >
        <section className="most-blog-section">
          <div className="most-container most-blog-article-layout">
            <div>
              <div className="h-4 w-40 animate-pulse rounded bg-concrete-100" />
              <div className="mt-4 h-12 w-4/5 animate-pulse rounded bg-concrete-100" />
              <div className="mt-4 h-24 animate-pulse rounded bg-concrete-100" />
            </div>
            <div>
              <div className="h-48 animate-pulse rounded bg-concrete-100" />
            </div>
          </div>
        </section>
      </BlogPublicLayout>
    );
  }

  if (error || !article || !articleMatchesRoute) {
    return (
      <BlogPublicLayout
        title="Статья недоступна"
        description="Похоже, материал был перемещен, удален или еще не опубликован."
      >
        <section className="most-blog-section">
          <div className="most-container">
            <div className="most-blog-notice">
              <h2 className="text-3xl font-bold text-steel-950">
                Статья не найдена
              </h2>
              <p className="mt-4 text-sm leading-7 text-steel-600">{error}</p>
              <Link to="/blog" className="most-blog-button">
                Вернуться в блог
              </Link>
            </div>
          </div>
        </section>
      </BlogPublicLayout>
    );
  }

  return (
    <BlogPublicLayout
      title={article.title}
      description={
        article.excerpt ||
        "Материал МОСТ о строительных процессах, ролях и проектных данных."
      }
      nav={[
        { label: "Содержание", href: "#article-content" },
        ...(relatedArticles.length > 0 && !isPreview
          ? [{ label: "Похожие материалы", href: "#related-articles" }]
          : []),
        { label: "Контакты", href: "#blog-cta" },
      ]}
    >
      <section id="article-content" className="most-blog-section">
        <div className="most-container most-blog-article-layout">
          <article className="most-blog-article">
            <div>
              <nav className="most-blog-breadcrumbs" aria-label="Путь к статье">
                <Link to="/" className="transition hover:text-construction-700">
                  Главная
                </Link>
                <span>/</span>
                <Link
                  to="/blog"
                  className="transition hover:text-construction-700"
                >
                  {isPreview ? "Предпросмотр" : "Блог"}
                </Link>
                <span>/</span>
                {isPreview ? (
                  <span>Черновик</span>
                ) : (
                  <Link
                    to={`/blog/category/${article.category.slug}`}
                    className="transition hover:text-construction-700"
                  >
                    {article.category.name}
                  </Link>
                )}
              </nav>

              <div className="most-blog-byline">
                <span>{article.author.name}</span>
                <time dateTime={article.published_at || article.created_at || undefined}>
                  {formatBlogDate(article.published_at || article.created_at)}
                </time>
                <span className="most-blog-reading">
                  <ClockIcon aria-hidden="true" />
                  {getBlogReadingTime(article.content)}
                </span>
              </div>

              {article.featured_image ? (
                <div>
                  <img
                    src={article.featured_image}
                    alt={article.title}
                    className="most-blog-article-cover"
                    decoding="async"
                  />
                </div>
              ) : null}

              <div
                className="blog-content mt-8"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {article.tags?.length ? (
                <div className="mt-8 border-t border-steel-100 pt-6">
                  <div className="most-blog-tags" aria-label="Темы статьи">
                    {article.tags.map((tag) => (
                      <Link key={tag.id} to={`/blog/tag/${tag.slug}`}>
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {relatedArticles.length > 0 && !isPreview ? (
              <section id="related-articles" className="most-blog-related">
                <h2>Продолжить чтение</h2>
                <div className="most-blog-grid">
                  {relatedArticles.map((relatedArticle) => (
                    <BlogArticleCard
                      key={relatedArticle.id}
                      article={relatedArticle}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </article>

          <BlogSidebar />
        </div>
      </section>
    </BlogPublicLayout>
  );
};

export default BlogArticlePage;
