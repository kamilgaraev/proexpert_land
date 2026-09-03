import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/components/landing/ContactForm", () => ({ default: () => <div /> }));
vi.mock("@/components/marketing/blocks/FaqAccordion", () => ({
  default: () => <div />,
}));
vi.mock("@/components/marketing/MarketingPrimitives", () => ({
  MarketingLink: ({ children }: { children: React.ReactNode }) => (
    <a>{children}</a>
  ),
  PageHero: ({
    title,
    description,
  }: {
    title: string;
    description: string;
  }) => (
    <>
      <h1>{title}</h1>
      <p>{description}</p>
    </>
  ),
  PageSectionNav: () => <nav />,
  SectionHeader: ({
    title,
    description,
  }: {
    title: string;
    description?: string;
  }) => (
    <>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </>
  ),
}));
vi.mock("@/hooks/useSEO", () => ({ useSEO: () => undefined }));

import SeoClusterPage from "./SeoClusterPage";
import { marketingSeoLandingPages } from "@/data/marketingRegistry";

afterEach(cleanup);

describe("SeoClusterPage workflow", () => {
  it.each(Object.keys(marketingSeoLandingPages))(
    "renders the configured process limitation on %s",
    (pageKey) => {
      const page = marketingSeoLandingPages[pageKey];
      const { container } = render(<SeoClusterPage pageKey={pageKey} />);
      if (page.processComparison.note) {
        expect(
          container.querySelector(
            "#process-comparison .most-scenario-record-note",
          ),
        ).toHaveTextContent(page.processComparison.note);
      } else {
        expect(
          container.querySelector(".most-scenario-record-note"),
        ).toBeNull();
      }
    },
  );

  it.each([
    [
      "construction-safety",
      "охрана труда, промышленная и экологическая безопасность (HSE)",
      "HSE",
    ],
    ["change-control", "запросы информации (RFI)", "RFI"],
    [
      "handover-acceptance",
      "перечень замечаний при приёмке (punch-list)",
      "punch-list",
    ],
    ["construction-documents", "электронной подписи (ЭП)", "ЭП"],
  ])(
    "explains the first rendered abbreviation on %s",
    (pageKey, expansion, abbreviation) => {
      const { container } = render(<SeoClusterPage pageKey={pageKey} />);
      const text = container.textContent!.toLocaleLowerCase("ru-RU");
      const normalizedExpansion = expansion.toLocaleLowerCase("ru-RU");
      const normalizedAbbreviation = abbreviation.toLocaleLowerCase("ru-RU");
      expect(text).toContain(normalizedExpansion);
      expect(text.indexOf(normalizedExpansion)).toBeLessThanOrEqual(
        text.indexOf(normalizedAbbreviation),
      );
    },
  );

  it("keeps the legal conditions of electronic signing visible in the document FAQ", () => {
    const { container } = render(
      <SeoClusterPage pageKey="construction-documents" />,
    );
    expect(container.querySelector("#faq")).toHaveTextContent(
      "Юридическая значимость зависит от регламента компании, полномочий участников и используемой электронной подписи (ЭП).",
    );
  });
  it("renders configured workflow heading and stages for a product page", () => {
    const html = renderToStaticMarkup(
      <SeoClusterPage pageKey="construction-procurement" />,
    );

    expect(html).toContain("Как проходит закупка по объекту");
    expect(html).toContain("Заявка на закупку");
    expect(html).toContain("Приемка");
  });

  it("does not render the workflow section for a legacy page without workflow data", () => {
    const html = renderToStaticMarkup(
      <SeoClusterPage pageKey="foreman-software" />,
    );

    expect(html).not.toContain("Как проходит закупка по объекту");
  });

  it("renders an honest process comparison without proof terminology", () => {
    const page = marketingSeoLandingPages["construction-procurement"];

    expect(page.processComparison).toEqual({
      eyebrow: "Маршрут закупки",
      title: "Потребность превращается в обоснованный выбор",
      description:
        "Карточка хранит исходную заявку, полученные предложения и решение сотрудника о поставщике.",
      metrics: [
        {
          value: "Заявка",
          label: "Основание",
          description: "Закупка начинается с потребности конкретного объекта.",
        },
        {
          value: "Предложения",
          label: "Сравнение",
          description: "Условия кандидатов доступны перед выбором.",
        },
      ],
      note: "МОСТ показывает данные для выбора, но поставщика выбирает уполномоченный сотрудник.",
    });

    render(<SeoClusterPage pageKey="construction-procurement" />);

    expect(
      screen.getByRole("heading", {
        name: "Потребность превращается в обоснованный выбор",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/доказательств/i)).not.toBeInTheDocument();
  });

  it("uses verifiable process properties instead of result promises", () => {
    for (const page of Object.values(marketingSeoLandingPages)) {
      const comparisonText = [
        page.processComparison.title,
        page.processComparison.description,
        page.processComparison.note,
        ...page.processComparison.metrics.flatMap((metric) => [
          metric.value,
          metric.label,
          metric.description,
        ]),
      ].join(" ");

      expect(comparisonText).not.toMatch(
        /в тот же день|сильно (?:ниже|меньше)|минуты|до срыва срока|раньше заметен|ежедневный контроль|сразу с объекта|готовятся быстрее|видны быстрее|риск.{0,30}ниже|скорост.{0,30}выше|нагрузк.{0,30}ниже/iu,
      );

      for (const metric of page.processComparison.metrics) {
        expect(
          [metric.value, metric.label, metric.description].join(" "),
        ).toMatch(
          /карточ|запис|статус|ответствен|связь|истори|маршрут|объект|документ|рол|заяв|предлож|верс|комплект|инструктаж|предписан|дефект|провер|зон|перечень|смен|техник|наряд|выработ|запрос|изменен|лимит|справочник|сигнал|решен|кандидат|потребност|приглашен|контрагент|платеж|счет|факт|данн/iu,
        );
      }
    }
  });
});
