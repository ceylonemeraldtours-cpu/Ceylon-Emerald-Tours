import type { Metadata } from "next";
import { SITE } from "@/lib/constants";

/** Public origin with no trailing slash. Set NEXT_PUBLIC_SITE_URL in production. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://ceylonemeraldtours.com").replace(/\/+$/, "");

export const SITE_TAGLINE = "Private Tours & Transfers in Sri Lanka";

export const DEFAULT_DESCRIPTION =
  "Private tours, airport transfers and custom journeys through Sri Lanka's hill country and beyond, planned by a local team in Bandarawela.";

export const DEFAULT_KEYWORDS = [
  "Sri Lanka tours",
  "private tours Sri Lanka",
  "Sri Lanka travel agency",
  "Bandarawela tour operator",
  "Ella day tour",
  "Sri Lanka airport transfer",
  "custom Sri Lanka itinerary",
  "hill country tours",
];

/** Absolute URL for a site path such as "/gallery". */
export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

interface PageSeo {
  /** Page title WITHOUT the brand suffix. The root layout template appends " | Ceylon Emerald Tours". */
  title: string;
  description: string;
  /** Path of this page, e.g. "/gallery". Used for the canonical URL and og:url. */
  path: string;
  keywords?: readonly string[];
  /**
   * Which branded preview image to use (see src/app/og/route.tsx): "home", "packages", "gallery",
   * "transfers", "custom-tour", or a tour id. Defaults to "home".
   */
  ogKey?: string;
}

/** Root-relative URL of the generated 1200x630 social preview. Resolved against metadataBase. */
export const ogImageUrl = (key = "home"): string => `/og?page=${encodeURIComponent(key)}`;

/**
 * One place that builds title, description, canonical, keywords, Open Graph and Twitter tags,
 * so every page stays consistent.
 */
export function buildMetadata({ title, description, path, keywords = [], ogKey = "home" }: PageSeo): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = `${title} | ${SITE.name}`;
  const images = [{ url: ogImageUrl(ogKey), width: 1200, height: 630, alt: `${title} | ${SITE.name}` }];

  return {
    title,
    description,
    keywords: [...keywords, ...DEFAULT_KEYWORDS],
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: SITE.name,
      locale: "en_US",
      url,
      title: fullTitle,
      description,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: images.map((i) => i.url),
    },
  };
}
