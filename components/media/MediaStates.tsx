import styles from "./media.module.css";

/** Loading state for media: keeps layout, shimmer disabled by reduced motion (inside the SVG). */
export function MediaSkeleton({ label = "Cargando contenido del producto" }: { label?: string }) {
  return (
    <div className={styles.fillWrap} role="status" aria-live="polite">
      {/* eslint-disable-next-line @next/next/no-img-element -- approved animated SVG */}
      <img src="/assets/loading/media-skeleton.svg" alt="" width={800} height={500} className={styles.fill} />
      <span className="visually-hidden">{label}</span>
    </div>
  );
}

/** Recoverable error state: never an empty area. */
export function MediaError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className={styles.errorState} role="alert">
      {/* eslint-disable-next-line @next/next/no-img-element -- approved vector state */}
      <img src="/assets/loading/media-error.svg" alt="" width={320} height={240} className={styles.errorArt} />
      <p>No pudimos cargar este contenido.</p>
      {onRetry ? (
        <button type="button" className={styles.retry} onClick={onRetry}>
          Reintentar
        </button>
      ) : null}
    </div>
  );
}
