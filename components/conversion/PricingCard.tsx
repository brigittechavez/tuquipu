import { Check, Clock3 } from "lucide-react";
import { ctas } from "@/content/ctas";
import { SOON, formatLimit, plans, pricingCopy, type Plan } from "@/content/pricing";
import { TrackedCta } from "@/components/ui/TrackedCta";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import styles from "./Pricing.module.css";

const QUOTE = {
  esencial: ctas.pricing_esencial_quote,
  operaciones: ctas.pricing_operaciones_quote,
  industria: ctas.pricing_industria_quote,
} as const;

const WHATSAPP = {
  esencial: ctas.pricing_esencial_whatsapp,
  operaciones: ctas.pricing_operaciones_whatsapp,
  industria: ctas.pricing_industria_whatsapp,
} as const;

const METERS = [
  { key: "users", label: "Usuarios" },
  { key: "sites", label: "Sedes" },
  { key: "documents", label: "Documentos / mes" },
] as const;

const MAX = {
  users: Math.max(...plans.map((p) => p.limits.users)),
  sites: Math.max(...plans.map((p) => p.limits.sites)),
  documents: Math.max(...plans.map((p) => p.limits.documents)),
};

export function PricingCard({ plan }: { plan: Plan }) {
  const titleId = `plan-${plan.id}-title`;
  // The top tier reads as a different level through mint accents (no contrasting block).
  const scale = plan.id === "industria";
  return (
    <article
      className={[styles.card, plan.recommended && styles.recommended, scale && styles.scale].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
    >
      <header className={styles.cardHead}>
        <div className={styles.nameRow}>
          <h3 id={titleId} className={styles.planName}>
            {plan.name}
          </h3>
          {plan.recommended ? <span className={styles.badge}>{pricingCopy.recommendedBadge}</span> : null}
        </div>
        <p className={styles.fit}>{plan.fit}</p>
      </header>

      <p className={styles.price}>
        <span className={styles.amount}>
          <span className={styles.currency}>{plan.currency}</span>
          {plan.price}
        </span>
        <span className={styles.suffix}>{plan.priceSuffix}</span>
      </p>
      <p className={styles.leap}>{plan.leap}</p>

      {/* Capacity as proportional meters against the largest plan: the jump is visible at a glance. */}
      <dl className={styles.meters} aria-label={`Capacidad del plan ${plan.name}`}>
        {METERS.map((m) => (
          <div key={m.key} className={styles.meter}>
            <dt>{m.label}</dt>
            <dd>
              <span className={styles.meterValue}>{formatLimit(m.key, plan)}</span>
              <span className={styles.meterBar} aria-hidden>
                <span style={{ ["--fill" as string]: plan.limits[m.key] / MAX[m.key] }} />
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <p className={styles.includes}>{plan.includesLabel}</p>
      <ul className={styles.highlights}>
        {plan.highlights.map((h) => (
          <li key={h}>
            <Check aria-hidden className={styles.check} />
            {h}
          </li>
        ))}
        {plan.upcoming?.map((u) => (
          <li key={u} className={styles.upcoming}>
            <Clock3 aria-hidden className={styles.soonIcon} />
            <span>
              {u} <span className={styles.soon}>{SOON}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className={styles.actions}>
        <TrackedCta cta={QUOTE[plan.id]} variant={plan.recommended ? "primary" : "dark"} block />
        <WhatsAppLink cta={WHATSAPP[plan.id]} appearance="link" icon label="o conversemos por WhatsApp" className={styles.waLink} />
      </div>
    </article>
  );
}
