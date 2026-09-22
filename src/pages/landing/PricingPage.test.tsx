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

    toggle("Рабочий вход");
    toggle("Снабжение и склад");
    expect(summary.getByText("49 800 ₽")).toBeInTheDocument();
    expect(
      summary.getByRole("link", { name: "Продолжить с этим набором" }),
    ).toHaveAttribute(
      "href",
      "/register?packages=working-entry,supply-warehouse",
    );
    expect(
      screen.getByRole("link", { name: /К набору \(2\)/ }),
    ).toHaveAttribute("href", "#package-summary");

    toggle("Снабжение и склад");
    expect(
      summary.getByRole("link", { name: "Продолжить с этим набором" }),
    ).toHaveAttribute("href", "/register?packages=working-entry");
    toggle("Рабочий вход");
    expect(summary.getByText("0 ₽")).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /К набору/ }),
    ).not.toBeInTheDocument();
  });

  it("suggests comparison without silently selecting the full suite", () => {
    const summary = renderPricing();
    ["Снабжение и склад", "Финансы и договоры", "Персонал и выработка"].forEach(toggle);
    expect(summary.getByText("67 600 ₽")).toBeInTheDocument();
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
    expect(summary.getByText("59 700 ₽")).toBeInTheDocument();
  });
});
