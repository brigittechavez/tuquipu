import { buildWhatsAppUrl, extractMessageCode } from "@/lib/whatsapp";
import type { CtaSpec, PlanId } from "./types";

/**
 * CTA registry: every call to action with its id, destination and analytics event.
 */
const LABEL = {
  demo: "Agenda una demo",
  quote: "Cotiza este plan",
  whatsapp: "Conversemos por WhatsApp",
} as const;

function demo(id: string, page: string, sectionId: string, source: string, label: string = LABEL.demo): CtaSpec {
  return { id, label, kind: "demo", page, sectionId, destination: `/demo?source=${source}`, analyticsEvent: "cta_click" };
}

/**
 * The trailing [CODE] in a message identifies the button for analytics only; it is
 * stripped from the text the visitor sends. Each button keeps a distinct message,
 * so the origin is also recognisable in the WhatsApp conversation itself.
 */
function whatsapp(id: string, page: string, sectionId: string, message: string | undefined, label: string = LABEL.whatsapp): CtaSpec {
  const text = message?.replace(/\s*\[[A-Z0-9-]+\]\s*$/, "");
  return {
    id,
    label,
    kind: "whatsapp",
    page,
    sectionId,
    destination: buildWhatsAppUrl(text),
    message: text,
    messageCode: extractMessageCode(message),
    analyticsEvent: "whatsapp_click",
  };
}

function quote(planId: PlanId): CtaSpec {
  return {
    id: `pricing_${planId}_quote`,
    label: LABEL.quote,
    kind: "quote",
    page: "/",
    sectionId: "planes",
    destination: `/demo?intent=quote&plan=${planId}&source=pricing_${planId}`,
    analyticsEvent: "cta_click",
    planId,
  };
}

function planWhatsapp(planId: PlanId, planName: string, code: string): CtaSpec {
  return {
    ...whatsapp(
      `pricing_${planId}_whatsapp`,
      "/",
      "planes",
      `Hola, me interesa el plan ${planName} de Tu Quipu. [${code}]`,
    ),
    planId,
  };
}

function link(id: string, page: string, sectionId: string, destination: string, label: string): CtaSpec {
  return { id, label, kind: "internal-link", page, sectionId, destination, analyticsEvent: "cta_click" };
}

export const ctas = {
  // Core CTAs
  home_header_demo: demo("home_header_demo", "/", "header", "home_header"),
  home_hero_demo: demo("home_hero_demo", "/", "inicio", "home_hero"),
  home_hero_whatsapp: whatsapp(
    "home_hero_whatsapp",
    "/",
    "inicio",
    "Hola, me gustaría conocer Tu Quipu. [WEB-HERO]",
  ),
  pricing_esencial_quote: quote("esencial"),
  pricing_operaciones_quote: quote("operaciones"),
  pricing_industria_quote: quote("industria"),
  pricing_esencial_whatsapp: planWhatsapp("esencial", "Esencial", "WEB-PLAN-ESENCIAL"),
  pricing_operaciones_whatsapp: planWhatsapp("operaciones", "Operaciones", "WEB-PLAN-OPERACIONES"),
  pricing_industria_whatsapp: planWhatsapp("industria", "Industria", "WEB-PLAN-INDUSTRIA"),
  home_faq_whatsapp: whatsapp(
    "home_faq_whatsapp",
    "/",
    "preguntas",
    "Hola, tengo una consulta sobre Tu Quipu. [WEB-FAQ]",
    "Resolver una duda",
  ),
  home_final_demo: demo("home_final_demo", "/", "cierre", "home_final"),
  home_final_whatsapp: whatsapp(
    "home_final_whatsapp",
    "/",
    "cierre",
    "Hola, quisiera evaluar Tu Quipu para mi empresa. [WEB-CIERRE]",
  ),
  features_demo: demo("features_demo", "/funcionalidades", "cierre", "features_final"),

  // Section-specific CTAs (same scheme)
  home_evidence_demo: demo("home_evidence_demo", "/", "producto", "home_evidence"),
  home_capabilities_features: link(
    "home_capabilities_features",
    "/",
    "funcionalidades",
    "/funcionalidades",
    "Explorar funcionalidades",
  ),
  pricing_custom_demo: demo(
    "pricing_custom_demo",
    "/",
    "planes",
    "pricing_custom",
    "Conversemos sobre tu alcance",
  ),
  features_whatsapp: whatsapp(
    "features_whatsapp",
    "/funcionalidades",
    "cierre",
    "Hola, quisiera saber más sobre lo que hace Tu Quipu. [WEB-FUNCIONALIDADES]",
  ),
  demo_whatsapp: whatsapp(
    "demo_whatsapp",
    "/demo",
    "solicitud",
    "Hola, quisiera conversar sobre una demo de Tu Quipu. [WEB-DEMO]",
  ),
  footer_whatsapp: whatsapp("footer_whatsapp", "*", "footer", undefined, "WhatsApp +51 977 729 193"),
  exit_intent_demo: demo("exit_intent_demo", "*", "salida", "exit_intent"),
  exit_intent_whatsapp: whatsapp(
    "exit_intent_whatsapp",
    "*",
    "salida",
    "Hola, quisiera ver una demo de Tu Quipu. [WEB-SALIDA]",
    "Escríbenos por WhatsApp",
  ),
  floating_whatsapp: whatsapp(
    "floating_whatsapp",
    "*",
    "flotante",
    "Hola, quiero agendar una demo de Tu Quipu. [WEB-FLOTANTE]",
    "Agenda tu demo por WhatsApp",
  ),
} as const satisfies Record<string, CtaSpec>;

export type CtaId = keyof typeof ctas;

export function featureCta(territoryId: string): CtaSpec {
  return demo(`features_${territoryId}_demo`, "/funcionalidades", territoryId, `features_${territoryId}`);
}

/** Every `source` value a CTA can legitimately send to /demo. */
export function allowedDemoSources(featureIds: readonly string[]): Set<string> {
  const sources = new Set<string>();
  const all = [...Object.values(ctas), ...featureIds.map(featureCta)];
  for (const cta of all) {
    if (!cta.destination.startsWith("/demo")) continue;
    const source = new URLSearchParams(cta.destination.split("?")[1]).get("source");
    if (source) sources.add(source);
  }
  return sources;
}
