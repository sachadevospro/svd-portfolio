import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CursorLabel } from "@/components/CursorLabel";
import { site, pages, hero, categories, absoluteUrl } from "@/lib/content";
import "./globals.css";

/* Archivo — a grotesque with a width axis, used wide for the name and labels. */
const sans = localFont({
  src: "../fonts/archivo-wdth.woff2",
  variable: "--font-sans",
  weight: "100 900",
  display: "swap",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});

/* Newsreader — an editorial serif with optical sizes, used for headings and long text. */
const serif = localFont({
  src: "../fonts/newsreader-opsz.woff2",
  variable: "--font-serif",
  weight: "200 800",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const ogImage = hero.photos[0]?.fallback;

export const metadata: Metadata = {
  metadataBase: site.siteUrl ? new URL(site.siteUrl) : undefined,
  title: {
    default: `${site.name} — ${site.title}`,
    template: `${site.name} — %s`,
  },
  description: pages.home.description,
  applicationName: site.name,
  authors: [{ name: site.name }],
  creator: site.name,
  keywords: [
    "photographer",
    "videographer",
    ...categories.map((c) => `${c.title.toLowerCase()} photography`),
    site.location,
  ],
  openGraph: {
    type: "website",
    siteName: site.name,
    title: `${site.name} — ${site.title}`,
    description: pages.home.description,
    locale: "en_GB",
    ...(site.siteUrl && ogImage ? { images: [{ url: ogImage, alt: `${site.name} — ${site.title}` }] } : {}),
  },
  twitter: { card: "summary_large_image" },
  alternates: absoluteUrl("/") ? { canonical: "/" } : undefined,
  formatDetection: { email: false, telephone: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const nav = categories.map((c) => ({ slug: c.slug, title: c.title, number: c.number, count: c.count }));
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Lets the CSS know JavaScript is available, so reveal effects never hide content without it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header name={site.name} categories={nav} email={site.email} social={site.social} />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <CursorLabel />
      </body>
    </html>
  );
}
