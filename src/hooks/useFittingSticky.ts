import { useEffect, useRef, useState } from "react";

export function useFittingSticky() {
  const ref = useRef<HTMLDivElement>(null);
  const [fits, setFits] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    let frame = 0;

    const measure = () => {
      frame = 0;
      const top = Number.parseFloat(getComputedStyle(element).top);
      const height = element.getBoundingClientRect().height;
      setFits(
        Number.isFinite(top) &&
          height > 0 &&
          height + top + 16 <= window.innerHeight,
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    const header = document.querySelector("header");
    if (header) observer.observe(header);
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return { ref, fits };
}
