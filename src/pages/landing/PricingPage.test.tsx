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
  it("пересчитывает весь набор, строки пакетов и полный комплект на 6 и 12 месяцев", () => {
    const summary = renderPricing();
    toggle("Снабжение и склад");

    fireEvent.click(screen.getByRole("radio", { name: "6 месяцев Скидка 5%" }));
    expect(summary.getByText("283 860 ₽")).toBeInTheDocument();
    expect(summary.getByText("за организацию / 6 месяцев")).toBeInTheDocument();
    expect(summary.getByText("227 430 ₽")).toBeInTheDocument();
    expect(summary.getByText("56 430 ₽")).toBeInTheDocument();
    expect(summary.getByText("Скидка 5% — экономия 14 940 ₽")).toBeInTheDocument();
    expect(screen.getByText("455 430 ₽")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Снабжение и склад" })).toBeChecked();

    fireEvent.click(screen.getByRole("radio", { name: "12 месяцев Скидка 10%" }));
    expect(summary.getByText("537 840 ₽")).toBeInTheDocument();
    expect(summary.getByText("за организацию / 12 месяцев")).toBeInTheDocument();
    expect(summary.getByText("Скидка 10% — экономия 59 760 ₽")).toBeInTheDocument();
    expect(screen.getByText("862 920 ₽")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /К набору \(2\)/ }).parentElement)
      .toHaveTextContent("537 840 ₽ / 12 месяцев");
    expect(summary.getByRole("link", { name: "Продолжить с этим набором" }))
      .toHaveAttribute("href", "/register?packages=working-entry,supply-warehouse");

    fireEvent.click(screen.getByRole("radio", { name: "30 дней Без скидки" }));
    expect(summary.getByText("49 800 ₽")).toBeInTheDocument();
    expect(summary.queryByText(/экономия/)).not.toBeInTheDocument();
    expect(screen.getByText("79 900 ₽")).toBeInTheDocument();
  });

  it("оставляет бесплатную основу бесплатной и не рекомендует комплект только из-за длительного срока", () => {
    const summary = renderPricing();
    fireEvent.click(screen.getByRole("radio", { name: "12 месяцев Скидка 10%" }));
    expect(summary.getByText("0 ₽")).toBeInTheDocument();
    expect(summary.queryByText(/экономия/)).not.toBeInTheDocument();
    toggle("Рабочий вход");
    expect(summary.getByText("430 920 ₽", { selector: "strong" })).toBeInTheDocument();
    expect(summary.queryByRole("status")).not.toBeInTheDocument();
  });

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
