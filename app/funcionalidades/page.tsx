import type { Metadata } from "next";
import { ctas } from "@/content/ctas";
import { featuresPage, territories } from "@/content/features";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { SectionHeading } from "@/components/foundations/SectionHeading";
import { FeatureDetail } from "@/components/sections/FeatureDetail";
import { FeaturesMap } from "@/components/sections/FeaturesMap";
import { FinalCtaSection } from "@/components/sections/FinalCtaSection";
import { JsonLd } from "@/components/foundations/JsonLd";
import { breadcrumbNode, graph, webPageNode } from "@/lib/seo/schema";

const description =
  "Producción con recetas, inventario con lotes y Kardex, compras e importaciones, ventas con facturación electrónica SUNAT y reportes en Tu Quipu.";

const structuredData = graph(
  webPageNode("/funcionalidades", "Funcionalidades de Tu Quipu", description),
  breadcrumbNode([
    { name: "Inicio", path: "/" },
    { name: "Funcionalidades", path: "/funcionalidades" },
  ]),
);

export const metadata: Metadata = {
  title: "Funcionalidades: producción, inventario, compras, ventas y control",
  description,
  alternates: { canonical: "/funcionalidades" },
  openGraph: { title: "Funcionalidades de Tu Quipu", description, url: "/funcionalidades" },
};

export default function FeaturesPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <Section tone="lavender" density="compact" ariaLabelledBy="features-title">
        <Container>
          <SectionHeading
            id="features-title"
            level={1}
            variant="hero"
            eyebrow={featuresPage.eyebrow}
            title={featuresPage.title}
            body={<p>{featuresPage.body}</p>}
          />
        </Container>
      </Section>
      {/* The map sticks while the five territories scroll under it. */}
      <div>
        <FeaturesMap items={territories.map(({ id, navLabel }) => ({ id, navLabel }))} />
        {territories.map((t, i) => (
          <FeatureDetail key={t.id} territory={t} index={i} />
        ))}
      </div>
      <FinalCtaSection
        title={featuresPage.closingTitle}
        body={featuresPage.closingBody}
        primary={ctas.features_demo}
        whatsapp={ctas.features_whatsapp}
        withScene={false}
      />
    </>
  );
}
