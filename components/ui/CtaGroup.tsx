import type { CtaSpec } from "@/content/types";
import type { ButtonVariant } from "./Button";
import styles from "./CtaGroup.module.css";
import { TrackedCta } from "./TrackedCta";
import { WhatsAppLink } from "./WhatsAppLink";

type Props = {
  primary: CtaSpec;
  whatsapp?: CtaSpec;
  onDark?: boolean;
  align?: "start" | "center";
  className?: string;
};

export function CtaGroup({ primary, whatsapp, onDark = false, align = "start", className }: Props) {
  const primaryVariant: ButtonVariant = onDark ? "onDark" : "primary";
  return (
    <div className={[styles.group, styles[align], className].filter(Boolean).join(" ")}>
      <TrackedCta cta={primary} variant={primaryVariant} />
      {whatsapp ? <WhatsAppLink cta={whatsapp} variant={onDark ? "ghost" : "secondary"} /> : null}
    </div>
  );
}
