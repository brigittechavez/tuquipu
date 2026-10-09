"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FeatureTerritory } from "@/content/features";
import styles from "./FeaturesMap.module.css";

type Item = Pick<FeatureTerritory, "id" | "navLabel">;

/**
 * Sticky operation map: real anchor links (work without JS), plus an
 * active state and a progress fill that follow the territory in view.
 * No scroll-jacking; reduced motion keeps the states without the sliding fill.
 */
export function FeaturesMap({ items }: { items: Item[] }) {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const sections = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    if (!sections.length || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  // Keep the active chip visible inside the horizontally scrollable bar on mobile.
  useEffect(() => {
    if (!active) return;
    // Scroll the bar itself, never the window: that would cancel an anchor's smooth scroll.
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>(`[data-map-id="${active}"]`);
    if (!list || !link) return;
    const left = link.offsetLeft - (list.clientWidth - link.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left) });
  }, [active]);

  const index = active ? items.findIndex((i) => i.id === active) : -1;

  return (
    <nav aria-labelledby="features-map-title" className={styles.map} data-features-map>
      <p id="features-map-title" className="visually-hidden">
        Mapa de la operación
      </p>
      <div className={styles.track} aria-hidden>
        <span className={styles.fill} style={{ ["--map-progress" as string]: index < 0 ? 0 : (index + 1) / items.length }} />
      </div>
      <ol ref={listRef} className={styles.list}>
        {items.map((item, i) => {
          const state = index < 0 ? undefined : i < index ? "done" : i === index ? "active" : undefined;
          return (
            <li key={item.id}>
              <Link
                href={`#${item.id}`}
                className={styles.link}
                data-map-id={item.id}
                data-state={state}
                aria-current={state === "active" ? "location" : undefined}
              >
                <span className={styles.num} aria-hidden>
                  {i + 1}
                </span>
                {item.navLabel}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
