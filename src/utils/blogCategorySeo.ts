import type { BlogCategory } from "@/types/blog";
import { getBlogListingSeo, type BlogIndexQuery } from "./blogIndexQuery";

export const getBlogCategorySeo = (
  slug: string,
  category: BlogCategory | null,
  notFound = false,
  query: BlogIndexQuery = {},
  pageNotFound = false,
  unavailable = false,
) => ({
  ...getBlogListingSeo(
    `/blog/category/${encodeURIComponent(slug)}`,
    { ...query, category: null },
    category?.meta_title ||
      (category ? `${category.name} — блог МОСТ` : "Категория блога МОСТ"),
    notFound || pageNotFound,
    unavailable,
  ),
  ...(notFound ? { title: "Категория не найдена | МОСТ" } : {}),
  description: notFound
    ? "Категория блога МОСТ не найдена. Посмотрите другие темы и материалы."
    : category?.meta_description ||
      category?.description ||
      (category
        ? `Подборка материалов МОСТ по теме «${category.name}».`
        : "Подборка материалов МОСТ по категориям блога."),
  type: "website" as const,
});
