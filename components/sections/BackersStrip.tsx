import Image from "next/image";
import { backers } from "@/content/backers";
import styles from "./BackersStrip.module.css";

/**
 * "Respaldado por": a light band after the hero with the
 * institutions that back Tu Quipu — grey logos, no frames, gliding at a constant pace. The real list is read once by assistive tech; the duplicated
 * track that makes the loop seamless is hidden from it. Reduced motion: still row.
 */
function Row({ copy }: { copy?: boolean }) {
  return (
    <ul className={styles.row} aria-hidden={copy || undefined}>
      {backers.map((b) => (
        <li key={b.id} className={styles.item}>
          <span className={styles.label}>{"label" in b ? b.label : ""}</span>
          <span className={styles.frame}>
            <Image src={b.logo.src} width={b.logo.width} height={b.logo.height} alt={copy ? "" : "label" in b ? `${b.label} ${b.name}` : b.name} className={styles.logo} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function BackersStrip() {
  return (
    <section className={styles.band} aria-labelledby="backers-title">
      <h2 id="backers-title" className={styles.title}>
        Respaldado por
      </h2>
      <div className={styles.viewport}>
        <div className={styles.track}>
          <Row />
          <Row copy />
          <Row copy />
        </div>
      </div>
    </section>
  );
}
