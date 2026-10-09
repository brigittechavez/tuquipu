import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "dark" | "ghost" | "onDark";

export function buttonClass(variant: ButtonVariant = "primary", size: "regular" | "small" = "regular", block = false, extra?: string) {
  return [styles.button, styles[variant], size === "small" && styles.small, block && styles.block, extra].filter(Boolean).join(" ");
}

export const buttonIconClass = styles.icon;
export const buttonArrowClass = `${styles.icon} ${styles.iconArrow}`;

type Props = {
  href: string;
  variant?: ButtonVariant;
  size?: "regular" | "small";
  block?: boolean;
  children: ReactNode;
  className?: string;
};

/** Internal navigation styled as a button (for non-tracked links). */
export function ButtonLink({ href, variant, size, block, children, className }: Props) {
  return (
    <Link href={href} className={buttonClass(variant, size, block, className)}>
      {children}
    </Link>
  );
}
