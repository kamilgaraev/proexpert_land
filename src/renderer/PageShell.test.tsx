import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { Link, MemoryRouter } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import type { PropsWithChildren } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PageShell } from "./PageShell";

const loader = vi.hoisted(() => ({
  ready: null as null | ((props: PropsWithChildren) => React.ReactNode),
  load: vi.fn(),
}));

vi.mock("./pageShellLoader", () => ({
  getPrivatePageShell: () => loader.ready,
  loadPrivatePageShell: loader.load,
}));

const PrivateShell = ({ children }: PropsWithChildren) => (
  <section data-testid="private-context">{children}</section>
);

const content = (
  <>
    <Link to="/dashboard">В кабинет</Link>
    <Link to="/">На сайт</Link>
    <p>Содержимое страницы</p>
  </>
);

const mount = (pathname = "/") =>
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <PageShell pageContext={{ urlPathname: pathname }}>{content}</PageShell>
    </MemoryRouter>,
  );

beforeEach(() => {
  loader.ready = null;
  loader.load.mockReset();
});

afterEach(cleanup);

describe("PageShell provider boundary", () => {
  it("renders public content without loading private code", () => {
    mount();
    expect(screen.getByText("Содержимое страницы")).toBeInTheDocument();
    expect(loader.load).not.toHaveBeenCalled();
    expect(screen.queryByTestId("private-context")).not.toBeInTheDocument();
  });

  it("uses the prepared private wrapper for server and initial client rendering", () => {
    loader.ready = PrivateShell;
    const html = renderToString(
      <StaticRouter location="/dashboard">
        <PageShell>{content}</PageShell>
      </StaticRouter>,
    );
    expect(html).toContain('data-testid="private-context"');
    expect(html).not.toContain("Открываем страницу");
    mount("/dashboard");
    expect(screen.getByTestId("private-context")).toHaveTextContent(
      "Содержимое страницы",
    );
    expect(loader.load).not.toHaveBeenCalled();
  });

  it("uses the current router path on public to private navigation", async () => {
    loader.load.mockResolvedValue(PrivateShell);
    mount();
    fireEvent.click(screen.getByRole("link", { name: "В кабинет" }));
    expect(await screen.findByTestId("private-context")).toBeInTheDocument();
    expect(loader.load).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("link", { name: "На сайт" }));
    expect(screen.queryByTestId("private-context")).not.toBeInTheDocument();
  });

  it("keeps private children unmounted while their providers load", async () => {
    let resolve!: (shell: typeof PrivateShell) => void;
    loader.load.mockReturnValue(
      new Promise((done) => {
        resolve = done;
      }),
    );
    mount("/dashboard");
    expect(screen.getByRole("status")).toHaveTextContent("Открываем страницу");
    expect(screen.queryByText("Содержимое страницы")).not.toBeInTheDocument();
    await act(async () => {
      resolve(PrivateShell);
    });
    expect(screen.getByTestId("private-context")).toBeInTheDocument();
  });

  it("shows a recoverable message when private code cannot load", async () => {
    loader.load
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(PrivateShell);
    mount("/dashboard");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Не удалось открыть страницу",
    );
    expect(screen.queryByText("network")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Повторить" }));
    expect(await screen.findByTestId("private-context")).toBeInTheDocument();
    expect(loader.load).toHaveBeenCalledTimes(2);
  });
});
