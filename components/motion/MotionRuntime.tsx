"use client";

import { useEffect } from "react";

const REVEAL = "[data-reveal]:not([data-inview])";
const LOOP = "[data-loop]";

/**
 * Single lightweight runtime for every `[data-reveal]` and `[data-loop]` element.
 * A MutationObserver picks up content mounted later (client-side navigation,
 * back/forward, streamed segments), so nothing stays masked after routing.
 * Reveals happen once (sequences end stable); loops only run while visible.
 * Reduced motion is handled in CSS: content is simply visible.
 */
export function MotionRuntime() {
  useEffect(() => {
    document.documentElement.classList.add("motion-ready");
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(REVEAL).forEach((n) => n.setAttribute("data-inview", ""));
      return;
    }

    const reveals = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Also reveal blocks already scrolled past (a fast flick can skip their "enter").
          if (!entry.isIntersecting && entry.boundingClientRect.top > 0) continue;
          entry.target.setAttribute("data-inview", "");
          reveals.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    const loops = new IntersectionObserver((entries) => {
      for (const entry of entries) entry.target.toggleAttribute("data-playing", entry.isIntersecting);
    });

    const seen = new WeakSet<Element>();
    function scan(root: ParentNode) {
      root.querySelectorAll(REVEAL).forEach((n) => {
        if (seen.has(n)) return;
        seen.add(n);
        reveals.observe(n);
      });
      root.querySelectorAll(LOOP).forEach((n) => {
        if (seen.has(n)) return;
        seen.add(n);
        loops.observe(n);
      });
    }
    scan(document);

    let frame = 0;
    const mutations = new MutationObserver(() => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        scan(document);
      });
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    // Safety net for very fast scrolling: when scrolling settles, anything above the
    // fold that never reported an intersection is revealed (sequences still end stable).
    let settle = 0;
    const onScroll = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(() => {
        const limit = window.innerHeight;
        document.querySelectorAll<HTMLElement>(REVEAL).forEach((n) => {
          if (n.getBoundingClientRect().top < limit) {
            n.setAttribute("data-inview", "");
            reveals.unobserve(n);
          }
        });
      }, 160);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(settle);
      mutations.disconnect();
      reveals.disconnect();
      loops.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
