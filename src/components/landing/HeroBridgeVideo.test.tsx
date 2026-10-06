import { cleanup, fireEvent, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { readFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import HeroBridgeVideo from "./HeroBridgeVideo";
const videoStyles = readFileSync("src/components/landing/HeroBridgeVideo.css", "utf8");

let style: HTMLStyleElement;
let styleVersion = 0;
const elementVisibility = (element: HTMLElement) => {
  style.textContent = videoStyles + "\n".repeat(++styleVersion);
  return getComputedStyle(element).visibility;
};
const elementOpacity = (element: HTMLElement) => {
  style.textContent = videoStyles + "\n".repeat(++styleVersion);
  return getComputedStyle(element).opacity;
};
beforeEach(() => {
  styleVersion = 0;
  style = document.createElement("style");
  style.textContent = videoStyles;
  document.head.append(style);
});

afterEach(() => { cleanup(); style.remove(); vi.restoreAllMocks(); });

function setup(reduced = false, loadPoster = true, mobile = false) {
  vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
    matches: query.includes("prefers-reduced-motion") ? reduced : mobile,
    addEventListener: vi.fn(), removeEventListener: vi.fn(),
  } as unknown as MediaQueryList));
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  const result = render(<HeroBridgeVideo />);
  const poster = result.container.querySelector("img")!;
  Object.defineProperty(poster, "currentSrc", {
    configurable: true,
    value: `/images/marketing/most-bridge-v2-${mobile ? 640 : 1774}.webp`,
  });
  if (loadPoster) fireEvent.load(poster);
  return { ...result, poster, video: result.container.querySelector("video")!, scene: result.container.firstElementChild! };
}

describe("Hero video story", () => {
  it("keeps the poster visible until the first video frame and restores it on failure", () => {
    const { poster, video } = setup();
    expect(elementVisibility(poster)).toBe("visible");
    expect(elementOpacity(video)).toBe("0");
    fireEvent.playing(video);
    expect(elementVisibility(poster)).toBe("hidden");
    expect(elementOpacity(video)).toBe("1");
    fireEvent.error(video);
    expect(elementVisibility(poster)).toBe("visible");
    expect(elementOpacity(video)).toBe("0");
  });
  it("renders a responsive high-priority poster before hydration without requesting video", () => {
    const html = renderToString(<HeroBridgeVideo />);
    const document = new DOMParser().parseFromString(html, "text/html");
    const poster = document.querySelector("img")!;
    expect(poster.getAttribute("srcset")).toContain("most-bridge-v2-640.webp 640w");
    expect(poster.getAttribute("srcset")).toContain("most-bridge-v2-1024.webp 1024w");
    expect(poster.getAttribute("sizes")).toBe("100vw");
    expect(poster.getAttribute("fetchpriority")).toBe("high");
    expect(poster.getAttribute("loading")).toBe("eager");
    expect(document.querySelector("video")!.hasAttribute("src")).toBe(false);
    expect(document.querySelector("video")!.hasAttribute("poster")).toBe(false);
  });
  it("waits for the responsive poster before loading mobile video and reuses the selected image", () => {
    const { poster, video, scene } = setup(false, false, true);
    expect(video.getAttribute("src")).toBeNull();
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    fireEvent.load(poster);
    expect(video.getAttribute("src")).toBe("/images/marketing/most-bridge-calm-mobile.mp4");
    expect(video.getAttribute("poster")).toBe(poster.currentSrc);
    expect(video.preload).toBe("none");
    expect(scene.getAttribute("data-poster-ready")).toBe("true");
  });
  it("starts video when the poster is already cached before hydration", () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true);
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(1774);
    const { video } = setup(false, false);
    expect(video.getAttribute("src")).toBe("/images/marketing/most-bridge-calm.mp4");
    expect(video.getAttribute("poster")).toContain("most-bridge-v2-1774.webp");
  });
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
    const { poster, video, scene, queryByRole } = setup(true);
    expect(video.getAttribute("src")).toBeNull();
    expect(scene.getAttribute("data-stage")).toBe("complete");
    expect(queryByRole("button")).toBeNull();
    expect(elementVisibility(poster)).toBe("visible");
  });
  it("shows both messages when video loading fails", () => {
    const { video, scene } = setup();
    fireEvent.error(video);
    expect(scene.getAttribute("data-stage")).toBe("complete");
  });
});
