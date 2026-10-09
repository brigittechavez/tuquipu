import Link from "next/link";
import styles from "./Logo.module.css";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={[styles.logo, className].filter(Boolean).join(" ")} aria-label="Tu Quipu, ir al inicio">
      {/* Light lockup on dark devices; the violet one otherwise. */}
      <picture>
        <source srcSet="/assets/logo/tu-quipu-lockup-horizontal-light.svg" media="(prefers-color-scheme: dark)" />
        <img src="/assets/logo/tu-quipu-lockup-horizontal-violet.svg" alt="" width={694} height={218} />
      </picture>
    </Link>
  );
}
