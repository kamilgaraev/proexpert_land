import { legalFixture } from '@/test/legalFixture';
vi.mock('@/hooks/useLegalManifest', () => ({ useLegalManifest: () => ({ manifest: legalFixture, error: null }) }));
import {
  cleanup,
  act,
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
import { LEGAL_VERSION } from "@/data/marketing/legal";
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
  vi.useRealTimers();
  cleanup();
  server.resetHandlers();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
afterAll(() => server.close());

const fillRequest = (variant: "compact" | "full" = "compact") => {
  const view = render(
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
  return view;
};

describe("Marketing contact request", () => {
  it("requires consent and submits a demonstration request with its page source", async () => {
    let received: Record<string, unknown> | undefined;
    let contentType: string | null = null;
    server.use(
      http.post("http://localhost/api/public/contact", async ({ request }) => {
        contentType = request.headers.get("Content-Type");
        received = Object.fromEntries(new URLSearchParams(await request.text()));
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
      consent_to_personal_data: "1",
      consent_version: LEGAL_VERSION,
      "legal_documents[contactConsent]": legalFixture.documents.contactConsent.sha256,
      page_source: "/#contact",
      analytics_consent: "0",
    });
    expect(trackButtonClick).toHaveBeenCalledTimes(1);
    expect(trackContactForm).toHaveBeenCalledExactlyOnceWith("compact", {
      subject: "demo",
      page_source: "/#contact",
      has_company: false,
      has_phone: true,
    });
    expect(received).not.toHaveProperty("company");
    expect(contentType).toMatch(/^application\/x-www-form-urlencoded(?:;|$)/);
    expect(received).not.toHaveProperty("utm_source");
    expect(received).not.toHaveProperty("utm_campaign");
    expect(screen.getByLabelText("Имя")).toHaveValue("");
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });

  it.each(["full", "compact"] as const)("submits with a required phone and no email in the %s form", async (variant) => {
    let received: Record<string, unknown> | undefined;
    server.use(http.post("http://localhost/api/public/contact", async ({ request }) => {
      received = Object.fromEntries(new URLSearchParams(await request.text()));
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
    expect(received).toMatchObject({ phone: "+7 900 123-45-67", consent_to_personal_data: "1" });
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
      received = Object.fromEntries(new URLSearchParams(await request.text()));
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

  it("preserves data after a network failure and sends again only on a manual retry", async () => {
    let attempts = 0;
    server.use(
      http.post("http://localhost/api/public/contact", () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.error()
          : HttpResponse.json({ success: true, message: "Заявка принята" });
      }),
    );
    fillRequest("full");
    fireEvent.change(screen.getByLabelText("Компания"), { target: { value: "  Стройка  " } });
    fireEvent.click(screen.getByRole("button", { name: "Внедрение и запуск" }));
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Запросить демонстрацию" }));
    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Ошибка соединения" }),
      ),
    );
    expect(attempts).toBe(1);
    expect(trackContactForm).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Рабочая почта/)).toHaveValue("anna@example.test");
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByLabelText("Имя")).toHaveValue("  Анна  ");
    expect(screen.getByLabelText("Компания")).toHaveValue("  Стройка  ");
    expect(screen.getByLabelText("Сообщение")).toHaveValue("Нужны заявки на материалы для трёх объектов.");
    expect(screen.getByRole("button", { name: "Внедрение и запуск" })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Запросить демонстрацию" }));
    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
    expect(attempts).toBe(2);
    expect(trackContactForm).toHaveBeenCalledTimes(1);
  });

  it("times out after 15 seconds and sends again only on a manual retry", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockImplementationOnce((_input, options) =>
        new Promise((_resolve, reject) => {
          options?.signal?.addEventListener("abort", () =>
            reject(new DOMException("Request aborted", "AbortError")),
          );
        }),
      )
      .mockResolvedValueOnce(
        HttpResponse.json({ success: true, message: "Заявка принята" }),
      );
    fillRequest("full");
    fireEvent.change(screen.getByLabelText("Компания"), { target: { value: "  Стройка  " } });
    fireEvent.click(screen.getByRole("button", { name: "Внедрение и запуск" }));
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Запросить демонстрацию" }));
    expect(screen.getByRole("button", { name: "Отправляем заявку" })).toBeDisabled();
    await act(async () => { await vi.advanceTimersByTimeAsync(14_999); });
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(false);
    expect(screen.getByRole("button", { name: "Отправляем заявку" })).toBeDisabled();
    await act(async () => { await vi.advanceTimersByTimeAsync(1); });
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ title: "Ошибка соединения" }));
    expect(screen.getByRole("button", { name: "Запросить демонстрацию" })).toBeEnabled();
    expect(screen.getByLabelText(/Рабочая почта/)).toHaveValue("anna@example.test");
    expect(trackContactForm).not.toHaveBeenCalled();
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByLabelText("Имя")).toHaveValue("  Анна  ");
    expect(screen.getByLabelText("Компания")).toHaveValue("  Стройка  ");
    expect(screen.getByLabelText("Сообщение")).toHaveValue("Нужны заявки на материалы для трёх объектов.");
    expect(screen.getByRole("button", { name: "Внедрение и запуск" })).toHaveAttribute("aria-pressed", "true");
    await act(async () => { await vi.advanceTimersByTimeAsync(15_000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Запросить демонстрацию" }));
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[1][1]?.body)).toBe(String(fetchMock.mock.calls[0][1]?.body));
    expect(screen.getByRole("status")).toHaveTextContent("Заявка принята");
    expect(trackContactForm).toHaveBeenCalledTimes(1);
  });

  it("aborts on unmount, clears the timeout and silently handles the abort rejection", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementationOnce((_input, options) =>
      new Promise((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () =>
          reject(new DOMException("Request aborted", "AbortError")),
        );
      }),
    );
    const view = fillRequest();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Отправить заявку" }));
    expect(vi.getTimerCount()).toBe(1);
    await act(async () => { view.unmount(); });
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => { await vi.advanceTimersByTimeAsync(30_000); });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(notify).not.toHaveBeenCalled();
    expect(trackContactForm).not.toHaveBeenCalled();
  });

  it.each(["success", "server error", "body error"])(
    "ignores a late %s body after unmount",
    async (outcome) => {
      vi.useFakeTimers();
      let resolveBody!: (value: unknown) => void;
      let rejectBody!: (reason: Error) => void;
      const body = new Promise((resolve, reject) => {
        resolveBody = resolve;
        rejectBody = reject;
      });
      const response = HttpResponse.json({}, { status: outcome === "server error" ? 503 : 200 });
      const readBody = vi.spyOn(response, "json").mockReturnValueOnce(body);
      const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(response);
      const view = fillRequest();
      fireEvent.click(screen.getByRole("checkbox"));
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Отправить заявку" }));
      });
      expect(readBody).toHaveBeenCalledTimes(1);
      view.unmount();
      expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
      expect(vi.getTimerCount()).toBe(0);
      await act(async () => {
        if (outcome === "body error") rejectBody(new Error("body unavailable"));
        else resolveBody({ success: outcome === "success", message: "Поздний ответ" });
      });
      expect(notify).not.toHaveBeenCalled();
      expect(trackContactForm).not.toHaveBeenCalled();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    },
  );

  it("keeps a new request and its manual retry independent of the unmounted request", async () => {
    vi.useFakeTimers();
    let resolveOld!: (response: Response) => void;
    let rejectNew!: (reason: Error) => void;
    const fetchMock = vi.spyOn(globalThis, "fetch")
      .mockImplementationOnce(() => new Promise((resolve) => { resolveOld = resolve; }))
      .mockImplementationOnce(() => new Promise((_resolve, reject) => { rejectNew = reject; }))
      .mockResolvedValueOnce(HttpResponse.json({ success: true, message: "Новая заявка принята" }));
    const oldView = fillRequest();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Отправить заявку" }));
    oldView.unmount();
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => { await vi.advanceTimersByTimeAsync(1_000); });
    fillRequest();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Отправить заявку" }));
    const oldResponse = HttpResponse.json({ success: true });
    const oldBody = vi.spyOn(oldResponse, "json");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(14_000);
      resolveOld(oldResponse);
    });
    expect(oldBody).not.toHaveBeenCalled();
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(fetchMock.mock.calls[1][1]?.signal?.aborted).toBe(false);
    expect(vi.getTimerCount()).toBe(1);
    expect(screen.getByRole("button", { name: "Отправляем заявку" })).toBeDisabled();
    expect(notify).not.toHaveBeenCalled();
    expect(trackContactForm).not.toHaveBeenCalled();
    await act(async () => { rejectNew(new TypeError("network unavailable")); });
    expect(notify).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Отправить заявку" })).toBeEnabled();
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(vi.getTimerCount()).toBe(0);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Отправить заявку" }));
    });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(String(fetchMock.mock.calls[2][1]?.body)).toBe(String(fetchMock.mock.calls[1][1]?.body));
    expect(screen.getByRole("status")).toHaveTextContent("Новая заявка принята");
    expect(trackContactForm).toHaveBeenCalledTimes(1);
    expect(vi.getTimerCount()).toBe(0);
    await act(async () => { await vi.advanceTimersByTimeAsync(15_000); });
    expect(fetchMock.mock.calls[2][1]?.signal?.aborted).toBe(false);
    expect(notify).toHaveBeenCalledTimes(1);
  });

});
