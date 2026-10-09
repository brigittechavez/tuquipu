"use client";

import { Copy, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { buttonClass } from "@/components/ui/Button";
import { WhatsAppGlyph } from "./WhatsAppGlyph";
import styles from "./LeadConfirmation.module.css";

/** Set after a confirmed request: the exit-intent dialog never interrupts someone who already booked. */
export const LEAD_DONE_KEY = "tq-lead-done";

type Props = { intent: "demo" | "quote"; planName?: string; reference: string };

/**
 * Celebratory confirmation after a real, server-confirmed request: a modal with a
 * drawn check and sparks (the check is the protagonist), the request code and a WhatsApp link
 * that carries it. The same code travels with the lead (and its CTA source), so the
 * conversation can be matched with the request and where it started. The inline confirmation stays underneath for no-JS and after closing.
 */
export function LeadConfirmation({ intent, planName, reference }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(LEAD_DONE_KEY, String(Date.now()));
    } catch {
      /* storage blocked: the exit dialog may still be skipped by its own session flag */
    }
    ref.current?.showModal();
  }, []);

  const message =
    intent === "quote"
      ? `Hola, acabo de solicitar una cotización${planName ? ` del plan ${planName}` : ""} de Tu Quipu. Mi código es ${reference}.`
      : `Hola, acabo de solicitar una demo de Tu Quipu. Mi código es ${reference}.`;
  const href = buildWhatsAppUrl(message);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable: the code stays visible to copy by hand */
    }
  };

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="lead-confirm-title"
      aria-describedby="lead-confirm-body"
      onClick={(e) => {
        if (e.target === e.currentTarget) ref.current?.close();
      }}
    >
      <div className={styles.panel}>
        <button type="button" className={styles.close} onClick={() => ref.current?.close()} aria-label="Cerrar">
          <X aria-hidden />
        </button>

        <div className={styles.art} aria-hidden>
          <span className={styles.burst}>
            {Array.from({ length: 10 }, (_, i) => (
              <i key={i} style={{ ["--a" as string]: `${i * 36}deg`, ["--d" as string]: `${(i % 3) * 60}ms` }} />
            ))}
          </span>
          <svg className={styles.check} viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" pathLength={1} />
            <path d="M20 33l8 8 16-17" pathLength={1} />
          </svg>
        </div>

        <div className={styles.copy}>
          <p className={styles.eyebrow}>{intent === "quote" ? "Cotización solicitada" : "Demo solicitada"}</p>
          <h2 id="lead-confirm-title" className={styles.title}>
            ¡Listo! Ya tenemos tu solicitud
          </h2>
          <p id="lead-confirm-body" className={styles.body}>
            {intent === "quote"
              ? `Te escribiremos pronto con la cotización${planName ? ` del plan ${planName}` : ""}.`
              : "Te escribiremos pronto para coordinar tu demo guiada."}
          </p>

          <div className={styles.code}>
            <span>
              <small>Tu código de solicitud</small>
              <strong>{reference}</strong>
            </span>
            <button type="button" className={styles.copyBtn} onClick={copy}>
              <Copy aria-hidden />
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>

          <div className={styles.actions}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass("primary")}
              aria-label="Escríbenos por WhatsApp con tu código (abre WhatsApp en una pestaña nueva)"
              data-cta-id="lead_confirm_whatsapp"
              data-section-id="confirmacion"
              data-destination={href}
              data-analytics-event="whatsapp_click"
              data-cta-label="Escríbenos con tu código"
              data-message-code="WEB-CONFIRMACION"
            >
              <WhatsAppGlyph className={styles.waIcon} />
              Escríbenos con tu código
            </a>
            <Link href="/" className={buttonClass("ghost")}>
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </dialog>
  );
}
