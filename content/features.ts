import type { ClaimId } from "./claims";
import type { EvidenceKey } from "./evidence";

export type Pictogram = "operation" | "receipt" | "continuity" | "control";

export type FeatureTerritory = {
  id: "produccion" | "inventario" | "compras" | "ventas" | "finanzas";
  navLabel: string;
  title: string;
  /** Home card: what the company can do (outcome, not module name). */
  outcome: string;
  /** Home card: detail revealed on hover/focus (always visible on touch). */
  detail: string;
  /** /funcionalidades: how it fits the flow. */
  fit: string;
  capabilities: string[];
  /** Three short, scannable labels (home cards and the features summary). */
  tags: [string, string, string];
  /** Contextual note, shown small. */
  note?: string;
  /** Capabilities rendered only once their claim is verified and approved. */
  upcoming?: { text: string; claimId: string }[];
  evidence: EvidenceKey[];
  /** Tab label per evidence when a territory has more than one clip. */
  evidenceLabels?: string[];
  claimIds: ClaimId[];
  related: FeatureTerritory["id"][];
  pictogram: Pictogram;
};

/** Capability areas, built from the claim registry. */
export const territories: readonly FeatureTerritory[] = [
  {
    id: "produccion",
    navLabel: "Producción",
    title: "Producción",
    outcome: "Produce a partir de recetas y sabe qué insumos necesitas antes de empezar.",
    detail: "Escala la receta a la cantidad objetivo, revisa stock y registra lo producido.",
    fit: "La producción parte de lo que compraste y almacenaste, y termina en producto listo para vender. Tu Quipu la registra dentro del mismo sistema.",
    capabilities: [
      "Crear, importar y exportar recetas",
      "Definir insumos, producto terminado y cantidad base",
      "Escalar a una cantidad objetivo considerando merma teórica",
      "Revisar el stock de insumos antes de producir",
      "Ejecutar la producción: consumo de insumos e ingreso de producto terminado",
      "Costo de materia prima y responsables de cada producción",
    ],
    tags: ["Recetas", "Escalado de insumos", "Producto terminado"],
    note: "Pensado para producción basada en recetas; la planificación avanzada (MRP) y el control de maquinaria no son parte del alcance actual.",
    evidence: ["production"],
    claimIds: ["production-recipes"],
    related: ["inventario", "compras"],
    pictogram: "operation",
  },
  {
    id: "inventario",
    navLabel: "Inventario",
    title: "Inventario",
    outcome: "Ve qué tienes, dónde está y cómo se movió, por sede y almacén.",
    detail: "Lotes, series, vencimientos y Kardex en el mismo lugar.",
    fit: "El inventario recibe lo que compras, entrega lo que produces y vendes. Cada movimiento queda registrado para consultarlo después.",
    capabilities: [
      "Stock por sede y almacén",
      "Ingresos, salidas, ajustes y transferencias",
      "Lotes, series y vencimientos",
      "Kardex y Kardex valorizado",
      "Reportes de inventario",
    ],
    tags: ["Stock por almacén", "Lotes y vencimientos", "Kardex"],
    note: "El stock se calcula a partir de los movimientos registrados.",
    evidence: ["inventory"],
    claimIds: ["inventory"],
    related: ["compras", "produccion"],
    pictogram: "continuity",
  },
  {
    id: "compras",
    navLabel: "Compras e Importaciones",
    title: "Compras e Importaciones",
    outcome: "Compra con orden: proveedores, órdenes y pagos que actualizan tu inventario.",
    detail: "Importa el XML de la compra y registra importaciones como parte del abastecimiento.",
    fit: "El abastecimiento es el inicio de la operación: lo que compras o importas llega al inventario y queda disponible para producir o vender.",
    capabilities: [
      "Proveedores, cotizaciones y órdenes de compra",
      "Compras con pagos, cuotas y cuentas por pagar",
      "Lotes y series desde la compra",
      "Importación de XML de comprobantes",
      "Impacto de la compra sobre el inventario",
      "Importaciones: expediente e información operativa (incluida en Industria; adicional cotizable en Operaciones)",
    ],
    tags: ["Órdenes de compra", "XML de comprobantes", "Importaciones"],
    evidence: ["purchaseStock", "imports"],
    evidenceLabels: ["Compras", "Importaciones"],
    claimIds: ["purchasing", "imports"],
    related: ["inventario", "finanzas"],
    pictogram: "operation",
  },
  {
    id: "ventas",
    navLabel: "Ventas y Facturación",
    title: "Ventas y Facturación",
    outcome: "Vende y emite tus comprobantes electrónicos SUNAT sin salir del sistema.",
    detail: "De la cotización al pedido, la venta, el comprobante y la cobranza.",
    fit: "La venta cierra el recorrido operativo: descuenta lo vendido, emite el comprobante electrónico y deja registrada la cobranza.",
    capabilities: [
      "Cotizaciones, pedidos y ventas",
      "Punto de venta y caja",
      "Facturas, boletas, notas y guías electrónicas SUNAT",
      "Transformación entre documentos comerciales",
      "Cobranzas, cuentas por cobrar y links de pago",
    ],
    tags: ["Facturas y boletas SUNAT", "Punto de venta", "Cobranzas"],
    note: "La facturación electrónica está incluida en todos los planes.",
    evidence: ["sales"],
    claimIds: ["sales-sunat"],
    related: ["inventario", "finanzas"],
    pictogram: "receipt",
  },
  {
    id: "finanzas",
    navLabel: "Finanzas y Control",
    title: "Finanzas y Control",
    outcome: "Entiende cómo va tu operación con reportes que salen de lo que registras.",
    detail: "Caja, bancos, cuentas por cobrar y por pagar, y alrededor de 30 reportes.",
    fit: "Todo lo registrado en compras, inventario, producción y ventas se convierte en información para revisar y decidir.",
    capabilities: [
      "Caja, bancos y movimientos",
      "Cuentas por cobrar y por pagar",
      "Dashboards y métricas",
      "Alrededor de 30 reportes",
      "Exportaciones hacia CONCAR, Siscont, Contasis y otros",
    ],
    tags: ["Caja y bancos", "Cuentas por cobrar y pagar", "Reportes"],
    note: "Complementa a tu contabilidad: exporta la información hacia tu sistema contable.",
    evidence: ["control"],
    claimIds: ["finance-reports"],
    related: ["ventas", "compras"],
    pictogram: "control",
  },
];

export const featuresPage = {
  eyebrow: "Funcionalidades",
  title: "Lo que puedes controlar con Tu Quipu, paso a paso",
  body: "Cada capacidad se entiende mejor por su papel en la operación: de lo que compras a lo que produces, vendes y controlas.",
  indexTitle: "Mapa de la operación",
  closingTitle: "¿Quieres verlo con los datos de tu operación?",
  closingBody: "En una demo guiada revisamos contigo cómo encajan estas capacidades en tu empresa.",
} as const;

export function getTerritory(id: string): FeatureTerritory | undefined {
  return territories.find((t) => t.id === id);
}
