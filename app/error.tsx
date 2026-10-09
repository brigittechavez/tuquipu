"use client";

import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import styles from "./status.module.css";

export default function RouteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className={styles.wrap} role="alert">
      {/* eslint-disable-next-line @next/next/no-img-element -- approved recoverable state */}
      <img src="/assets/loading/media-error.svg" alt="" width={160} height={120} />
      <h1 className={styles.title}>No pudimos cargar esta página</h1>
      <p>Inténtalo nuevamente en unos segundos.</p>
      <div className={styles.actions}>
        <button type="button" className={buttonClass("primary")} onClick={reset}>
          Reintentar
        </button>
        <Link href="/" className={buttonClass("secondary")}>
          Ir al inicio
        </Link>
      </div>
    </div>
  );
}
