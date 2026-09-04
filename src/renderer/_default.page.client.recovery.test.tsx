import { expect, it, vi } from "vitest";
import type { PropsWithChildren } from "react";

vi.mock("./pageShellLoader", () => ({
  preparePageShell: async () => undefined,
}));
vi.mock("./PageShell", () => ({
  PageShell: ({ children }: PropsWithChildren) => children,
}));

it("recovers on the next route after an uncaught React render error", async () => {
  const environment = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
  const previousActEnvironment = environment.IS_REACT_ACT_ENVIRONMENT;
  environment.IS_REACT_ACT_ENVIRONMENT = false;
  const errorLog = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);
  const renderer = await import("./_default.page.client");
  document.body.innerHTML = '<div id="root"></div>';
  try {
    await renderer.render({
      urlPathname: "/",
      urlOriginal: "/",
      isHydration: false,
      Page: () => {
        throw new Error("test render failure");
      },
      pageProps: {},
    } as Parameters<typeof renderer.render>[0]);
    expect(errorLog).toHaveBeenCalled();

    await renderer.render({
      urlPathname: "/contact",
      urlOriginal: "/contact",
      isHydration: false,
      Page: () => <h1>Контакты</h1>,
      pageProps: {},
    } as Parameters<typeof renderer.render>[0]);
    expect(document.querySelector("h1")?.textContent).toBe("Контакты");
  } finally {
    errorLog.mockRestore();
    environment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment;
  }
});
