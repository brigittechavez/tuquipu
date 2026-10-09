import { ArrowRight, Check } from "lucide-react";
import { assertPublishable } from "@/content/claims";
import { connectedOperation } from "@/content/landing";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { SectionHeading } from "@/components/foundations/SectionHeading";
import { IsoJourney } from "@/components/illustration/IsoJourney";
import { JourneyStory } from "@/components/motion/JourneyStory";
import styles from "./ConnectedOperationSection.module.css";

/**
 * Operational sequence as a 2.5D production route, open on the page —
 * no frame around the scene. Enhanced: the route pins while scrolling; a camera
 * travels station to station, a batch rides the conveyors, and the story text is
 * choreographed beside it (real screens live in "Producto real"). No JS / reduced
 * motion: the whole route, then the five steps.
 */
export function ConnectedOperationSection() {
  assertPublishable(connectedOperation.claimIds);
  const { chapters } = connectedOperation;
  return (
    <Section id={connectedOperation.id} tone="lavender" ariaLabelledBy="operation-title" className={styles.section}>
      <Container>
        <SectionHeading
          id="operation-title"
          eyebrow={connectedOperation.eyebrow}
          title={connectedOperation.title}
          body={<p>{connectedOperation.body}</p>}
        />
      </Container>

      <div className={styles.journey} data-journey="operation" style={{ ["--count" as string]: chapters.length }}>
        <div className={styles.pin}>
          <div className={styles.scene} data-loop>
            <IsoJourney labels={chapters.map((c) => c.verb)} />
          </div>

          <Container className={styles.overlay}>
            <ol className={styles.chapters}>
              {chapters.map((c, i) => (
                <li key={c.id} className={styles.chapter} data-chapter={c.id}>
                  <p className={styles.step}>
                    <span className="visually-hidden">Paso {i + 1} de {chapters.length}: </span>
                    <span aria-hidden className={styles.stepNum}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {c.verb}
                  </p>
                  <h3 className={styles.title}>{c.title}</h3>
                  <p className={styles.body}>{c.body}</p>
                  <p className={styles.status}>
                    <Check aria-hidden className={styles.statusIcon} />
                    {c.status}
                  </p>
                  <p className={styles.next}>
                    <ArrowRight aria-hidden className={styles.nextIcon} />
                    {c.next}
                  </p>
                </li>
              ))}
            </ol>
          </Container>
        </div>
        <JourneyStory storyId="operation" />
      </div>
    </Section>
  );
}
