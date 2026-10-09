import { describe, expect, it, vi } from "vitest";
import { getLeadDelivery, unavailableDelivery, type LeadDelivery } from "@/lib/leads/delivery";
import { createRateLimiter } from "@/lib/leads/rate-limit";
import { MIN_FILL_MS, submitLead } from "@/lib/leads/submit";
import { parseDemoQuery, validateLead, type LeadInput } from "@/lib/validation/lead";

const valid: LeadInput = {
  intent: "quote",
  plan: "operaciones",
  source: "pricing_operaciones",
  name: "Ana Pérez",
  company: "Fábrica Andina",
  phone: "987 654 321",
  email: "ana@fabrica.pe",
  activity: "Fabricamos productos de limpieza",
  need: "",
  consent: true,
};

function form(overrides: Record<string, string> = {}) {
  const fd = new FormData();
  const base: Record<string, string> = {
    intent: "quote",
    plan: "operaciones",
    source: "pricing_operaciones",
    name: valid.name,
    company: valid.company,
    phone: valid.phone,
    email: valid.email,
    activity: valid.activity,
    need: "",
    consent: "on",
    tq_hp: "",
    startedAt: "0",
    ...overrides,
  };
  for (const [k, v] of Object.entries(base)) fd.set(k, v);
  return fd;
}

const now = MIN_FILL_MS + 10_000;
const okDelivery: LeadDelivery = { enabled: true, deliver: vi.fn(async () => ({ ok: true as const })) };

describe("parseDemoQuery", () => {
  it("keeps allowlisted intent/plan/source", () => {
    expect(parseDemoQuery({ intent: "quote", plan: "industria", source: "pricing_industria" })).toEqual({
      intent: "quote",
      plan: "industria",
      source: "pricing_industria",
    });
  });

  it("falls back safely on arbitrary values", () => {
    expect(parseDemoQuery({ intent: "<script>", plan: "gold", source: "https://evil.example" })).toEqual({
      intent: "demo",
      plan: undefined,
      source: "direct",
    });
  });
});

describe("validateLead", () => {
  it("accepts a valid lead", () => {
    expect(validateLead(valid)).toEqual({});
  });

  it("reports each invalid field with a helpful message", () => {
    const errors = validateLead({ ...valid, name: "", phone: "abc", email: "no-mail", activity: "", consent: false });
    expect(Object.keys(errors).sort()).toEqual(["activity", "consent", "email", "name", "phone"]);
  });
});

describe("submitLead", () => {
  const allow = () => true;

  it("never simulates success while delivery is unavailable", async () => {
    const res = await submitLead(form(), { delivery: unavailableDelivery, allow, clientKey: "k", now });
    expect(res.status).toBe("unavailable");
  });

  it("returns success only after the adapter confirms", async () => {
    let delivered: Record<string, unknown> | undefined;
    const spy: LeadDelivery = {
      enabled: true,
      deliver: async (lead) => {
        delivered = lead;
        return { ok: true };
      },
    };
    const res = await submitLead(form(), { delivery: spy, allow, clientKey: "k", now });
    expect(res).toEqual({
      status: "success",
      lead: { intent: "quote", plan: "operaciones", source: "pricing_operaciones", reference: expect.stringMatching(/^TQ-[A-Z0-9]{6}$/) },
    });
    // The same request code reaches the team with the lead and its origin.
    expect(delivered?.reference).toBe(res.status === "success" ? res.lead.reference : undefined);
    expect(delivered?.source).toBe("pricing_operaciones");
  });

  it("reports delivery failures as recoverable errors", async () => {
    const failing: LeadDelivery = { enabled: true, deliver: async () => ({ ok: false, reason: "failed" }) };
    const res = await submitLead(form(), { delivery: failing, allow, clientKey: "k", now });
    expect(res.status).toBe("error");
  });

  it("validates on the server and keeps entered values", async () => {
    const res = await submitLead(form({ email: "x" }), { delivery: okDelivery, allow, clientKey: "k", now });
    expect(res.status).toBe("invalid");
    if (res.status === "invalid") {
      expect(res.errors.email).toBeTruthy();
      expect(res.values.name).toBe(valid.name);
    }
  });

  it("rejects honeypot and too-fast submissions", async () => {
    const bot = await submitLead(form({ tq_hp: "http://spam" }), { delivery: okDelivery, allow, clientKey: "k", now });
    expect(bot.status).toBe("error");
    const fast = await submitLead(form({ startedAt: String(now - 100) }), { delivery: okDelivery, allow, clientKey: "k", now });
    expect(fast.status).toBe("error");
  });

  it("applies the rate limit", async () => {
    const res = await submitLead(form(), { delivery: okDelivery, allow: () => false, clientKey: "k", now });
    expect(res.status).toBe("error");
  });
});

describe("delivery selection and rate limiter", () => {
  it("requires both an endpoint and approved privacy text", () => {
    expect(getLeadDelivery({} as NodeJS.ProcessEnv).enabled).toBe(false);
    expect(getLeadDelivery({ LEAD_WEBHOOK_URL: "https://x" } as unknown as NodeJS.ProcessEnv).enabled).toBe(false);
    expect(getLeadDelivery({ LEAD_WEBHOOK_URL: "https://x", LEAD_PRIVACY_APPROVED: "true" } as unknown as NodeJS.ProcessEnv).enabled).toBe(true);
    // Local review only: `npm run dev` simulates delivery; production never does.
    expect(getLeadDelivery({ NODE_ENV: "development" } as unknown as NodeJS.ProcessEnv).enabled).toBe(true);
    expect(getLeadDelivery({ NODE_ENV: "production" } as unknown as NodeJS.ProcessEnv).enabled).toBe(false);
  });

  it("limits requests per key within the window", () => {
    const limiter = createRateLimiter(2, 1000);
    expect(limiter.check("a", 0)).toBe(true);
    expect(limiter.check("a", 10)).toBe(true);
    expect(limiter.check("a", 20)).toBe(false);
    expect(limiter.check("a", 2000)).toBe(true);
    expect(limiter.check("b", 20)).toBe(true);
  });
});
