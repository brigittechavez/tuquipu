/**
 * Measurement spec.
 * Each event lists the ONLY parameters it may carry. Anything else is dropped,
 * which guarantees that form fields (PII) can never reach analytics.
 */
export const measurement = {
  cta_click: ["cta_id", "page_path", "section_id", "cta_label", "destination", "plan_id"],
  whatsapp_click: ["cta_id", "page_path", "section_id", "cta_label", "destination", "link_url", "message_code", "plan_id"],
  demo_form_start: ["form_id", "source"],
  generate_lead: ["form_id", "source", "lead_type", "plan_id"],
  pricing_interaction: ["plan_id", "interaction_type"],
  product_media_play: ["media_id", "section_id"],
  product_media_complete: ["media_id", "percent"],
  faq_open: ["faq_id", "topic"],
  scroll_depth: ["percent", "page_path"],
  exit_intent_view: ["page_path", "trigger"],
  exit_intent_dismiss: ["page_path", "trigger"],
} as const;

export type AnalyticsEvent = keyof typeof measurement;
export type AnalyticsParams = Record<string, string | number | undefined>;

export const SCROLL_DEPTH_THRESHOLDS = [50, 75, 90] as const;
