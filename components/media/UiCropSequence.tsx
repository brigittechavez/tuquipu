import Image from "next/image";
import styles from "./media.module.css";

type Crop = { src: string; alt: string; label: string };

/** 2–3 related real crops with clear labels. Only renders with real assets. */
export function UiCropSequence({ crops, width, height }: { crops: Crop[]; width: number; height: number }) {
  return (
    <ol className={styles.crops}>
      {crops.map((crop, i) => (
        <li key={crop.src} className={styles.crop} style={{ ["--i" as string]: i }}>
          <span className={styles.cropLabel}>
            {i + 1}. {crop.label}
          </span>
          <Image src={crop.src} alt={crop.alt} width={width} height={height} sizes="(min-width: 1024px) 40vw, 90vw" />
        </li>
      ))}
    </ol>
  );
}
