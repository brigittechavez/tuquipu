import { Plus } from "lucide-react";
import { ctas } from "@/content/ctas";
import { faq } from "@/content/faq";
import { faqSection } from "@/content/landing";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { SectionHeading } from "@/components/foundations/SectionHeading";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import styles from "./FaqSection.module.css";

/** Native <details> accordion: works without JS; faq_open is tracked by delegation. */
export function FaqSection() {
  return (
    <Section id={faqSection.id} tone="white" ariaLabelledBy="faq-title">
      <Container className={styles.grid}>
        <div className={styles.aside}>
          <SectionHeading id="faq-title" eyebrow={faqSection.eyebrow} title={faqSection.title} />
          <div className={styles.help}>
            <p>{faqSection.whatsappLead}</p>
            <WhatsAppLink cta={ctas.home_faq_whatsapp} />
          </div>
        </div>
        <div className={styles.list}>
          {faq.map((item) => (
            <details key={item.id} className={styles.item} data-faq-id={item.id} data-faq-topic={item.topic}>
              <summary className={styles.question}>
                <h3 className={styles.questionText}>{item.question}</h3>
                <Plus aria-hidden className={styles.icon} />
              </summary>
              <div className={styles.answer}>
                {item.answer.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
