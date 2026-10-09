import { assertPublishable } from "@/content/claims";
import { ctas } from "@/content/ctas";
import { hero } from "@/content/landing";
import { Container } from "@/components/foundations/Container";
import { Section } from "@/components/foundations/Section";
import { IsoPlantScape } from "@/components/illustration/IsoPlantScape";
import { HeroScroll } from "@/components/motion/HeroScroll";
import { CtaGroup } from "@/components/ui/CtaGroup";
import styles from "./HeroSection.module.css";

/**
 * Hero — "Línea de producción viva" as a landscape:
 * a compact promise with its CTAs on top, and a panoramic 2.5D industrial park
 * across the full width that is visible in the first view and always moving
 * (inputs arriving, steam, the filling line, an order leaving). Tiny status pills
 * say what Tu Quipu records at each step. Gentle parallax on scroll.
 */
export function HeroSection() {
  assertPublishable(hero.claimIds);
  const sectors = hero.industries;
  return (
    <Section id="inicio" tone="light" density="compact" ariaLabelledBy="hero-title" className={styles.hero}>
      <Container className={styles.copy}>
        <h1 id="hero-title" className={styles.title}>
          {hero.title}
        </h1>
        <p className={styles.sectors}>
          <span className="visually-hidden">
            {hero.industriesLead}: {sectors.slice(0, -1).join(", ")} y {sectors[sectors.length - 1]}.
          </span>
          <span aria-hidden className={styles.sectorsLead}>
            {hero.industriesLead}
          </span>
          <span aria-hidden className={styles.rotator} data-loop="">
            {sectors.map((s, i) => (
              <span key={s} className={styles.word} style={{ ["--w" as string]: i }}>
                {s}
              </span>
            ))}
          </span>
        </p>
        <p className={styles.body}>{hero.body}</p>
        <CtaGroup primary={ctas.home_hero_demo} whatsapp={ctas.home_hero_whatsapp} align="center" className={styles.ctas} />
      </Container>

      <div className={styles.scape} data-loop="" data-scape="">
        <IsoPlantScape />
      </div>
      <HeroScroll targetId="inicio" />
    </Section>
  );
}
