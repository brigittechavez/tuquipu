"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { EvidenceMedia } from "@/content/types";
import { track } from "@/lib/analytics";
import { still } from "@/lib/media";
import { MediaError } from "./MediaStates";
import { ResponsiveImage } from "./ResponsiveImage";
import styles from "./media.module.css";

const MOBILE_MEDIA = "(max-width: 767.98px)";
const COMPLETE_PERCENT = 90;
const MEDIA_ERR_ABORTED = 1;
const NETWORK_NO_SOURCE = 3;

type Props = {
  media: EvidenceMedia;
  mediaId: string;
  sectionId: string;
  priority?: boolean;
  /** Fires once the clip reaches its end (used to reveal the next step of a story). */
  onEnded?: () => void;
  /** Reports playback progress 0–1 (used to sync story steps with the clip). */
  onProgress?: (ratio: number) => void;
};
type Status = "idle" | "loading" | "playing" | "paused" | "ended";

/** Starts playback, reloading the source first if the browser aborted it (route change, bfcache). */
function safePlay(video: HTMLVideoElement) {
  if (video.error || video.networkState === NETWORK_NO_SOURCE) video.load();
  return video.play().catch(() => {});
}

/**
 * Silent product clip with Tu Quipu's own control (play / pause / replay with a
 * progress ring and a branded loading state) instead of the native bar.
 * "loop" (hero) repeats; "inview" plays once and rests on its result frame.
 * Both autoplay only while visible; reduced motion or data saver keep the poster
 * until the visitor presses play. Mobile gets its own file and poster.
 * Aborted loads (leaving the route, hidden cached routes) are not treated as errors.
 */
export function ProductVideo({ media, mediaId, sectionId, priority = false, onEnded, onProgress }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const started = useRef(false);
  const completed = useRef(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const loop = media.playback === "loop";

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    const autoplay = !reduce && !saveData;
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Plays once on entry; a finished clip stays on its result until the visitor replays it.
          if (autoplay && video.paused && !video.ended) {
            setStatus("loading");
            safePlay(video);
          }
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      if (!video.paused) video.pause();
    };
  }, [attempt]);

  function fail(video: HTMLVideoElement) {
    // Only a real decode/network failure counts; an abort is the browser cancelling the download.
    const code = video.error?.code;
    const noSource = video.networkState === NETWORK_NO_SOURCE;
    if (!video.isConnected || code === MEDIA_ERR_ABORTED || (!code && !noSource)) return;
    setFailed(true);
  }

  if (failed) {
    return (
      <>
        <ResponsiveImage media={{ ...still(media), alt: "" }} sizes="(min-width: 1024px) 50vw, 100vw" />
        <MediaError
          onRetry={() => {
            setFailed(false);
            setStatus("idle");
            setAttempt((n) => n + 1);
          }}
        />
      </>
    );
  }

  function toggle() {
    const v = ref.current;
    if (!v) return;
    if (v.ended) {
      v.currentTime = 0;
      setStatus("loading");
      safePlay(v);
    } else if (v.paused) {
      setStatus("loading");
      safePlay(v);
    } else {
      v.pause();
    }
  }

  const label =
    status === "playing" ? "Pausar video" : status === "ended" ? "Ver de nuevo" : status === "loading" ? "Cargando video" : "Reproducir video";
  const Icon = status === "playing" ? Pause : status === "ended" ? RotateCcw : Play;

  return (
    <>
      {/* Art-directed, optimized poster under the (transparent until playing) video. */}
      <ResponsiveImage media={{ ...still(media), alt: "" }} priority={priority} sizes="(min-width: 1024px) 50vw, 100vw" />
      <video
        key={attempt}
        ref={ref}
        className={styles.fill}
        style={{ objectPosition: media.focus ?? "50% 0%" }}
        width={media.desktop.width}
        height={media.desktop.height}
        muted
        playsInline
        loop={loop}
        preload={loop && priority ? "auto" : "none"}
        aria-label={media.alt}
        onError={(event) => fail(event.currentTarget)}
        onWaiting={() => setStatus("loading")}
        onPlaying={() => setStatus("playing")}
        onPlay={() => {
          if (started.current) return;
          started.current = true;
          track("product_media_play", { media_id: mediaId, section_id: sectionId });
        }}
        onPause={(event) => setStatus(event.currentTarget.ended ? "ended" : "paused")}
        onEnded={() => {
          setStatus("ended");
          onEnded?.();
        }}
        onTimeUpdate={(event) => {
          const v = event.currentTarget;
          if (!v.duration) return;
          const ratio = v.currentTime / v.duration;
          toggleRef.current?.style.setProperty("--progress", String(ratio));
          onProgress?.(ratio);
          if (!completed.current && ratio * 100 >= COMPLETE_PERCENT) {
            completed.current = true;
            track("product_media_complete", { media_id: mediaId, percent: COMPLETE_PERCENT });
          }
        }}
      >
        {media.mobile ? <source media={MOBILE_MEDIA} src={media.mobile.src} type="video/mp4" /> : null}
        <source
          src={media.desktop.src}
          type="video/mp4"
          onError={() => {
            if (ref.current) fail(ref.current);
          }}
        />
      </video>
      <button
        ref={toggleRef}
        type="button"
        className={styles.videoToggle}
        data-status={status}
        onClick={toggle}
        aria-label={label}
        title={label}
      >
        <svg className={styles.videoRing} viewBox="0 0 48 48" aria-hidden>
          <circle cx="24" cy="24" r="21" pathLength={1} />
        </svg>
        {status === "loading" ? (
          // eslint-disable-next-line @next/next/no-img-element -- brand loader (SVG)
          <img src="/assets/loading/button-loader.svg" alt="" width={20} height={20} className={styles.videoLoader} />
        ) : (
          <Icon aria-hidden className={styles.videoIcon} />
        )}
      </button>
    </>
  );
}
