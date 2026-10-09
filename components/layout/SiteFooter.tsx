import Link from "next/link";
import { ctas } from "@/content/ctas";
import { territories } from "@/content/features";
import { navigation } from "@/content/landing";
import { site } from "@/content/site";
import { Container } from "@/components/foundations/Container";
import { TrackedCta } from "@/components/ui/TrackedCta";
import { Logo } from "./Logo";
import { SocialIcon } from "./SocialIcon";
import styles from "./SiteFooter.module.css";

/**
 * Complete footer built only from real data — navigation,
 * the five territories, WhatsApp, official social accounts and legal.
 */
export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <Container className={styles.inner}>
        <div className={styles.brand}>
          <Logo />
          <p className={styles.tagline}>{site.description}</p>
          <div className={styles.contact}>
            <p className={styles.contactLabel}>Conversemos por WhatsApp</p>
            <TrackedCta cta={ctas.footer_whatsapp} appearance="link" icon label={site.whatsapp.display} className={styles.contactLink} />
          </div>
          <ul className={styles.social} aria-label="Redes sociales de Tu Quipu">
            {site.social.map((s) => (
              <li key={s.id}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={`${s.label} (abre en una pestaña nueva)`}
                  data-social={s.id}
                >
                  <SocialIcon id={s.id} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <nav id="footer-nav" aria-label="Pie de página" className={styles.columns}>
          <div className={styles.col}>
            <p className={styles.heading}>Explora</p>
            <ul className={styles.list}>
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
              {site.loginUrl ? (
                <li>
                  <a href={site.loginUrl}>Ingresar al sistema</a>
                </li>
              ) : null}
            </ul>
          </div>
          <div className={styles.col}>
            <p className={styles.heading}>Funcionalidades</p>
            <ul className={styles.list}>
              {territories.map((t) => (
                <li key={t.id}>
                  <Link href={`/funcionalidades#${t.id}`}>{t.navLabel}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.col}>
            <p className={styles.heading}>Empieza</p>
            <ul className={styles.list}>
              <li>
                <Link href="/demo">Agenda una demo</Link>
              </li>
              <li>
                <Link href="/demo?intent=quote">Cotiza un plan</Link>
              </li>
              <li>
                <Link href="/privacidad">Privacidad</Link>
              </li>
            </ul>
          </div>
        </nav>
      </Container>
      <Container>
        <div className={styles.bottom}>
          <p>
            © {new Date().getFullYear()} {site.name}. Hecho en Perú.
          </p>
          <p>ERP para empresas que producen.</p>
        </div>
      </Container>
    </footer>
  );
}
