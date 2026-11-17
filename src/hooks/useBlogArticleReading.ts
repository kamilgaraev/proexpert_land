import { useEffect } from 'react';
import { blogPublicApi } from '@/utils/blogPublicApi';

const VISITOR_KEY = 'most.blog.visitor.v1';

export function useBlogArticleReading(slug: string | null) {
  useEffect(() => {
    if (!slug) return;

    let visitorId: string;
    try {
      const stored = localStorage.getItem(VISITOR_KEY);
      visitorId = stored && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(stored)
        ? stored : crypto.randomUUID();
      localStorage.setItem(VISITOR_KEY, visitorId);
    } catch {
      visitorId = crypto.randomUUID();
    }
    const sessionId = crypto.randomUUID();
    let activeMilliseconds = 0;
    let lastTick = performance.now();
    let lastInteraction = lastTick;
    let focused = document.hasFocus();
    let lastSent = -1;

    const tick = () => {
      const now = performance.now();
      if (document.visibilityState === 'visible' && focused && now - lastInteraction < 60_000) {
        activeMilliseconds += Math.min(Math.max(now - lastTick, 0), 2_000);
      }
      lastTick = now;
    };
    const flush = () => {
      tick();
      const activeSeconds = Math.min(Math.floor(activeMilliseconds / 1_000), 3_600);
      if (activeSeconds === lastSent) return;
      lastSent = activeSeconds;
      blogPublicApi.recordReading(slug, {
        visitor_id: visitorId,
        session_id: sessionId,
        active_seconds: activeSeconds,
      });
    };
    const interact = () => {
      tick();
      lastInteraction = performance.now();
    };
    const focus = () => {
      lastTick = performance.now();
      lastInteraction = lastTick;
      focused = true;
    };
    const blur = () => {
      flush();
      focused = false;
    };
    const visibility = () => {
      flush();
      lastTick = performance.now();
      focused = document.hasFocus();
    };

    flush();
    const tickTimer = window.setInterval(tick, 1_000);
    const flushTimer = window.setInterval(flush, 15_000);
    const interactionEvents = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart'] as const;
    interactionEvents.forEach((event) => window.addEventListener(event, interact, { passive: true }));
    window.addEventListener('focus', focus);
    window.addEventListener('blur', blur);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', visibility);

    return () => {
      flush();
      window.clearInterval(tickTimer);
      window.clearInterval(flushTimer);
      interactionEvents.forEach((event) => window.removeEventListener(event, interact));
      window.removeEventListener('focus', focus);
      window.removeEventListener('blur', blur);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [slug]);
}
