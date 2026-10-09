import type { Metadata } from "next";
import { connection } from "next/server";
import { ctas } from "@/content/ctas";
import { getPlan, pricingCopy } from "@/content/pricing";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { SectionHeading } from "@/components/foundations/SectionHeading";
import { DemoRequestForm } from "@/components/conversion/DemoRequestForm";
import { KappiPoseShift } from "@/components/illustration/KappiPoseShift";
import { WhatsAppLink } from "@/components/ui/WhatsAppLink";
import { issueFormTimestamp } from "@/lib/leads/submit";
import { parseDemoQuery } from "@/lib/validation/lead";
import { JsonLd } from "@/components/foundations/JsonLd";
import { breadcrumbNode, graph, webPageNode } from "@/lib/seo/schema";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Agenda una demo o cotiza un plan",
  description:
    "Solicita una demo guiada de Tu Quipu o la cotización de un plan. Te contactamos para conocer tu operación; no necesitas crear una cuenta.",
  alternates: { canonical: "/demo" },
};

const structuredData = graph(
  webPageNode("/demo", "Agenda una demo o cotiza un plan de Tu Quipu", "Solicita una demo guiada de Tu Quipu o la cotización de un plan."),
  breadcrumbNode([
    { name: "Inicio", path: "/" },
    { name: "Demo", path: "/demo" },
  ]),
);

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function DemoPage(props: Props) {
  await connection();
  const query = parseDemoQuery(await props.searchParams);
  const plan = getPlan(query.plan);
  const isQuote = query.intent === "quote";
  const title = isQuote ? (plan ? `Cotiza el plan ${plan.name}` : "Cotiza un plan de Tu Quipu") : "Agenda una demo de Tu Quipu";
  const body = isQuote
    ? "Cuéntanos sobre tu empresa y te enviamos una cotización. El plan queda seleccionado, pero puedes cambiarlo."
    : "Cuéntanos sobre tu empresa y coordinamos una demo guiada, enfocada en cómo trabajas hoy.";

  return (
    <>
      <JsonLd data={structuredData} />
      <Section id="solicitud" tone="light" density="compact" ariaLabelledBy="demo-title">
        <Container className={styles.grid}>
          <div className={styles.main}>
            <SectionHeading id="demo-title" level={1} eyebrow={isQuote ? "Cotización" : "Demo guiada"} title={title} body={<p>{body}</p>} />
            <div className={styles.formCard}>
              <DemoRequestForm intent={query.intent} plan={query.plan} source={query.source} startedAt={issueFormTimestamp()} />
            </div>
          </div>

          <aside className={styles.aside} aria-labelledby="next-steps-title">
            {plan ? (
              <div className={styles.planSummary}>
                <p className={styles.asideLabel}>Plan seleccionado</p>
                <p className={styles.planName}>{plan.name}</p>
                <p className={styles.planPrice}>
                  {plan.currency}
                  {plan.price} <span>{plan.priceSuffix}</span>
                </p>
                <p className={styles.planNote}>{pricingCopy.implementationNotice}</p>
              </div>
            ) : null}
            <div className={styles.next}>
              <h2 id="next-steps-title" className={styles.nextTitle}>
                Qué pasa después
              </h2>
              <ol className={styles.steps}>
                <li>Revisamos tu solicitud.</li>
                <li>Te contactamos para conocer tu operación.</li>
                <li>{isQuote ? "Te enviamos una propuesta según el alcance." : "Te mostramos Tu Quipu en una demo guiada."}</li>
              </ol>
              <p className={styles.noAccount}>No se crea ninguna cuenta ni se inicia una prueba.</p>
            </div>
            <div className={styles.whatsapp}>
              <p>¿Prefieres conversar ahora?</p>
              <WhatsAppLink cta={ctas.demo_whatsapp} block />
            </div>
            <div className={styles.kappi}>
              <KappiPoseShift from="neutral" to="closure" size={180} triggerEvent="tq:lead-success" facing="left" />
            </div>
          </aside>
        </Container>
      </Section>
    </>
  );
}
