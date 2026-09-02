import type { BlogCategory } from "@/types/blog";

export const getBlogCategorySeo = (
  slug: string,
  category: BlogCategory | null,
  notFound = false,
) => ({
  title: notFound
    ? "Категория не найдена | МОСТ"
    : category?.meta_title ||
      (category ? `${category.name} — блог МОСТ` : "Категория блога МОСТ"),
  description: notFound
    ? "Категория блога МОСТ не найдена. Посмотрите другие темы и материалы."
    : category?.meta_description ||
      category?.description ||
      (category
        ? `Подборка материалов МОСТ по теме «${category.name}».`
        : "Подборка материалов МОСТ по категориям блога."),
  canonicalUrl: `https://1мост.рф/blog/category/${encodeURIComponent(slug)}`,
  type: "website" as const,
  noIndex: notFound,
  statusCode: notFound ? 404 : 200,
});
