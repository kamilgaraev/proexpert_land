import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it } from "vitest";
import { PageHero, SectionHeader } from "./MarketingPrimitives";
import CtaBand from "./blocks/CtaBand";

afterEach(cleanup);

const CurrentLocation = () => {
  const location = useLocation();
  return <output aria-label="Текущий путь">{location.pathname}</output>;
};

describe("Shared marketing page navigation", () => {
  it("preserves heading hierarchy and destinations across shared blocks", () => {
    render(
      <MemoryRouter initialEntries={["/features"]}>
        <PageHero
          eyebrow="Возможности"
          title="Управление строительством"
          description="Работы и документы по объектам."
          actions={[
            { label: "Посмотреть демо", href: "#contact", primary: true },
            { label: "Тарифы", href: "/pricing" },
          ]}
          nav={[{ label: "Документы", href: "#documents" }]}
        />
        <section id="documents">
          <SectionHeader
            eyebrow="Документы"
            title="От проекта до приёмки"
            description="Версии и замечания доступны команде."
          />
        </section>
        <section id="contact">
          <CtaBand
            eyebrow="Контакт"
            title="Обсудим вашу задачу"
            description="Расскажите о работе компании."
            actions={[
              {
                label: "Написать",
                href: "mailto:info@example.com",
                primary: true,
              },
            ]}
          />
        </section>
        <CurrentLocation />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2);
    expect(
      screen.getByRole("navigation", { name: "Разделы страницы" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Документы" })).toHaveAttribute(
      "href",
      "#documents",
    );
    expect(
      screen.getByRole("link", { name: "Посмотреть демо" }),
    ).toHaveAttribute("href", "#contact");
    expect(screen.getByRole("link", { name: "Написать" })).toHaveAttribute(
      "href",
      "mailto:info@example.com",
    );
    fireEvent.click(screen.getByRole("link", { name: "Тарифы" }));
    expect(screen.getByLabelText("Текущий путь")).toHaveTextContent("/pricing");
  });
});
