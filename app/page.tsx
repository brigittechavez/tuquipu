import type { Metadata } from "next";
import { ctas } from "@/content/ctas";
import { finalSection } from "@/content/landing";
import { JsonLd } from "@/components/foundations/JsonLd";
import { faqNode, graph, organizationNode, seoDescription, softwareNode, webPageNode, websiteNode } from "@/lib/seo/schema";
import { AudienceSection } from "@/components/sections/AudienceSection";
import { BackersStrip } from "@/components/sections/BackersStrip";
import { CapabilitiesSection } from "@/components/sections/CapabilitiesSection";
import { ConnectedOperationSection } from "@/components/sections/ConnectedOperationSection";
import { EvidenceSection } from "@/components/sections/EvidenceSection";
import { FaqSection } from "@/components/sections/FaqSection";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { OnboardingMicroSection } from "@/components/sections/OnboardingMicroSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { ProblemContextSection } from "@/components/sections/ProblemContextSection";
import { WhySection } from "@/components/sections/WhySection";

export const metadata: Metadata = {
  title: { absolute: "Tu Quipu · ERP para manufactura y producción en Perú" },
  description: seoDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: "Tu Quipu · ERP para manufactura y producción en Perú",
    description: seoDescription,
    url: "/",
  },
};

const structuredData = graph(
  organizationNode(),
  websiteNode(),
  softwareNode(),
  webPageNode("/", "Tu Quipu · ERP para manufactura y producción en Perú", seoDescription),
  faqNode(),
);

export default function Home() {
  return (
    <>
      <JsonLd data={structuredData} />
      <HeroSection />
      <BackersStrip />
      <ProblemContextSection />
      <ConnectedOperationSection />
      <CapabilitiesSection />
      <EvidenceSection />
      <WhySection />
      <AudienceSection />
      <PricingSection />
      <OnboardingMicroSection />
      <FaqSection />
      <FinalCtaSection
        title={finalSection.title}
        body={finalSection.body}
        primary={ctas.home_final_demo}
        whatsapp={ctas.home_final_whatsapp}
      />
    </>
  );
}
