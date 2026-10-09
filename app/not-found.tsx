import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import styles from "./status.module.css";

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>No encontramos esta página</h1>
      <p>Puede que el enlace haya cambiado.</p>
      <div className={styles.actions}>
        <Link href="/" className={buttonClass("primary")}>
          Ir al inicio
        </Link>
        <Link href="/funcionalidades" className={buttonClass("secondary")}>
          Ver funcionalidades
        </Link>
      </div>
    </div>
  );
}
