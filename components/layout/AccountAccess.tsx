"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { site } from "@/content/site";
import styles from "./AccountAccess.module.css";

/** RUC (11 digits, Peruvian prefixes) or an email address. */
function kindOf(value: string): "ruc" | "email" | null {
  const v = value.trim();
  if (/^(10|15|17|20)\d{9}$/.test(v)) return "ruc";
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "email";
  return null;
}

/**
 * "Ir a tu cuenta": each company has its own tenant, so the visitor types their RUC
 * or email and is sent to the account lookup, which redirects to their login.
 * The lookup URL comes from NEXT_PUBLIC_ACCOUNT_LOOKUP_URL (configured by the
 * developer); the value travels as the `identificador` query parameter and never
 * reaches analytics. Without JS it is a plain GET form.
 */
export function AccountAccess({ onNavigate, autoFocus = false }: { onNavigate?: () => void; autoFocus?: boolean }) {
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const configured = Boolean(site.accountLookupUrl);

  return (
    <form
      className={styles.form}
      action={site.accountLookupUrl || undefined}
      method="get"
      noValidate
      onSubmit={(e) => {
        const value = String(new FormData(e.currentTarget).get("identificador") ?? "");
        if (!kindOf(value)) {
          e.preventDefault();
          setError("Escribe un RUC de 11 dígitos o un correo válido.");
          return;
        }
        if (!configured) {
          e.preventDefault();
          setError("El acceso desde la web estará disponible muy pronto. Mientras tanto, ingresa desde el enlace de tu empresa.");
        }
      }}
    >
      <p className={styles.title} id={`${id}-title`}>
        Ir a tu cuenta
      </p>
      <p className={styles.hint} id={`${id}-hint`}>
        Escribe tu <strong>RUC</strong> o el <strong>correo</strong> con el que te registraste y te llevamos directo a tu acceso.
      </p>
      <label className="visually-hidden" htmlFor={`${id}-input`}>
        RUC o correo
      </label>
      <input
        id={`${id}-input`}
        name="identificador"
        className={styles.input}
        inputMode="email"
        autoComplete="username"
        placeholder="20100070970 o correo@empresa.com"
        aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}
        aria-invalid={error ? true : undefined}
        autoFocus={autoFocus}
        onInput={() => error && setError(null)}
        required
      />
      {error ? (
        <p className={styles.error} id={`${id}-error`} role="alert">
          {error}
        </p>
      ) : null}
      <button type="submit" className={styles.submit}>
        Acceder
      </button>
      <p className={styles.alt}>
        ¿Aún no tienes cuenta?{" "}
        <Link href="/demo?source=account_access" onClick={onNavigate} data-cta-id="account_access_demo" data-analytics-event="cta_click">
          Solicita tu demo
        </Link>
      </p>
    </form>
  );
}
