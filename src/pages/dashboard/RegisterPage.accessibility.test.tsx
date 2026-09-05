import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ register: vi.fn() }),
}));

vi.mock("@/hooks/useDaData", () => ({
  default: () => ({
    searchAddresses: vi.fn().mockResolvedValue([]),
    searchCities: vi.fn().mockResolvedValue([]),
    searchOrganizations: vi.fn().mockResolvedValue([]),
    isLoading: false,
  }),
}));

vi.mock('framer-motion', async () => {
  const { createElement, Fragment } = await import('react');
  return {
    motion: { div: (props: Record<string, unknown>) => createElement('div', Object.fromEntries(
      Object.entries(props).filter(([key]) => !['initial', 'animate', 'exit', 'transition'].includes(key)),
    )) },
    AnimatePresence: ({ children }: { children: import('react').ReactNode }) => createElement(Fragment, null, children),
  };
});

import RegisterPage from "./RegisterPage";

const renderPage = () =>
  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>,
  );

// Regression: ISSUE-060 — регистрация не раскрывала семантику этапов, полей и кнопок пароля
// Found by /qa on 2026-08-29
// Report: .gstack/qa-reports/qa-report-most-full-2026-08-28.md
describe("RegisterPage accessibility", () => {
  it('связывает ошибки с полями и фокусирует первое неверное поле', () => {
    renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Далее' }));
    const name = screen.getByLabelText('Полное имя');
    expect(name).toHaveFocus();
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription('Укажите ваше имя');
    expect(screen.getByLabelText('Email')).toHaveAccessibleDescription('Укажите email');
    expect(screen.getByLabelText('Пароль')).toHaveAccessibleDescription('Укажите пароль');
  });

  it("именует этапы регистрации и отмечает текущий этап", () => {
    renderPage();

    const progress = screen.getByRole("list", { name: "Этапы регистрации" });
    expect(
      within(progress).getByRole("listitem", { name: /Личные данные/ }),
    ).toHaveAttribute("aria-current", "step");
    expect(
      within(progress).getByRole("listitem", { name: /Организация/ }),
    ).not.toHaveAttribute("aria-current");
  });

  it("именует загрузку фотографии и поля личных данных", () => {
    renderPage();

    expect(screen.getByLabelText("Загрузить фото профиля")).toHaveAttribute(
      "name",
      "avatar",
    );

    const fields = [
      ["Полное имя", "name", "name"],
      ["Email", "email", "email"],
      ["Пароль", "password", "new-password"],
      ["Подтверждение пароля", "passwordConfirmation", "new-password"],
      ["Телефон", "phone", "tel"],
      ["Должность", "position", "organization-title"],
    ] as const;

    fields.forEach(([label, name, autocomplete]) => {
      const field = screen.getByLabelText(label);
      expect(field).toHaveAttribute("name", name);
      expect(field).toHaveAttribute("autocomplete", autocomplete);
    });
  });

  it("объясняет назначение обеих кнопок показа пароля", () => {
    renderPage();

    const password = screen.getByLabelText("Пароль");
    const confirmation = screen.getByLabelText("Подтверждение пароля");
    const passwordToggle = screen.getByRole("button", {
      name: "Показать пароль",
    });
    const confirmationToggle = screen.getByRole("button", {
      name: "Показать подтверждение пароля",
    });

    fireEvent.click(passwordToggle);
    fireEvent.click(confirmationToggle);

    expect(password).toHaveAttribute("type", "text");
    expect(confirmation).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Показать пароль" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      screen.getByRole("button", { name: "Показать подтверждение пароля" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("именует реквизиты организации и сообщает браузеру их назначение", async () => {
    renderPage();

    fireEvent.change(screen.getByLabelText("Полное имя"), {
      target: { value: "Иван Иванов" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "ivan@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Пароль"), {
      target: { value: "Password1" },
    });
    fireEvent.change(screen.getByLabelText("Подтверждение пароля"), {
      target: { value: "Password1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Далее" }));

    const fields = [
      ["Название организации", "organizationName", "organization"],
      ["ИНН", "organizationTaxNumber", "off"],
      ["ОГРН", "organizationRegistrationNumber", "off"],
      ["Телефон организации", "organizationPhone", "tel"],
      ["Email организации", "organizationEmail", "email"],
      ["Адрес", "organizationAddress", "street-address"],
      ["Город", "organizationCity", "address-level2"],
      ["Индекс", "organizationPostalCode", "postal-code"],
    ] as const;

    for (const [label, name, autocomplete] of fields) {
      const field = await screen.findByLabelText(label);
      expect(field).toHaveAttribute("name", name);
      expect(field).toHaveAttribute("autocomplete", autocomplete);
    }

    expect(screen.getByRole("checkbox")).toHaveAttribute("name", "agreeTerms");
  });
});
