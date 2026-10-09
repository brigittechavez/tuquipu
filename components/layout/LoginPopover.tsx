"use client";

import { LogIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AccountAccess } from "./AccountAccess";
import styles from "./LoginPopover.module.css";

/**
 * Header "Ingresar": a small panel under the button with the account lookup.
 * Closes with Escape, an outside click or after navigating; focus returns to the trigger.
 */
export function LoginPopover() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const onDown = (e: PointerEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  return (
    <div ref={wrap} className={styles.wrap}>
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        aria-expanded={open}
        aria-controls="account-access"
        onClick={() => setOpen((v) => !v)}
      >
        <LogIn aria-hidden className={styles.icon} />
        Ingresar
      </button>
      {open ? (
        <div id="account-access" className={styles.panel} role="dialog" aria-label="Ir a tu cuenta">
          <AccountAccess autoFocus onNavigate={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
