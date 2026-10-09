import type { Claim, ClaimStatus } from "./types";

/**
 * Claim registry: the verified product statements the site may publish.
 * Only claims with a publishable status AND marketing approval reach the UI;
 * anything else (unknown ids included) is treated as unverified and never rendered.
 */
const OWNER = "Producto";

export const claims = [
  {
    id: "production-recipes",
    status: "available",
    statement:
      "Crear, importar y exportar recetas; definir insumos, producto terminado y cantidad base; escalar a una cantidad objetivo con merma teórica; revisar stock; ejecutar la producción consumiendo insumos e ingresando producto terminado, con costo de materia prima y responsables básicos.",
    evidenceRef: "evidence-production",
    owner: OWNER,
    approvedForMarketing: true,
  },
  {
    id: "purchasing",
    status: "available",
    statement:
      "Compras, proveedores, cotizaciones y órdenes de compra, pagos y cuotas, cuentas por pagar, lotes y series, importación de XML e impacto de la compra sobre el inventario.",
    evidenceRef: "evidence-purchase-stock",
    owner: OWNER,
    approvedForMarketing: true,
  },
  {
    id: "inventory",
    status: "available",
    statement:
      "Stock por sede y almacén, movimientos, ingresos y salidas, ajustes, transferencias, lotes, series, vencimientos, Kardex y Kardex valorizado, y reportes.",
    evidenceRef: "evidence-inventory",
    owner: OWNER,
    approvedForMarketing: true,
  },
  {
    id: "sales-sunat",
    status: "available",
    statement:
      "Cotizaciones, pedidos, ventas, POS y caja, facturación electrónica SUNAT (facturas, boletas, notas y guías), cobranzas, cuentas por cobrar, links de pago y transformación entre documentos comerciales.",
    evidenceRef: "evidence-sales",
    owner: OWNER,
    approvedForMarketing: true,
  },
  {
    id: "finance-reports",
    status: "available",
    statement:
      "Caja, bancos, movimientos, cuentas por cobrar y por pagar, dashboards, métricas, alrededor de 30 reportes y exportaciones hacia CONCAR, Siscont, Contasis y otros.",
    evidenceRef: "evidence-control",
    owner: OWNER,
    approvedForMarketing: true,
  },
  {
    id: "imports",
    status: "available_for_offer",
    statement:
      "Importaciones como parte del abastecimiento: expediente y su información operativa dentro del alcance auditado.",
    evidenceRef: "evidence-imports",
    owner: OWNER,
    approvedForMarketing: true,
  },
  {
    id: "connected-operation",
    status: "available_with_limits",
    statement:
      "Tu Quipu reúne compras, inventario, producción, ventas y control en un mismo sistema y relaciona sus procesos principales.",
    evidenceRef: "evidence-connected",
    owner: OWNER,
    approvedForMarketing: true,
  },
] as const satisfies readonly Claim[];

export type ClaimId = (typeof claims)[number]["id"];

const PUBLISHABLE: ReadonlySet<ClaimStatus> = new Set([
  "available",
  "available_with_limits",
  "available_for_offer",
]);

export function isPublishable(claim: Pick<Claim, "status" | "approvedForMarketing">): boolean {
  return claim.approvedForMarketing && PUBLISHABLE.has(claim.status);
}

export function getPublishableClaims(source: readonly Claim[] = claims): Claim[] {
  return source.filter(isPublishable);
}

/** Throws at build time if content references a claim that cannot be published. */
export function assertPublishable(ids: readonly string[], source: readonly Claim[] = claims): void {
  for (const id of ids) {
    const claim = source.find((c) => c.id === id);
    if (!claim) throw new Error(`Unknown claim: ${id}`);
    if (!isPublishable(claim)) throw new Error(`Claim not publishable: ${id} (${claim.status})`);
  }
}

/** Unknown ids resolve to an unpublishable placeholder, so gated copy can never leak. */
export function getClaim(id: string, source: readonly Claim[] = claims): Claim {
  return (
    source.find((c) => c.id === id) ?? { id, status: "unverified", statement: "", owner: "", approvedForMarketing: false }
  );
}
