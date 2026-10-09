/** Single source for brand, contact and environment-driven URLs. */
export const site = {
  name: "Tu Quipu",
  category: "ERP para empresas que producen en Perú",
  description:
    "Tu Quipu es un ERP peruano para pymes y empresas productivas: reúne compras, inventario, producción, ventas con facturación electrónica SUNAT y control en un mismo sistema.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://tuquipu.com").replace(/\/$/, ""),
  /** Product login URL (footer link, hidden while empty). */
  loginUrl: process.env.NEXT_PUBLIC_APP_LOGIN_URL || "",
  /** Account lookup (RUC or email → the company tenant login). Receives ?identificador=. Configured by the developer. */
  accountLookupUrl: process.env.NEXT_PUBLIC_ACCOUNT_LOOKUP_URL || "",
  locale: "es_PE",
  whatsapp: {
    display: "+51 977 729 193",
    number: "51977729193",
    base: "https://wa.me/51977729193",
  },
  /** Official social accounts. */
  social: [
    { id: "facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=61584896563158" },
    { id: "instagram", label: "Instagram", url: "https://www.instagram.com/tuquipu.peru/" },
    { id: "tiktok", label: "TikTok", url: "https://www.tiktok.com/@tuquipu" },
    { id: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/company/107431133/" },
  ],
} as const;

export type SocialId = (typeof site.social)[number]["id"];
