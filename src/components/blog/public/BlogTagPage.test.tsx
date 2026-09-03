import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import BlogTagPage from "./BlogTagPage";

vi.mock("@/utils/blogPublicApi", () => ({
  blogPublicApi: {
    getTags: vi.fn().mockRejectedValue(new Error("Unavailable")),
    getPopularArticles: vi.fn().mockResolvedValue({ data: { data: [] } }),
    getCategories: vi.fn().mockResolvedValue({ data: { data: [] } }),
  },
}));

describe("BlogTagPage unavailable catalogue", () => {
  it("shows a single availability error without a raw slug or empty result claim", async () => {
    render(
      <MemoryRouter initialEntries={["/blog/tag/kompyuternoe-zrenie"]}>
        <Routes>
          <Route path="/blog/tag/:slug" element={<BlogTagPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Не удалось загрузить подборку по тегу.",
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Статьи по теме",
    );
    expect(screen.queryByText("По этому тегу пока нет материалов")).toBeNull();
    expect(document.body.textContent).not.toContain("kompyuternoe-zrenie");
  });
});
