import { assertPublishable } from "@/content/claims";
import { ctas } from "@/content/ctas";
import { getEvidence } from "@/content/evidence";
import { evidenceSection } from "@/content/landing";
import type { EvidenceSlot } from "@/content/types";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { SectionHeading } from "@/components/foundations/SectionHeading";
import { CausalStory } from "@/components/media/CausalStory";
import { TrackedCta } from "@/components/ui/TrackedCta";
import styles from "./EvidenceSection.module.css";

function checked(slot: EvidenceSlot) {
  assertPublishable(slot.claimIds);
  return slot;
}

/** Each story shows the action, its processing and the consequence, in order. */
export function EvidenceSection() {
  return (
    <Section id={evidenceSection.id} tone="dark" ariaLabelledBy="evidence-title">
      <Container>
        <SectionHeading
          id="evidence-title"
          eyebrow={evidenceSection.eyebrow}
          title={evidenceSection.title}
          body={<p>{evidenceSection.body}</p>}
        />
        <div className={styles.stories}>
          {evidenceSection.stories.map((story, i) => {
            return (
              <article key={story.id} className={styles.story} aria-labelledby={`${story.id}-title`}>
                <CausalStory
                  reverse={i % 2 === 1}
                  header={
                    <header className={styles.text} data-reveal>
                      <p className={styles.index} aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h3 id={`${story.id}-title`} className={styles.title}>
                        {story.title}
                      </h3>
                      <p className={styles.body}>{story.body}</p>
                    </header>
                  }
                  slot={checked(getEvidence(story.evidence))}
                  steps={story.steps}
                  sectionId={evidenceSection.id}
                  followUpLabel={"followUpLabel" in story ? story.followUpLabel : undefined}
                />
              </article>
            );
          })}
        </div>
        <div className={styles.action}>
          <TrackedCta cta={ctas.home_evidence_demo} variant="onDark" />
        </div>
      </Container>
    </Section>
  );
}
