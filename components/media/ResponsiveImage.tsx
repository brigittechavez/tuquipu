import { getImageProps } from "next/image";
import type { EvidenceMedia } from "@/content/types";
import styles from "./media.module.css";

export const MOBILE_MEDIA = "(max-width: 767.98px)";

/** Art-directed product image: dedicated mobile crop when provided, optimized by next/image. */
export function ResponsiveImage({ media, sizes, priority = false }: { media: EvidenceMedia; sizes: string; priority?: boolean }) {
  const common = { alt: media.alt, sizes, priority };
  const desktop = getImageProps({ ...common, ...media.desktop }).props;
  const mobile = media.mobile ? getImageProps({ ...common, ...media.mobile }).props : undefined;
  return (
    <picture>
      {mobile ? <source media={MOBILE_MEDIA} srcSet={mobile.srcSet} width={mobile.width} height={mobile.height} /> : null}
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt comes from getImageProps */}
      <img {...desktop} className={styles.fill} style={{ objectPosition: media.focus ?? "50% 0%" }} />
    </picture>
  );
}
