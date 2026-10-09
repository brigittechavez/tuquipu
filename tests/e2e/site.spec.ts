import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { LEADS_PORT } from "../../playwright.config";

const ROUTES = ["/", "/funcionalidades", "/demo", "/demo?intent=quote&plan=industria&source=pricing_industria", "/privacidad"];

async function collectAnalytics(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __events: unknown[] }).__events = [];
    window.addEventListener("tq:analytics", (e) => (window as unknown as { __events: unknown[] }).__events.push((e as CustomEvent).detail));
  });
}

async function events(page: Page) {
  return page.evaluate(() => (window as unknown as { __events: { event: string; params: Record<string, unknown> }[] }).__events);
}

test.describe("routes", () => {
  for (const route of ROUTES) {
    test(`${route} renders one h1, metadata and no overflow or console errors`, async ({ page }) => {
      const problems: string[] = [];
      page.on("pageerror", (e) => problems.push(e.message));
      page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page).toHaveTitle(/Tu Quipu/);
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(problems).toEqual([]);
    });

    test(`${route} has no automatic axe violations`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(route);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }

  test("unknown route returns 404 page", async ({ page }) => {
    const res = await page.goto("/no-existe");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("No encontramos");
  });

  test("robots, sitemap and structured data are real", async ({ page, request }) => {
    expect((await request.get("/robots.txt")).status()).toBe(200);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/funcionalidades");
    expect(sitemap).not.toContain("/privacidad");
    await page.goto("/");
    const ld = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent()) ?? "{}");
    const text = JSON.stringify(ld);
    expect(text).toContain("SoftwareApplication");
    expect(text).not.toMatch(/aggregateRating|review|offers/);
    // AEO/GEO: FAQ, entity profiles and an llms.txt built from real content.
    expect(text).toContain("FAQPage");
    expect(text).toContain("¿Qué es Tu Quipu?");
    expect(text).toContain("instagram.com/tuquipu.peru");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("OAI-SearchBot");
    const llms = await request.get("/llms.txt");
    expect(llms.status()).toBe(200);
    expect(await llms.text()).toMatch(/^# Tu Quipu[\s\S]*## Planes/);
    await page.goto("/privacidad");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });
});

test.describe("home content and conversion", () => {
  test("pricing shows approved plans, IGV and quote destinations", async ({ page }) => {
    await page.goto("/#planes");
    for (const [id, price] of [["esencial", "299"], ["operaciones", "499"], ["industria", "699"]]) {
      const card = page.locator(`article[aria-labelledby="plan-${id}-title"]`);
      await expect(card).toContainText(price);
      await expect(card).toContainText("+ IGV / mes");
      await expect(card.getByRole("link", { name: "Cotiza este plan" })).toHaveAttribute(
        "href",
        `/demo?intent=quote&plan=${id}&source=pricing_${id}`,
      );
    }
    await expect(page.getByText("Recomendado").first()).toBeVisible();
    await expect(page.getByText(/Se agrega un pago único por implementación/).first()).toBeVisible();
    await expect(page.getByText(/gratis|Regístrate|Más elegido/i)).toHaveCount(0);
  });

  test("WhatsApp links are safe and carry no UTMs", async ({ page }) => {
    await page.goto("/");
    const links = page.locator('a[href^="https://wa.me/"]');
    expect(await links.count()).toBeGreaterThan(4);
    for (const link of await links.all()) {
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", /noopener/);
      expect(await link.getAttribute("href")).not.toMatch(/utm_/);
    }
  });

  test("CTA and FAQ interactions emit PII-free analytics without blocking navigation", async ({ page }) => {
    await collectAnalytics(page);
    await page.goto("/");
    await page.locator("details[data-faq-id]").first().locator("summary").click();
    await page.locator("details[data-pricing-interaction] summary").click();
    await page.locator('[data-cta-id="home_hero_demo"]').click();
    await expect(page).toHaveURL(/\/demo\?source=home_hero/);
    const seen = await events(page);
    const names = seen.map((e) => e.event);
    expect(names).toEqual(expect.arrayContaining(["faq_open", "pricing_interaction", "cta_click"]));
    const click = seen.find((e) => e.event === "cta_click");
    expect(click?.params).toMatchObject({ cta_id: "home_hero_demo", section_id: "inicio", destination: "/demo?source=home_hero" });
  });

  test("works without JavaScript: content, pricing and FAQ remain readable", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("#planes")).toContainText("S/");
    const hidden = await page.$$eval("[data-reveal]", (els) => els.filter((e) => getComputedStyle(e).opacity === "0").length);
    expect(hidden).toBe(0);
    await page.locator("details[data-faq-id] summary").first().click();
    await expect(page.locator("details[data-faq-id]").first()).toHaveAttribute("open", "");
    await ctx.close();
  });

  test("/demo form works without JavaScript (server validation)", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, baseURL: test.info().project.use.baseURL });
    const page = await ctx.newPage();
    await page.goto("/demo?intent=quote&plan=esencial&source=pricing_esencial");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cotiza el plan Esencial");
    await expect(page.getByRole("radio", { name: /Esencial/ })).toBeChecked();
    await page.getByLabel("Nombre").fill("Ana");
    await page.waitForTimeout(2600);
    await page.getByRole("button", { name: "Solicitar cotización" }).click();
    await expect(page.getByText("Escribe el nombre de tu empresa.")).toBeVisible();
    await expect(page.getByLabel("Nombre")).toHaveValue("Ana");
    await ctx.close();
  });

  test("with motion enabled, every revealed block ends visible after scrolling", async ({ page }) => {
    test.setTimeout(90_000);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    for (const route of ["/", "/funcionalidades"]) {
      await page.goto(route);
      await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
      // The page grows once scroll scenes enhance (pinned tracks), so re-measure while scrolling.
      for (let y = 0; y < (await page.evaluate(() => document.body.scrollHeight)); y += 500) {
        await page.evaluate((yy) => window.scrollTo(0, yy), y);
        await page.waitForTimeout(40);
      }
      await page.waitForTimeout(1200);
      const stuck = await page.$$eval("[data-reveal]:not([data-reveal=none])", (els) =>
        els
          .filter((e) => !e.hasAttribute("data-inview"))
          .map((e) => `${e.tagName}.${String(e.className).slice(0, 40)} [${e.getAttribute("data-reveal")}] top=${Math.round(e.getBoundingClientRect().top)} vh=${innerHeight} y=${Math.round(scrollY)}`),
      );
      expect(stuck, route).toEqual([]);
    }
  });

  test("reduced motion shows every chapter statically", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const hidden = await page.$$eval("[data-reveal]", (els) => els.filter((e) => getComputedStyle(e).opacity === "0").length);
    expect(hidden).toBe(0);
    await expect(page.locator("[data-chapter]")).toHaveCount(5);
  });
});

test.describe("navigation", () => {
  test("mobile menu is an accessible dialog (Escape closes, focus restored)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Menú" });
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await trigger.click();
    const dialog = page.getByRole("dialog", { name: "Menú" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Funcionalidades" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("skip link and features index anchors work by keyboard", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/funcionalidades");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Saltar al contenido" })).toBeFocused();
    await page.getByRole("navigation", { name: "Mapa de la operación" }).getByRole("link", { name: /Inventario/ }).click();
    await expect(page).toHaveURL(/#inventario$/);
    await expect(page.locator("#inventario h2")).toBeInViewport();
  });
});

test.describe("/demo", () => {
  test("quote intent preselects an editable plan", async ({ page }) => {
    await page.goto("/demo?intent=quote&plan=operaciones&source=pricing_operaciones");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Cotiza el plan Operaciones");
    const group = page.getByRole("group", { name: /Plan a cotizar/ });
    await expect(group.getByRole("radio", { name: /Operaciones/ })).toBeChecked();
    await group.getByRole("radio", { name: /Industria/ }).check();
    await expect(group.getByRole("radio", { name: /Industria/ })).toBeChecked();
    // Keyboard: arrows move within the branded radio group.
    await group.getByRole("radio", { name: /Industria/ }).focus();
    await page.keyboard.press("ArrowLeft");
    await expect(group.getByRole("radio", { name: /Operaciones/ })).toBeChecked();
    await expect(page.getByRole("radio", { name: "Cotizar un plan" })).toBeChecked();
  });

  test("arbitrary query values fall back safely", async ({ page }) => {
    await page.goto("/demo?intent=hack&plan=gold&source=%3Cscript%3E");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Agenda una demo de Tu Quipu");
    await expect(page.locator('input[name="source"]')).toHaveValue("direct");
  });

  test("client validation announces errors, focuses the first field and passes axe", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/demo");
    await page.getByRole("button", { name: "Solicitar demo" }).click();
    await expect(page.getByText(/Revisa \d campos/)).toBeVisible();
    await expect(page.getByLabel("Nombre")).toBeFocused();
    await expect(page.getByLabel("Nombre")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Nombre")).toHaveAttribute("aria-describedby", "name-error");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
    expect(results.violations).toEqual([]);
  });

  test("valid submission never fakes success while delivery is not configured and sends no PII", async ({ page }) => {
    await collectAnalytics(page);
    await page.goto("/demo?source=home_hero");
    await page.getByLabel("Nombre").fill("Ana Pérez");
    await page.getByLabel("Empresa", { exact: true }).fill("Fábrica Andina");
    await page.getByLabel("WhatsApp o teléfono").fill("987654321");
    await page.getByLabel("Correo").fill("ana@fabrica.pe");
    await page.getByLabel("Actividad de tu empresa").fill("Fabricamos productos de limpieza");
    await page.getByRole("checkbox").check();
    await page.waitForTimeout(2600);
    await page.getByRole("button", { name: "Solicitar demo" }).click();
    await expect(page.getByText("Tu solicitud no se envió.")).toBeVisible();
    await expect(page.getByText("Recibimos tu solicitud")).toHaveCount(0);
    await expect(page.getByLabel("Nombre")).toHaveValue("Ana Pérez");
    const seen = await events(page);
    expect(seen.map((e) => e.event)).toContain("demo_form_start");
    expect(seen.map((e) => e.event)).not.toContain("generate_lead");
    const serialized = JSON.stringify(seen);
    for (const pii of ["Ana", "Fábrica", "987654321", "ana@fabrica.pe", "limpieza"]) expect(serialized).not.toContain(pii);
  });
});

test.describe("QA regressions", () => {
  test("videos load and play again after navigating away and back", async ({ page }) => {
    test.setTimeout(90_000);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    const state = (sel: string) =>
      page.evaluate((s) => {
        const v = document.querySelector<HTMLVideoElement>(s);
        return v ? { ok: true, playing: !v.paused, t: v.currentTime } : { ok: false, playing: false, t: 0 };
      }, sel);
    const show = async (sel: string) => {
      await page.evaluate((s) => {
        document.documentElement.style.scrollBehavior = "auto";
        document.querySelector(s)?.scrollIntoView({ block: "center" });
      }, sel);
      await page.waitForTimeout(2000);
    };
    await page.goto("/funcionalidades");
    await show("#ventas video");
    for (let round = 0; round < 2; round++) {
      await page.locator('header a[href="/"]').first().click();
      await expect(page).toHaveURL(/\/$/);
      await page.goBack();
      await expect(page).toHaveURL(/funcionalidades/);
      for (const id of ["produccion", "ventas", "finanzas"]) {
        await show(`#${id} video`);
        const s = await state(`#${id} video`);
        expect(s.ok, `${id} video present`).toBe(true);
        expect(s.playing || s.t > 0, `${id} video playing`).toBe(true);
      }
    }
  });

  test("a valid request reaches a real confirmation and generate_lead", async ({ page }) => {
    await collectAnalytics(page);
    await page.goto(`http://localhost:${LEADS_PORT}/demo?intent=quote&plan=operaciones&source=pricing_operaciones`);
    await page.getByLabel("Nombre").fill("Ana Pérez");
    await page.getByLabel("Empresa", { exact: true }).fill("Fábrica Andina");
    await page.getByLabel("WhatsApp o teléfono").fill("987654321");
    await page.getByLabel("Correo").fill("ana@fabrica.pe");
    await page.getByLabel("Actividad de tu empresa").fill("Fabricamos jabones y champú");
    await page.getByRole("checkbox").check();
    await page.waitForTimeout(2600);
    await page.getByRole("button", { name: "Solicitar cotización" }).click();
    // Celebratory confirmation: modal with the request code and a WhatsApp link that carries it.
    const dialog = page.getByRole("dialog", { name: /Ya tenemos tu solicitud/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/plan Operaciones/)).toBeVisible();
    const code = (await dialog.locator("strong").first().textContent())?.trim() ?? "";
    expect(code).toMatch(/^TQ-[A-Z0-9]{6}$/);
    await expect(dialog.getByRole("link", { name: /WhatsApp con tu código/ })).toHaveAttribute("href", new RegExp(encodeURIComponent(code)));
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    // The inline confirmation stays, with the same code.
    await expect(page.getByRole("heading", { name: "Recibimos tu solicitud" })).toBeVisible();
    await expect(page.getByText(code).first()).toBeVisible();
    // Someone who already booked is never interrupted by the exit dialog.
    expect(await page.evaluate(() => localStorage.getItem("tq-lead-done"))).not.toBeNull();
    const seen = await events(page);
    const lead = seen.find((e) => e.event === "generate_lead");
    expect(lead?.params).toEqual({ form_id: "demo_request", source: "pricing_operaciones", lead_type: "quote", plan_id: "operaciones" });
    for (const pii of ["Ana", "Fábrica", "987654321", "ana@fabrica.pe", "jabones"]) expect(JSON.stringify(seen)).not.toContain(pii);
  });

  test("Compras e Importaciones shows one clip at a time through tabs", async ({ page }) => {
    await page.goto("/funcionalidades#compras");
    const tabs = page.getByRole("tablist", { name: /Compras e Importaciones/ });
    await expect(tabs.getByRole("tab", { name: "Compras" })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#compras video:visible")).toHaveCount(1);
    await tabs.getByRole("tab", { name: "Compras" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(tabs.getByRole("tab", { name: "Importaciones" })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#compras video:visible")).toHaveCount(1);
  });

  test("capabilities in development are not published", async ({ page }) => {
    await page.goto("/funcionalidades");
    const text = (await page.locator("main").textContent()) ?? "";
    // Feature pages list only verified capabilities: nothing "in development" or "coming soon".
    expect(text).not.toMatch(/en desarrollo|próximamente/i);
    await expect(page.getByText("Alcance", { exact: true })).toHaveCount(0);
  });
});
