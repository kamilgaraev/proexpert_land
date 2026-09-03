import { useEffect, useRef } from "react";

export const getScrollbarGeometry = (
  viewport: number,
  content: number,
  scroll: number,
) => {
  const track = Math.max(0, viewport - 8);
  const maximum = Math.max(0, content - viewport);
  const height = Math.min(
    track,
    Math.max(48, (track * viewport) / Math.max(content, 1)),
  );
  const travel = track - height;
  const position = Math.min(maximum, Math.max(0, scroll));
  return {
    height,
    travel,
    maximum,
    position,
    top: 4 + (maximum ? (position / maximum) * travel : 0),
  };
};

const MarketingScrollbar = () => {
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const thumb = thumbRef.current;
    if (
      !thumb ||
      !window.ResizeObserver ||
      !window.PointerEvent ||
      !window.CSS?.supports("scrollbar-width", "none") ||
      !thumb.setPointerCapture
    )
      return;

    const desktop = window.matchMedia(
      "(min-width: 1080px) and (pointer: fine)",
    );
    const forcedColors = window.matchMedia("(forced-colors: active)");
    const root = document.documentElement;
    let stop: (() => void) | undefined;

    const configure = () => {
      stop?.();
      stop = undefined;
      if (!desktop.matches || forcedColors.matches) return;

      let frame = 0;
      let pointer: number | null = null;
      let grabOffset = 0;
      const geometry = () =>
        getScrollbarGeometry(
          window.innerHeight,
          Math.max(root.scrollHeight, document.body.scrollHeight),
          window.scrollY,
        );
      const update = () => {
        frame = 0;
        const current = geometry();
        thumb.hidden = current.maximum === 0;
        thumb.style.height = `${current.height}px`;
        thumb.style.transform = `translateY(${current.top}px)`;
        thumb.setAttribute(
          "aria-valuemax",
          String(Math.round(current.maximum)),
        );
        thumb.setAttribute(
          "aria-valuenow",
          String(Math.round(current.position)),
        );
        thumb.setAttribute(
          "aria-valuetext",
          `${current.maximum ? Math.round((current.position / current.maximum) * 100) : 0}%`,
        );
      };
      const schedule = () => {
        if (!frame) frame = window.requestAnimationFrame(update);
      };
      const scrollTo = (top: number) =>
        window.scrollTo({ top, behavior: "instant" });
      const release = () => {
        if (pointer !== null && thumb.hasPointerCapture(pointer))
          thumb.releasePointerCapture(pointer);
        pointer = null;
        thumb.removeAttribute("data-dragging");
      };
      const pointerDown = (event: PointerEvent) => {
        if (event.button !== 0 || !event.isPrimary) return;
        event.preventDefault();
        grabOffset = event.clientY - geometry().top;
        thumb.setPointerCapture(event.pointerId);
        pointer = event.pointerId;
        thumb.setAttribute("data-dragging", "true");
      };
      const pointerMove = (event: PointerEvent) => {
        if (pointer !== event.pointerId) return;
        const current = geometry();
        if (current.travel > 0)
          scrollTo(
            Math.max(
              0,
              Math.min(1, (event.clientY - 4 - grabOffset) / current.travel),
            ) * current.maximum,
          );
      };
      const keyDown = (event: KeyboardEvent) => {
        const current = geometry();
        const page = window.innerHeight * 0.9;
        const positions: Record<string, number> = {
          ArrowDown: current.position + 40,
          ArrowUp: current.position - 40,
          PageDown: current.position + page,
          PageUp: current.position - page,
          Home: 0,
          End: current.maximum,
          " ": current.position + (event.shiftKey ? -page : page),
        };
        if (!(event.key in positions)) return;
        event.preventDefault();
        scrollTo(Math.max(0, Math.min(current.maximum, positions[event.key])));
      };
      const observer = new ResizeObserver(schedule);
      stop = () => {
        root.classList.remove("most-overlay-scrollbar-ready");
        thumb.hidden = true;
        release();
        observer.disconnect();
        window.cancelAnimationFrame(frame);
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
        window.visualViewport?.removeEventListener("resize", schedule);
        thumb.removeEventListener("pointerdown", pointerDown);
        thumb.removeEventListener("pointermove", pointerMove);
        thumb.removeEventListener("pointerup", release);
        thumb.removeEventListener("pointercancel", release);
        thumb.removeEventListener("lostpointercapture", release);
        thumb.removeEventListener("keydown", keyDown);
      };
      try {
        observer.observe(root);
        observer.observe(document.body);
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        window.visualViewport?.addEventListener("resize", schedule);
        thumb.addEventListener("pointerdown", pointerDown);
        thumb.addEventListener("pointermove", pointerMove);
        thumb.addEventListener("pointerup", release);
        thumb.addEventListener("pointercancel", release);
        thumb.addEventListener("lostpointercapture", release);
        thumb.addEventListener("keydown", keyDown);
        update();
        root.classList.add("most-overlay-scrollbar-ready");
        schedule();
      } catch {
        stop();
        stop = undefined;
      }
    };

    configure();
    desktop.addEventListener("change", configure);
    forcedColors.addEventListener("change", configure);
    return () => {
      stop?.();
      desktop.removeEventListener("change", configure);
      forcedColors.removeEventListener("change", configure);
    };
  }, []);

  return (
    <div
      ref={thumbRef}
      className="most-scrollbar-thumb"
      role="scrollbar"
      aria-label="Прокрутка страницы"
      aria-controls="main-content"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={0}
      aria-valuenow={0}
      tabIndex={0}
      hidden
    />
  );
};

export default MarketingScrollbar;
