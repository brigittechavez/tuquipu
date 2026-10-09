import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { assertPublishable, getPublishableClaims, isPublishable } from "@/content/claims";
import { allowedDemoSources, ctas } from "@/content/ctas";
import { evidence, getChapterMedia, getEvidence } from "@/content/evidence";
import { faq } from "@/content/faq";
import { territories } from "@/content/features";
import { comparison, formatLimit, plans } from "@/content/pricing";
import type { EvidenceMedia } from "@/content/types";
import { buildWhatsAppUrl, extractMessageCode } from "@/lib/whatsapp";

describe("claim registry", () => {
  it("publishes only approved claims with a publishable status", () => {
    const ids = getPublishableClaims().map((c) => c.id);
    expect(ids).toEqual([
      "production-recipes",
      "purchasing",
      "inventory",
      "sales-sunat",
      "finance-reports",
      "imports",
      "connected-operation",
    ]);
  });

  it("never publishes exclusions, internal or roadmap claims", () => {
    for (const status of ["not_available", "internal", "development", "roadmap", "unverified", "partial"] as const) {
      expect(isPublishable({ status, approvedForMarketing: true })).toBe(false);
    }
    expect(isPublishable({ status: "available", approvedForMarketing: false })).toBe(false);
    expect(() => assertPublishable(["does-not-exist"])).toThrow(/Unknown claim/);
  });

  it("every territory and evidence slot references publishable claims", () => {
    for (const t of territories) expect(() => assertPublishable(t.claimIds)).not.toThrow();
    for (const slot of Object.values(evidence)) expect(() => assertPublishable(slot.claimIds)).not.toThrow();
  });

  it("public copy avoids forbidden promises", () => {
    const publicCopy = JSON.stringify({ territories, faq, plans, claims: getPublishableClaims() }).toLowerCase();
    for (const banned of ["trazabilidad total", "integración perfecta", "prueba gratis", "comienza gratis", "14 días", "regístrate", "más elegido", "24/7 incluido"]) {
      expect(publicCopy).not.toContain(banned);
    }
  });

  it("every evidence slot and chapter points to real files with the agreed sizes", () => {
    const check = (m: EvidenceMedia | undefined) => {
      expect(m).toBeDefined();
      for (const asset of [m!.desktop, m!.mobile]) {
        expect(asset).toBeDefined();
        for (const file of [asset!.src, asset!.poster].filter(Boolean) as string[]) {
          expect(existsSync(join(process.cwd(), "public", file)), file).toBe(true);
          expect(file).not.toMatch(/pruebas/);
        }
      }
      expect([m!.desktop.width, m!.desktop.height]).toEqual([1600, 1000]);
      expect([m!.mobile!.width, m!.mobile!.height]).toEqual([1080, 1350]);
      expect(m!.preview).toBeFalsy();
    };
    for (const key of Object.keys(evidence) as (keyof typeof evidence)[]) check(getEvidence(key).media);
    for (const id of ["compra", "stock", "produce", "vende", "controla"]) check(getChapterMedia(id));
  });

  it("loops only the hero clip", () => {
    for (const key of Object.keys(evidence) as (keyof typeof evidence)[]) {
      expect(getEvidence(key).media?.playback).toBe(key === "hero" ? "loop" : "inview");
    }
  });
});

describe("pricing", () => {
  it("matches the approved plans, prices and limits", () => {
    expect(plans.map((p) => [p.id, p.price, p.priceSuffix, p.limits])).toEqual([
      ["esencial", 299, "+ IGV / mes", { users: 3, sites: 1, documents: 500 }],
      ["operaciones", 499, "+ IGV / mes", { users: 10, sites: 3, documents: 2000 }],
      ["industria", 699, "+ IGV / mes", { users: 25, sites: 8, documents: 5000 }],
    ]);
    expect(plans.filter((p) => p.recommended).map((p) => p.id)).toEqual(["operaciones"]);
  });

  it("formats limits as approved", () => {
    expect(formatLimit("documents", plans[1])).toBe("Hasta 2,000");
    expect(formatLimit("sites", plans[0])).toBe("1");
    expect(formatLimit("users", plans[2])).toBe("Hasta 25");
  });

  it("keeps lots/series/expiry from Esencial and imports as add-on/included", () => {
    const rows = comparison.flatMap((g) => g.rows);
    const lots = rows.find((r) => r.label === "Lotes, series y vencimientos")!;
    expect(lots.values).toEqual({ esencial: true, operaciones: true, industria: true });
    const imports = rows.find((r) => r.label === "Importaciones")!;
    expect(imports.values).toEqual({ esencial: false, operaciones: "Adicional cotizable", industria: "Incluida" });
    const kardex = rows.find((r) => r.label === "Kardex valorizado")!;
    expect(kardex.values.esencial).toBe(false);
  });
});

describe("CTAs and WhatsApp", () => {
  it("builds wa.me URLs from the single number without UTMs", () => {
    expect(buildWhatsAppUrl()).toBe("https://wa.me/51977729193");
    const url = buildWhatsAppUrl("Hola, tengo una consulta sobre Tu Quipu. [WEB-FAQ]");
    expect(url).toBe("https://wa.me/51977729193?text=Hola%2C%20tengo%20una%20consulta%20sobre%20Tu%20Quipu.%20%5BWEB-FAQ%5D");
    expect(url).not.toMatch(/utm_/);
    expect(extractMessageCode("... [WEB-PLAN-INDUSTRIA]")).toBe("WEB-PLAN-INDUSTRIA");
  });

  it("uses the approved destinations for core CTA ids", () => {
    expect(ctas.home_header_demo.destination).toBe("/demo?source=home_header");
    expect(ctas.home_hero_demo.destination).toBe("/demo?source=home_hero");
    expect(ctas.home_final_demo.destination).toBe("/demo?source=home_final");
    expect(ctas.features_demo.destination).toBe("/demo?source=features_final");
    for (const plan of ["esencial", "operaciones", "industria"] as const) {
      const quote = ctas[`pricing_${plan}_quote`];
      expect(quote.label).toBe("Cotiza este plan");
      expect(quote.destination).toBe(`/demo?intent=quote&plan=${plan}&source=pricing_${plan}`);
      expect(ctas[`pricing_${plan}_whatsapp`].messageCode).toBe(`WEB-PLAN-${plan.toUpperCase()}`);
    }
    expect(ctas.home_hero_whatsapp.messageCode).toBe("WEB-HERO");
    expect(ctas.home_final_whatsapp.messageCode).toBe("WEB-CIERRE");
    expect(ctas.floating_whatsapp.messageCode).toBe("WEB-FLOTANTE");
  });

  it("keeps analytics codes out of the text sent by WhatsApp, with a distinct message per button", () => {
    const messages = Object.values(ctas)
      .filter((c) => c.kind === "whatsapp" && c.message)
      .map((c) => c.message as string);
    for (const cta of Object.values(ctas)) if (cta.kind === "whatsapp") expect(decodeURIComponent(cta.destination)).not.toMatch(/\[[A-Z0-9-]+\]/);
    const distinct = new Set(messages.map((m) => m.replace(/plan \w+/i, "plan")));
    // Plan messages differ only by the plan name; every other button has its own sentence.
    expect(distinct.size).toBe(new Set(messages).size - 2);
  });

  it("uses only approved labels (no free trial or sign-up)", () => {
    for (const cta of Object.values(ctas)) {
      expect(cta.label).not.toMatch(/gratis|regístrate|adquirir/i);
      if (cta.kind === "whatsapp") expect(cta.destination.startsWith("https://wa.me/51977729193")).toBe(true);
    }
  });

  it("derives the /demo source allowlist from real CTAs", () => {
    const sources = allowedDemoSources(territories.map((t) => t.id));
    expect(sources.has("pricing_operaciones")).toBe(true);
    expect(sources.has("features_produccion")).toBe(true);
    expect(sources.has("evil_source")).toBe(false);
  });
});

describe("plans progression and gated capabilities", () => {
  it("keeps capabilities in development unpublished until verified", async () => {
    const { getClaim } = await import("@/content/claims");
    expect(isPublishable(getClaim("does-not-exist"))).toBe(false);
  });

  it("every gated capability points to a registered claim", () => {
    const ids = new Set(getPublishableClaims().map((c) => c.id));
    for (const t of territories) {
      for (const u of t.upcoming ?? []) expect(ids.has(u.claimId)).toBe(false);
    }
  });

  it("each plan only lists what it adds over the previous one", () => {
    const [esencial, operaciones, industria] = plans;
    expect(operaciones.includesLabel).toMatch(/Esencial/);
    expect(industria.includesLabel).toMatch(/Operaciones/);
    for (const h of operaciones.highlights) expect(esencial.highlights).not.toContain(h);
    for (const h of industria.highlights) expect(operaciones.highlights).not.toContain(h);
    expect(industria.highlights).toContain("Importaciones incluidas");
  });

  it("does not claim limitations for capabilities expected at launch", () => {
    const notes = territories.map((t) => t.note ?? "").join(" ").toLowerCase();
    expect(notes).not.toContain("conciliación");
  });
});
