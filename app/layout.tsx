import type { Metadata, Viewport } from "next";
import { Manrope, Mona_Sans } from "next/font/google";
import { site } from "@/content/site";
import { seoDescription } from "@/lib/seo/schema";
import { AnalyticsListener } from "@/components/layout/AnalyticsListener";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ExitIntent } from "@/components/conversion/ExitIntent";
import { FloatingWhatsApp } from "@/components/conversion/FloatingWhatsApp";
import { CursorFollower } from "@/components/motion/CursorFollower";
import { MotionRuntime } from "@/components/motion/MotionRuntime";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
  weight: ["400", "500"],
});

/** Display face: Mona Sans, expanded, weight 500. */
const monaSans = Mona_Sans({
  subsets: ["latin"],
  variable: "--font-mona",
  display: "swap",
  axes: ["wdth"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} · ERP para empresas que producen en Perú`,
    template: `%s · ${site.name}`,
  },
  description: seoDescription,
  applicationName: site.name,
  category: "business software",
  creator: site.name,
  publisher: site.name,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9FAFB" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0F15" },
  ],
  colorScheme: "light dark",
};

/** Marks JS availability before paint so reveal styles never hide content without JS. */
const jsFlag = `document.documentElement.classList.add("js")`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-PE" className={`${manrope.variable} ${monaSans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body>
        <a className="skip-link" href="#contenido">
          Saltar al contenido
        </a>
        <SiteHeader />
        <main id="contenido" tabIndex={-1}>
          {children}
        </main>
        <SiteFooter />
        <FloatingWhatsApp />
        <ExitIntent />
        <MotionRuntime />
        <CursorFollower />
        <AnalyticsListener />
      </body>
    </html>
  );
}
