import { legalFixture } from '@/test/legalFixture';
vi.mock('@/hooks/useLegalManifest', () => ({ useLegalManifest: () => ({ manifest: legalFixture, error: null }) }));
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import ContactForm from "./ContactForm";
import { COOKIE_CONSENT_VERSION } from "@/utils/marketingConsent";
import { captureMarketingAttribution, clearMarketingAttribution } from "@/utils/marketingAttribution";

const { notify, trackButtonClick, trackContactForm } = vi.hoisted(() => ({
  notify: vi.fn(),
  trackButtonClick: vi.fn(),
  trackContactForm: vi.fn(),
}));
vi.mock("@/hooks/useAnalytics", () => ({
  default: () => ({ trackButtonClick, trackContactForm }),
}));
vi.mock("@/components/shared/NotificationService", () => ({
  default: { show: notify },
}));
vi.mock("@/components/shared/SuccessModal", () => ({
  default: ({ isOpen, message }: { isOpen: boolean; message: string }) =>
    isOpen ? <div role="status">{message}</div> : null,
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
  },
}));

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
beforeEach(() => {
  vi.stubEnv("VITE_API_URL", "http://localhost/api/v1/landing");
  clearMarketingAttribution();
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
afterAll(() => server.close());

const fillRequest = (variant: "full" | "compact" = "compact") => {
  render(
    <MemoryRouter initialEntries={["/#contact"]}>
      <ContactForm variant={variant} />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Имя"), {
    target: { value: "  Анна  " },
  });
  fireEvent.change(screen.getByLabelText(/Рабочая почта/), {
    target: { value: "anna@example.test" },
  });
  fireEvent.change(screen.getByRole("textbox", { name: "Телефон" }), {
    target: { value: "+7 900 123-45-67" },
  });
  fireEvent.change(screen.getByLabelText("Сообщение"), {
    target: { value: "Нужны заявки на материалы для трёх объектов." },
  });
};

describe("Marketing contact request", () => {
  it("requires consent and submits a demonstration request with its page source", async () => {
    let received: Record<string, unknown> | undefined;
    server.use(
      http.post("http://localhost/api/public/contact", async ({ request }) => {
        received = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ success: true, message: "Заявка принята" });
      }),
    );
    captureMarketingAttribution('?utm_source=yandex&utm_campaign=materials');
    captureMarketingAttribution('');
    fillRequest();
    const submit = screen.getByRole("button", { name: "Отправить заявку" });
    expect(submit).toBeDisabled();
    expect(received).toBeUndefined();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Заявка принята"),
    );
    expect(received).toMatchObject({
      name: "Анна",
      email: "anna@example.test",
      phone: "+7 900 123-45-67",
      subject: "Запрос демонстрации",
      message: "Нужны заявки на материалы для трёх объектов.",
      consent_to_personal_data: true,
      consent_version: COOKIE_CONSENT_VERSION,
      page_source: "/#contact",
      analytics_consent: false,
    });
    expect(trackButtonClick).toHaveBeenCalledTimes(1);
    expect(trackContactForm).toHaveBeenCalledExactlyOnceWith("compact", {
      subject: "demo",
      page_source: "/#contact",
      has_company: false,
      has_phone: true,
    });
    expect(received).not.toHaveProperty("company");
    expect(received).not.toHaveProperty("utm_source");
    expect(received).not.toHaveProperty("utm_campaign");
    expect(screen.getByLabelText("Имя")).toHaveValue("");
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it.each(["full", "compact"] as const)("submits with a required phone and no email in the %s form", async (variant) => {
    let received: Record<string, unknown> | undefined;
    server.use(http.post("http://localhost/api/public/contact", async ({ request }) => {
      received = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({ success: true, message: "Заявка принята" });
    }));
    fillRequest(variant);
    const phone = screen.getByRole("textbox", { name: "Телефон" });
    expect(phone).toHaveAttribute("type", "tel");
    expect(phone).toHaveAttribute("autocomplete", "tel");
    expect(phone).toBeRequired();
    const email = screen.getByLabelText(/Рабочая почта/);
    expect(email).not.toBeRequired();
    fireEvent.change(email, { target: { value: "   " } });
    fireEvent.change(phone, { target: { value: " +7 900 123-45-67 " } });
    if (variant === "full") fireEvent.click(screen.getByRole("button", { name: "Запрос демонстрации" }));
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: variant === "full" ? "Запросить демонстрацию" : "Отправить заявку" }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Заявка принята"));
    expect(received).toMatchObject({ phone: "+7 900 123-45-67", consent_to_personal_data: true });
    expect(received).not.toHaveProperty("email");
    expect(trackContactForm).toHaveBeenCalledExactlyOnceWith(variant, expect.objectContaining({ has_phone: true }));
    expect(phone).toHaveValue("");
  });

  it.each([
    ["NBSP", "\u00a0", "full"],
    ["narrow NBSP", "\u202f", "compact"],
  ] as const)("normalizes %s phone whitespace before validation and submission", async (_label, whitespace, variant) => {
    let received: Record<string, unknown> | undefined;
    server.use(http.post("http://localhost/api/public/contact", async ({ request }) => {
      received = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({ success: true, message: "Заявка принята" });
    }));
    fillRequest(variant);
    const phone = screen.getByRole("textbox", { name: "Телефон" });
    fireEvent.change(phone, { target: { value: `+7${whitespace}900${whitespace}123-45-67` } });
    fireEvent.blur(phone);
    expect(phone).not.toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    if (variant === "full") fireEvent.click(screen.getByRole("button", { name: "Запрос демонстрации" }));
    fireEvent.click(screen.getByRole("checkbox"));
    const submit = screen.getByRole("button", { name: variant === "full" ? "Запросить демонстрацию" : "Отправить заявку" });
    expect(submit).toBeEnabled();
    fireEvent.click(submit);
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent("Заявка принята"));
    expect(received?.phone).toBe("+7 900 123-45-67");
  });

  it.each(["", "abc", "123", "++7 900 123-45-67", "1234567890123456"])("rejects an empty or invalid phone %s", (value) => {
    fillRequest();
    fireEvent.click(screen.getByRole("checkbox"));
    const submit = screen.getByRole("button", { name: "Отправить заявку" });
    const phone = screen.getByRole("textbox", { name: "Телефон" });
    expect(submit).toBeEnabled();
    fireEvent.change(phone, { target: { value } });
    fireEvent.blur(phone);
    expect(submit).toBeDisabled();
    expect(phone).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Укажите номер из 7–15 цифр");
    fireEvent.change(phone, { target: { value: "" } });
    expect(submit).toBeDisabled();
    fireEvent.change(phone, { target: { value: "+7 900 123-45-67" } });
    expect(submit).toBeEnabled();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("validates email only when provided", () => {
    fillRequest();
    fireEvent.click(screen.getByRole("checkbox"));
    const submit = screen.getByRole("button", { name: "Отправить заявку" });
    const email = screen.getByLabelText(/Рабочая почта/);
    fireEvent.change(email, { target: { value: "invalid" } });
    expect(submit).toBeDisabled();
    fireEvent.change(email, { target: { value: "" } });
    expect(submit).toBeEnabled();
  });

  it("keeps entered information available for retry when the server rejects a request", async () => {
    server.use(
      http.post("http://localhost/api/public/contact", () =>
        HttpResponse.json(
          { success: false, message: "Заявка не принята" },
          { status: 503 },
        ),
      ),
    );
    fillRequest();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Отправить заявку" }));
    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Заявка не принята" }),
      ),
    );
    expect(trackButtonClick).toHaveBeenCalledTimes(1);
    expect(trackContactForm).not.toHaveBeenCalled();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Имя")).toHaveValue("  Анна  ");
    expect(screen.getByLabelText(/Рабочая почта/)).toHaveValue(
      "anna@example.test",
    );
    expect(screen.getByRole("textbox", { name: "Телефон" })).toHaveValue("+7 900 123-45-67");
    expect(
      screen.getByRole("button", { name: "Отправить заявку" }),
    ).toBeEnabled();
  });
});
