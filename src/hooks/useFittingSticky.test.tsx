import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useFittingSticky } from "./useFittingSticky";

let height = 600;
let top = "112px";
let resize: () => void;
const frames = new Map<number, FrameRequestCallback>();
const disconnect = vi.fn();
const observe = vi.fn();
let nextFrame = 0;

function Example() {
  const story = useFittingSticky();
  return <div ref={story.ref} data-testid="scene" data-sticky={story.fits} />;
}

function flushFrame() {
  act(() => {
    const pending = [...frames.values()];
    frames.clear();
    pending.forEach((callback) => callback(0));
  });
}

beforeEach(() => {
  height = 600;
  top = "112px";
  nextFrame = 0;
  frames.clear();
  observe.mockClear();
  disconnect.mockClear();
  vi.stubGlobal("innerHeight", 900);
  vi.stubGlobal("getComputedStyle", () => ({ top }));
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    () => ({ height }) as DOMRect,
  );
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    const id = ++nextFrame;
    frames.set(id, callback);
    return id;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: () => void) {
        resize = callback;
      }
      observe = observe;
      disconnect = disconnect;
    },
  );
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("useFittingSticky", () => {
  it("keeps an oversized scene in normal flow and responds to content changes", () => {
    height = 1007;
    render(<Example />);
    flushFrame();
    expect(screen.getByTestId("scene").dataset.sticky).toBe("false");
    height = 600;
    resize();
    flushFrame();
    expect(screen.getByTestId("scene").dataset.sticky).toBe("true");
    height = 790;
    resize();
    flushFrame();
    expect(screen.getByTestId("scene").dataset.sticky).toBe("false");
  });

  it("rechecks viewport and header space before enabling sticky", () => {
    render(<Example />);
    flushFrame();
    expect(screen.getByTestId("scene").dataset.sticky).toBe("true");
    vi.stubGlobal("innerHeight", 700);
    fireEvent(window, new Event("resize"));
    flushFrame();
    expect(screen.getByTestId("scene").dataset.sticky).toBe("false");
    vi.stubGlobal("innerHeight", 900);
    top = "300px";
    resize();
    flushFrame();
    expect(screen.getByTestId("scene").dataset.sticky).toBe("false");
    top = "112px";
    resize();
    flushFrame();
    expect(screen.getByTestId("scene").dataset.sticky).toBe("true");
  });

  it("stays in normal flow when size observation is unavailable", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    render(<Example />);
    expect(screen.getByTestId("scene").dataset.sticky).toBe("false");
    expect(frames.size).toBe(0);
  });

  it("observes header changes and cleans up pending measurements", () => {
    const header = document.createElement("header");
    document.body.append(header);
    const remove = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<Example />);
    expect(observe).toHaveBeenCalledWith(header);
    expect(frames.size).toBe(1);
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(frames.size).toBe(0);
    expect(remove).toHaveBeenCalledWith("resize", expect.any(Function));
    header.remove();
  });
});
