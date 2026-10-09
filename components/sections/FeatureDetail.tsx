import { Check, Plus } from "lucide-react";
import Link from "next/link";
import { assertPublishable, getClaim, isPublishable } from "@/content/claims";
import { featureCta } from "@/content/ctas";
import { getEvidence } from "@/content/evidence";
import { getTerritory, type FeatureTerritory } from "@/content/features";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { Pictogram } from "@/components/illustration/Modules";
import { MediaTabs } from "@/components/media/MediaTabs";
import { ProductEvidence } from "@/components/media/ProductEvidence";
import { TrackedCta } from "@/components/ui/TrackedCta";
import styles from "./FeatureDetail.module.css";

function RelatedCapabilities({ ids }: { ids: FeatureTerritory["related"] }) {
  return (
    <p className={styles.related}>
      <span>Se relaciona con:</span>{" "}
      {ids.map((id, i) => {
        const t = getTerritory(id);
        if (!t) return null;
        return (
          <span key={id}>
            <Link href={`#${id}`}>{t.navLabel}</Link>
            {i < ids.length - 1 ? ", " : ""}
          </span>
        );
      })}
    </p>
  );
}

export function FeatureDetail({ territory, index }: { territory: FeatureTerritory; index: number }) {
  assertPublishable(territory.claimIds);
  const titleId = `${territory.id}-title`;
  // Capabilities in development only appear once their claim is verified and approved.
  const capabilities = [
    ...territory.capabilities,
    ...(territory.upcoming ?? []).filter((u) => isPublishable(getClaim(u.claimId))).map((u) => u.text),
  ];
  return (
    <Section id={territory.id} tone={index % 2 ? "light" : "white"} ariaLabelledBy={titleId} className={styles.section}>
      <Container className={`${styles.grid} ${index % 2 ? styles.reverse : ""}`}>
        <div className={styles.text}>
          <p className={styles.eyebrow}>
            <Pictogram name={territory.pictogram} size={36} />
            {String(index + 1).padStart(2, "0")} · {territory.navLabel}
          </p>
          <h2 id={titleId} className={styles.title}>
            {territory.title}
          </h2>
          <p className={styles.outcome}>{territory.outcome}</p>
          <ul className={styles.tags} aria-label="En resumen">
            {territory.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
          <p className={styles.body}>{territory.fit}</p>
          {/* The full list stays available under the visitor's control. */}
          <details className={styles.more}>
            <summary className={styles.moreSummary}>
              <Plus aria-hidden className={styles.moreIcon} />
              Qué puedes hacer ({capabilities.length})
            </summary>
            <ul className={styles.capabilities}>
              {capabilities.map((c) => (
                <li key={c}>
                  <Check aria-hidden className={styles.check} />
                  {c}
                </li>
              ))}
            </ul>
            {territory.note ? <p className={styles.note}>{territory.note}</p> : null}
          </details>
          <div className={styles.actions}>
            <TrackedCta cta={featureCta(territory.id)} variant="primary" />
          </div>
          <RelatedCapabilities ids={territory.related} />
        </div>
        <div className={styles.media} data-reveal="mask">
          {territory.evidence.length > 1 ? (
            <MediaTabs
              label={`Videos de ${territory.navLabel}`}
              panels={territory.evidence.map((key, i) => ({
                id: key,
                label: territory.evidenceLabels?.[i] ?? key,
                content: <ProductEvidence slot={getEvidence(key)} sectionId={territory.id} expandable />,
              }))}
            />
          ) : (
            <ProductEvidence slot={getEvidence(territory.evidence[0])} sectionId={territory.id} expandable />
          )}
        </div>
      </Container>
    </Section>
  );
}
