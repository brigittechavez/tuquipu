"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { ctas } from "@/content/ctas";
import { TrackedCta } from "@/components/ui/TrackedCta";
import { AccountAccess } from "./AccountAccess";
import styles from "./MobileNavigation.module.css";

type Props = {
  links: readonly { href: string; label: string }[];
};

const noopSubscribe = () => () => {};

/**
 * Accessible dialog navigation. Before hydration (or without JS) it is a plain
 * link to the footer navigation. Links only exist in the DOM while open.
 */
export function MobileNavigation({ links }: Props) {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  if (!hydrated) {
    return (
      <a href="#footer-nav" className={styles.trigger}>
        <Menu aria-hidden className={styles.icon} />
        <span>Menú</span>
      </a>
    );
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen(true)}
      >
        <Menu aria-hidden className={styles.icon} />
        <span>Menú</span>
      </button>
      <dialog
        id="mobile-navigation"
        ref={dialogRef}
        className={styles.dialog}
        aria-label="Menú"
        onClose={() => {
          if (open) close();
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        {open ? (
          <div className={styles.panel}>
            <div className={styles.top}>
              <p className={styles.title}>Menú</p>
              <button type="button" className={styles.close} onClick={close} aria-label="Cerrar menú">
                <X aria-hidden className={styles.icon} />
              </button>
            </div>
            <nav aria-label="Principal (móvil)">
              <ul className={styles.list}>
                {links.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={styles.item} onClick={() => setOpen(false)}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className={styles.actions}>
              <TrackedCta cta={ctas.home_header_demo} block />
            </div>
            <div className={styles.account}>
              <AccountAccess onNavigate={() => setOpen(false)} />
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
