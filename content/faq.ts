/**
 * FAQ — only answers backed by verified product facts (capabilities, services, pricing).
 * No timelines, SLA, fixed implementation fees or plan-change policy (not approved).
 */
import { plans } from "./pricing";

/** "Esencial a S/ 299, Operaciones a S/ 499 e Industria a S/ 699", always in sync with pricing. */
const planPrices = plans
  .map((p) => `${p.name} a ${p.currency} ${p.price}`)
  .join(", ")
  .replace(/, ([^,]*)$/, " e $1");

export type FaqItem = {
  id: string;
  topic: "producto" | "encaje" | "capacidades" | "implementacion" | "soporte" | "planes" | "servicios" | "demo";
  question: string;
  answer: string[];
};

export const faq: readonly FaqItem[] = [
  // Answer-first entries (AEO/GEO): self-contained answers to the questions people ask search engines and assistants.
  {
    id: "faq_what_is",
    topic: "producto",
    question: "¿Qué es Tu Quipu?",
    answer: [
      "Tu Quipu es un ERP peruano para pymes y empresas productivas: reúne compras, inventario, producción con recetas, ventas con facturación electrónica SUNAT y control en un mismo sistema.",
      "Está pensado para quienes producen alimentos, cosmética, pigmentos, jabones y champú, entre otros productos.",
    ],
  },
  {
    id: "faq_price",
    topic: "planes",
    question: "¿Cuánto cuesta Tu Quipu?",
    answer: [
      `Hay tres planes mensuales: ${planPrices}, más IGV. La facturación electrónica SUNAT está incluida en todos.`,
      "A la suscripción se suma un pago único por implementación, que se define según el alcance de tu operación.",
    ],
  },
  {
    id: "faq_fit_manufacturing",
    topic: "encaje",
    question: "¿Tu Quipu sirve para una empresa que fabrica o produce?",
    answer: [
      "Sí. Tu Quipu está pensado para pymes y empresas productivas o manufactureras en Perú que necesitan relacionar compras, inventario, producción, ventas y control en un mismo sistema.",
      "La producción se gestiona con recetas: insumos, producto terminado, cantidad base y escalado a la cantidad que necesitas producir.",
    ],
  },
  {
    id: "faq_production_inventory",
    topic: "capacidades",
    question: "¿Cómo se relaciona la producción con el inventario?",
    answer: [
      "Antes de producir puedes revisar el stock de los insumos. Al ejecutar la producción se consumen los insumos de la receta y se ingresa el producto terminado, con el costo de materia prima registrado.",
    ],
  },
  {
    id: "faq_einvoicing",
    topic: "capacidades",
    question: "¿Incluye facturación electrónica SUNAT?",
    answer: [
      "Sí, en todos los planes. Puedes emitir facturas, boletas, notas y guías, y relacionarlas con cotizaciones, pedidos, ventas y cobranzas.",
    ],
  },
  {
    id: "faq_lots_kardex",
    topic: "capacidades",
    question: "¿Puedo controlar lotes, series, vencimientos y Kardex?",
    answer: [
      "Lotes, series y vencimientos están disponibles desde el plan Esencial. El Kardex está disponible y el Kardex valorizado se incluye desde el plan Operaciones.",
    ],
  },
  {
    id: "faq_sites",
    topic: "planes",
    question: "¿Puedo trabajar con varias sedes o almacenes?",
    answer: [
      "Sí. El stock se controla por sede y almacén, con transferencias entre ellos. Esencial incluye 1 sede, Operaciones hasta 3 e Industria hasta 8.",
    ],
  },
  {
    id: "faq_implementation",
    topic: "implementacion",
    question: "¿Cómo es la implementación y cuánto cuesta?",
    answer: [
      "La implementación es un pago único, separado de la suscripción mensual, y se define según el alcance de tu operación.",
      "Puede contemplar configuración, preparación o migración de información cuando aplica, sesiones, capacitación inicial y acompañamiento de la puesta en marcha. Lo revisamos contigo antes de enviarte una propuesta.",
    ],
  },
  {
    id: "faq_support",
    topic: "soporte",
    question: "¿Qué incluye el soporte?",
    answer: [
      "El soporte incluye consultas funcionales e incidencias del sistema. No ofrecemos soporte 24/7 ni reuniones ilimitadas.",
      "Las reuniones dedicadas y capacitaciones adicionales pueden tener un costo adicional.",
    ],
  },
  {
    id: "faq_accounting",
    topic: "servicios",
    question: "¿Tu Quipu incluye asesoría contable?",
    answer: [
      "No. La asesoría contable especializada es un servicio independiente. Desde el plan Operaciones puedes exportar información hacia sistemas contables como CONCAR, Siscont o Contasis.",
    ],
  },
  {
    id: "faq_custom",
    topic: "servicios",
    question: "¿Qué pasa si necesito algo particular para mi operación?",
    answer: [
      "Integraciones, requerimientos o desarrollos particulares se evalúan y cotizan por separado. Conversemos para entender el alcance antes de proponer algo.",
    ],
  },
  {
    id: "faq_demo",
    topic: "demo",
    question: "¿Cómo funciona la demo?",
    answer: [
      "Nos cuentas cómo trabaja tu empresa y te mostramos Tu Quipu en una demo guiada, enfocada en tu operación. Después, si tiene sentido, te enviamos una propuesta. No necesitas crear una cuenta.",
    ],
  },
];
