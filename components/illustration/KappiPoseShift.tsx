"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { KAPPI_POSES, type KappiPose } from "./Kappi";
import styles from "./illustration.module.css";

type Props = {
  from: KappiPose;
  to: KappiPose;
  size: number;
  /** Controlled trigger (e.g. a choreography). */
  shifted?: boolean;
  /** Or a window event that triggers the shift once (e.g. "tq:lead-success"). */
  triggerEvent?: string;
  /** "left" mirrors both poses so Kappi faces the content beside it. */
  facing?: "right" | "left";
  className?: string;
};

/**
 * Kappi v1 `pose-shift`: a single crossfade (550 ms) between at most two approved
 * poses inside a fixed box (object-fit: contain, bottom-center anchor), so height
 * and baseline never jump. Never loops. Reduced motion jumps to the final pose.
 */
export function KappiPoseShift({ from, to, size, shifted: controlled, triggerEvent, facing = "right", className }: Props) {
  const [fired, setFired] = useState(false);
  const shifted = controlled ?? fired;

  useEffect(() => {
    if (!triggerEvent) return;
    const onEvent = () => setFired(true);
    window.addEventListener(triggerEvent, onEvent, { once: true });
    return () => window.removeEventListener(triggerEvent, onEvent);
  }, [triggerEvent]);

  // Fixed box sized by the taller pose so the swap never changes layout.
  const a = KAPPI_POSES[from];
  const b = KAPPI_POSES[to];
  const ratio = Math.max(a.height / a.width, b.height / b.width);

  return (
    <span
      className={[styles.poseShift, className].filter(Boolean).join(" ")}
      style={{ aspectRatio: `1 / ${ratio}` }}
      data-shifted={shifted || undefined}
    >
      {[
        { pose: from, layer: "from" },
        { pose: to, layer: "to" },
      ].map(({ pose, layer }) => {
        const p = KAPPI_POSES[pose];
        return (
          <Image
            key={layer}
            src={p.src}
            width={p.width}
            height={p.height}
            alt=""
            sizes={`(min-width: 1024px) ${size}px, ${Math.round(size * 0.7)}px`}
            className={[styles.poseLayer, facing === "left" && styles.mirrored].filter(Boolean).join(" ")}
            data-layer={layer}
            draggable={false}
          />
        );
      })}
    </span>
  );
}
