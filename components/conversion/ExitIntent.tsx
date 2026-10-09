"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ctas } from "@/content/ctas";
import { Kappi } from "@/components/illustration/Kappi";
import { TrackedCta } from "@/components/ui/TrackedCta";
import { track } from "@/lib/analytics";
import { LEAD_DONE_KEY } from "./LeadConfirmation";
import styles from "./ExitIntent.module.css";

type Trigger = "mouse_exit" | "tab_return" | "fast_scroll_up";

const SESSION_KEY = "tq-exit-shown";
const SNOOZE_KEY = "tq-exit-snooze-until";
const SNOOZE_MS = 3 * 24 * 60 * 60 * 1000;
/** Arm only after real interest: some time on the page and some reading. */
const ARM_AFTER_MS = 12000;
const ARM_SCROLL = 0.2;
const AWAY_MIN_MS = 4000;
/** Routes where interrupting would hurt (the form itself, legal). */
const EXCLUDED = ["/demo", "/privacidad"];

function storage(kind: "local" | "session"): Storage | null {
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function allowed(): boolean {
  if (storage("session")?.getItem(SESSION_KEY)) return false;
  // Someone who already requested a demo or quote is never asked again.
  if (storage("local")?.getItem(LEAD_DONE_KEY)) return false;
  const until = Number(storage("local")?.getItem(SNOOZE_KEY) || 0);
  return Date.now() > until;
}

/**
 * Exit-intent dialog: one respectful chance to stay — a guided demo or WhatsApp.
 * Desktop: the pointer heads to the tabs/address bar. Any device: returning to the
 * tab after leaving it. Mobile: a fast scroll back toward the top after reading.
 * Once per session, snoozed 3 days when dismissed, never after a CTA click.
 */
export function ExitIntent() {
  const pathname = usePathname();
  const ref = useRef<HTMLDialogElement>(null);
  const [trigger, setTrigger] = useState<Trigger | null>(null);
  const excluded = EXCLUDED.some((p) => pathname?.startsWith(p));

  const open = useCallback((why: Trigger) => {
    const dialog = ref.current;
    if (!dialog || dialog.open || !allowed()) return;
    storage("session")?.setItem(SESSION_KEY, "1");
    setTrigger(why);
    dialog.showModal();
    track("exit_intent_view", { page_path: window.location.pathname, trigger: why });
  }, []);

  const close = useCallback(
    (reason: "dismiss" | "cta") => {
      const dialog = ref.current;
      if (!dialog?.open) return;
      dialog.close();
      if (reason === "dismiss") {
        storage("local")?.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
        track("exit_intent_dismiss", { page_path: window.location.pathname, trigger: trigger ?? undefined });
      }
    },
    [trigger],
  );

  useEffect(() => {
    if (excluded || !allowed()) return;
    const start = performance.now();
    let maxScroll = 0;
    let engaged = false;
    let leftAt = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();

    const armed = () =>
      !engaged && performance.now() - start > ARM_AFTER_MS && maxScroll >= ARM_SCROLL && !document.querySelector("dialog[open]");

    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      if (h > 0) maxScroll = Math.max(maxScroll, y / h);
      const now = performance.now();
      const dt = now - lastT;
      // Mobile exit signal: a fast flick back up after reading at least 40%.
      if (window.matchMedia("(pointer: coarse)").matches && dt > 0 && dt < 250) {
        const speed = (lastY - y) / dt;
        if (speed > 2.2 && maxScroll > 0.4 && y > 300 && armed()) open("fast_scroll_up");
      }
      lastY = y;
      lastT = now;
    };
    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget && e.clientY <= 0 && armed()) open("mouse_exit");
    };
    const onVisibility = () => {
      if (document.hidden) leftAt = performance.now();
      else if (leftAt && performance.now() - leftAt > AWAY_MIN_MS && armed()) open("tab_return");
    };
    // Anyone who already acted (demo, quote, WhatsApp) is never interrupted.
    const onClick = (e: MouseEvent) => {
      if (e.target instanceof Element && e.target.closest("[data-cta-id]") && !ref.current?.contains(e.target)) engaged = true;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onMouseOut);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("click", onClick, true);
    };
  }, [excluded, open]);

  if (excluded) return null;

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="exit-title"
      aria-describedby="exit-body"
      onCancel={(e) => {
        e.preventDefault();
        close("dismiss");
      }}
      onClick={(e) => {
        // Backdrop click (the dialog element itself, outside the panel).
        if (e.target === e.currentTarget) close("dismiss");
      }}
    >
      <div className={styles.panel}>
        <button type="button" className={styles.close} onClick={() => close("dismiss")} aria-label="Cerrar">
          <X aria-hidden />
        </button>
        <div className={styles.art} aria-hidden>
          <span className={styles.halo} />
          {trigger ? <Kappi pose="guide" size={170} motion="static" /> : null}
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Antes de que te vayas</p>
          <h2 id="exit-title" className={styles.title}>
            Mira cómo se vería tu operación en Tu Quipu
          </h2>
          <p id="exit-body" className={styles.body}>
            Agenda una demo guiada con tu operación como punto de partida: compras, inventario, producción y ventas con
            facturación electrónica SUNAT, en un mismo sistema.
          </p>
          <div className={styles.actions} onClick={() => close("cta")}>
            <TrackedCta cta={ctas.exit_intent_demo} block />
            <TrackedCta cta={ctas.exit_intent_whatsapp} variant="secondary" block />
          </div>
          <button type="button" className={styles.later} onClick={() => close("dismiss")}>
            Ahora no, gracias
          </button>
        </div>
      </div>
    </dialog>
  );
}
