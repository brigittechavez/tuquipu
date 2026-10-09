"use client";

import { useEffect } from "react";

type Cam = { cx: number; cy: number; w: number; wDesk: number; shift: number; minH: number };

const smooth = (t: number) => t * t * (3 - 2 * t);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Each step holds, then glides to the next (no constant drift). */
const plateau = (t: number) => smooth(Math.min(1, Math.max(0, (t - 0.3) / 0.4)));

/**
 * Pinned 2.5D route driven by native scroll (no scroll-jacking). The track's
 * progress picks the active chapter, glides a camera between stations (from the
 * SVG's data-camera), rides the batch token along data-anchors with a small hop,
 * and moves every [data-station] and [data-chapter] through
 * pending → active → done. Reduced motion: nothing runs, the plain layout stays.
 */
export function JourneyStory({ storyId }: { storyId: string }) {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(`[data-journey="${storyId}"]`);
    const svg = root?.querySelector<SVGSVGElement>("[data-journey-svg]");
    if (!root || !svg || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cams = JSON.parse(svg.dataset.camera ?? "[]") as Cam[];
    const anchors = JSON.parse(svg.dataset.anchors ?? "[]") as [number, number][];
    const token = svg.querySelector<SVGGElement>("[data-journey-token]");
    const stations = Array.from(svg.querySelectorAll<SVGGElement>("[data-station]"));
    const chapters = Array.from(root.querySelectorAll<HTMLElement>("[data-chapter]"));
    const order = chapters.map((c) => c.dataset.chapter as string);
    const groups = ["[data-chapter]"].map((s) => Array.from(root.querySelectorAll<HTMLElement>(s)));
    const wide = window.matchMedia("(min-width: 1024px)");
    const last = order.length - 1;

    let target = 0;
    let shown = 0;
    let active = -1;
    let frame = 0;
    let visible = false;

    const progress = () => {
      const r = root.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      return (span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0) * last;
    };

    const frameCamera = (f: number) => {
      const i = Math.min(Math.floor(f), last);
      const t = plateau(f - i);
      const a = cams[i];
      const b = cams[Math.min(i + 1, last)];
      const box = svg.getBoundingClientRect();
      const ratio = box.width > 0 ? box.height / box.width : 0.6;
      // Wide enough for the station, and tall enough for the overview to fit.
      const fit = (c: Cam) => Math.max(wide.matches ? c.wDesk : c.w, c.minH / ratio);
      const w = lerp(fit(a), fit(b), t);
      const h = w * ratio;
      // Desktop: the station sits right of centre, leaving room for the story text.
      const shift = wide.matches ? lerp(a.shift, b.shift, t) : 0;
      // Phones: the text sits on top, so the station sits a little low.
      const lift = wide.matches ? 0.06 : -0.06;
      const cx = lerp(a.cx, b.cx, t) - shift * w;
      const cy = lerp(a.cy, b.cy, t) + lift * h;
      svg.setAttribute("viewBox", `${(cx - w / 2).toFixed(1)} ${(cy - h / 2).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`);

      if (token && anchors.length) {
        const p = anchors[i];
        const q = anchors[Math.min(i + 1, last)];
        const x = lerp(p[0], q[0], t);
        const y = lerp(p[1], q[1], t) - Math.sin(Math.PI * t) * 46 - 70;
        token.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      }
    };

    const setActive = (index: number) => {
      if (index === active) return;
      active = index;
      const state = (i: number) => (i < index ? "done" : i === index ? "active" : "pending");
      groups.forEach((list) => list.forEach((el, i) => (el.dataset.state = state(i))));
      stations.forEach((s, i) => s.setAttribute("data-state", state(i)));
      root.dataset.activeStep = order[index];
    };

    const tick = () => {
      frame = 0;
      target = progress();
      setActive(Math.min(last, Math.max(0, Math.round(target))));
      shown += (target - shown) * 0.14;
      if (Math.abs(target - shown) < 0.002) shown = target;
      frameCamera(shown);
      if (visible && shown !== target) frame = requestAnimationFrame(tick);
    };
    const schedule = () => {
      if (visible && !frame) frame = requestAnimationFrame(tick);
    };

    root.dataset.pinned = "";
    shown = target = progress();
    tick();

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    });
    io.observe(root);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      delete root.dataset.pinned;
    };
  }, [storyId]);

  return null;
}
