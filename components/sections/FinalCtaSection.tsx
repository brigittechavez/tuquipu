import type { CtaSpec } from "@/content/types";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { SectionHeading } from "@/components/foundations/SectionHeading";
import { FINAL_PRESENTED_EVENT, FinalCtaScene } from "@/components/illustration/FinalCtaScene";
import { Choreography } from "@/components/motion/Choreography";
import { CtaGroup } from "@/components/ui/CtaGroup";
import styles from "./FinalCtaSection.module.css";

type Props = {
  id?: string;
  title: string;
  body: string;
  primary: CtaSpec;
  whatsapp: CtaSpec;
  withScene?: boolean;
};

/**
 * Closing choreography: Kappi enters → operation and control settle → the accepted receipt
 * arrives and Kappi shifts to the presenting pose → the CTA appears. One shot, ends at rest.
 */
export function FinalCtaSection({ id = "cierre", title, body, primary, whatsapp, withScene = true }: Props) {
  const content = (
    <>
      <div className={styles.copy}>
        <SectionHeading id={`${id}-title`} title={title} body={<p>{body}</p>} className={styles.heading} />
        <CtaGroup primary={primary} whatsapp={whatsapp} onDark className={styles.ctas} />
      </div>
      {withScene ? <FinalCtaScene /> : null}
    </>
  );
  return (
    <Section id={id} tone="dark" ariaLabelledBy={`${id}-title`} className={styles.section}>
      <Container>
        {withScene ? (
          <Choreography className={styles.grid} phases={[0, 350, 800, 1500]} event={{ phase: 3, name: FINAL_PRESENTED_EVENT }}>
            {content}
          </Choreography>
        ) : (
          <div className={`${styles.grid} ${styles.single}`}>{content}</div>
        )}
      </Container>
    </Section>
  );
}
