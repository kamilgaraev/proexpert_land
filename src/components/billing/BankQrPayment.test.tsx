import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { bankBillingService } from "@/services/bankBillingService";
import { BankQrPayment } from "./BankQrPayment";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("QR СБП B2B", () => {
  it.each(["", "/relative", ":invalid:"])(
    "показывает русскую ошибку для невалидной ссылки %s",
    async (url) => {
      vi.spyOn(bankBillingService, "qr").mockResolvedValue({
        type: "sbp_b2b",
        url,
        image: "data:image/png;base64,iVBORw0KGgo=",
        amount_minor: 10000,
        expires_at: new Date(Date.now() + 60_000).toISOString(),
      });
      render(
        <BankQrPayment invoiceId="11111111-1111-4111-8111-111111111111" />,
      );
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Оплатить по QR" }));
      });
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Не удалось получить QR. Оплатите по реквизитам счёта.",
      );
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    },
  );

  it("убирает просроченные изображение и ссылку без обновления списка счетов", async () => {
    vi.useFakeTimers();
    vi.spyOn(bankBillingService, "qr").mockResolvedValue({
      type: "sbp_b2b",
      url: "https://qr.nspk.ru/AS123",
      image: "data:image/png;base64,iVBORw0KGgo=",
      amount_minor: 10000,
      expires_at: new Date(Date.now() + 1000).toISOString(),
    });
    render(<BankQrPayment invoiceId="11111111-1111-4111-8111-111111111111" />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Оплатить по QR" }));
    });
    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByRole("link")).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1001);
    });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Срок QR истёк");
    expect(
      screen.getByRole("button", { name: "Оплатить по QR" }),
    ).toBeEnabled();
  });
});
