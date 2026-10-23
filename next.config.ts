import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Netlify-compatible output
  output: "standalone",

  // Disable x-powered-by header
  poweredByHeader: false,

  // Compress responses
  compress: true,

  images: {
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    formats: ["image/avif", "image/webp"],
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jspszcrdxenulgcoziir.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
    ],
  },

  // Cache static assets aggressively — production only
  // (In dev, immutable caching breaks Turbopack hot reload)
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" },
        ],
      },
    ];
  },

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "react-icons",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
    ],
  },

  async redirects() {
    return [
      // ── Duplicate / legacy URLs → the one canonical page per topic ──────────
      // /prams was a byte-for-byte copy of /prams-strollers (Google reported it
      // as an "alternate page with canonical").
      { source: "/prams", destination: "/prams-strollers", permanent: true },
      // /products?category=prams|strollers|bags → landing pages: see src/proxy.ts

      // ── Product slug clean-ups (junk / mixed-case slugs → readable lowercase).
      // New slugs deliberately differ by more than case: Next matches redirect
      // sources case-insensitively, so a case-only rename would redirect to itself.
      { source: "/product/color", destination: "/product/color-blocked-diaper-bag", permanent: true },
      { source: "/product/Multipurpose-Quilted-Diaper-Bag", destination: "/product/quilted-multipurpose-diaper-bag", permanent: true },
      { source: "/product/Flap-check-bag", destination: "/product/flap-check-diaper-bag", permanent: true },
      { source: "/product/Comfy-Rider-Lite", destination: "/product/comfy-rider-lite-stroller", permanent: true },

      {
        source: "/strollers",
        destination: "/prams-strollers",
        permanent: true,
      },
      {
        source: "/baby-prams-strollers",
        destination: "/prams-strollers",
        permanent: true,
      },
      {
        source: "/pram",
        destination: "/prams-strollers",
        permanent: true,
      },
      {
        source: "/comfy-rider-pro",
        destination:
          "/product/little-bunnies-comfy-rider-pro-baby-stroller-360-rotating-reversible-seat-ultra-lightweight-aluminium-frame-upf-50-canopy-one-touch-fold-travel-friendly",
        permanent: true,
      },
      {
        source: "/product/comfy-rider-pro",
        destination:
          "/product/little-bunnies-comfy-rider-pro-baby-stroller-360-rotating-reversible-seat-ultra-lightweight-aluminium-frame-upf-50-canopy-one-touch-fold-travel-friendly",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

// Cache bust: Force Next.js dev server restart to clear stale Turbopack RSC cache
