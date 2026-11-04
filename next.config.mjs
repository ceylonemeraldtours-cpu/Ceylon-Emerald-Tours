const DAY = 60 * 60 * 24;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false, // no "X-Powered-By: Next.js" banner

  images: {
    // Serve modern formats; browsers that cannot read them get the original.
    formats: ["image/avif", "image/webp"],
    // Optimised copies are cached for 30 days instead of the 60-second default.
    minimumCacheTTL: DAY * 30,
  },

  experimental: {
    // Import only the icons / animation helpers that are actually used.
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },

  async headers() {
    return [
      {
        // Security basics for every response. No CSP here on purpose: a strict policy needs
        // per-request nonces for Next.js inline scripts, and the tour pages embed Google Maps.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        // Photos in /public are not fingerprinted, so: cache for a day, then serve stale for up
        // to a week while the browser re-checks in the background. Rename a file when you
        // replace a photo that must change immediately.
        source: "/images/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${DAY}, stale-while-revalidate=${DAY * 7}` }],
      },
      {
        // Form endpoints must never be cached.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
};

export default nextConfig;
