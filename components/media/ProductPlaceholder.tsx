import styles from "./media.module.css";

/**
 * Placeholder. Explicitly labelled as an internal preview so it
 * can never be read as product proof. Replace with real media before release.
 */
export function ProductPlaceholder({ demonstrates }: { demonstrates: string }) {
  return (
    <div className={styles.placeholder} data-media-state="placeholder">
      {/* eslint-disable-next-line @next/next/no-img-element -- approved vector placeholder */}
      <img src="/assets/loading/product-placeholder.svg" alt="" width={800} height={500} className={styles.fill} />
      <p className={styles.placeholderNote}>
        <span className={styles.badge}>Vista previa interna</span>
        <span className={styles.placeholderText}>Aquí irá una captura real de {demonstrates}.</span>
      </p>
    </div>
  );
}
