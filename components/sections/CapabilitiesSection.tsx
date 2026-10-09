import { capabilitiesSection } from "@/content/landing";
import { ctas } from "@/content/ctas";
import { territories } from "@/content/features";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { SectionHeading } from "@/components/foundations/SectionHeading";
import { CapabilityCard } from "@/components/ui/CapabilityCard";
import { TrackedCta } from "@/components/ui/TrackedCta";
import styles from "./CapabilitiesSection.module.css";

export function CapabilitiesSection() {
  return (
    <Section id={capabilitiesSection.id} tone="light" ariaLabelledBy="capabilities-title">
      <Container>
        <div className={styles.head}>
          <SectionHeading
            id="capabilities-title"
            eyebrow={capabilitiesSection.eyebrow}
            title={capabilitiesSection.title}
            body={<p>{capabilitiesSection.body}</p>}
          />
          <TrackedCta cta={ctas.home_capabilities_features} variant="secondary" className={styles.cta} />
        </div>
        <div className={styles.grid}>
          {territories.map((t, i) => (
            <CapabilityCard
              key={t.id}
              territory={t}
              href={`/funcionalidades#${t.id}`}
              featured={i === 0}
              revealIndex={i}
              className={styles[`area-${t.id}`]}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
