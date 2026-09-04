import { beforeEach, describe, expect, it, vi } from "vitest";

const imports = vi.hoisted(() => ({ loaded: vi.fn() }));
vi.mock("./PrivatePageShell", () => {
  imports.loaded();
  return { default: () => null };
});

beforeEach(() => {
  vi.resetModules();
  imports.loaded.mockClear();
});

describe("page shell preparation", () => {
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
