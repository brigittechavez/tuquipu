import type { EvidenceMedia } from "@/content/types";

/** Still frame (the clip's poster) as an art-directed image. */
export function still(media: EvidenceMedia): EvidenceMedia {
  return {
    kind: "image",
    alt: media.alt,
    focus: media.focus,
    desktop: { src: media.desktop.poster ?? media.desktop.src, width: media.desktop.width, height: media.desktop.height },
    mobile: media.mobile
      ? { src: media.mobile.poster ?? media.mobile.src, width: media.mobile.width, height: media.mobile.height }
      : undefined,
  };
}
