import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import HeroBridgeVideo from "./HeroBridgeVideo";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function setup(reduced = false) {
  vi.spyOn(window, "matchMedia").mockReturnValue({
    matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  } as unknown as MediaQueryList);
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  const result = render(<HeroBridgeVideo />);
  return { ...result, video: result.container.querySelector("video")!, scene: result.container.firstElementChild! };
}

describe("Hero video story", () => {
  it("holds the last frame until the visitor explicitly replays", () => {
    const { video, getByRole } = setup();
    expect(video.loop).toBe(false);
    Object.defineProperty(video, "currentTime", { value: 10, configurable: true, writable: true });
    fireEvent.ended(video);
    const play = vi.mocked(HTMLMediaElement.prototype.play);
    play.mockClear();
    fireEvent(document, new Event("visibilitychange"));
    expect(play).not.toHaveBeenCalled();
    expect(video.currentTime).toBe(10);
    fireEvent.click(getByRole("button", { name: "Посмотреть ещё раз" }));
    expect(video.currentTime).toBe(0);
    expect(play).toHaveBeenCalledOnce();
  });
  it("keeps the completed copy visible when the video loops", () => {
    const { video, scene } = setup();
    Object.defineProperty(video, "currentTime", { value: 5, configurable: true });
    fireEvent.timeUpdate(video);
    expect(scene.getAttribute("data-stage")).toBe("transfer");
    Object.defineProperty(video, "currentTime", { value: 9, configurable: true });
    fireEvent.timeUpdate(video);
    expect(scene.getAttribute("data-stage")).toBe("complete");
    Object.defineProperty(video, "currentTime", { value: 0, configurable: true });
    fireEvent.timeUpdate(video);
    expect(scene.getAttribute("data-stage")).toBe("complete");
  });
  it("uses the poster without loading video for reduced motion", () => {
    const { video, scene, queryByRole } = setup(true);
    expect(video.getAttribute("src")).toBeNull();
    expect(scene.getAttribute("data-stage")).toBe("complete");
    expect(queryByRole("button")).toBeNull();
  });
  it("shows both messages when video loading fails", () => {
    const { video, scene } = setup();
    fireEvent.error(video);
    expect(scene.getAttribute("data-stage")).toBe("complete");
  });
});
