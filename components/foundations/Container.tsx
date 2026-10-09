import type { ElementType, ReactNode } from "react";
import styles from "./Container.module.css";

type Props = {
  size?: "wide" | "content" | "narrow";
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

export function Container({ size = "wide", as: Tag = "div", className, children }: Props) {
  return <Tag className={[styles.container, styles[size], className].filter(Boolean).join(" ")}>{children}</Tag>;
}
