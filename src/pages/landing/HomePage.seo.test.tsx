import { cleanup, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomePage from "./HomePage";
import { getPageSEOData } from "@/utils/seo";

vi.mock("@/hooks/useAnalytics", () => ({
  default: () => ({ trackPageView: vi.fn() }),
}));
vi.mock("@/hooks/useSEO", () => ({ useSEO: vi.fn() }));
vi.mock("@/components/landing/ContactForm", () => ({ default: () => null }));
afterEach(cleanup);

describe("Home page search markup", () => {
  it("publishes exactly the questions and answers rendered for visitors", () => {
    const { container } = render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    );
    const visibleQuestions = Array.from(
      container.querySelectorAll(".most-faq details"),
    ).map((item) => ({
      "@type": "Question",
      name: item.querySelector("summary")?.firstChild?.textContent?.trim(),
      acceptedAnswer: {
        "@type": "Answer",
        text: item.querySelector("p")?.textContent,
      },
    }));
    expect(visibleQuestions.length).toBeGreaterThan(0);
    const faqSchema = getPageSEOData("/").structuredData?.find(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        "@type" in item &&
        item["@type"] === "FAQPage",
    );
    expect(faqSchema).toMatchObject({ mainEntity: visibleQuestions });
  });
});
