"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { SCROLL_DEPTH_THRESHOLDS } from "@/content/measurement";
import { track } from "@/lib/analytics";

/**
 * Page-level delegation so CTAs, FAQ and pricing stay server-rendered.
 * Listeners never call preventDefault: navigation works even if analytics fail.
 */
export function AnalyticsListener() {
  const pathname = usePathname();

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const target = (event.target as Element | null)?.closest<HTMLElement>("[data-cta-id]");
      if (!target) return;
      const d = target.dataset;
      const isWhatsapp = d.analyticsEvent === "whatsapp_click";
      track(isWhatsapp ? "whatsapp_click" : "cta_click", {
        cta_id: d.ctaId,
        page_path: pathname,
        section_id: d.sectionId,
        cta_label: d.ctaLabel,
        destination: d.destination,
        plan_id: d.planId,
        ...(isWhatsapp ? { link_url: d.destination, message_code: d.messageCode } : {}),
      });
    }

    function onToggle(event: Event) {
      const el = event.target as HTMLDetailsElement | null;
      if (!el || el.tagName !== "DETAILS" || !el.open) return;
      if (el.dataset.faqId) track("faq_open", { faq_id: el.dataset.faqId, topic: el.dataset.faqTopic });
      if (el.dataset.pricingInteraction) {
        track("pricing_interaction", { plan_id: "all", interaction_type: el.dataset.pricingInteraction });
      }
    }

    const reached = new Set<number>();
    let frame = 0;
    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const doc = document.documentElement;
        const scrollable = doc.scrollHeight - window.innerHeight;
        if (scrollable <= 0) return;
        const percent = ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;
        for (const t of SCROLL_DEPTH_THRESHOLDS) {
          if (percent >= t && !reached.has(t)) {
            reached.add(t);
            track("scroll_depth", { percent: t, page_path: pathname });
          }
        }
      });
    }

    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("toggle", onToggle, { capture: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("toggle", onToggle, { capture: true });
      window.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  return null;
}
