"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  className?: string;
  /** Delay (ms from entering view) at which each phase 1…n starts. */
  phases: number[];
  /** Optional window event fired when a phase starts (e.g. to trigger a Kappi pose-shift). */
  event?: { phase: number; name: string };
  children: ReactNode;
};

/**
 * Plays a one-shot sequence when the block enters view by stepping `data-phase`
 * (0 → n); CSS decides what each phase shows. Runs once, ends stable.
 * Without JS no `data-phase` exists, so the final composition renders as is;
 * with reduced motion it jumps straight to the last phase.
 */
export function Choreography({ className, phases, event, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const last = phases.length;
    const fire = (phase: number) => {
      el.dataset.phase = String(phase);
      if (event && phase === event.phase) window.dispatchEvent(new CustomEvent(event.name));
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      fire(last);
      if (event && event.phase !== last) window.dispatchEvent(new CustomEvent(event.name));
      return;
    }
    el.dataset.phase = "0";
    const timers: number[] = [];
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        phases.forEach((delay, i) => timers.push(window.setTimeout(() => fire(i + 1), delay)));
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      timers.forEach(clearTimeout);
    };
  }, [phases, event]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
