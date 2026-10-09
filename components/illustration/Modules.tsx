import type { Pictogram as PictogramName } from "@/content/features";
import { InlineSvg } from "./InlineSvg";
import styles from "./illustration.module.css";

type ModuleProps = { idPrefix: string; className?: string };

export function OperationModule({ idPrefix, className }: ModuleProps) {
  return <InlineSvg file="assets/illustration-modules/operation-registered.svg" idPrefix={idPrefix} className={[styles.module, className].filter(Boolean).join(" ")} />;
}

export function ReceiptModule({ idPrefix, className }: ModuleProps) {
  return <InlineSvg file="assets/illustration-modules/sunat-confirmation.svg" idPrefix={idPrefix} className={[styles.module, className].filter(Boolean).join(" ")} />;
}

export function ControlModule({ idPrefix, className }: ModuleProps) {
  return <InlineSvg file="assets/illustration-modules/control-visible.svg" idPrefix={idPrefix} className={[styles.module, className].filter(Boolean).join(" ")} />;
}

export function Pictogram({ name, size = 48, className }: { name: PictogramName; size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- tiny approved vector pictogram
    <img
      src={`/assets/pictograms/${name}.svg`}
      alt=""
      width={size}
      height={size}
      className={[styles.pictogram, className].filter(Boolean).join(" ")}
      decoding="async"
    />
  );
}
