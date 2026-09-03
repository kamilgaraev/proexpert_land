import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

type CommitElement = ReactElement<{
  onCommit: () => void;
  children: ReactElement;
}>;
const client = vi.hoisted(() => ({
  hydrate: vi.fn(),
  create: vi.fn(),
  render: vi.fn(),
  prepare: vi.fn(),
  commit: null as null | (() => void),
  autoCommit: true,
}));

vi.mock("react-dom/client", () => ({
  hydrateRoot: client.hydrate,
  createRoot: client.create,
}));
vi.mock("./pageShellLoader", () => ({ preparePageShell: client.prepare }));
vi.mock("./PageShell", () => ({ PageShell: () => null }));

function scheduleCommit(page: CommitElement) {
  client.commit = page.props.onCommit;
  if (client.autoCommit) queueMicrotask(page.props.onCommit);
}

const context = (path: string, isHydration = false) => ({
  urlPathname: path.split("?")[0],
  urlOriginal: path,
  isHydration,
  Page: () => null,
  pageProps: {},
});

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  client.autoCommit = true;
  client.commit = null;
  client.prepare.mockResolvedValue(undefined);
  client.render.mockImplementation(scheduleCommit);
  client.create.mockReturnValue({ render: client.render });
  client.hydrate.mockImplementation((_container, page: CommitElement) => {
    scheduleCommit(page);
    return { render: client.render };
  });
  document.body.innerHTML = '<div id="root"><p>SSR content</p></div>';
});

describe("client renderer lifecycle", () => {
  it("hydrates once and renders subsequent routes into the same root", async () => {
    const renderer = await import("./_default.page.client");
    await renderer.render(
      context("/", true) as Parameters<typeof renderer.render>[0],
    );
    await renderer.render(
      context("/blog?page=2") as Parameters<typeof renderer.render>[0],
    );
    expect(client.hydrate).toHaveBeenCalledTimes(1);
    expect(client.create).not.toHaveBeenCalled();
    expect(client.render).toHaveBeenCalledTimes(1);
    const tree = client.render.mock.calls[0][0] as CommitElement;
    expect(tree.props.children.key).toBe("/blog?page=2");
  });

  it("creates a root when navigation supersedes initial hydration", async () => {
    const renderer = await import("./_default.page.client");
    await renderer.render(
      context("/contact") as Parameters<typeof renderer.render>[0],
    );
    expect(client.create).toHaveBeenCalledTimes(1);
    expect(client.hydrate).not.toHaveBeenCalled();
  });

  it("does not hydrate an empty SPA container", async () => {
    document.getElementById("root")!.innerHTML = "";
    const renderer = await import("./_default.page.client");
    await renderer.render(
      context("/", true) as Parameters<typeof renderer.render>[0],
    );
    expect(client.create).toHaveBeenCalledTimes(1);
    expect(client.hydrate).not.toHaveBeenCalled();
  });

  it("discards an older private import after a newer public navigation", async () => {
    let release!: () => void;
    client.prepare.mockImplementation((path: string) =>
      path === "/dashboard"
        ? new Promise<void>((resolve) => {
            release = resolve;
          })
        : Promise.resolve(),
    );
    const renderer = await import("./_default.page.client");
    const older = renderer.render(
      context("/dashboard", true) as Parameters<typeof renderer.render>[0],
    );
    await renderer.render(
      context("/blog") as Parameters<typeof renderer.render>[0],
    );
    release();
    await older;
    expect(client.hydrate).not.toHaveBeenCalled();
    expect(client.create).toHaveBeenCalledTimes(1);
    expect(client.render).toHaveBeenCalledTimes(1);
  });

  it("waits for the first commit before rendering an early navigation", async () => {
    client.autoCommit = false;
    const renderer = await import("./_default.page.client");
    const initial = renderer.render(
      context("/", true) as Parameters<typeof renderer.render>[0],
    );
    await vi.waitFor(() => expect(client.hydrate).toHaveBeenCalledTimes(1));
    const next = renderer.render(
      context("/contact") as Parameters<typeof renderer.render>[0],
    );
    await Promise.resolve();
    expect(client.render).not.toHaveBeenCalled();
    client.autoCommit = true;
    client.commit!();
    await Promise.all([initial, next]);
    expect(client.hydrate).toHaveBeenCalledTimes(1);
    expect(client.render).toHaveBeenCalledTimes(1);
  });
});
