"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a[href], button, summary, [role='tab'], label:has(> input[type='radio']), label:has(> input[type='checkbox'])";
const TEXT_FIELD = "input:not([type='radio'], [type='checkbox'], [type='submit'], [type='button']), textarea, select, [contenteditable]";

/**
 * Companion ring for the brand cursor: trails the pointer with inertia, grows
 * and gets pulled toward interactive targets, and switches to light on dark
 * sections. Only for precise pointers and no reduced motion; never on text fields.
 * Purely decorative (aria-hidden, pointer-events none) and paused when idle.
 */
export function CursorFollower() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ring = ref.current;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!ring || !fine.matches || reduced.matches) return;

    let x = -100;
    let y = -100;
    let rx = x;
    let ry = y;
    let target: Element | null = null;
    let frame = 0;

    const tick = () => {
      let tx = x;
      let ty = y;
      if (target) {
        // Magnetic pull: a third of the way toward the target's center.
        const r = target.getBoundingClientRect();
        tx = x + (r.left + r.width / 2 - x) * 0.33;
        ty = y + (r.top + r.height / 2 - y) * 0.33;
      }
      rx += (tx - rx) * 0.22;
      ry += (ty - ry) * 0.22;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
      frame = Math.abs(tx - rx) + Math.abs(ty - ry) > 0.2 ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      const el = e.target instanceof Element ? e.target : null;
      const field = el?.closest(TEXT_FIELD);
      target = field ? null : (el?.closest(INTERACTIVE) ?? null);
      ring.dataset.state = field ? "field" : target ? "hover" : "idle";
      const tone = el?.closest("[data-tone]")?.getAttribute("data-tone");
      ring.dataset.dark = tone === "dark" || tone === "brand" ? "true" : "false";
      ring.dataset.visible = "true";
      wake();
    };
    const onDown = () => (ring.dataset.pressed = "true");
    const onUp = () => (ring.dataset.pressed = "false");
    // Hide only when the pointer leaves the window (no element on the other side).
    const onLeave = (e: PointerEvent) => {
      if (!e.relatedTarget) ring.dataset.visible = "false";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerout", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerout", onLeave);
    };
  }, []);

  return <div ref={ref} className="cursor-ring" aria-hidden data-visible="false" />;
}
