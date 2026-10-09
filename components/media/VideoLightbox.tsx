"use client";

import { Maximize2, X } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import type { EvidenceMedia } from "@/content/types";
import styles from "./VideoLightbox.module.css";

/** Desktop only: large screen and a precise pointer (never touch devices). */
const LARGE = "(min-width: 900px) and (hover: hover) and (pointer: fine)";

/**
 * Wraps a product clip so it can be watched large (screens ≥ 900px only): clicking the frame (or the
 * "Ver en grande" button) opens a modal <dialog> with the desktop version and
 * native controls. Escape, the close button or the backdrop close it; focus
 * returns to the trigger. The inline clip keeps playing underneath.
 */
export function VideoLightbox({ media, label, children }: { media: EvidenceMedia; label: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);

  const show = () => {
    // Phones and tablets already show the clip at full width: no lightbox there.
    if (!window.matchMedia(LARGE).matches) return;
    setOpen(true);
    ref.current?.showModal();
    requestAnimationFrame(() => video.current?.play().catch(() => {}));
  };
  const hide = () => {
    video.current?.pause();
    ref.current?.close();
  };

  return (
    <div className={styles.wrap}>
      {/* The whole frame is a large target; the explicit button keeps it discoverable and keyboard-reachable. */}
      <div className={styles.hit} onClick={(e) => (e.target as Element).closest("button") || show()}>
        {children}
      </div>
      <button type="button" className={styles.expand} onClick={show} aria-label={`Ver en grande: ${label}`}>
        <Maximize2 aria-hidden />
        <span>Ver en grande</span>
      </button>

      <dialog
        ref={ref}
        className={styles.dialog}
        aria-label={label}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) hide();
        }}
      >
        <div className={styles.panel}>
          <button type="button" className={styles.close} onClick={hide} aria-label="Cerrar">
            <X aria-hidden />
          </button>
          {open ? (
            <video ref={video} className={styles.video} src={media.desktop.src} poster={media.desktop.poster} controls muted playsInline loop preload="auto">
              {media.alt}
            </video>
          ) : null}
          <p className={styles.caption}>{label}</p>
        </div>
      </dialog>
    </div>
  );
}
