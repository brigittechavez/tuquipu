import { site } from "@/content/site";

/**
 * Builds a click-to-chat URL from the single configured number.
 * Never appends UTMs to wa.me (attribution lives in the message code + event).
 */
export function buildWhatsAppUrl(message?: string): string {
  if (!message) return site.whatsapp.base;
  return `${site.whatsapp.base}?text=${encodeURIComponent(message)}`;
}

/** Extracts the readable origin code, e.g. "[WEB-HERO]" → "WEB-HERO". */
export function extractMessageCode(message?: string): string | undefined {
  const match = message?.match(/\[([A-Z0-9-]+)\]\s*$/);
  return match?.[1];
}
