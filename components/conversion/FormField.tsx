import type { ReactNode } from "react";
import styles from "./DemoRequestForm.module.css";

type Props = {
  id: string;
  label: string;
  optional?: boolean;
  help?: string;
  error?: string;
  className?: string;
  children: (describedBy: string | undefined, invalid: boolean) => ReactNode;
};

/** Visible label + help + error wired through aria-describedby. */
export function FormField({ id, label, optional, help, error, className, children }: Props) {
  const helpId = help ? `${id}-help` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={[styles.field, error && styles.fieldInvalid, className].filter(Boolean).join(" ")}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {optional ? <span className={styles.optional}> (opcional)</span> : null}
      </label>
      {help ? (
        <p id={helpId} className={styles.help}>
          {help}
        </p>
      ) : null}
      {children(describedBy, Boolean(error))}
      {error ? (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
