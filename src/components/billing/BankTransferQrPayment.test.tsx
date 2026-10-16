import { afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { bankBillingService } from "@/services/bankBillingService";
import { BankTransferQrPayment } from "./BankTransferQrPayment";
import type { BankTransferQrPayment as Payment } from "@/types/bankBilling";

const invoiceId = "11111111-1111-4111-8111-111111111111";
const payment = (): Payment => ({
  type: "bank_transfer",
  invoice_id: invoiceId,
  image: "data:image/png;base64,iVBORw0KGgo=",
  amount_minor: 6000,
  expires_at: new Date(Date.now() + 60_000).toISOString(),
});
const show = async () => {
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Показать QR банковского перевода" }),
    );
  });
};
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("QR банковского перевода", () => {
  it("показывает сумму к доплате без перехода в СБП", async () => {
    const service = vi
      .spyOn(bankBillingService, "transferQr")
      .mockResolvedValue(payment());
    render(
      <BankTransferQrPayment invoiceId={invoiceId} remainingMinor={6000} />,
    );
    expect(service).not.toHaveBeenCalled();
    await show();
    expect(
      screen.getByRole("img", {
        name: "QR с реквизитами банковского перевода",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/К оплате: 60/)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it.each([
    { amount_minor: 10000 },
    { amount_minor: -1 },
    { invoice_id: "other" },
    { type: "sbp_b2b" },
    { image: "https://example.test/qr.png" },
    { expires_at: "bad-date" },
    { expires_at: "2020-01-01T00:00:00Z" },
  ])(
    "отклоняет несогласованные или небезопасные данные %j",
    async (overrides) => {
      vi.spyOn(bankBillingService, "transferQr").mockResolvedValue({
        ...payment(),
        ...overrides,
      } as Payment);
      render(
        <BankTransferQrPayment invoiceId={invoiceId} remainingMinor={6000} />,
      );
      await show();
      expect(screen.getByRole("alert")).toHaveTextContent("Проверьте оплату");
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    },
  );

  it("убирает QR при изменении остатка во время фоновой проверки", async () => {
    vi.useFakeTimers();
    const service = vi
      .spyOn(bankBillingService, "transferQr")
      .mockResolvedValueOnce(payment())
      .mockResolvedValueOnce({ ...payment(), amount_minor: 3000 });
    render(
      <BankTransferQrPayment invoiceId={invoiceId} remainingMinor={6000} />,
    );
    await show();
    expect(screen.getByRole("img")).toBeInTheDocument();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_001);
    });
    expect(service).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("убирает изображение сразу по окончании срока оплаты", async () => {
    vi.useFakeTimers();
    vi.spyOn(bankBillingService, "transferQr").mockResolvedValue({
      ...payment(),
      expires_at: new Date(Date.now() + 1000).toISOString(),
    });
    render(
      <BankTransferQrPayment invoiceId={invoiceId} remainingMinor={6000} />,
    );
    await show();
    act(() => {
      vi.advanceTimersByTime(1001);
    });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Срок оплаты счёта истёк",
    );
  });

  it("отменяет незавершённый запрос при уходе со страницы", async () => {
    let requestSignal: AbortSignal | undefined;
    vi.spyOn(bankBillingService, "transferQr").mockImplementation(
      async (_id, signal) => {
        requestSignal = signal;
        return new Promise<Payment>(() => {});
      },
    );
    const view = render(
      <BankTransferQrPayment invoiceId={invoiceId} remainingMinor={6000} />,
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Показать QR банковского перевода" }),
    );
    view.unmount();
    expect(requestSignal?.aborted).toBe(true);
  });

  it("скрывает старый QR при таймауте фонового запроса", async () => {
    vi.useFakeTimers();
    vi.spyOn(bankBillingService, "transferQr")
      .mockResolvedValueOnce(payment())
      .mockImplementationOnce(async () => new Promise<Payment>(() => {}));
    render(
      <BankTransferQrPayment invoiceId={invoiceId} remainingMinor={6000} />,
    );
    await show();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(40_001);
    });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Проверьте оплату");
  });
});
