import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/** Served at /robots.txt. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Form endpoints are not pages. /og is left open on purpose so WhatsApp, Facebook and X
        // can fetch the preview image.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
