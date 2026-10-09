import { Check } from "lucide-react";
import { problem } from "@/content/landing";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { SectionHeading } from "@/components/foundations/SectionHeading";
import { IsoPlant } from "@/components/illustration/IsoPlant";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import styles from "./ProblemContextSection.module.css";

export function ProblemContextSection() {
  const { separate, connected } = problem.comparison;
  return (
    <Section id={problem.id} tone="white" ariaLabelledBy="problem-title">
      <Container>
        <div className={styles.grid}>
          <SectionHeading
            id="problem-title"
            eyebrow={problem.eyebrow}
            title={problem.title}
            body={<p>{problem.body}</p>}
            className={styles.heading}
          />
          <ol className={styles.situations}>
            {problem.situations.map((s, i) => (
              <li key={s.title} className={styles.situation} data-reveal="scale" style={{ ["--reveal-index" as string]: i }}>
                <span className={styles.index} aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className={styles.situationTitle}>{s.title}</h3>
                <p className={styles.situationBody}>{s.body}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* ComparisonState as a 2.5D scene: the four areas drift apart buried in loose
            records, then dock onto one base as a single system (scroll-scrubbed). */}
        <ScrollProgress className={styles.scrub} start={0.25} end={-0.85}>
          <div className={styles.sticky}>
            <div className={styles.split}>
              <div className={styles.caption}>
                <p className={styles.labels}>
                  <span className="visually-hidden">
                    {separate.label}: {separate.items.join(", ")}. {connected.label}.
                  </span>
                  <span className={styles.labelSeparate} aria-hidden>
                    {separate.label}
                  </span>
                  <span className={styles.labelConnected} aria-hidden>
                    {connected.label}
                  </span>
                </p>
                <p className={styles.note}>
                  <Check aria-hidden className={styles.check} />
                  {connected.body}
                </p>
              </div>
              <div className={styles.sceneWrap}>
                <IsoPlant items={separate.items} />
              </div>
            </div>
          </div>
        </ScrollProgress>
      </Container>
    </Section>
  );
}
