import type { LeadInput } from "@/lib/validation/lead";

export type DeliveryResult = { ok: true } | { ok: false; reason: "unavailable" | "failed" };

export type LeadDelivery = {
  readonly enabled: boolean;
  /** `reference` is the request code shown to the visitor; `source` (inside the lead) is the CTA they came from. */
  deliver(lead: LeadInput & { reference?: string }): Promise<DeliveryResult>;
};

/**
 * While either is missing, no personal data is sent or stored anywhere and the
 * UI says so honestly — it never simulates a successful submission.
 */
export const unavailableDelivery: LeadDelivery = {
  enabled: false,
  async deliver() {
    return { ok: false, reason: "unavailable" };
  },
};

export function webhookDelivery(url: string, timeoutMs = 8000): LeadDelivery {
  return {
    enabled: true,
    async deliver(lead) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...lead, receivedAt: new Date().toISOString() }),
          signal: AbortSignal.timeout(timeoutMs),
          cache: "no-store",
        });
        return res.ok ? { ok: true } : { ok: false, reason: "failed" };
      } catch {
        return { ok: false, reason: "failed" };
      }
    },
  };
}

/**
 * Local review only (`npm run dev`): accepts the request without sending or storing
 * anything, so the confirmation flow can be seen before the real endpoint exists.
 * Never active in production builds.
 */
export const previewDelivery: LeadDelivery = {
  enabled: true,
  async deliver(lead) {
    console.info(`[leads · vista previa local] Solicitud simulada ${lead.reference ?? ""} (origen: ${lead.source}). No se envió ni guardó ningún dato.`);
    return { ok: true };
  },
};

export function getLeadDelivery(env: NodeJS.ProcessEnv = process.env): LeadDelivery {
  const url = env.LEAD_WEBHOOK_URL;
  const privacyApproved = env.LEAD_PRIVACY_APPROVED === "true";
  if (url && privacyApproved) return webhookDelivery(url);
  if (env.NODE_ENV === "development" && env.LEAD_PREVIEW !== "off") return previewDelivery;
  return unavailableDelivery;
}
