import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import MarketingScrollbar, { getScrollbarGeometry } from "./MarketingScrollbar";

const disconnect = vi.fn();
const mediaListeners = new Set<() => void>();
let desktop = true;
let forcedColors = false;
let resizeCallback: () => void;
const capture = new Set<number>();

beforeEach(() => {
  desktop = true;
  forcedColors = false;
  capture.clear();
  mediaListeners.clear();
  vi.stubGlobal("innerHeight", 1000);
  vi.stubGlobal("scrollY", 0);
  vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(
    5000,
  );
  vi.stubGlobal("CSS", { supports: () => true });
  vi.stubGlobal(
    "PointerEvent",
    class extends MouseEvent {
      pointerId: number;
      isPrimary: boolean;
      constructor(type: string, init: PointerEventInit) {
        super(type, init);
        this.pointerId = init.pointerId ?? 1;
        this.isPrimary = init.isPrimary ?? true;
      }
    },
  );
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resizeCallback = callback;
      }
      observe = vi.fn();
      disconnect = disconnect;
    },
  );
  vi.stubGlobal("matchMedia", (query: string) => ({
    get matches() {
      return query.includes("forced-colors") ? forcedColors : desktop;
    },
    addEventListener: (_: string, listener: () => void) =>
      mediaListeners.add(listener),
    removeEventListener: (_: string, listener: () => void) =>
      mediaListeners.delete(listener),
  }));
  vi.stubGlobal("scrollTo", vi.fn());
  vi.stubGlobal(
    "requestAnimationFrame",
    vi.fn(() => 37),
  );
  vi.stubGlobal("cancelAnimationFrame", vi.fn());
  Object.defineProperties(HTMLElement.prototype, {
    setPointerCapture: {
      configurable: true,
      value: (id: number) => capture.add(id),
    },
    hasPointerCapture: {
      configurable: true,
      value: (id: number) => capture.has(id),
    },
    releasePointerCapture: {
      configurable: true,
      value: (id: number) => capture.delete(id),
    },
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  disconnect.mockClear();
});

describe("Marketing window scrollbar", () => {
  it("clamps overscroll and keeps a usable thumb for long pages", () => {
    expect(getScrollbarGeometry(1000, 100000, -20)).toMatchObject({
      height: 48,
      top: 4,
      position: 0,
    });
    const end = getScrollbarGeometry(1000, 5000, 6000);
    expect(end.top + end.height).toBe(996);
    expect(end.position).toBe(4000);
    expect(getScrollbarGeometry(1000, 800, 0)).toMatchObject({
      maximum: 0,
      height: 992,
    });
  });

  it("uses native window scrolling for keyboard and captured pointer drag", () => {
    render(<MarketingScrollbar />);
    const thumb = screen.getByRole("scrollbar");
    expect(document.documentElement).toHaveClass(
      "most-overlay-scrollbar-ready",
    );
    expect(thumb).toHaveAttribute("aria-valuemax", "4000");
    fireEvent.keyDown(thumb, { key: "End" });
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: 4000,
      behavior: "instant",
    });
    fireEvent.keyDown(thumb, { key: "PageDown" });
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: 900,
      behavior: "instant",
    });
    fireEvent.pointerDown(thumb, {
      button: 0,
      pointerId: 8,
      clientY: 20,
      isPrimary: true,
    });
    expect(capture.has(8)).toBe(true);
    expect(thumb).not.toHaveFocus();
    fireEvent.pointerMove(thumb, { pointerId: 8, clientY: 900 });
    expect(window.scrollTo).toHaveBeenLastCalledWith({
      top: 4000,
      behavior: "instant",
    });
    fireEvent.pointerUp(thumb, { pointerId: 8 });
    expect(capture.size).toBe(0);
  });

  it("restores native scrolling on media changes and disposes observers, capture and frames", () => {
    const { unmount } = render(<MarketingScrollbar />);
    const thumb = screen.getByRole("scrollbar");
    fireEvent.pointerDown(thumb, {
      button: 0,
      pointerId: 4,
      clientY: 20,
      isPrimary: true,
    });
    forcedColors = true;
    mediaListeners.forEach((listener) => listener());
    expect(document.documentElement).not.toHaveClass(
      "most-overlay-scrollbar-ready",
    );
    expect(thumb).toHaveAttribute("hidden");
    expect(capture.size).toBe(0);
    expect(disconnect).toHaveBeenCalled();
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(37);
    unmount();
    expect(mediaListeners.size).toBe(0);
    vi.mocked(window.requestAnimationFrame).mockClear();
    fireEvent.scroll(window);
    fireEvent.resize(window);
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("retains native scrolling on mobile and unsupported browsers", () => {
    desktop = false;
    const { unmount } = render(<MarketingScrollbar />);
    expect(document.documentElement).not.toHaveClass(
      "most-overlay-scrollbar-ready",
    );
    unmount();
    desktop = true;
    vi.stubGlobal("ResizeObserver", undefined);
    render(<MarketingScrollbar />);
    expect(document.documentElement).not.toHaveClass(
      "most-overlay-scrollbar-ready",
    );
  });

  it("coalesces document resizing and scrolling into one pending frame", () => {
    render(<MarketingScrollbar />);
    resizeCallback();
    fireEvent.scroll(window);
    fireEvent.resize(window);
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
  });
});
