import type { LeadIntent, PlanId } from "@/content/types";
import { leadFromFormData, validateLead, type LeadErrors } from "@/lib/validation/lead";
import type { LeadDelivery } from "./delivery";

export type LeadFormValues = {
  name: string;
  company: string;
  phone: string;
  email: string;
  activity: string;
  need: string;
  plan: string;
  consent: boolean;
};

export type LeadFormState =
  | { status: "idle" }
  | { status: "invalid"; errors: LeadErrors; values: LeadFormValues }
  | { status: "unavailable"; values: LeadFormValues }
  | { status: "error"; values: LeadFormValues; message: string }
  | { status: "success"; lead: { intent: LeadIntent; plan?: PlanId; source: string; reference: string } };

/** Short request code (e.g. TQ-7K3Q9P) shown to the visitor and sent with the lead, so both sides can match it. */
export function createLeadReference(): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return `TQ-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("")}`;
}

export const MIN_FILL_MS = 2500;

/** Server render time, used by the minimum-fill-time spam check (per request page). */
export function issueFormTimestamp(): number {
  return Date.now();
}

type Deps = {
  delivery: LeadDelivery;
  allow: (key: string) => boolean;
  clientKey: string;
  now?: number;
};

export async function submitLead(form: FormData, deps: Deps): Promise<LeadFormState> {
  const lead = leadFromFormData(form);
  const values: LeadFormValues = {
    name: lead.name,
    company: lead.company,
    phone: lead.phone,
    email: lead.email,
    activity: lead.activity,
    need: lead.need ?? "",
    plan: lead.plan ?? "",
    consent: lead.consent,
  };

  // Anti-spam: honeypot + minimum fill time. Rejected silently as a generic error.
  // Field name chosen so browser autofill never fills it (a "website" field was autofilled).
  const honeypot = form.get("tq_hp");
  const startedAt = Number(form.get("startedAt"));
  const now = deps.now ?? Date.now();
  const tooFast = !Number.isFinite(startedAt) || now - startedAt < MIN_FILL_MS;
  if ((typeof honeypot === "string" && honeypot.length > 0) || tooFast) {
    return { status: "error", values, message: "No pudimos procesar la solicitud. Inténtalo nuevamente en unos segundos." };
  }

  const errors = validateLead(lead);
  if (Object.keys(errors).length > 0) return { status: "invalid", errors, values };

  if (!deps.allow(deps.clientKey)) {
    return { status: "error", values, message: "Recibimos varias solicitudes seguidas. Espera unos minutos o escríbenos por WhatsApp." };
  }

  if (!deps.delivery.enabled) return { status: "unavailable", values };

  const reference = createLeadReference();
  const result = await deps.delivery.deliver({ ...lead, reference });
  if (!result.ok) {
    return result.reason === "unavailable"
      ? { status: "unavailable", values }
      : { status: "error", values, message: "No pudimos enviar tu solicitud. Inténtalo nuevamente o escríbenos por WhatsApp." };
  }

  return { status: "success", lead: { intent: lead.intent, plan: lead.plan, source: lead.source, reference } };
}
