import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Real HTML link. The sticky-header offset comes from `scroll-padding-top` and
 * smooth scrolling is disabled globally under prefers-reduced-motion.
 */
export function AnchorLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
