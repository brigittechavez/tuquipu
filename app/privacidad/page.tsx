import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/content/site";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { SectionHeading } from "@/components/foundations/SectionHeading";
import styles from "./page.module.css";

/**
 * Pending: the final legal text. This page only states verifiable facts about
 * what the site collects and is kept out of the index until the text is approved.
 */
export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Cómo trata Tu Quipu los datos del formulario de demo y la medición del sitio.",
  alternates: { canonical: "/privacidad" },
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <Section tone="light" density="compact" ariaLabelledBy="privacy-title">
      <Container size="narrow">
        <SectionHeading id="privacy-title" level={1} eyebrow="Privacidad" title="Política de privacidad" />
        <p className={styles.pending} role="note">
          El texto legal definitivo de esta política está en revisión. Mientras no se publique, el formulario del sitio
          no envía ni guarda datos personales.
        </p>

        <div className={styles.body}>
          <section aria-labelledby="p-datos">
            <h2 id="p-datos">Datos que solicita el formulario</h2>
            <p>
              Para agendar una demo o cotizar un plan pedimos nombre, empresa, WhatsApp o teléfono, correo, actividad de
              la empresa y, de forma opcional, lo que te gustaría resolver. No pedimos RUC, facturación ni número de
              empleados.
            </p>
          </section>
          <section aria-labelledby="p-uso">
            <h2 id="p-uso">Para qué se usan</h2>
            <p>Únicamente para contactarte sobre la solicitud que envías. No se crea ninguna cuenta.</p>
          </section>
          <section aria-labelledby="p-medicion">
            <h2 id="p-medicion">Medición del sitio</h2>
            <p>
              Cuando se active la medición, el sitio registrará interacciones generales, como clics en botones o preguntas abiertas, sin incluir datos
              personales ni el contenido del formulario o de los mensajes de WhatsApp.
            </p>
          </section>
          <section aria-labelledby="p-contacto">
            <h2 id="p-contacto">Contacto</h2>
            <p>
              Si tienes preguntas sobre tus datos, escríbenos por WhatsApp al {site.whatsapp.display}. También puedes{" "}
              <Link href="/">volver al inicio</Link>.
            </p>
          </section>
        </div>
      </Container>
    </Section>
  );
}
