import { beforeEach, describe, expect, it, vi } from "vitest";

const imports = vi.hoisted(() => ({ loaded: vi.fn(), styles: vi.fn() }));
vi.mock("../index.css", () => {
  imports.styles();
  return {};
});
vi.mock("./PrivatePageShell", () => {
  imports.loaded();
  return { default: () => null };
});

beforeEach(() => {
  vi.resetModules();
  imports.loaded.mockClear();
  imports.styles.mockClear();
});

describe("page shell preparation", () => {
  it("loads full styles for non-home pages without requesting them for the home", async () => {
    const loader = await import("./pageShellLoader");
    await loader.preparePageShell("/");
    expect(imports.styles).not.toHaveBeenCalled();
    await loader.preparePageShell("/pricing");
    expect(imports.styles).toHaveBeenCalledOnce();
    expect(imports.loaded).not.toHaveBeenCalled();
  });
  it("does not evaluate private providers for public SSR or hydration", async () => {
    const loader = await import("./pageShellLoader");
    await loader.preparePageShell("/");
    await loader.preparePageShell("/blog");
    await loader.preparePageShell("/privacy");
    expect(imports.loaded).not.toHaveBeenCalled();
    expect(loader.getPrivatePageShell()).toBeNull();
  });

  it("prepares private routes before rendering and shares concurrent imports", async () => {
    const loader = await import("./pageShellLoader");
    const first = loader.loadPrivatePageShell();
    const second = loader.loadPrivatePageShell();
    expect(first).toBe(second);
    await Promise.all([first, loader.preparePageShell("/dashboard")]);
    expect(loader.getPrivatePageShell()).toBe(await first);
    expect(imports.loaded).toHaveBeenCalledTimes(1);
    await loader.preparePageShell("/login");
    expect(imports.loaded).toHaveBeenCalledTimes(1);
  });
});
