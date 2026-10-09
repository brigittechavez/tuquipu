"use client";

import { useEffect, useRef, useState } from "react";
import { ctas } from "@/content/ctas";
import { WhatsAppGlyph } from "./WhatsAppGlyph";
import styles from "./FloatingWhatsApp.module.css";

/** Areas that already offer WhatsApp: the floating button steps aside while they are on screen. */
const OWN_CTA_AREAS = "#inicio, #cierre, footer";
/** Crucial moments where the label briefly unfolds: after seeing the product, the plans and the FAQ. */
const NUDGE_AREAS = "#producto, #planes, #preguntas, #compras, #finanzas";
const NUDGE_MS = 4500;
const NUDGE_GAP_MS = 25000;
const NUDGE_MAX = 3;

/**
 * Persistent WhatsApp access: a small glass disc with the mint WhatsApp mark that
 * unfolds into "Agenda tu demo / por WhatsApp" on hover/focus and at crucial moments
 * (max. three per page view, 4.5 s each). Without JS: a plain link.
 */
export function FloatingWhatsApp() {
  const cta = ctas.floating_whatsapp;
  const [hidden, setHidden] = useState(false);
  const [nudging, setNudging] = useState(false);
  const hiddenRef = useRef(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const visible = new Set<Element>();
    const areas = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        hiddenRef.current = visible.size > 0;
        setHidden(hiddenRef.current);
        if (hiddenRef.current) setNudging(false);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    document.querySelectorAll(OWN_CTA_AREAS).forEach((a) => areas.observe(a));

    let count = 0;
    let last = -Infinity;
    let timer = 0;
    const seen = new WeakSet<Element>();
    const nudges = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting || seen.has(e.target)) continue;
          seen.add(e.target);
          const now = performance.now();
          if (count >= NUDGE_MAX || now - last < NUDGE_GAP_MS || document.hidden) continue;
          count += 1;
          last = now;
          // Let the visitor land on the section first.
          window.setTimeout(() => {
            if (hiddenRef.current) return;
            setNudging(true);
            window.clearTimeout(timer);
            timer = window.setTimeout(() => setNudging(false), NUDGE_MS);
          }, 1200);
        }
      },
      { rootMargin: "-40% 0px -40% 0px" },
    );
    document.querySelectorAll(NUDGE_AREAS).forEach((a) => nudges.observe(a));

    return () => {
      areas.disconnect();
      nudges.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <a
      href={cta.destination}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.fab}
      data-hidden={hidden || undefined}
      data-nudge={nudging || undefined}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      aria-label={`${cta.label} (abre WhatsApp en una pestaña nueva)`}
      data-cta-id={cta.id}
      data-section-id={cta.sectionId}
      data-destination={cta.destination}
      data-analytics-event={cta.analyticsEvent}
      data-cta-label={cta.label}
      data-message-code={cta.messageCode}
    >
      <span className={styles.icon} aria-hidden>
        <WhatsAppGlyph />
      </span>
      <span className={styles.text} aria-hidden>
        <span className={styles.title}>Agenda tu demo</span>
        <span className={styles.sub}>por WhatsApp</span>
      </span>
    </a>
  );
}
