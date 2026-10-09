import { afterEach, describe, expect, it } from "vitest";
import { sanitizeParams, setAnalyticsSink, track, type AnalyticsPayload } from "@/lib/analytics";

describe("analytics", () => {
  afterEach(() => setAnalyticsSink(() => {}));

  it("drops parameters outside the event allowlist (no form fields)", () => {
    const clean = sanitizeParams("generate_lead", {
      form_id: "demo_request",
      source: "home_hero",
      lead_type: "demo",
      name: "Ana",
      email: "ana@fabrica.pe",
      phone: "987654321",
    });
    expect(clean).toEqual({ form_id: "demo_request", source: "home_hero", lead_type: "demo" });
  });

  it("drops values that look like PII even under allowed keys", () => {
    expect(sanitizeParams("cta_click", { cta_label: "ana@fabrica.pe" })).toEqual({});
    expect(sanitizeParams("cta_click", { section_id: "987 654 321" })).toEqual({});
  });

  it("keeps the business wa.me link for whatsapp_click", () => {
    const clean = sanitizeParams("whatsapp_click", { link_url: "https://wa.me/51977729193?text=Hola", message_code: "WEB-HERO" });
    expect(clean.link_url).toContain("wa.me/51977729193");
  });

  it("never throws even if the sink fails", () => {
    setAnalyticsSink(() => {
      throw new Error("provider down");
    });
    expect(() => track("cta_click", { cta_id: "home_hero_demo" })).not.toThrow();
  });

  it("emits sanitized payloads", () => {
    const seen: AnalyticsPayload[] = [];
    setAnalyticsSink((p) => seen.push(p));
    track("faq_open", { faq_id: "faq_demo", topic: "demo", extra: "x" });
    expect(seen).toEqual([{ event: "faq_open", params: { faq_id: "faq_demo", topic: "demo" } }]);
  });
});
