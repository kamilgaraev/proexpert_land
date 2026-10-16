import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { bankBillingService } from "@/services/bankBillingService";
import type { BankQrPayment as QrPayment } from "@/types/bankBilling";

const validPayment = (value: unknown): QrPayment => {
  try {
    const payment = value as Partial<QrPayment> | null;
    if (
      !payment ||
      typeof payment.url !== "string" ||
      typeof payment.image !== "string" ||
      typeof payment.expires_at !== "string"
    )
      throw new Error();
    const url = new URL(payment.url);
    if (
      payment.type !== "sbp_b2b" ||
      url.protocol !== "https:" ||
      url.hostname !== "qr.nspk.ru" ||
      url.username ||
      url.password ||
      url.port ||
      !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(payment.image) ||
      payment.image.length > 280_000 ||
      !Number.isSafeInteger(payment.amount_minor) ||
      (payment.amount_minor ?? 0) <= 0 ||
      !Number.isFinite(Date.parse(payment.expires_at)) ||
      Date.parse(payment.expires_at) <= Date.now()
    )
      throw new Error();
    return payment as QrPayment;
  } catch {
    throw new Error("Не удалось получить QR. Оплатите по реквизитам счёта.");
  }
};

export const BankQrPayment = ({ invoiceId }: { invoiceId: string }) => {
  const [payment, setPayment] = useState<QrPayment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const active = useRef<AbortController | null>(null);

  useEffect(() => () => active.current?.abort(), []);

  useEffect(() => {
    if (!payment) return;
    const remaining = Date.parse(payment.expires_at) - Date.now();
    const expire = () => {
      setPayment(null);
      setError("Срок QR истёк. Обновите счёт или оплатите по реквизитам.");
    };
    if (remaining <= 0) {
      expire();
      return;
    }
    const timer = window.setTimeout(expire, Math.min(remaining, 2_147_483_647));
    return () => window.clearTimeout(timer);
  }, [payment]);

  const load = async () => {
    const controller = new AbortController();
    active.current?.abort();
    active.current = controller;
    setLoading(true);
    setError(null);
    try {
      const result = await bankBillingService.qr(invoiceId, controller.signal);
      if (controller.signal.aborted) return;
      setPayment(validPayment(result));
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure instanceof Error
            ? failure.message
            : "Не удалось получить QR.",
        );
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  };

  return (
    <div className="space-y-2 rounded border border-slate-200 p-3">
      <p className="text-sm">
        СБП для бизнеса: оплачивайте из банковского приложения компании или ИП.
      </p>
      {!payment && (
        <Button
          variant="outline"
          disabled={loading}
          onClick={() => void load()}
        >
          {loading ? "Готовим QR…" : "Оплатить по QR"}
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
            width={240}
            height={240}
            alt="QR для оплаты счёта через СБП B2B"
            className="h-auto max-w-full"
          />
          <a
            href={payment.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-orange-700 underline"
          >
            Открыть оплату в банке компании или ИП
          </a>
          <p className="text-xs text-slate-600">
            До {new Date(payment.expires_at).toLocaleString("ru-RU")}. Оплата
            подтвердится после поступления денег.
          </p>
        </>
      )}
    </div>
  );
};
