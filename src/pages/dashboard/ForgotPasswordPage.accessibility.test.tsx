import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("@utils/api", () => ({
  authService: {
    requestPasswordReset: vi.fn(),
  },
}));

import ForgotPasswordPage from "./ForgotPasswordPage";

// Regression: ISSUE-060 — поле восстановления не сообщало браузеру назначение email
// Found by /qa on 2026-08-29
// Report: .gstack/qa-reports/qa-report-most-full-2026-08-28.md
describe("ForgotPasswordPage accessibility", () => {
  it("предоставляет браузеру назначение поля email", () => {
    render(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>,
    );

    const email = screen.getByLabelText("Email адрес");
    expect(email).toHaveAttribute("name", "email");
    expect(email).toHaveAttribute("autocomplete", "email");
  });
});
