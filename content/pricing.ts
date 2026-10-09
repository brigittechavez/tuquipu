import type { PlanId } from "./types";

/**
 * Pricing: plans, limits and the comparison matrix.
 */
export type Plan = {
  id: PlanId;
  name: string;
  price: number;
  currency: "S/";
  priceSuffix: "+ IGV / mes";
  fit: string;
  level: string;
  recommended: boolean;
  limits: { users: number; sites: number; documents: number };
  /** What this plan adds over the previous one (progression, not repetition). */
  includesLabel: string;
  highlights: string[];
  /** Upcoming capabilities shown with a "Próximamente" badge; never as available. */
  upcoming?: string[];
  /** One-line value jump, shown as a chip. */
  leap: string;
};

/** Comparison value for roadmap capabilities: rendered as a "Próximamente" badge. */
export const SOON = "Próximamente";

export const plans: readonly Plan[] = [
  {
    id: "esencial",
    name: "Esencial",
    price: 299,
    currency: "S/",
    priceSuffix: "+ IGV / mes",
    fit: "Para una operación pequeña que quiere ordenar su producción y su venta.",
    level: "Operación base en un mismo sistema",
    leap: "Base completa para producir y vender",
    includesLabel: "Incluye",
    recommended: false,
    limits: { users: 3, sites: 1, documents: 500 },
    highlights: [
      "Producción con recetas",
      "Compras e inventario",
      "Ventas y facturación electrónica",
      "Lotes, series y vencimientos",
      "Control básico",
    ],
  },
  {
    id: "operaciones",
    name: "Operaciones",
    price: 499,
    currency: "S/",
    priceSuffix: "+ IGV / mes",
    fit: "Para equipos que necesitan más control administrativo sobre su operación.",
    level: "Equipo y control ampliados",
    leap: "+ control administrativo y contable",
    includesLabel: "Todo lo de Esencial, más",
    recommended: true,
    limits: { users: 10, sites: 3, documents: 2000 },
    highlights: ["Kardex valorizado", "Cuentas por cobrar y por pagar", "Reportes ampliados", "Exportaciones contables"],
    upcoming: ["Conciliación bancaria"],
  },
  {
    id: "industria",
    name: "Industria",
    price: 699,
    currency: "S/",
    priceSuffix: "+ IGV / mes",
    fit: "Para operaciones distribuidas de mayor escala que también importan.",
    level: "Operación distribuida de mayor escala",
    leap: "+ escala, importaciones y trazabilidad",
    includesLabel: "Todo lo de Operaciones, más",
    recommended: false,
    limits: { users: 25, sites: 8, documents: 5000 },
    highlights: ["Importaciones incluidas", "Hasta 8 sedes para operar de forma distribuida"],
    upcoming: ["Roles y permisos por área", "Alcance por almacén o planta", "Trazabilidad lote a lote", "Recepción de mercadería"],
  },
];

export type ComparisonValue = true | false | string;

export type ComparisonRow = {
  label: string;
  values: Record<PlanId, ComparisonValue>;
};

export type ComparisonGroup = { title: string; rows: ComparisonRow[] };

const all = (v: ComparisonValue): Record<PlanId, ComparisonValue> => ({ esencial: v, operaciones: v, industria: v });

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatLimit(kind: keyof Plan["limits"], plan: Plan): string {
  const n = plan.limits[kind];
  if (kind === "sites") return n === 1 ? "1" : `Hasta ${formatNumber(n)}`;
  return `Hasta ${formatNumber(n)}`;
}

function limitRow(label: string, kind: keyof Plan["limits"]): ComparisonRow {
  const values = Object.fromEntries(plans.map((p) => [p.id, formatLimit(kind, p)])) as Record<PlanId, string>;
  return { label, values };
}

export const comparison: readonly ComparisonGroup[] = [
  {
    title: "Capacidad incluida",
    rows: [
      limitRow("Usuarios incluidos", "users"),
      limitRow("Sedes", "sites"),
      limitRow("Documentos mensuales", "documents"),
    ],
  },
  {
    title: "Operación",
    rows: [
      { label: "Producción y recetas", values: all(true) },
      { label: "Compras", values: all(true) },
      { label: "Inventario", values: all(true) },
      { label: "Ventas", values: all(true) },
      { label: "Facturación electrónica", values: all(true) },
      { label: "Lotes, series y vencimientos", values: all(true) },
      { label: "Control básico", values: all(true) },
    ],
  },
  {
    title: "Control y administración",
    rows: [
      { label: "Kardex valorizado", values: { esencial: false, operaciones: true, industria: true } },
      { label: "Cuentas por cobrar y por pagar", values: { esencial: false, operaciones: true, industria: true } },
      { label: "Reportes ampliados", values: { esencial: false, operaciones: true, industria: true } },
      { label: "Exportaciones contables", values: { esencial: false, operaciones: true, industria: true } },
      { label: "Correlativos internos (OP, OC y cotizaciones)", values: { esencial: false, operaciones: SOON, industria: SOON } },
      { label: "Conciliación bancaria y medio de pago", values: { esencial: false, operaciones: SOON, industria: SOON } },
      { label: "Liquidación de diferencias de cambio", values: { esencial: false, operaciones: SOON, industria: SOON } },
      { label: "Alertas de stock mínimo y notificaciones", values: { esencial: false, operaciones: SOON, industria: SOON } },
      { label: "Bandeja de trabajo por área", values: { esencial: false, operaciones: SOON, industria: SOON } },
    ],
  },
  {
    title: "Escala, importaciones y gobierno",
    rows: [
      {
        label: "Importaciones",
        values: { esencial: false, operaciones: "Adicional cotizable", industria: "Incluida" },
      },
      { label: "Roles y permisos por área", values: { esencial: false, operaciones: false, industria: SOON } },
      { label: "Alcance por almacén o planta", values: { esencial: false, operaciones: false, industria: SOON } },
      { label: "Trazabilidad lote a lote (retiro de producto)", values: { esencial: false, operaciones: false, industria: SOON } },
      { label: "Recepción de mercadería", values: { esencial: false, operaciones: false, industria: SOON } },
      { label: "Kardex valorizado PEPS", values: { esencial: false, operaciones: false, industria: SOON } },
      { label: "Factoring (cesión de facturas)", values: { esencial: false, operaciones: false, industria: SOON } },
    ],
  },
];

export const pricingCopy = {
  eyebrow: "Planes",
  title: "Elige el nivel que encaja con tu operación",
  body: "Los tres planes incluyen producción, compras, inventario, ventas y facturación electrónica. Cambian la capacidad y la profundidad de control.",
  recommendedBadge: "Recomendado",
  compareLabel: "Comparar planes",
  implementationNotice: "Se agrega un pago único por implementación, definido según el alcance de tu operación.",
  implementationDetail:
    "Puede contemplar configuración, preparación o migración de información, sesiones, capacitación inicial y acompañamiento de la puesta en marcha.",
  documentLimitDisclosure:
    "El límite mensual aplica a los documentos comerciales y fiscales definidos en la oferta. No lo consumen recetas, ejecuciones de producción, movimientos internos de inventario, Kardex, reportes ni transferencias internas.",
  limitsNote: "Los límites son comerciales y reflejan el tamaño de la operación.",
  customNeeds: "¿Tu operación necesita algo diferente? Conversemos para evaluar el alcance.",
} as const;

export function getPlan(id: string | undefined): Plan | undefined {
  return plans.find((p) => p.id === id);
}
