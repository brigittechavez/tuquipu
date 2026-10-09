"use client";

import { Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { StoryStep } from "@/content/landing";
import type { EvidenceSlot } from "@/content/types";
import { ProductFrame } from "./ProductFrame";
import { ProductVideo } from "./ProductVideo";
import { VideoLightbox } from "./VideoLightbox";
import styles from "./CausalStory.module.css";

type Props = {
  slot: EvidenceSlot;
  steps: StoryStep[];
  sectionId: string;
  /** Consequence (e.g. "Tu control se actualiza"), confirmed as the last step when the clip ends. */
  followUpLabel?: string;
  /** Story heading (index, title, body), placed beside the clip with its steps. */
  header?: ReactNode;
  /** Clip on the right (editorial alternation). */
  reverse?: boolean;
};

const MOBILE_RATIO = { width: 4, height: 5 };

/**
 * Product evidence told as cause → effect: each step lights up when the clip
 * reaches it, and the consequence (control) confirms when the clip ends.
 * Before playback (no JS, reduced motion, not yet in view) every step is listed
 * plainly and the consequence is visible, so nothing depends on motion.
 */
export function CausalStory({ slot, steps, sectionId, followUpLabel, header, reverse }: Props) {
  const [progress, setProgress] = useState<number | null>(null);
  const [ended, setEnded] = useState(false);
  const media = slot.media;
  if (!media || media.kind !== "video") return null;

  const active = progress === null ? -1 : steps.reduce((acc, s, i) => (progress >= s.at ? i : acc), 0);
  const armed = progress !== null;

  return (
    <div className={[styles.story, reverse && styles.reverse].filter(Boolean).join(" ")} data-armed={armed || undefined}>
      {header ? <div className={styles.head}>{header}</div> : null}
      <div className={styles.media} data-reveal="mask">
        <VideoLightbox media={media} label={slot.caption}>
          <ProductFrame width={slot.width} height={slot.height} mobile={media.mobile ?? MOBILE_RATIO} tone="dark" caption={slot.caption}>
            <ProductVideo
              media={media}
              mediaId={slot.id}
              sectionId={sectionId}
              onProgress={(ratio) => {
                setProgress(ratio);
                if (ratio < 0.99) setEnded(false);
              }}
              onEnded={() => setEnded(true)}
            />
          </ProductFrame>
        </VideoLightbox>
      </div>

      <div className={styles.side} data-reveal="none">
        <ol className={styles.steps} aria-label="Pasos del recorrido">
          {steps.map((step, i) => {
            const state = !armed ? "static" : ended || i < active ? "done" : i === active ? "active" : "pending";
            return (
              <li
                key={step.label}
                className={styles.step}
                data-state={state}
                aria-current={state === "active" ? "step" : undefined}
                style={{ ["--i" as string]: i }}
              >
                <span className={styles.mark} aria-hidden>
                  {state === "done" ? <Check className={styles.markIcon} /> : i + 1}
                </span>
                {step.label}
              </li>
            );
          })}
          {/* The consequence closes the list as one more step, checked when the clip ends. */}
          {followUpLabel ? (
            <li
              className={`${styles.step} ${styles.outcome}`}
              data-state={!armed ? "static" : ended ? "done" : "pending"}
              style={{ ["--i" as string]: steps.length }}
            >
              <span className={styles.mark} aria-hidden>
                <Check className={styles.markIcon} />
              </span>
              {followUpLabel}
              <span className="visually-hidden" aria-live="polite">
                {ended ? ": actualizado" : ""}
              </span>
            </li>
          ) : null}
        </ol>
      </div>
    </div>
  );
}
