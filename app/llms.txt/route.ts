import { backers } from "@/content/backers";
import { faq } from "@/content/faq";
import { territories } from "@/content/features";
import { plans } from "@/content/pricing";
import { site } from "@/content/site";

export const dynamic = "force-static";

/**
 * /llms.txt (llmstxt.org): a plain Markdown map of the site for AI assistants.
 * Built from the same content as the pages, so it never drifts. Cheap and
 * future-proof; real, answer-first content on the pages matters more.
 */
export function GET() {
  const url = (path: string) => `${site.url}${path}`;
  const body = `# ${site.name}

> ${site.description}

${site.name} es un ERP peruano para pymes y empresas productivas o manufactureras: quienes producen alimentos, cosmética, pigmentos, jabones y champú, entre otros. Relaciona compras, inventario, producción con recetas, ventas con facturación electrónica SUNAT y control en un mismo sistema web.

## Páginas principales
- [Inicio](${url("/")}): qué es ${site.name}, cómo funciona, planes y preguntas frecuentes.
- [Funcionalidades](${url("/funcionalidades")}): producción, inventario, compras e importaciones, ventas y facturación, finanzas y control.
- [Agenda una demo o cotiza un plan](${url("/demo")}): demo guiada sin crear cuenta.

## Funcionalidades
${territories.map((t) => `- [${t.navLabel}](${url(`/funcionalidades#${t.id}`)}): ${t.outcome}`).join("\n")}

## Planes (precios mensuales, más IGV)
${plans
  .map(
    (p) =>
      `- ${p.name} — ${p.currency} ${p.price}: ${p.fit} Hasta ${p.limits.users} usuarios, ${p.limits.sites === 1 ? "1 sede" : `hasta ${p.limits.sites} sedes`} y hasta ${p.limits.documents.toLocaleString("en-US")} documentos al mes.`,
  )
  .join("\n")}
- La facturación electrónica SUNAT está incluida en todos los planes. Se agrega un pago único por implementación según el alcance.

## Preguntas frecuentes
${faq.map((q) => `### ${q.question}\n${q.answer.join(" ")}`).join("\n\n")}

## Respaldo
${backers.map((b) => `- ${"label" in b ? `${b.label} ${b.name}` : b.name}`).join("\n")}

## Contacto
- WhatsApp: ${site.whatsapp.display} (${site.whatsapp.base})
${site.social.map((s) => `- ${s.label}: ${s.url}`).join("\n")}
`;

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
