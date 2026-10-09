"use client";

import { useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react";
import styles from "./MediaTabs.module.css";

type Panel = { id: string; label: string; content: ReactNode };

const noopSubscribe = () => () => {};

/**
 * One frame, several clips: only the selected panel is shown, so a single
 * video holds focus; the hidden one is paused by its own visibility observer.
 * WAI-ARIA tabs with arrow/Home/End keys. Without JS every panel stays readable.
 */
export function MediaTabs({ panels, label }: { panels: Panel[]; label: string }) {
  const [active, setActive] = useState(0);
  // Panels are only hidden once interactive tabs exist (server/no-JS shows all).
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const base = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = panels.length - 1;
    const next =
      event.key === "ArrowRight" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowLeft" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className={styles.tabs}>
      <div role="tablist" hidden={!hydrated} aria-label={label} className={styles.list}>
        {panels.map((panel, i) => (
          <button
            key={panel.id}
            ref={(el) => {
              tabs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={`${base}-tab-${panel.id}`}
            aria-selected={i === active}
            aria-controls={`${base}-panel-${panel.id}`}
            tabIndex={i === active ? 0 : -1}
            className={styles.tab}
            onClick={() => setActive(i)}
            onKeyDown={(event) => onKeyDown(event, i)}
          >
            {panel.label}
          </button>
        ))}
        <span className={styles.indicator} style={{ ["--tab-index" as string]: active, ["--tab-count" as string]: panels.length }} aria-hidden />
      </div>
      {panels.map((panel, i) => (
        <div
          key={panel.id}
          role="tabpanel"
          id={`${base}-panel-${panel.id}`}
          aria-labelledby={`${base}-tab-${panel.id}`}
          hidden={hydrated && i !== active}
          className={styles.panel}
        >
          {panel.content}
        </div>
      ))}
    </div>
  );
}
