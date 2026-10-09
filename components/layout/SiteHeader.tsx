import { ctas } from "@/content/ctas";
import { navigation } from "@/content/landing";
import { Container } from "@/components/foundations/Container";
import { TrackedCta } from "@/components/ui/TrackedCta";
import { AnchorLink } from "./AnchorLink";
import { HeaderTone } from "./HeaderTone";
import { LoginPopover } from "./LoginPopover";
import { Logo } from "./Logo";
import { MobileNavigation } from "./MobileNavigation";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header id="site-header" className={styles.header}>
      <HeaderTone headerId="site-header" />
      <Container className={styles.inner}>
        <Logo />
        <nav aria-label="Principal" className={styles.nav}>
          <ul className={styles.links}>
            {navigation.map((item) => (
              <li key={item.href}>
                <AnchorLink href={item.href} className={styles.link}>
                  {item.label}
                </AnchorLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className={styles.actions}>
          <LoginPopover />
          <TrackedCta cta={ctas.home_header_demo} size="small" className={styles.cta} />
          <MobileNavigation links={navigation} />
        </div>
      </Container>
    </header>
  );
}
