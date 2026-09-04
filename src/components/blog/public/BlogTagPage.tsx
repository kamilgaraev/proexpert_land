import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Link, useParams, useSearchParams } from "react-router-dom";
import BlogArticleCard from "./BlogArticleCard";
import BlogPagination from "./BlogPagination";
import BlogPublicLayout from "./BlogPublicLayout";
import BlogSidebar from "./BlogSidebar";
import { getBlogListMeta } from "./blogPresentation";
import { useSEO } from "@/hooks/useSEO";
import type { BlogTagInitialData } from "@/types/blog";
import { readBlogIndexQuery, type BlogIndexQuery } from "@/utils/blogIndexQuery";
import {
  applyBlogTagArticles,
  createBlogTagData,
  getBlogTagName,
  getBlogTagSeo,
  normalizeBlogTagQuery,
} from "@/utils/blogTagListing";
import { blogPublicApi } from "@/utils/blogPublicApi";

interface BlogTagPageProps {
  initialData?: BlogTagInitialData;
}

const BlogTagContent = ({
  slug,
  query,
  initialData,
}: BlogTagPageProps & { slug: string; query: BlogIndexQuery }) => {
  const [data, setData] = useState(
    () => initialData ?? createBlogTagData(slug, query),
  );
  const [loading, setLoading] = useState(
    !data.articlesLoaded &&
      !data.notFound &&
      !data.pageNotFound &&
      !data.unavailable,
  );
  const tagName = getBlogTagName(data);
  const page = query.page ?? 1;
  const search = query.search;
  useSEO(getBlogTagSeo(data, query));

  useEffect(() => {
    let cancelled = false;
    const initial = initialData ?? createBlogTagData(slug, { page, search });
    if (initial.articlesLoaded || initial.notFound || initial.pageNotFound) return;
    const loadArticles = async () => {
      setLoading(true);
      try {
        const { data: payload } = await blogPublicApi.getArticles({
          tag_slug: slug,
          page,
          per_page: 12,
          search: search || undefined,
        });
        const next = applyBlogTagArticles(initial, payload.data, payload.meta);
        if (!cancelled) setData(next);
      } catch (error) {
        if (!cancelled) {
          setData({
            ...initial,
            unavailable: !(
              isAxiosError(error) && error.response?.status === 404
            ),
            notFound: isAxiosError(error) && error.response?.status === 404,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadArticles();
    return () => {
      cancelled = true;
    };
  }, [slug, page, search, initialData]);

  return (
    <BlogPublicLayout
      title={
        data.notFound
          ? "Тема не найдена"
          : data.pageNotFound
            ? "Страница не найдена"
            : tagName
              ? `Статьи: ${tagName}`
              : "Статьи по теме"
      }
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
              {!loading &&
              !data.unavailable &&
              !data.notFound &&
              !data.pageNotFound ? (
                <p>{getBlogListMeta(data.articles.length)}</p>
              ) : null}
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
            ) : data.unavailable ? (
              <div className="most-blog-notice" role="alert">
                <h3>Материалы временно недоступны</h3>
                <p>Не удалось загрузить материалы этой темы. Попробуйте позже.</p>
              </div>
            ) : data.articles.length ? (
              <>
                <div className="most-blog-grid">
                  {data.articles.map((article) => (
                    <BlogArticleCard key={article.id} article={article} />
                  ))}
                </div>
                <BlogPagination
                  pathname={`/blog/tag/${encodeURIComponent(slug)}`}
                  query={query}
                  hasNext={page < data.pagination.last_page}
                />
              </>
            ) : (
              <div className="most-blog-notice">
                <h3>
                  {data.pageNotFound
                    ? "Страница не найдена"
                    : data.notFound
                      ? "Выберите другую тему"
                      : "По этой теме пока нет материалов"}
                </h3>
                <p>Вернитесь к общей ленте или выберите другую тему.</p>
                {data.pageNotFound ? (
                  <Link
                    to={`/blog/tag/${encodeURIComponent(slug)}`}
                    className="most-blog-read"
                  >
                    К началу подборки
                  </Link>
                ) : null}
              </div>
            )}
          </div>
          <BlogSidebar />
        </div>
      </section>
    </BlogPublicLayout>
  );
};

const BlogTagPage = ({ initialData }: BlogTagPageProps = {}) => {
  const { slug = "" } = useParams<{ slug: string }>();
  const [params] = useSearchParams();
  const query = normalizeBlogTagQuery(readBlogIndexQuery(params));
  const queryKey = createBlogTagData(slug, query).queryKey;
  return (
    <BlogTagContent
      key={`${slug}:${queryKey}`}
      slug={slug}
      query={query}
      initialData={
        initialData?.slug === slug && initialData.queryKey === queryKey
          ? initialData
          : undefined
      }
    />
  );
};

export default BlogTagPage;
