import { MEDIA_PREVIEW, previewChapters, previewEvidence } from "./media-preview";
import { still } from "@/lib/media";
import type { EvidenceMedia, EvidenceSlot } from "./types";

export { still };

/**
 * Product evidence slots.
 * Real media recorded on the DEMO company "Lácteos Demo S.A.C." (fictitious clients and
 * RUC 20000000xxx).
 * Captions only state what the approved claim registry allows.
 */
const W = 1600;
const H = 1000;
const DIR = "/assets/product/tuquipu-medios";

/** Desktop 1600×1000 (16:10) + mobile 1080×1350 (4:5), each with its poster. */
function clip(name: string, alt: string, playback: EvidenceMedia["playback"] = "inview"): EvidenceMedia {
  return {
    kind: "video",
    playback,
    alt,
    desktop: { src: `${DIR}/${name}-desktop.mp4`, width: W, height: H, poster: `${DIR}/${name}-desktop-poster.jpg` },
    mobile: { src: `${DIR}/${name}-mobile.mp4`, width: 1080, height: 1350, poster: `${DIR}/${name}-mobile-poster.jpg` },
  };
}

const media = {
  hero: clip("hero", "Panel de inicio de Tu Quipu en una empresa de demostración.", "loop"),
  production: clip(
    "produccion",
    "Producción con recetas en Tu Quipu: se elige una receta de yogurt, se escala a 1,200 unidades, se recalculan los insumos y la orden ejecutada aparece en el historial.",
  ),
  inventory: clip("inventario", "Stock por almacén de cada producto y el Kardex de un producto con sus movimientos."),
  purchaseStock: clip("compras", "Listado de compras a proveedores con su estado y forma de pago, y el inventario que reflejan."),
  sales: clip("ventas", "Emisión de un comprobante electrónico: se elige el cliente y el producto, se emite y aparece aceptado por SUNAT en el listado."),
  control: clip("panel", "Panel de inicio con indicadores del mes, próximos vencimientos y resumen de caja."),
  imports: clip("importaciones", "Expediente de importación con el costo por producto y los gastos del expediente."),
} satisfies Record<string, EvidenceMedia>;

export const evidence = {
  hero: {
    id: "evidence-hero",
    demonstrates: "una vista reconocible y limpia de Tu Quipu",
    caption: "Tu Quipu en uso, en una empresa de demostración.",
    claimIds: ["connected-operation"],
    media: media.hero,
    format: "video",
    width: W,
    height: H,
  },
  production: {
    id: "evidence-production",
    demonstrates: "receta e insumos → escalado → ejecución → producto terminado",
    caption: "Una receta escalada a la cantidad objetivo: los insumos y el costo de materia prima se recalculan y la producción queda registrada.",
    claimIds: ["production-recipes"],
    media: media.production,
    format: "video",
    width: W,
    height: H,
  },
  purchaseStock: {
    id: "evidence-purchase-stock",
    demonstrates: "una compra y su impacto sobre el inventario",
    caption: "Compras registradas a proveedores, con su estado y forma de pago, y el inventario que reflejan.",
    claimIds: ["purchasing"],
    media: media.purchaseStock,
    format: "video",
    width: W,
    height: H,
  },
  inventory: {
    id: "evidence-inventory",
    demonstrates: "movimientos, almacenes y Kardex",
    caption: "Stock por almacén y el Kardex de un producto, con cada movimiento y su documento.",
    claimIds: ["inventory"],
    media: media.inventory,
    format: "video",
    width: W,
    height: H,
  },
  sales: {
    id: "evidence-sales",
    demonstrates: "una venta y su comprobante electrónico SUNAT",
    caption: "Del comprobante emitido a su aceptación por SUNAT, en el mismo flujo.",
    claimIds: ["sales-sunat"],
    media: media.sales,
    format: "video",
    width: W,
    height: H,
  },
  control: {
    id: "evidence-control",
    demonstrates: "indicadores y resúmenes que resultan de la operación registrada",
    caption: "Indicadores del mes, próximos vencimientos y resumen de caja en el panel de inicio.",
    claimIds: ["finance-reports"],
    media: media.control,
    format: "video",
    width: W,
    height: H,
  },
  imports: {
    id: "evidence-imports",
    demonstrates: "un expediente de importación dentro del abastecimiento",
    caption: "Un expediente de importación con el costo por producto y sus gastos.",
    claimIds: ["imports"],
    media: media.imports,
    format: "video",
    width: W,
    height: H,
  },
} as const satisfies Record<string, EvidenceSlot>;

export type EvidenceKey = keyof typeof evidence;

/** "Cómo funciona" chapters use the result frame of the matching clip. */
const chapterMedia: Record<string, EvidenceMedia> = {
  compra: still(media.purchaseStock),
  stock: still(media.inventory),
  produce: still(media.production),
  vende: still(media.sales),
  controla: still(media.control),
};

/** Slot with preview media merged in when MEDIA_PREVIEW=1 (never in a normal build). */
export function getEvidence(key: EvidenceKey): EvidenceSlot {
  const slot: EvidenceSlot = evidence[key];
  const preview = MEDIA_PREVIEW ? previewEvidence[key] : undefined;
  return preview ? { ...slot, media: preview } : slot;
}

/** Real screenshot for a "Cómo funciona" chapter (test material overrides it in preview). */
export function getChapterMedia(chapterId: string): EvidenceMedia | undefined {
  return (MEDIA_PREVIEW ? previewChapters[chapterId] : undefined) ?? chapterMedia[chapterId];
}
