import type { ReactNode } from "react";
import styles from "./Section.module.css";

export type Tone = "light" | "white" | "lavender" | "dark" | "brand";

type Props = {
  id?: string;
  tone?: Tone;
  density?: "regular" | "compact";
  ariaLabelledBy?: string;
  ariaLabel?: string;
  className?: string;
  children: ReactNode;
};

export function Section({ id, tone = "light", density = "regular", ariaLabelledBy, ariaLabel, className, children }: Props) {
  return (
    <section
      id={id}
      data-tone={tone}
      aria-labelledby={ariaLabelledBy}
      aria-label={ariaLabel}
      className={[styles.section, styles[tone], styles[density], className].filter(Boolean).join(" ")}
    >
      {children}
    </section>
  );
}
