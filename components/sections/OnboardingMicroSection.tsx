import { onboardingSection } from "@/content/landing";
import { pricingCopy } from "@/content/pricing";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { SectionHeading } from "@/components/foundations/SectionHeading";
import { Kappi } from "@/components/illustration/Kappi";
import styles from "./OnboardingMicroSection.module.css";

/** Compact "how to start" block; Kappi (guide) is the contextual cameo. */
export function OnboardingMicroSection() {
  return (
    <Section id={onboardingSection.id} tone="lavender" density="compact" ariaLabelledBy="onboarding-title">
      <Container>
        <div className={styles.head}>
          <SectionHeading
            id="onboarding-title"
            eyebrow={onboardingSection.eyebrow}
            title={onboardingSection.title}
            body={<p>{onboardingSection.body}</p>}
          />
          <div className={styles.kappi}>
            <Kappi pose="guide" size={200} motion="enter" facing="left" />
          </div>
        </div>
        <ol className={styles.steps} data-reveal="none">
          {onboardingSection.steps.map((s, i) => (
            <li key={s.title} className={styles.step} style={{ ["--i" as string]: i }}>
              <span className={styles.num} aria-hidden>
                {i + 1}
              </span>
              <h3 className={styles.title}>{s.title}</h3>
              <p className={styles.body}>{s.body}</p>
            </li>
          ))}
        </ol>
        <div className={styles.notes}>
          <p className={styles.fee}>{pricingCopy.implementationNotice}</p>
          <p className={styles.support}>{onboardingSection.supportNote}</p>
        </div>
      </Container>
    </Section>
  );
}
