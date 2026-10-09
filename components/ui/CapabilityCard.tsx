import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { assertPublishable } from "@/content/claims";
import type { FeatureTerritory } from "@/content/features";
import { Pictogram } from "@/components/illustration/Modules";
import styles from "./CapabilityCard.module.css";

type Props = {
  territory: FeatureTerritory;
  href: string;
  featured?: boolean;
  revealIndex?: number;
  className?: string;
};

/**
 * Capability card: compact and scannable — pictogram, outcome and
 * three tags are always visible (nothing depends on hover). Hover/focus lifts an
 * inner layer, nudges the pictogram and expands a violet field; touch shows the same.
 */
export function CapabilityCard({ territory, href, featured = false, revealIndex = 0, className }: Props) {
  assertPublishable(territory.claimIds);
  return (
    <article
      className={[styles.card, featured && styles.featured, className].filter(Boolean).join(" ")}
      data-reveal
      style={{ ["--reveal-index" as string]: revealIndex }}
    >
      <span className={styles.field} aria-hidden />
      <div className={styles.layer}>
        <div className={styles.head}>
          <span className={styles.icon}>
            <Pictogram name={territory.pictogram} size={featured ? 52 : 40} />
          </span>
          <h3 className={styles.title}>
            <Link href={href} className={styles.link}>
              {territory.title}
            </Link>
          </h3>
        </div>
        <p className={styles.outcome}>{territory.outcome}</p>
        <ul className={styles.tags} aria-label={`Incluye en ${territory.title}`}>
          {territory.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
        <span className={styles.more} aria-hidden>
          Ver detalle <ArrowRight className={styles.arrow} />
        </span>
      </div>
    </article>
  );
}
