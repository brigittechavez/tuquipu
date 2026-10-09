import type { ElementType, ReactNode } from "react";
import styles from "./Surface.module.css";

type Props = {
  as?: ElementType;
  tone?: "white" | "lavender" | "dark";
  radius?: "md" | "lg" | "xl";
  padding?: "sm" | "md" | "lg";
  elevated?: boolean;
  className?: string;
  children: ReactNode;
};

export function Surface({ as: Tag = "div", tone = "white", radius = "lg", padding = "md", elevated = true, className, children }: Props) {
  return (
    <Tag
      className={[styles.surface, styles[tone], styles[`r-${radius}`], styles[`p-${padding}`], elevated && styles.elevated, className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </Tag>
  );
}
