import { KappiPoseShift } from "./KappiPoseShift";
import { ControlModule, OperationModule, ReceiptModule } from "./Modules";
import styles from "./FinalCtaScene.module.css";

export const FINAL_PRESENTED_EVENT = "tq:final-presented";

/**
 * Closing scene: operation, accepted receipt and control order themselves
 * around Kappi, who then presents the result (pose-shift neutral → closure, once).
 * Phases are driven by the parent <Choreography> through `data-phase`.
 * Four elements (max five); the CTA lives outside, in HTML.
 */
export function FinalCtaScene() {
  return (
    <div className={styles.scene} aria-hidden>
      <span className={styles.halo} />
      <OperationModule idPrefix="final-operation" className={`${styles.piece} ${styles.operation}`} />
      <ControlModule idPrefix="final-control" className={`${styles.piece} ${styles.control}`} />
      <div className={`${styles.piece} ${styles.kappi}`}>
        <KappiPoseShift from="neutral" to="closure" size={300} triggerEvent={FINAL_PRESENTED_EVENT} />
      </div>
      <ReceiptModule idPrefix="final-receipt" className={`${styles.piece} ${styles.receipt}`} />
    </div>
  );
}
