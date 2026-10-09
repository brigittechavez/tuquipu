"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Reads the tone of the section currently under the sticky header and
 * mirrors it on the header (`data-on="dark"`), so logo, links, focus and CTA keep
 * AA contrast over light, violet or dark blocks. One rAF-throttled check per scroll.
 */
export function HeaderTone({ headerId }: { headerId: string }) {
  const pathname = usePathname();

  useEffect(() => {
    const header = document.getElementById(headerId);
    if (!header) return;
    let frame = 0;
    const check = () => {
      frame = 0;
      const y = header.getBoundingClientRect().bottom + 1;
      const below = document.elementsFromPoint(window.innerWidth / 2, y).find((el) => !header.contains(el));
      const tone = below?.closest<HTMLElement>("[data-tone]")?.dataset.tone;
      const dark = tone === "dark" || tone === "brand";
      header.toggleAttribute("data-on-dark", dark);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headerId, pathname]);

  return null;
}
