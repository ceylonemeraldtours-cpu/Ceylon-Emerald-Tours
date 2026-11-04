import { ImageResponse } from "next/og";
import { getTourBySlug } from "@/data/toursData";

// Generates the 1200 x 630 preview image used by WhatsApp, Facebook, Instagram, X and others.
// Usage: /og?page=home | packages | gallery | transfers | custom-tour | <tour id>
// Only known pages are accepted, so the endpoint cannot be used to render arbitrary text.

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

const PAGES: Record<string, { title: string; subtitle: string }> = {
  home: {
    title: "Discover the Heart of Ceylon",
    subtitle: "Private tours, airport transfers and custom journeys across Sri Lanka",
  },
  packages: {
    title: "Tour Packages across Sri Lanka",
    subtitle: "From a single day in Ella to two weeks around the island",
  },
  gallery: {
    title: "Sri Lanka Photo Gallery",
    subtitle: "Destinations and happy guests from our private tours",
  },
  transfers: {
    title: "Airport Transfers in Sri Lanka",
    subtitle: "Private rides with a driver waiting when you land",
  },
  "custom-tour": {
    title: "Plan a Custom Sri Lanka Tour",
    subtitle: "Tell us your dates and interests. We plan the route.",
  },
};

function resolve(key: string): { title: string; subtitle: string } {
  const page = PAGES[key];
  if (page) return page;
  const tour = getTourBySlug(key);
  if (tour) return { title: tour.title, subtitle: `${tour.duration} private tour with Ceylon Emerald Tours` };
  return PAGES.home;
}

export function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("page") ?? "home";
  const { title, subtitle } = resolve(key);
  const big = title.length > 38;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          color: "#ffffff",
          background: "linear-gradient(135deg, #064e3b 0%, #022c22 70%)",
          borderBottom: "14px solid #fbbf24",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <path d="M16 2 28 12 16 30 4 12Z" fill="#064e3b" stroke="#fbbf24" strokeWidth="1.5" />
            <path
              d="M4 12h24M10 12l6 18 6-18M16 2l-6 10M16 2l6 10"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1"
              opacity="0.7"
            />
          </svg>
          <div style={{ display: "flex", marginLeft: 20, fontSize: 36, fontWeight: 700, letterSpacing: -0.5 }}>
            <span>Ceylon&nbsp;</span>
            <span style={{ color: "#fbbf24" }}>Emerald</span>
            <span>&nbsp;Tours</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: big ? 68 : 84,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -2,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", marginTop: 28, fontSize: 34, color: "#a7f3d0", maxWidth: 940 }}>{subtitle}</div>
        </div>

        {/* Footer line */}
        <div style={{ display: "flex", fontSize: 28, color: "#fbbf24", fontWeight: 600 }}>
          Bandarawela, Sri Lanka
        </div>
      </div>
    ),
    { ...SIZE }
  );
}
