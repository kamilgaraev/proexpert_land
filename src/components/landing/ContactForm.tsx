import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BuildingOffice2Icon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PaperAirplaneIcon,
  ShieldCheckIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import NotificationService from "@/components/shared/NotificationService";
import SuccessModal from "@/components/shared/SuccessModal";
import { marketingPaths } from "@/data/marketingRegistry";
import useAnalytics from "@/hooks/useAnalytics";
import { hasAnalyticsConsent, getCookieConsent } from "@/utils/marketingConsent";
import { useLegalManifest } from '@/hooks/useLegalManifest';
import { LEGAL_UNAVAILABLE, legalAcceptancePayload } from '@/services/legalService';
import { LEGAL_VERSION } from '@/data/marketing/legal';
import { getMarketingAttribution } from "@/utils/marketingAttribution";

interface ContactFormData {
  name: string;
  email: string;
  company: string;
  subject: string;
  message: string;
  consentToPersonalData: boolean;
}

interface ContactFormProps {
  variant?: "full" | "compact";
  className?: string;
}

const subjectOptions = [
  { value: "demo", label: "Запрос демонстрации" },
  { value: "pricing", label: "Пакеты и состав решения" },
  { value: "launch", label: "Внедрение и запуск" },
  { value: "security", label: "Безопасность и юридические вопросы" },
];

const getPublicApiBase = () => {
  const rawBase =
    (import.meta.env.VITE_API_URL as string | undefined) ??
    "https://api.1мост.рф";

  return rawBase.replace(/\/api\/v1\/landing\/?$/, "");
};

const normalizeOptional = (value: string) => {
  const trimmedValue = value.trim();

  return trimmedValue.length > 0 ? trimmedValue : undefined;
};

const ContactForm = ({
  variant = "full",
  className = "",
}: ContactFormProps) => {
  const location = useLocation();
  const { manifest: legalManifest, error: legalError } = useLegalManifest();
  const { trackButtonClick, trackContactForm } = useAnalytics();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    company: "",
    subject: variant === "compact" ? "demo" : "",
    message: "",
    consentToPersonalData: false,
  });
  const activeRequest = useRef<{
    controller: AbortController;
    timeoutId: number;
  } | null>(null);

  useEffect(() => () => {
    const request = activeRequest.current;
    activeRequest.current = null;
    if (request) {
      window.clearTimeout(request.timeoutId);
      request.controller.abort();
    }
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = event.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]:
        type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubjectChange = (subject: string) => {
    setFormData((prevState) => ({
      ...prevState,
      subject,
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    if (formData.name.trim().length < 2) {
      errors.push("Укажите имя не короче 2 символов.");
    }

    if (!emailRegex.test(formData.email.trim())) {
      errors.push("Введите корректную рабочую почту.");
    }

    if (formData.message.trim().length < 10) {
      errors.push("Опишите запрос минимум в 10 символах.");
    }

    if (variant === "full" && !formData.subject) {
      errors.push("Выберите тему обращения.");
    }

    if (!formData.consentToPersonalData) {
      errors.push("Подтвердите согласие на обработку персональных данных.");
    }

    return errors;
  };

  const isNameValid = formData.name.trim().length >= 2;
  const isEmailValid = emailRegex.test(formData.email.trim());
  const isMessageValid = formData.message.trim().length >= 10;
  const isSubjectValid = variant === "compact" || Boolean(formData.subject);
  const canSubmit =
    Boolean(legalManifest) &&
    !isSubmitting &&
    formData.consentToPersonalData &&
    isNameValid &&
    isEmailValid &&
    isMessageValid &&
    isSubjectValid;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = validateForm();
    if (!legalManifest) errors.push(legalError ?? LEGAL_UNAVAILABLE);
    if (errors.length > 0) {
      NotificationService.show({
        type: "error",
        title: "Форма заполнена не полностью",
        message: errors.join(" "),
      });
      return;
    }

    setIsSubmitting(true);

    const selectedSubject =
      subjectOptions.find((option) => option.value === formData.subject) ??
      subjectOptions[0];
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      company: normalizeOptional(formData.company),
      subject: selectedSubject.label,
      message: formData.message.trim(),
      consent_to_personal_data: formData.consentToPersonalData,
      consent_version: LEGAL_VERSION,
      ...legalAcceptancePayload(legalManifest!, ['contactConsent']),
      analytics_consent: hasAnalyticsConsent(),
      analytics_visitor_id: hasAnalyticsConsent() ? getCookieConsent()?.visitorId : undefined,
      analytics_receipt_id: hasAnalyticsConsent() ? getCookieConsent()?.receiptId : undefined,
      page_source: `${location.pathname}${location.hash}`,
      ...getMarketingAttribution(),
    };

    const preparedPayload = Object.fromEntries(
      Object.entries(payload).filter(
        ([, value]) => value !== undefined && value !== "",
      ),
    );

    const abortController = new AbortController();
    const timeoutId = window.setTimeout(() => abortController.abort(), 15_000);
    const request = { controller: abortController, timeoutId };
    activeRequest.current = request;

    try {
      trackButtonClick("public_contact_submit", `contact_form_${variant}`);
      const response = await fetch(`${getPublicApiBase()}/api/public/contact`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: new URLSearchParams(
          Object.entries(preparedPayload).flatMap(([key, value]) =>
            typeof value === "object" && value !== null
              ? Object.entries(value).map(([nestedKey, nestedValue]) => [
                  `${key}[${nestedKey}]`,
                  String(nestedValue),
                ])
              : [[key, typeof value === "boolean" ? (value ? "1" : "0") : String(value)]],
          ),
        ),
        signal: abortController.signal,
      });

      if (activeRequest.current !== request) return;

      const result = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
        errors?: Record<string, string[]>;
      } | null;

      if (activeRequest.current !== request) return;

      if (!response.ok || !result?.success) {
        const validationMessage =
          response.status === 422 && result?.errors
            ? Object.values(result.errors).flat().join(" ")
            : (result?.message ??
              "Не удалось отправить заявку. Попробуйте позже.");

        NotificationService.show({
          type: "error",
          title: "Ошибка отправки",
          message: validationMessage,
        });
        return;
      }

      trackContactForm(variant, {
        subject: selectedSubject.value,
        page_source: preparedPayload.page_source,
        has_company: Boolean(preparedPayload.company),
        has_phone: false,
      });
      setSuccessMessage(
        result.message ?? "Заявка принята. Мы напишем на указанную почту.",
      );
      setShowSuccessModal(true);
      setFormData({
        name: "",
        email: "",
        company: "",
        subject: variant === "compact" ? "demo" : "",
        message: "",
        consentToPersonalData: false,
      });
    } catch {
      if (activeRequest.current !== request) return;

      NotificationService.show({
        type: "error",
        title: "Ошибка соединения",
        message:
          "Не удалось отправить заявку. Проверьте соединение и попробуйте еще раз.",
      });
    } finally {
      window.clearTimeout(timeoutId);
      if (activeRequest.current === request) {
        activeRequest.current = null;
        setIsSubmitting(false);
      }
    }
  };

  const wrapperClass =
    variant === "compact"
      ? `rounded-[1.75rem] border border-steel-200 bg-white p-6 shadow-sm ${className}`
      : `rounded-[2rem] border border-steel-200 bg-white p-6 shadow-sm lg:p-7 ${className}`;

  return (
    <>
      <motion.div
        className={wrapperClass}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex flex-col gap-3 border-b border-steel-100 pb-5">
          <h2 className="font-sans text-2xl font-bold text-steel-950 lg:text-[1.85rem]">
            {variant === "compact"
              ? "Оставить заявку"
              : "Запросить демонстрацию МОСТ"}
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-steel-600">
            {variant === "compact"
              ? "Укажите почту, на которую вам удобно получить ответ."
              : "Расскажите, что хотите посмотреть. Напишем на указанную почту и договоримся о демонстрации."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 ym-hide-content ym-disable-submit">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-steel-700">
                <UserIcon
                  className="most-icon h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                Имя
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                minLength={2}
                placeholder="Как к вам обращаться"
                className="w-full rounded-[1.1rem] border border-steel-300 px-4 py-3 text-steel-900 outline-none transition focus:border-construction-500 focus:ring-4 focus:ring-construction-100"
                required
              />
            </label>

            <label className="block">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-steel-700">
                <BuildingOffice2Icon
                  className="most-icon h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                Компания
              </span>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Название компании"
                className="w-full rounded-[1.1rem] border border-steel-300 px-4 py-3 text-steel-900 outline-none transition focus:border-construction-500 focus:ring-4 focus:ring-construction-100"
              />
            </label>

            <label className="block md:col-span-2 xl:col-span-1">
              <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-steel-700">
                <EnvelopeIcon
                  className="most-icon h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                Рабочая почта
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@company.ru"
                className="w-full rounded-[1.1rem] border border-steel-300 px-4 py-3 text-steel-900 outline-none transition focus:border-construction-500 focus:ring-4 focus:ring-construction-100"
                required
              />
            </label>
          </div>

          {variant === "full" ? (
            <div>
              <span className="mb-3 block text-sm font-semibold text-steel-700">
                Что хотите обсудить
              </span>
              <div className="grid gap-3 sm:grid-cols-2">
                {subjectOptions.map((option) => {
                  const active = formData.subject === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => handleSubjectChange(option.value)}
                      className={`rounded-[1.1rem] border px-4 py-3 text-left text-sm font-semibold transition ${
                        active
                          ? "border-steel-950 bg-steel-950 text-white"
                          : "border-steel-200 bg-white text-steel-700 hover:border-construction-300 hover:text-construction-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <input type="hidden" name="subject" value="demo" />
          )}

          <label className="block">
            <span className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-steel-700">
              <ChatBubbleLeftRightIcon
                className="most-icon h-5 w-5 shrink-0"
                aria-hidden="true"
              />
              Сообщение
            </span>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              minLength={10}
              placeholder="Например: хотим наладить заявки на материалы с трёх объектов"
              rows={variant === "compact" ? 4 : 5}
              className="w-full rounded-[1.1rem] border border-steel-300 px-4 py-3 text-steel-900 outline-none transition focus:border-construction-500 focus:ring-4 focus:ring-construction-100"
              required
            />
            {formData.message.trim().length > 0 && !isMessageValid ? (
              <span className="mt-2 block text-sm text-rose-600">
                Опишите запрос минимум в 10 символах.
              </span>
            ) : null}
          </label>

          <div className="rounded-[1.25rem] bg-concrete-50 p-4">
            <label className="flex items-start gap-3">
              <input
                type="checkbox"
                name="consentToPersonalData"
                checked={formData.consentToPersonalData}
                onChange={handleInputChange}
                className="mt-1 h-4 w-4 rounded border-steel-300 text-construction-600 focus:ring-construction-500"
              />
              <div>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-steel-900">
                  <ShieldCheckIcon
                    className="most-icon h-5 w-5 shrink-0 text-construction-700"
                    aria-hidden="true"
                  />
                  Согласие на обработку персональных данных
                </div>
                <p className="mt-2 text-sm leading-6 text-steel-600">
                  Даю отдельное{" "}
                  <Link
                    to="/personal-data-consent"
                    className="font-semibold text-construction-800 underline decoration-1 underline-offset-2"
                  >
                    согласие на обработку данных обращения
                  </Link>{" "}
                  для ответа на запрос. Подробнее — в{" "}
                  <Link
                    to={marketingPaths.privacy}
                    className="font-semibold text-construction-800 underline decoration-1 underline-offset-2"
                  >
                    политике обработки персональных данных
                  </Link>
                  . Настройки аналитики описаны в{" "}
                  <Link
                    to={marketingPaths.cookies}
                    className="font-semibold text-construction-800 underline decoration-1 underline-offset-2"
                  >
                    политике cookie
                  </Link>
                  .
                </p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`inline-flex w-full min-w-0 flex-wrap items-center justify-center gap-3 rounded-full px-6 py-4 text-center text-base font-semibold whitespace-normal [overflow-wrap:anywhere] transition ${
              !canSubmit
                ? "cursor-not-allowed bg-steel-300 text-white"
                : "bg-steel-950 text-white hover:-translate-y-0.5 hover:bg-steel-900"
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Отправляем заявку
              </>
            ) : (
              <>
                <PaperAirplaneIcon
                  className="most-icon h-5 w-5 shrink-0"
                  aria-hidden="true"
                />
                {variant === "compact"
                  ? "Отправить заявку"
                  : "Запросить демонстрацию"}
              </>
            )}
          </button>
          {!legalManifest && <p role="status" className="text-sm">{legalError ?? LEGAL_UNAVAILABLE}</p>}
        </form>
      </motion.div>

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Заявка отправлена"
        message={successMessage}
      />
    </>
  );
};

export default ContactForm;
