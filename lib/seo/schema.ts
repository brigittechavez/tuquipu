import { backers } from "@/content/backers";
import { faq } from "@/content/faq";
import { territories } from "@/content/features";
import { site } from "@/content/site";

/**
 * JSON-LD builders (schema.org) for SEO/AEO/GEO: only types that still help
 * search engines and that AI assistants read, with real data only — no ratings, reviews or invented facts.
 * Offers stay out until the price + IGV display is validated.
 */

const abs = (path: string) => new URL(path, `${site.url}/`).href;
const ORG_ID = `${site.url}/#organization`;
const SITE_ID = `${site.url}/#website`;
const APP_ID = `${site.url}/#software`;

/** Shorter description for meta tags (≈150 chars; the long one is used in content). */
export const seoDescription =
  "Tu Quipu es el ERP peruano para empresas que producen: compras, inventario, producción con recetas, ventas con facturación electrónica SUNAT y control.";

export function organizationNode() {
  return {
    "@type": "Organization",
    "@id": ORG_ID,
    name: site.name,
    url: abs("/"),
    description: site.description,
    logo: { "@type": "ImageObject", url: abs("/assets/logo/tu-quipu-logo-512.png"), width: 512, height: 512 },
    image: abs("/opengraph-image.png"),
    areaServed: { "@type": "Country", name: "Perú" },
    address: { "@type": "PostalAddress", addressCountry: "PE" },
    knowsLanguage: "es-PE",
    // Official profiles: multi-source corroboration of the entity (key for GEO).
    sameAs: site.social.map((s) => s.url),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: `+${site.whatsapp.number}`,
      contactType: "sales",
      areaServed: "PE",
      availableLanguage: "es",
    },
    // Institutional backing shown on the page ("Respaldado por").
    funder: backers.filter((b) => b.id === "proinnovate").map((b) => ({ "@type": "Organization", name: b.name })),
  };
}

export function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": SITE_ID,
    url: abs("/"),
    name: site.name,
    description: seoDescription,
    inLanguage: "es-PE",
    publisher: { "@id": ORG_ID },
  };
}

export function softwareNode() {
  return {
    "@type": "SoftwareApplication",
    "@id": APP_ID,
    name: site.name,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "ERP para manufactura y producción",
    operatingSystem: "Web",
    inLanguage: "es-PE",
    description: site.description,
    url: abs("/"),
    image: abs("/opengraph-image.png"),
    featureList: territories.map((t) => `${t.navLabel}: ${t.outcome}`),
    audience: { "@type": "BusinessAudience", name: "Pymes y empresas productivas o manufactureras en Perú" },
    publisher: { "@id": ORG_ID },
  };
}

/** FAQPage: no Google rich result since 2026, but assistants parse it (AEO/GEO). */
export function faqNode() {
  return {
    "@type": "FAQPage",
    mainEntity: faq.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer.join(" ") },
    })),
  };
}

export function webPageNode(path: string, name: string, description: string) {
  return {
    "@type": "WebPage",
    "@id": `${abs(path)}#webpage`,
    url: abs(path),
    name,
    description,
    inLanguage: "es-PE",
    isPartOf: { "@id": SITE_ID },
    about: { "@id": APP_ID },
    dateModified: new Date().toISOString().slice(0, 10),
  };
}

export function breadcrumbNode(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: abs(item.path) })),
  };
}

export function graph(...nodes: Record<string, unknown>[]) {
  return { "@context": "https://schema.org", "@graph": nodes };
}
