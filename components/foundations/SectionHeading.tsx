import type { ReactNode } from "react";
import styles from "./SectionHeading.module.css";

type Props = {
  id?: string;
  eyebrow?: string;
  title: ReactNode;
  body?: ReactNode;
  level?: 1 | 2 | 3;
  variant?: "hero" | "section";
  align?: "start" | "center";
  maxWidth?: "narrow" | "content" | "none";
  className?: string;
};

export function SectionHeading({
  id,
  eyebrow,
  title,
  body,
  level = 2,
  variant = "section",
  align = "start",
  maxWidth = "content",
  className,
}: Props) {
  const Heading = `h${level}` as const;
  return (
    <div
      className={[styles.heading, styles[variant], styles[align], styles[`max-${maxWidth}`], className]
        .filter(Boolean)
        .join(" ")}
    >
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <Heading id={id} className={styles.title}>
        {title}
      </Heading>
      {body ? <div className={styles.body}>{body}</div> : null}
    </div>
  );
}
