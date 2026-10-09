import type { CtaSpec } from "@/content/types";
import type { ButtonVariant } from "./Button";
import { TrackedCta } from "./TrackedCta";

type Props = { cta: CtaSpec; variant?: ButtonVariant; size?: "regular" | "small"; block?: boolean; label?: string; appearance?: "button" | "link"; className?: string; icon?: boolean };

export function WhatsAppLink({ cta, variant = "secondary", ...rest }: Props) {
  if (cta.kind !== "whatsapp") throw new Error(`WhatsAppLink requires a whatsapp CTA, got ${cta.id}`);
  return <TrackedCta cta={cta} variant={variant} {...rest} />;
}
