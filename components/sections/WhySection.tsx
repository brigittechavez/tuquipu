import { whySection } from "@/content/landing";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { SectionHeading } from "@/components/foundations/SectionHeading";
import { Pictogram } from "@/components/illustration/Modules";
import styles from "./WhySection.module.css";

/** Reasons assemble one by one (stagger), then stay still. */
export function WhySection() {
  return (
    <Section id={whySection.id} tone="white" ariaLabelledBy="why-title">
      <Container className={styles.grid}>
        <SectionHeading id="why-title" eyebrow={whySection.eyebrow} title={whySection.title} className={styles.heading} />
        <ol className={styles.reasons}>
          {whySection.reasons.map((r, i) => (
            <li key={r.title} className={styles.reason} data-reveal style={{ ["--reveal-index" as string]: i }}>
              <span className={styles.icon}>
                <Pictogram name={r.pictogram} size={52} />
              </span>
              <div>
                <h3 className={styles.title}>{r.title}</h3>
                <p className={styles.body}>{r.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
