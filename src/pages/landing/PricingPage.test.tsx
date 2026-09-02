import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import PricingPage from "./PricingPage";

vi.mock("@/hooks/useAnalytics", () => ({
  default: () => ({ trackPageView: vi.fn(), trackPricingView: vi.fn() }),
}));
vi.mock("@/hooks/useSEO", () => ({ useSEO: vi.fn() }));
vi.mock("@/components/landing/ContactForm", () => ({ default: () => null }));
afterEach(cleanup);

const renderPricing = () => {
  render(
    <MemoryRouter>
      <PricingPage />
    </MemoryRouter>,
  );
  return within(screen.getByRole("complementary", { name: "Ваш набор" }));
};

const toggle = (name: string) => {
  fireEvent.click(screen.getByRole("checkbox", { name }));
};

describe("Pricing package selection", () => {
  it("starts free and carries only selected packages into registration", () => {
    const summary = renderPricing();
    expect(summary.getByText("0 ₽")).toBeInTheDocument();
    expect(
      summary.getByRole("link", { name: "Создать организацию" }),
    ).toHaveAttribute("href", "/register");

    toggle("Проекты и процессы");
    toggle("Снабжение и склад");
    expect(summary.getByText("21 800 ₽")).toBeInTheDocument();
    expect(
      summary.getByRole("link", { name: "Продолжить с этим набором" }),
    ).toHaveAttribute(
      "href",
      "/register?packages=projects-processes,supply-warehouse",
    );
    expect(
      screen.getByRole("link", { name: /К набору \(2\)/ }),
    ).toHaveAttribute("href", "#package-summary");

    toggle("Проекты и процессы");
    expect(
      summary.getByRole("link", { name: "Продолжить с этим набором" }),
    ).toHaveAttribute("href", "/register?packages=supply-warehouse");
    toggle("Снабжение и склад");
    expect(summary.getByText("0 ₽")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /К набору/ }),
    ).not.toBeInTheDocument();
  });

  it("suggests comparison without silently changing eight selected packages", () => {
    const summary = renderPricing();
    [
      "Проекты и процессы",
      "Графики и планирование",
      "Сметы и нормы",
      "Качество и безопасность",
      "ПТО и сдача",
      "Снабжение и склад",
      "Финансы и договоры",
      "Персонал и выработка",
    ].forEach(toggle);
    expect(summary.getByText("87 200 ₽")).toBeInTheDocument();
    expect(summary.getByRole("status")).toHaveTextContent(
      "Сравните с полным комплектом",
    );
    expect(
      summary
        .getByRole("link", { name: "Продолжить с этим набором" })
        .getAttribute("href"),
    ).not.toContain("full-suite");
    expect(
      screen.getByRole("link", { name: "Выбрать полный комплект" }),
    ).toHaveAttribute("href", "/register?packages=full-suite");

    toggle("Персонал и выработка");
    expect(summary.queryByRole("status")).not.toBeInTheDocument();
    expect(summary.getByText("77 300 ₽")).toBeInTheDocument();
  });
});
