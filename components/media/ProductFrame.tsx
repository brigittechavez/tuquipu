import type { ReactNode } from "react";
import styles from "./media.module.css";

type Ratio = { width: number; height: number };

type Props = {
  width: number;
  height: number;
  /** Mobile frame ratio (≤767px). Defaults to the desktop ratio. */
  mobile?: Ratio;
  caption?: ReactNode;
  state?: "loading" | "ready" | "error" | "empty";
  tone?: "light" | "dark";
  className?: string;
  children: ReactNode;
};

/** Rounded frame that reserves the aspect ratio of any product media (no CLS). */
export function ProductFrame({ width, height, mobile, caption, state = "ready", tone = "light", className, children }: Props) {
  const ratios = {
    ["--frame-ratio" as string]: `${width} / ${height}`,
    ["--frame-ratio-mobile" as string]: mobile ? `${mobile.width} / ${mobile.height}` : `${width} / ${height}`,
  };
  return (
    <figure className={[styles.figure, className].filter(Boolean).join(" ")} data-state={state}>
      <div className={[styles.frame, tone === "dark" && styles.dark].filter(Boolean).join(" ")} style={ratios}>
        {children}
      </div>
      {caption ? <figcaption className={styles.caption}>{caption}</figcaption> : null}
    </figure>
  );
}
