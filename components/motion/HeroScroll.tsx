"use client";

import { useEffect } from "react";

/**
 * Sets `--s` (0 → 1) on the hero while it scrolls out of view, for a gentle
 * parallax (copy lifts and fades, the plant comes closer). Defaults to 0 in CSS,
 * so without JS or with reduced motion the hero simply stays at rest.
 */
export function HeroScroll({ targetId }: { targetId: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const h = el.offsetHeight || window.innerHeight;
      const s = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / (h * 0.8)));
      el.style.setProperty("--s", s.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [targetId]);
  return null;
}
