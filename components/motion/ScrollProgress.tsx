"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  className?: string;
  /** Viewport fraction where progress starts (top of the block reaches it). */
  start?: number;
  /** Viewport fraction where progress reaches 1. */
  end?: number;
  children: ReactNode;
  as?: "div" | "section";
  ariaLabel?: string;
};

/**
 * Scroll-linked progress without scroll-jacking: exposes `--p` (0 → 1) while the
 * block crosses the viewport, so CSS can "scrub" a dispersed → assembled state.
 * Server default is the final state (`--p: 1`), so it reads correctly without JS
 * and with prefers-reduced-motion (the listener is not attached).
 */
export function ScrollProgress({ className, start = 0.88, end = 0.35, children, as: Tag = "div", ariaLabel }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    let visible = false;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, (start * vh - top) / ((start - end) * vh)));
      el.style.setProperty("--p", p.toFixed(3));
      el.toggleAttribute("data-assembled", p >= 0.98);
    };
    const onScroll = () => {
      if (visible && !frame) frame = requestAnimationFrame(update);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) update();
    });
    io.observe(el);
    el.setAttribute("data-scrub", "");
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [start, end]);

  return (
    <Tag ref={ref} className={className} style={{ ["--p" as string]: 1 }} aria-label={ariaLabel}>
      {children}
    </Tag>
  );
}
