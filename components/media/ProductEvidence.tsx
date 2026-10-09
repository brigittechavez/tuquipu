import { assertPublishable } from "@/content/claims";
import type { EvidenceSlot } from "@/content/types";
import { ProductFrame } from "./ProductFrame";
import { ProductPlaceholder } from "./ProductPlaceholder";
import { ProductVideo } from "./ProductVideo";
import { ResponsiveImage } from "./ResponsiveImage";
import { UiCropSequence } from "./UiCropSequence";
import { VideoLightbox } from "./VideoLightbox";
import styles from "./media.module.css";

type Props = {
  slot: EvidenceSlot;
  sectionId: string;
  priority?: boolean;
  tone?: "light" | "dark";
  showCaption?: boolean;
  /** Video slots can be opened large on desktop ("Ver en grande"). */
  expandable?: boolean;
  className?: string;
};

/** 4:5 mobile frame for real media; placeholders keep the desktop ratio. */
const MOBILE_RATIO = { width: 4, height: 5 };

/**
 * Renders real product media when the slot has it; otherwise the approved,
 * labelled placeholder. The linked claims must be publishable.
 */
export function ProductEvidence({ slot, sectionId, priority = false, tone = "light", showCaption = true, expandable = false, className }: Props) {
  assertPublishable(slot.claimIds);
  const { media } = slot;
  const hasMedia = Boolean(media || slot.crops?.length);

  let content: React.ReactNode;
  if (media?.kind === "video") {
    content = <ProductVideo media={media} mediaId={slot.id} sectionId={sectionId} priority={priority} />;
  } else if (media?.kind === "image") {
    content = <ResponsiveImage media={media} priority={priority} sizes="(min-width: 1024px) 55vw, 100vw" />;
  } else if (slot.crops?.length) {
    content = <UiCropSequence crops={slot.crops} width={slot.width} height={slot.height} />;
  } else {
    content = <ProductPlaceholder demonstrates={slot.demonstrates} />;
  }

  const frame = (
    <ProductFrame
      width={slot.width}
      height={slot.height}
      mobile={media ? (media.mobile ?? MOBILE_RATIO) : undefined}
      tone={tone}
      state={hasMedia ? "ready" : "empty"}
      caption={showCaption && hasMedia ? slot.caption : undefined}
      className={className}
    >
      {content}
      {media?.preview ? <span className={styles.testBadge}>Material de prueba</span> : null}
    </ProductFrame>
  );
  return expandable && media?.kind === "video" ? (
    <VideoLightbox media={media} label={slot.caption}>
      {frame}
    </VideoLightbox>
  ) : (
    frame
  );
}
