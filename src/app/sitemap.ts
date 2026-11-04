import type { MetadataRoute } from "next";
import { tours } from "@/data/toursData";
import { absoluteUrl } from "@/lib/seo";

// Bump this date when page content changes in a meaningful way. Search engines use it to decide
// what to re-crawl, so it should not simply be "now".
const CONTENT_UPDATED = new Date("2026-11-03");

/** Served at /sitemap.xml. Tour pages are generated from src/data/toursData.ts. */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/packages"), changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/gallery"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/transfers"), changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/custom-tour"), changeFrequency: "monthly", priority: 0.8 },
  ];

  const tourPages: MetadataRoute.Sitemap = tours.map((tour) => ({
    url: absoluteUrl(`/packages/${tour.id}`),
    changeFrequency: "monthly",
    priority: tour.type === "multi-day" ? 0.8 : 0.7,
  }));

  return [...pages, ...tourPages].map((entry) => ({ ...entry, lastModified: CONTENT_UPDATED }));
}
