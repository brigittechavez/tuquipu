import type { ClaimId } from "./claims";
import type { EvidenceKey } from "./evidence";
import type { Pictogram } from "./features";

/**
 * Home copy.
 * Capabilities, prices, phone and CTAs are referenced from their registries.
 */
export const hero = {
  eyebrow: "ERP para empresas que producen en Perú",
  title: "Conecta tu producción con el resto de tu operación",
  /** Kinetic line: representative manufacturing sectors. */
  industriesLead: "Para quienes producen",
  industries: ["alimentos", "cosmética", "pigmentos", "jabones y champú"],
  body: "Compras, inventario, producción, ventas con facturación electrónica SUNAT y control, en un mismo sistema.",
  evidence: "hero" as EvidenceKey,
  /** Hero flow rail: what moves from one step to the next (concepts, not product data). */
  flow: [
    { label: "Insumos", pictogram: "continuity" as Pictogram },
    { label: "Producción", pictogram: "operation" as Pictogram },
    { label: "Comprobante SUNAT", pictogram: "receipt" as Pictogram },
    { label: "Control", pictogram: "control" as Pictogram },
  ],
  claimIds: ["connected-operation", "sales-sunat", "production-recipes"] satisfies ClaimId[],
};

export const problem = {
  id: "problema",
  eyebrow: "Lo que suele pasar",
  title: "Cuando cada área lleva su propio registro, entender la operación toma tiempo",
  body: "No es falta de orden. Es que la información vive en lugares distintos.",
  situations: [
    {
      title: "Lo comprado y lo almacenado no coinciden a simple vista",
      body: "Las compras se anotan en un lugar y el stock en otro, y hay que revisarlos a mano para saber qué hay.",
    },
    {
      title: "La producción se registra aparte",
      body: "A veces en una hoja de cálculo, un cuaderno o por mensajes, y lo que se produjo no se ve junto a lo que se vendió.",
    },
    {
      title: "Saber cómo vas exige recomponer información",
      body: "Para responder una pregunta simple, alguien tiene que juntar datos de varias áreas.",
    },
  ],
  comparison: {
    separate: { label: "Registros separados", items: ["Compras", "Stock", "Producción", "Ventas"] },
    connected: { label: "Un mismo sistema", body: "Cada paso deja su registro donde el siguiente lo necesita." },
  },
};

export type OperationChapter = {
  id: "compra" | "stock" | "produce" | "vende" | "controla";
  verb: string;
  title: string;
  body: string;
  visual: "operation-registered" | "sunat-confirmation" | "control-visible" | Pictogram;
  status: string;
  /** What travels from this step to the next (concept, not product data). */
  carries: string;
  /** One-line handoff so each step reads without the paragraph. */
  next: string;
};

export const connectedOperation = {
  id: "operacion",
  eyebrow: "Cómo funciona",
  title: "De la compra al control, en un mismo sistema",
  body: "Tu Quipu no reemplaza tu forma de trabajar: relaciona los momentos principales de tu operación para que cada uno parta de lo que ya registraste.",
  claimIds: ["connected-operation"] satisfies ClaimId[],
  chapters: [
    {
      id: "compra",
      verb: "Compra",
      title: "Registras la compra",
      body: "Con su proveedor, su orden y sus pagos. Puedes importar el XML del comprobante.",
      visual: "operation-registered",
      status: "Compra registrada",
      carries: "Compra",
      next: "Pasa al inventario",
    },
    {
      id: "stock",
      verb: "Stock",
      title: "El inventario la recibe",
      body: "La compra impacta el stock de la sede y el almacén, con lotes, series y vencimientos.",
      visual: "continuity",
      status: "Stock actualizado",
      carries: "Insumos",
      next: "Quedan listos para producir",
    },
    {
      id: "produce",
      verb: "Produce",
      title: "Produces con tu receta",
      body: "Escalas la receta, revisas insumos y, al ejecutar, se consumen insumos y entra el producto terminado.",
      visual: "operation",
      status: "Producción ejecutada",
      carries: "Producto terminado",
      next: "Queda listo para vender",
    },
    {
      id: "vende",
      verb: "Vende",
      title: "Vendes y emites el comprobante",
      body: "La venta genera la factura o boleta electrónica y queda lista la cobranza.",
      visual: "sunat-confirmation",
      status: "Comprobante aceptado",
      carries: "Comprobante",
      next: "Se refleja en tu control",
    },
    {
      id: "controla",
      verb: "Controla",
      title: "Ves el resultado",
      body: "Caja, cuentas por cobrar y por pagar, y reportes a partir de lo que se registró.",
      visual: "control-visible",
      status: "Control visible",
      carries: "Reporte",
      next: "Decides con información",
    },
  ] satisfies OperationChapter[],
};

export const capabilitiesSection = {
  id: "funcionalidades",
  eyebrow: "Qué puedes controlar",
  title: "Cinco frentes de tu operación, un solo lugar para verlos",
  body: "Cada capacidad está pensada desde lo que tu equipo necesita hacer, no desde el nombre de un módulo.",
};

export type StoryStep = { label: string; /** Clip progress (0–1) at which the step becomes active. */ at: number };

export const evidenceSection = {
  id: "producto",
  eyebrow: "Producto real",
  title: "Tu Quipu en acción",
  body: "Dos recorridos completos, tal como se ven en el sistema.",
  stories: [
    {
      id: "story-production",
      title: "De la receta al producto terminado",
      body: "Escalas una receta a la cantidad que necesitas, revisas los insumos y ejecutas la producción.",
      evidence: "production" as EvidenceKey,
      steps: [
        { label: "Eliges la receta y la cantidad", at: 0 },
        { label: "Se escalan los insumos y el costo", at: 0.45 },
        { label: "Ejecutas la producción", at: 0.76 },
        { label: "Queda en el historial de órdenes", at: 0.86 },
      ] satisfies StoryStep[],
    },
    {
      id: "story-sales",
      title: "De la venta al comprobante y al control",
      body: "Registras la venta, emites el comprobante electrónico y lo ves reflejado en tu control.",
      evidence: "sales" as EvidenceKey,
      steps: [
        { label: "Registras la venta", at: 0 },
        { label: "Se genera el comprobante", at: 0.62 },
        { label: "SUNAT lo acepta", at: 0.88 },
      ] satisfies StoryStep[],
      followUp: "control" as EvidenceKey,
      followUpLabel: "Tu control se actualiza",
    },
  ],
};

export const whySection = {
  id: "por-que",
  eyebrow: "Por qué Tu Quipu",
  title: "Hecho para empresas que producen, en Perú",
  reasons: [
    {
      title: "Operación conectada",
      body: "Compras, inventario, producción, ventas y control comparten el mismo sistema. Lo que registras en un paso está disponible para el siguiente.",
      pictogram: "continuity" as Pictogram,
    },
    {
      title: "Pensado para quien produce",
      body: "La producción no es un agregado: recetas, insumos, escalado y producto terminado son parte del núcleo.",
      pictogram: "operation" as Pictogram,
    },
    {
      title: "Preparado para operar en Perú",
      body: "Facturación electrónica SUNAT y exportaciones hacia sistemas contables usados en el país, como CONCAR, Siscont y Contasis.",
      pictogram: "receipt" as Pictogram,
    },
    {
      title: "Implementación acompañada",
      body: "No te dejamos solo con una cuenta: la puesta en marcha se define contigo según el alcance de tu operación.",
      pictogram: "control" as Pictogram,
    },
  ],
};

export const audienceSection = {
  id: "para-quien",
  eyebrow: "Para quién es",
  title: "Para pymes y empresas que producen y quieren ver su operación completa",
  fits: [
    "Compras insumos, los transformas y vendes el producto terminado.",
    "Necesitas saber qué stock tienes por sede o almacén, con lotes o vencimientos.",
    "Emites comprobantes electrónicos y quieres relacionarlos con tu inventario y tus cobranzas.",
    "Hoy juntas información de varias herramientas para entender cómo vas.",
  ],
  notFitTitle: "Quizá no sea lo que buscas si…",
  notFits: [
    "Necesitas planificación de producción avanzada (MRP) o control de maquinaria.",
    "Buscas un servicio de contabilidad: la asesoría contable es un servicio independiente.",
  ],
};

export const onboardingSection = {
  id: "puesta-en-marcha",
  eyebrow: "Puesta en marcha",
  title: "Cómo empezar",
  body: "Cada implementación se adapta a tu operación. Este es el recorrido habitual:",
  steps: [
    { title: "Conocemos tu operación", body: "Entendemos cómo compras, produces y vendes hoy." },
    { title: "Preparamos y configuramos", body: "Dejamos Tu Quipu listo para tu forma de trabajar." },
    { title: "Migramos información", body: "Cuando aplica, preparamos los datos que ya tienes." },
    { title: "Capacitamos y ponemos en marcha", body: "Acompañamos a tu equipo en los primeros pasos." },
    { title: "Operas", body: "Tu equipo trabaja en Tu Quipu con soporte funcional." },
  ],
  supportNote:
    "El soporte incluye consultas funcionales e incidencias del sistema. Sesiones o capacitaciones adicionales, asesoría contable y desarrollos particulares se evalúan por separado.",
};

export const faqSection = {
  id: "preguntas",
  eyebrow: "Preguntas frecuentes",
  title: "Lo que suelen preguntarnos",
  whatsappLead: "¿No encuentras tu pregunta?",
};

export const finalSection = {
  id: "cierre",
  title: "Tu negocio ya se mueve. Haz que todo se conecte.",
  body: "Agenda una demo guiada con tu operación como punto de partida, o escríbenos por WhatsApp.",
};

export const navigation = [
  { href: "/#operacion", label: "Producto" },
  { href: "/funcionalidades", label: "Funcionalidades" },
  { href: "/#planes", label: "Planes" },
  { href: "/#preguntas", label: "Preguntas" },
] as const;
