import { measurement, type AnalyticsEvent, type AnalyticsParams } from "@/content/measurement";

const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]+/;
const PHONE = /\+?\d[\d\s-]{7,}\d/;

/** Keeps only allowlisted keys and drops any value that looks like PII. */
export function sanitizeParams(event: AnalyticsEvent, params: AnalyticsParams): Record<string, string | number> {
  const allowed = measurement[event] as readonly string[];
  const clean: Record<string, string | number> = {};
  for (const key of allowed) {
    const value = params[key];
    if (value === undefined || value === "") continue;
    if (typeof value === "string") {
      // wa.me URLs legitimately contain the business number; everything else must not.
      const isLinkField = key === "link_url" || key === "destination";
      if (EMAIL.test(value)) continue;
      if (!isLinkField && PHONE.test(value)) continue;
      clean[key] = value.slice(0, 300);
    } else {
      clean[key] = value;
    }
  }
  return clean;
}

export type AnalyticsPayload = { event: AnalyticsEvent; params: Record<string, string | number> };

type Sink = (payload: AnalyticsPayload) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/**
 * Provider-agnostic sink. Pushes to `window.dataLayer` when a
 * tag manager is later configured and emits a DOM event for tests/debugging.
 */
const defaultSink: Sink = (payload) => {
  if (typeof window === "undefined") return;
  window.dataLayer?.push({ event: payload.event, ...payload.params });
  window.dispatchEvent(new CustomEvent("tq:analytics", { detail: payload }));
};

let sink: Sink = defaultSink;

export function setAnalyticsSink(next: Sink): void {
  sink = next;
}

/** Never throws and never blocks navigation. */
export function track(event: AnalyticsEvent, params: AnalyticsParams = {}): void {
  try {
    sink({ event, params: sanitizeParams(event, params) });
  } catch {
    // analytics must never break the page
  }
}
