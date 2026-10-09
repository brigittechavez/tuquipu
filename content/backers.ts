/**
 * Institutions that back Tu Quipu.
 * Logos are web copies in public/assets/partners/ (trimmed, transparent WebP).
 */
export const backers = [
  {
    id: "produce",
    name: "Ministerio de la Producción del Perú",
    logo: { src: "/assets/partners/produce.webp", width: 831, height: 160 },
  },
  {
    id: "proinnovate",
    name: "ProInnóvate",
    /** Small label above the logo. */
    label: "Cofinanciado por",
    logo: { src: "/assets/partners/proinnovate.webp", width: 360, height: 107 },
  },
  {
    id: "wichay",
    name: "Wichay Continental",
    logo: { src: "/assets/partners/wichay-continental.webp", width: 431, height: 92 },
  },
] as const;
