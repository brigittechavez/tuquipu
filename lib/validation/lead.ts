import { allowedDemoSources } from "@/content/ctas";
import { territories } from "@/content/features";
import { plans } from "@/content/pricing";
import type { LeadIntent, PlanId } from "@/content/types";

export type LeadInput = {
  intent: LeadIntent;
  plan?: PlanId;
  source: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  activity: string;
  need?: string;
  consent: boolean;
};

export type LeadField = "name" | "company" | "phone" | "email" | "activity" | "need" | "consent" | "plan";
export type LeadErrors = Partial<Record<LeadField, string>>;

const PLAN_IDS = new Set<string>(plans.map((p) => p.id));
const SOURCES = allowedDemoSources(territories.map((t) => t.id));
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const LIMITS = { name: 80, company: 120, phone: 20, email: 120, activity: 120, need: 800 } as const;

/** Only allowlisted query values survive; anything else falls back to safe defaults. */
export function parseDemoQuery(query: Record<string, string | string[] | undefined>): {
  intent: LeadIntent;
  plan?: PlanId;
  source: string;
} {
  const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const rawPlan = first(query.plan);
  const plan = rawPlan && PLAN_IDS.has(rawPlan) ? (rawPlan as PlanId) : undefined;
  const intent: LeadIntent = first(query.intent) === "quote" ? "quote" : "demo";
  const rawSource = first(query.source);
  const source = rawSource && SOURCES.has(rawSource) ? rawSource : "direct";
  return { intent, plan, source };
}

export function normalizePhone(raw: string): string {
  return raw.replace(/[\s().-]/g, "");
}

export function validateLead(input: LeadInput): LeadErrors {
  const errors: LeadErrors = {};
  const name = input.name.trim();
  const company = input.company.trim();
  const phone = normalizePhone(input.phone.trim());
  const email = input.email.trim();

  if (name.length < 2) errors.name = "Escribe tu nombre.";
  else if (name.length > LIMITS.name) errors.name = `Usa como máximo ${LIMITS.name} caracteres.`;

  if (company.length < 2) errors.company = "Escribe el nombre de tu empresa.";
  else if (company.length > LIMITS.company) errors.company = `Usa como máximo ${LIMITS.company} caracteres.`;

  if (!/^\+?\d{7,15}$/.test(phone)) errors.phone = "Escribe un número de WhatsApp o teléfono válido, por ejemplo 987 654 321.";

  if (!EMAIL.test(email) || email.length > LIMITS.email) errors.email = "Escribe un correo válido, por ejemplo nombre@empresa.pe.";

  const activity = input.activity.trim();
  if (activity.length < 2) errors.activity = "Cuéntanos a qué se dedica tu empresa.";
  else if (activity.length > LIMITS.activity) errors.activity = `Usa como máximo ${LIMITS.activity} caracteres.`;

  if ((input.need ?? "").length > LIMITS.need) errors.need = `Usa como máximo ${LIMITS.need} caracteres.`;

  if (input.plan !== undefined && !PLAN_IDS.has(input.plan)) errors.plan = "Elige un plan válido.";

  if (!input.consent) errors.consent = "Necesitamos tu autorización para contactarte.";

  return errors;
}

export function leadFromFormData(form: FormData): LeadInput {
  const text = (key: string) => {
    const v = form.get(key);
    return typeof v === "string" ? v : "";
  };
  const query = parseDemoQuery({ intent: text("intent"), plan: text("plan"), source: text("source") });
  return {
    intent: query.intent,
    plan: query.plan,
    source: query.source,
    name: text("name"),
    company: text("company"),
    phone: text("phone"),
    email: text("email"),
    activity: text("activity"),
    need: text("need"),
    consent: text("consent") === "on" || text("consent") === "true",
  };
}
