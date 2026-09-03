import { StrictMode } from "react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import type {
  BlogArticle,
  BlogCategory,
  BlogCategoryInitialData,
} from "@/types/blog";
import BlogCategoryPage from "./BlogCategoryPage";

const apiUrl = (path: string) => new URL(path, "https://api.1мост.рф").href;
const category: BlogCategory = {
  id: 7,
  name: "Управление",
  slug: "management",
  color: "#111111",
  sort_order: 1,
  is_active: true,
  created_at: null,
  updated_at: null,
};
const nextCategory: BlogCategory = {
  ...category,
  id: 8,
  name: "Материалы",
  slug: "materials",
};
const article: BlogArticle = {
  id: 42,
  title: "Как управлять стройкой",
  slug: "manage-construction",
  excerpt: "Практический разбор",
  content: "<p>Материал</p>",
  status: "published",
  published_at: "2026-07-01T10:00:00Z",
  views_count: 10,
  likes_count: 0,
  comments_count: 0,
  reading_time: 2,
  estimated_reading_time: 2,
  is_featured: false,
  allow_comments: true,
  is_published_in_rss: true,
  noindex: false,
  sort_order: 1,
  url: "/blog/manage-construction",
  is_published: true,
  category,
  author: { id: 3, name: "Редакция", email: null },
  tags: [],
  created_at: null,
  updated_at: null,
};
const nextArticle: BlogArticle = {
  ...article,
  id: 43,
  title: "Как учитывать материалы",
  slug: "materials-accounting",
  category: nextCategory,
};
const pagination = { current_page: 1, last_page: 1, per_page: 12, total: 1 };
const initialData: BlogCategoryInitialData = {
  slug: category.slug,
  category,
  categories: [category, nextCategory],
  articles: [article],
  pagination,
  categoriesLoaded: true,
  articlesLoaded: true,
  notFound: false,
};
const requests = { articles: 0, categories: 0 };
const server = setupServer(
  http.get(apiUrl("/api/v1/blog/categories"), () => {
    requests.categories += 1;
    return HttpResponse.json({ success: true, data: [category, nextCategory] });
  }),
  http.get(apiUrl("/api/v1/blog/articles"), ({ request }) => {
    requests.articles += 1;
    const selectedArticle =
      new URL(request.url).searchParams.get("category_id") === "8"
        ? nextArticle
        : article;
    return HttpResponse.json({
      success: true,
      data: { data: [selectedArticle], meta: pagination },
    });
  }),
  http.get(apiUrl("/api/v1/blog/articles/popular"), () =>
    HttpResponse.json({ success: true, data: [] }),
  ),
  http.get(apiUrl("/api/v1/blog/tags"), () =>
    HttpResponse.json({ success: true, data: [] }),
  ),
);
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterAll(() => server.close());
afterEach(() => {
  server.resetHandlers();
  requests.articles = 0;
  requests.categories = 0;
});
const tree = (
  data: BlogCategoryInitialData | undefined,
  entry = "/blog/category/management",
) => (
  <MemoryRouter initialEntries={[entry]}>
    <Routes>
      <Route
        path="/blog/category/:slug"
        element={<BlogCategoryPage initialData={data} />}
      />
    </Routes>
  </MemoryRouter>
);

describe("BlogCategoryPage URL pagination", () => {
  it("hydrates category page 2 without fetching and preserves search in pagination links", async () => {
    render(tree({ ...initialData, queryKey: 'category=management&search=budget&page=2', pagination: { current_page: 2, last_page: 3, per_page: 12, total: 30 } }, '/blog/category/management?search=budget&page=2'));
    expect(screen.getByRole('heading', { name: article.title })).toBeVisible();
    expect(screen.getByRole('link', { name: 'Следующая' })).toHaveAttribute('href', '/blog/category/management?search=budget&page=3');
    await act(async () => { await Promise.resolve(); });
    expect(requests).toEqual({ articles: 0, categories: 0 });
  });

  it("loads the requested URL page and replaces old category content", async () => {
    const pages: string[] = [];
    server.use(http.get(apiUrl('/api/v1/blog/articles'), ({ request }) => {
      const page = new URL(request.url).searchParams.get('page') || '1';
      pages.push(page);
      return HttpResponse.json({ success: true, data: { data: [{ ...article, title: `Категория: страница ${page}` }], meta: { current_page: Number(page), last_page: 2, per_page: 12, total: 13 } } });
    }));
    render(tree({ ...initialData, pagination: { current_page: 1, last_page: 2, per_page: 12, total: 13 } }));
    fireEvent.click(screen.getByRole('link', { name: 'Следующая' }));
    await screen.findByRole('heading', { name: 'Категория: страница 2' });
    expect(screen.queryByRole('heading', { name: article.title })).not.toBeInTheDocument();
    expect(pages).toEqual(['2']);
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute('href', 'https://1мост.рф/blog/category/management?page=2');
  });

  it("shows an unavailable page without displaying another page of articles", async () => {
    render(tree(initialData, '/blog/category/management?page=9'));
    await screen.findByRole('heading', { level: 1, name: 'Страница не найдена' });
    expect(screen.queryByRole('heading', { name: article.title })).not.toBeInTheDocument();
  });
});

describe("BlogCategoryPage initial data", () => {
  it("renders category H1 and article links into server HTML", () => {
    const html = renderToString(tree(initialData));
    expect(html).toMatch(/<h1[^>]*>Управление<\/h1>/);
    expect(html).toContain('href="/blog/manage-construction"');
    expect(html).not.toContain("animate-pulse");
  });

  it("uses initial content without repeating successful catalogue or article requests in StrictMode", async () => {
    render(<StrictMode>{tree(initialData)}</StrictMode>);
    expect(
      screen.getByRole("heading", { level: 1, name: "Управление" }),
    ).toBeVisible();
    await act(async () => {
      await Promise.resolve();
    });
    expect(requests).toEqual({ articles: 0, categories: 0 });
    expect(document.title).toBe("Управление — блог МОСТ");
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://1мост.рф/blog/category/management",
    );
  });

  it("fetches only missing articles when the catalogue was rendered successfully", async () => {
    render(tree({ ...initialData, articles: [], articlesLoaded: false }));
    await screen.findByRole("heading", { name: article.title });
    expect(requests).toEqual({ articles: 1, categories: 0 });
  });

  it("loads the newly selected slug instead of retaining the original SSR articles", async () => {
    render(tree(initialData));
    fireEvent.click(screen.getAllByRole("link", { name: /Материалы/ })[0]);
    await screen.findByRole("heading", { name: nextArticle.title });
    expect(
      screen.queryByRole("heading", { name: article.title }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: nextCategory.name }),
    ).toBeVisible();
    expect(document.title).toBe("Материалы — блог МОСТ");
  });

  it("does not overwrite another category after a late first response", async () => {
    let release: (() => void) | undefined;
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.get(apiUrl("/api/v1/blog/articles"), async ({ request }) => {
        const isFirst =
          new URL(request.url).searchParams.get("category_id") === "7";
        if (isFirst) await pending;
        return HttpResponse.json({
          success: true,
          data: { data: [isFirst ? article : nextArticle], meta: pagination },
        });
      }),
    );
    render(tree({ ...initialData, articles: [], articlesLoaded: false }));
    fireEvent.click(screen.getAllByRole("link", { name: /Материалы/ })[0]);
    await screen.findByRole("heading", { name: nextArticle.title });
    await act(async () => {
      release?.();
      await pending;
    });
    expect(
      screen.queryByRole("heading", { name: article.title }),
    ).not.toBeInTheDocument();
  });

  it("retains known missing-category status without another request", async () => {
    render(
      tree(
        {
          ...initialData,
          slug: "missing",
          category: null,
          articles: [],
          articlesLoaded: false,
          notFound: true,
        },
        "/blog/category/missing",
      ),
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(
      screen.getByRole("heading", { level: 1, name: "Категория не найдена" }),
    ).toBeVisible();
    expect(requests).toEqual({ articles: 0, categories: 0 });
    expect(
      document.querySelector('meta[name="robots"]')?.getAttribute("content"),
    ).toContain("noindex");
  });

  it.each([
    { success: false, data: [] },
    { success: true, data: {} },
    { success: true, data: [{}] },
  ])(
    "does not mistake an invalid catalogue for a missing category",
    async (payload) => {
      server.use(
        http.get(apiUrl("/api/v1/blog/categories"), () =>
          HttpResponse.json(payload),
        ),
      );
      render(tree(undefined));
      await screen.findByRole("heading", {
        name: "Материалы временно недоступны",
      });
      expect(
        screen.queryByRole("heading", { name: "Категория не найдена" }),
      ).not.toBeInTheDocument();
    },
  );

  it("shows an availability error instead of an empty or missing category when the API fails", async () => {
    server.use(
      http.get(
        apiUrl("/api/v1/blog/categories"),
        () => new HttpResponse(null, { status: 503 }),
      ),
    );
    render(tree(undefined));
    await waitFor(() =>
      expect(
        screen.getByText("Не удалось загрузить материалы этой категории."),
      ).toBeVisible(),
    );
    expect(
      screen.queryByRole("heading", { name: "Категория не найдена" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Материалы временно недоступны" }),
    ).toBeVisible();
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toContain('noindex');
  });
});
