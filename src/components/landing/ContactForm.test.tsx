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
  vi.useRealTimers();
  cleanup();
  server.resetHandlers();
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});
afterAll(() => server.close());

const fillRequest = () => {
  render(
    <MemoryRouter initialEntries={["/#contact"]}>
      <ContactForm variant="compact" />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("Имя"), {
    target: { value: "  Анна  " },
  });
  fireEvent.change(screen.getByLabelText("Рабочая почта"), {
    target: { value: "anna@example.test" },
  });
  fireEvent.change(screen.getByLabelText("Сообщение"), {
    target: { value: "Нужны заявки на материалы для трёх объектов." },
  });
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
      subject: "Запрос демонстрации",
      message: "Нужны заявки на материалы для трёх объектов.",
      consent_to_personal_data: "true",
      consent_version: COOKIE_CONSENT_VERSION,
      page_source: "/#contact",
      utm_source: "yandex",
      utm_campaign: "materials",
    });
    expect(trackButtonClick).toHaveBeenCalledTimes(1);
    expect(trackContactForm).toHaveBeenCalledExactlyOnceWith("compact", {
      subject: "demo",
      page_source: "/#contact",
      has_company: false,
      has_phone: false,
    });
    expect(received).not.toHaveProperty("company");
    expect(contentType).toMatch(/^application\/x-www-form-urlencoded(?:;|$)/);
    expect(screen.getByLabelText("Имя")).toHaveValue("");
    expect(screen.getByRole("checkbox")).not.toBeChecked();
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
    expect(screen.getByLabelText("Рабочая почта")).toHaveValue(
      "anna@example.test",
    );
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
    fillRequest();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Отправить заявку" }));
    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Ошибка соединения" }),
      ),
    );
    expect(attempts).toBe(1);
    expect(trackContactForm).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Рабочая почта")).toHaveValue("anna@example.test");
    expect(screen.getByRole("checkbox")).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Отправить заявку" }));
    await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument());
    expect(attempts).toBe(2);
    expect(trackContactForm).toHaveBeenCalledTimes(1);
  });

  it("releases the submit button when the connection does not respond", async () => {
    vi.useFakeTimers();
    vi.spyOn(globalThis, "fetch").mockImplementation((_input, options) =>
      new Promise((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () =>
          reject(new DOMException("Request aborted", "AbortError")),
        );
      }),
    );
    fillRequest();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Отправить заявку" }));
    expect(screen.getByRole("button", { name: "Отправляем заявку" })).toBeDisabled();
    await act(async () => { await vi.advanceTimersByTimeAsync(15_000); });
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ title: "Ошибка соединения" }));
    expect(screen.getByRole("button", { name: "Отправить заявку" })).toBeEnabled();
    expect(screen.getByLabelText("Рабочая почта")).toHaveValue("anna@example.test");
    expect(trackContactForm).not.toHaveBeenCalled();
  });
});
