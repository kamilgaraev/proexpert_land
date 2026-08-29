import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ login: vi.fn() }),
}));

import LoginPage from "./LoginPage";

// Regression: ISSUE-060 — публичная форма входа не раскрывала назначение и состояние контролов
// Found by /qa on 2026-08-29
// Report: .gstack/qa-reports/qa-report-most-full-2026-08-28.md
describe("LoginPage accessibility", () => {
  it("предоставляет браузеру назначение полей авторизации", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Email")).toHaveAttribute("name", "email");
    expect(screen.getByLabelText("Email")).toHaveAttribute(
      "autocomplete",
      "email",
    );
    expect(screen.getByLabelText("Пароль")).toHaveAttribute("name", "password");
    expect(screen.getByLabelText("Пароль")).toHaveAttribute(
      "autocomplete",
      "current-password",
    );
    expect(
      screen.getByRole("checkbox", { name: "Запомнить меня" }),
    ).toHaveAttribute("name", "rememberMe");
  });

  it("объясняет назначение и состояние кнопки показа пароля", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    );

    const password = screen.getByLabelText("Пароль");
    const toggle = screen.getByRole("button", { name: "Показать пароль" });

    expect(toggle).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(toggle);

    expect(password).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Показать пароль" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});
