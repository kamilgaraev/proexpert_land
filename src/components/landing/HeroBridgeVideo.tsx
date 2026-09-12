import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@heroicons/react/24/outline";
import "./HeroBridgeVideo.css";

export default function HeroBridgeVideo() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [videoSource, setVideoSource] = useState<string>();
  const manuallyPaused = useRef(false);

  const showCopy = () => {
    progressRef.current = 1;
    if (sceneRef.current) sceneRef.current.dataset.stage = "complete";
  };

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = window.matchMedia("(max-width: 767px)");
    const update = () => {
      setVideoSource(compact.matches ? "/images/marketing/most-bridge-story-mobile.mp4" : "/images/marketing/most-bridge-story.mp4");
      setEnabled(!motion.matches);
      if (motion.matches) {
        videoRef.current?.pause();
        showCopy();
      }
    };
    update();
    motion.addEventListener("change", update);
    compact.addEventListener("change", update);
    return () => {
      motion.removeEventListener("change", update);
      compact.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const scene = sceneRef.current;
    if (!enabled || !video || !scene) return;
    let visible = true;
    const syncPlayback = () => {
      if (visible && !document.hidden && !manuallyPaused.current) {
        void video.play().catch(showCopy);
      } else {
        video.pause();
      }
    };
    const observer = typeof IntersectionObserver === "undefined" ? null :
      new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        syncPlayback();
      }, { threshold: 0.15 });
    observer?.observe(scene);
    document.addEventListener("visibilitychange", syncPlayback);
    if (!observer) syncPlayback();
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      video.pause();
    };
  }, [enabled, videoSource]);

  const syncCopy = () => {
    const video = videoRef.current;
    const scene = sceneRef.current;
    if (!video || !scene) return;
    const progress = Math.max(progressRef.current, Math.min(1, Math.max(0, (video.currentTime - 1) / 7)));
    progressRef.current = progress;
    scene.dataset.stage = progress >= 0.9 ? "complete" : video.currentTime >= 3 ? "transfer" : "start";
  };

  return (
    <div className="most-hero-film" ref={sceneRef} data-animated={enabled || undefined}>
      <video
        ref={videoRef}
        src={enabled ? videoSource : undefined}
        poster="/images/marketing/most-bridge-v2-1774.webp"
        width={1774}
        height={887}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label="Мост соединяет строительную площадку и офис"
        onTimeUpdate={syncCopy}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={showCopy}
      />
      <div className="most-hero-film-story">
        <p className="most-hero-film-start"><small>Площадка</small>Нужен материал.<br />Прораб создаёт заявку.</p>
        <p className="most-hero-film-transfer"><small>Одна заявка. Общая работа.</small>От стройки —<br />к решению в офисе.</p>
        <p className="most-hero-film-finish"><small>Офис</small>Заявка получена.<br />Снабженец готовит закупку.</p>
      </div>
      {enabled && (
        <button
          type="button"
          className="most-hero-film-control"
          aria-label={playing ? "Приостановить видео" : "Воспроизвести видео"}
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            manuallyPaused.current = !video.paused;
            if (video.paused) void video.play().catch(showCopy);
            else video.pause();
          }}
        >
          {playing ? <PauseIcon aria-hidden="true" /> : <PlayIcon aria-hidden="true" />}
        </button>
      )}
    </div>
  );
}
