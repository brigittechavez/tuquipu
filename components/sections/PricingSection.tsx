import { Info } from "lucide-react";
import Link from "next/link";
import { ctas } from "@/content/ctas";
import { plans, pricingCopy } from "@/content/pricing";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { SectionHeading } from "@/components/foundations/SectionHeading";
import { PricingCard } from "@/components/conversion/PricingCard";
import { PricingComparison } from "@/components/conversion/PricingComparison";
import { TrackedCta } from "@/components/ui/TrackedCta";
import styles from "@/components/conversion/Pricing.module.css";

export function ImplementationNotice() {
  return (
    <div className={styles.notice}>
      <Info aria-hidden className={styles.noticeIcon} />
      <div>
        <p className={styles.noticeTitle}>{pricingCopy.implementationNotice}</p>
        <p className={styles.noticeBody}>
          {pricingCopy.implementationDetail} <Link href="#puesta-en-marcha">Cómo es la puesta en marcha</Link>.
        </p>
      </div>
    </div>
  );
}

export function DocumentLimitDisclosure() {
  return (
    <p className={styles.disclosure}>
      <strong>Sobre los límites.</strong> {pricingCopy.limitsNote} {pricingCopy.documentLimitDisclosure}
    </p>
  );
}

export function CustomNeedsCallout() {
  return (
    <div className={styles.custom}>
      <p className={styles.customText}>{pricingCopy.customNeeds}</p>
      <TrackedCta cta={ctas.pricing_custom_demo} variant="secondary" />
    </div>
  );
}

export function PricingSection() {
  return (
    <Section id="planes" tone="white" ariaLabelledBy="pricing-title">
      <Container>
        <SectionHeading
          id="pricing-title"
          eyebrow={pricingCopy.eyebrow}
          title={pricingCopy.title}
          body={<p>{pricingCopy.body}</p>}
        />
        <div className={styles.cards} data-plans data-reveal="none">
          {plans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>
        <ImplementationNotice />
        <PricingComparison />
        <DocumentLimitDisclosure />
        <CustomNeedsCallout />
      </Container>
    </Section>
  );
}
