import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { bankBillingService } from "@/services/bankBillingService";
import type { BankTransferQrPayment as Payment } from "@/types/bankBilling";

const errorMessage =
  "Не удалось обновить QR. Проверьте оплату и используйте реквизиты счёта.";
const money = (value: number) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB" }).format(
    value / 100,
  );

const validate = (
  value: unknown,
  invoiceId: string,
  remainingMinor: number,
): Payment => {
  const payment = value as Partial<Payment> | null;
  if (
    !payment ||
    payment.type !== "bank_transfer" ||
    payment.invoice_id !== invoiceId ||
    typeof payment.image !== "string" ||
    payment.image.length > 280_000 ||
    !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(payment.image) ||
    !Number.isSafeInteger(payment.amount_minor) ||
    payment.amount_minor !== remainingMinor ||
    remainingMinor <= 0 ||
    typeof payment.expires_at !== "string" ||
    !Number.isFinite(Date.parse(payment.expires_at)) ||
    Date.parse(payment.expires_at) <= Date.now()
  )
    throw new Error(errorMessage);
  return payment as Payment;
};

export const BankTransferQrPayment = ({
  invoiceId,
  remainingMinor,
}: {
  invoiceId: string;
  remainingMinor: number;
}) => {
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef<AbortController | null>(null);
  const loadRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => () => active.current?.abort(), []);

  const load = async () => {
    const controller = new AbortController();
    active.current?.abort();
    active.current = controller;
    setLoading(true);
    setError(null);
    const requestTimeout = window.setTimeout(() => {
      controller.abort();
      setLoading(false);
      setPayment(null);
      setError(errorMessage);
    }, 10_000);
    controller.signal.addEventListener(
      "abort",
      () => window.clearTimeout(requestTimeout),
      { once: true },
    );
    try {
      const result = await bankBillingService.transferQr(
        invoiceId,
        controller.signal,
      );
      if (!controller.signal.aborted)
        setPayment(validate(result, invoiceId, remainingMinor));
    } catch {
      if (!controller.signal.aborted) {
        setPayment(null);
        setError(errorMessage);
      }
    } finally {
      window.clearTimeout(requestTimeout);
      if (!controller.signal.aborted) setLoading(false);
    }
  };
  loadRef.current = load;

  useEffect(() => {
    if (!payment) return;
    const interval = window.setInterval(() => {
      void loadRef.current();
    }, 30_000);
    const timeout = window.setTimeout(
      () => {
        active.current?.abort();
        setLoading(false);
        setPayment(null);
        setError("Срок оплаты счёта истёк. Обновите список счетов.");
      },
      Math.min(Date.parse(payment.expires_at) - Date.now(), 2_147_483_647),
    );
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [payment]);

  return (
    <div className="space-y-3 rounded border border-slate-200 p-3">
      <p className="text-sm font-medium">Банковский перевод по QR</p>
      <p className="text-sm text-slate-600">
        Откройте сканер QR в банке вашей организации или ИП. Перед переводом
        проверьте сумму и назначение платежа.
      </p>
      {!payment && (
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => void load()}
        >
          {loading ? "Готовим QR…" : "Показать QR банковского перевода"}
        </Button>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      {payment && (
        <>
          <img
            src={payment.image}
            width={400}
            height={400}
            alt="QR с реквизитами банковского перевода"
            className="h-auto w-full max-w-[400px]"
          />
          <p className="text-lg font-semibold">
            К оплате: {money(payment.amount_minor)}
          </p>
          <p className="text-xs text-slate-600">
            Если банк не распознаёт QR, оплатите по реквизитам. Поступление
            подтвердится после проверки банковской выписки.
          </p>
        </>
      )}
    </div>
  );
};
