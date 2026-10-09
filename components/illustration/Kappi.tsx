import Image from "next/image";
import styles from "./illustration.module.css";

/** Web derivatives (trimmed WebP) of the approved RGBA masters. The only Kappi assets allowed (v1). */
export const KAPPI_POSES = {
  neutral: { src: "/assets/kappi/kappi-neutral.webp", width: 720, height: 841 },
  guide: { src: "/assets/kappi/kappi-guide.webp", width: 720, height: 715 },
  closure: { src: "/assets/kappi/kappi-closure.webp", width: 720, height: 832 },
} as const;

export type KappiPose = keyof typeof KAPPI_POSES;

/**
 * Kappi motion contract:
 * - static: complete illustration, no motion.
 * - enter: once, opacity 0→1, translateY 16px→0, scale .985→1, 650 ms.
 * - idle: ambient translateY ≤3px + rotate ≤0.4deg, 6.2 s ease-in-out, paused off-screen.
 * Mobile halves the amplitude; prefers-reduced-motion shows the static pose.
 * Only transform/opacity on the whole illustration — never parts, never per-axis scale.
 */
export type KappiMotion = "static" | "enter" | "idle" | "enter-idle";

type Props = {
  pose: KappiPose;
  /** Rendered width in px at the largest breakpoint; used for `sizes`. */
  size: number;
  priority?: boolean;
  decorative?: boolean;
  motion?: KappiMotion;
  /** The art looks right; "left" mirrors it so Kappi faces the content it accompanies. */
  facing?: "right" | "left";
  className?: string;
};

export function Kappi({ pose, size, priority = false, decorative = true, motion = "static", facing = "right", className }: Props) {
  const p = KAPPI_POSES[pose];
  const enter = motion === "enter" || motion === "enter-idle";
  const idle = motion === "idle" || motion === "enter-idle";
  return (
    <span
      className={[styles.kappiWrap, className].filter(Boolean).join(" ")}
      data-kappi-motion={motion}
      data-reveal={enter ? "kappi" : undefined}
      data-loop={idle ? "" : undefined}
    >
      <Image
        src={p.src}
        width={p.width}
        height={p.height}
        alt={decorative ? "" : "Ilustración de una capibara que acompaña la explicación"}
        priority={priority}
        sizes={`(min-width: 1024px) ${size}px, ${Math.round(size * 0.7)}px`}
        className={[styles.kappi, facing === "left" && styles.mirrored].filter(Boolean).join(" ")}
        draggable={false}
      />
    </span>
  );
}
