import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import CookieConsent from "@/components/CookieConsent";
import JsonLd from "@/components/JsonLd";
import ScrollToTop from "@/components/ScrollToTop";
import PageLoader from "@/components/PageLoader";
import { SITE } from "@/lib/constants";
import { DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS, SITE_TAGLINE, SITE_URL, ogImageUrl } from "@/lib/seo";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Figtree({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const DEFAULT_TITLE = `${SITE.name} | ${SITE_TAGLINE}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s | ${SITE.name}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  publisher: SITE.name,
  category: "travel",
  formatDetection: { telephone: false, email: false, address: false },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_US",
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: ogImageUrl("home"), width: 1200, height: 630, alt: DEFAULT_TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [ogImageUrl("home")],
  },
};

export const viewport: Viewport = {
  themeColor: "#022c22",
  width: "device-width",
  initialScale: 1,
};

const TRAVEL_AGENCY_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "TravelAgency",
  name: SITE.name,
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  email: SITE.email,
  telephone: SITE.phoneTel,
  image: `${SITE_URL}${ogImageUrl("home")}`,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Gedara arawa halpe, hela halpe",
    addressLocality: "Bandarawela",
    addressCountry: "LK",
  },
  areaServed: { "@type": "Country", name: "Sri Lanka" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <Suspense fallback={null}>
          <PageLoader>
            {children}
            <ScrollToTop />
            <CookieConsent />
            <JsonLd data={TRAVEL_AGENCY_SCHEMA} />
          </PageLoader>
        </Suspense>
      </body>
    </html>
  );
}