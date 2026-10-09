import { ArrowRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import type { CtaSpec } from "@/content/types";
import { WhatsAppGlyph } from "@/components/conversion/WhatsAppGlyph";
import { buttonArrowClass, buttonClass, buttonIconClass, type ButtonVariant } from "./Button";

const linkIconClass = "cta-link-icon";

type Props = {
  cta: CtaSpec;
  variant?: ButtonVariant;
  size?: "regular" | "small";
  block?: boolean;
  /** Overrides the visible label while keeping the approved CTA id/destination. */
  label?: string;
  className?: string;
  appearance?: "button" | "link";
  /** Link appearance only: show the WhatsApp mark before the text. */
  icon?: boolean;
};

/**
 * Server-rendered CTA. Analytics are attached by the page-level listener via
 * data attributes, so navigation never depends on JavaScript or analytics.
 */
export function TrackedCta({ cta, variant = "primary", size, block, label, className, appearance = "button", icon = false }: Props) {
  const text = label ?? cta.label;
  const data = {
    "data-cta-id": cta.id,
    "data-section-id": cta.sectionId,
    "data-destination": cta.destination,
    "data-analytics-event": cta.analyticsEvent,
    "data-cta-label": text,
    ...(cta.messageCode ? { "data-message-code": cta.messageCode } : {}),
    ...(cta.planId ? { "data-plan-id": cta.planId } : {}),
  };
  const cls = appearance === "button" ? buttonClass(variant, size, block, className) : className;

  if (cta.kind === "whatsapp") {
    return (
      <a
        href={cta.destination}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        aria-label={`${text} (abre WhatsApp en una pestaña nueva)`}
        {...data}
      >
        {appearance === "button" ? <MessageCircle aria-hidden className={buttonIconClass} /> : icon ? <WhatsAppGlyph className={linkIconClass} /> : null}
        {text}
      </a>
    );
  }

  return (
    <Link href={cta.destination} className={cls} {...data}>
      {text}
      {appearance === "button" ? <ArrowRight aria-hidden className={buttonArrowClass} /> : null}
    </Link>
  );
}
