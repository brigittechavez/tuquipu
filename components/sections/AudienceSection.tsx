import { Check, Minus } from "lucide-react";
import { audienceSection } from "@/content/landing";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { SectionHeading } from "@/components/foundations/SectionHeading";
import styles from "./AudienceSection.module.css";

/** FitCard: fit / not-fit signals without invented personas or segments. */
export function AudienceSection() {
  return (
    <Section id={audienceSection.id} tone="light" density="compact" ariaLabelledBy="audience-title">
      <Container className={styles.grid}>
        <SectionHeading id="audience-title" eyebrow={audienceSection.eyebrow} title={audienceSection.title} />
        <div className={styles.cards}>
          <div className={`${styles.card} ${styles.fit}`}>
            <p className={styles.cardTitle}>Es para ti si…</p>
            <ul className={styles.list}>
              {audienceSection.fits.map((f) => (
                <li key={f}>
                  <Check aria-hidden className={styles.yes} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
          <div className={`${styles.card} ${styles.notFit}`}>
            <p className={styles.cardTitle}>{audienceSection.notFitTitle}</p>
            <ul className={styles.list}>
              {audienceSection.notFits.map((f) => (
                <li key={f}>
                  <Minus aria-hidden className={styles.no} />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
