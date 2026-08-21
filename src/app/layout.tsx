import type { Metadata, Viewport } from "next";
import { Quicksand, Fredoka } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import ScrollToTop from "@/components/ScrollToTop";
import {
  SITE_URL,
  SITE_NAME,
  jsonLd,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
  buildWebSiteSchema,
} from "@/lib/seo";
import "./globals.css";

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : null;

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://littlebunnies.co.in"),
  title: {
    default: "Little Bunnies — Premium Baby Products for 0–6 Months | India",
    template: "%s | Little Bunnies",
  },
  description:
    "Little Bunnies is India's premium baby essentials brand. Shop prams, strollers, diaper bags & utility bags — crafted with love for newborns aged 0–6 months. Free shipping above ₹5999.",
  applicationName: "Little Bunnies",
  authors: [{ name: "Little Bunnies", url: "https://littlebunnies.co.in" }],
  generator: "Next.js",
  creator: "Little Bunnies",
  publisher: "Little Bunnies",
  keywords: [
    // Brand
    "Little Bunnies",
    "littlebunnies",
    "little bunnies india",
    "littlebunnies.co.in",
    // Products
    "baby products india",
    "newborn essentials india",
    "baby prams india",
    "baby strollers india",
    "baby pram online",
    "stroller for newborn",
    "infant pram",
    "baby carrier",
    "diaper bag india",
    "multipurpose diaper bag",
    "baby feeding bottles",
    "baby skincare products",
    "baby clothing 0-6 months",
    "nursery essentials",
    "baby toys 0-6 months",
    "baby gifts india",
    // Intent
    "buy baby products online india",
    "premium baby brand india",
    "baby shop online india",
    "newborn shopping india",
    "0 to 6 months baby products",
    "infant care products",
    "best baby products india 2024",
    // City/Local
    "baby products mumbai",
    "baby shop mumbai",
    "baby products online delivery india",
  ],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://littlebunnies.co.in",
  },
  icons: {
    icon: [
      { url: "/images/logo-full.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/images/logo-full.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://littlebunnies.co.in",
    siteName: SITE_NAME,
    title: "Little Bunnies — Premium Baby Products for 0–6 Months",
    description:
      "India's premium baby essentials brand. Shop prams, strollers, diaper bags & utility bags — handpicked with love for your little one. Free shipping above ₹5999.",
    images: [
      {
        url: "https://littlebunnies.co.in/images/banner2.png",
        width: 1200,
        height: 630,
        alt: "Little Bunnies — Premium Baby Products India",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Little Bunnies — Premium Baby Products for 0–6 Months",
    description:
      "India's premium baby essentials brand. Shop prams, strollers, diaper bags & utility bags — handpicked with love for your little one.",
    images: [
      {
        url: "https://littlebunnies.co.in/images/banner2.png",
        alt: "Little Bunnies — Premium Baby Products India",
      },
    ],
    site: "@littlebunniesofficial",
    creator: "@littlebunniesofficial",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  // Google Search Console domain verification
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  }),
  // Geo / Local SEO
  other: {
    "geo.region": "IN-MH",
    "geo.placename": "Mumbai, Maharashtra, India",
    "geo.position": "19.0760;72.8777",
    ICBM: "19.0760, 72.8777",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FBF8F3",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en-IN" className={`${quicksand.variable} ${fredoka.variable}`}>
        <head>
          {/* DNS prefetch for performance */}
          {supabaseOrigin && (
            <>
              <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />
              <link rel="dns-prefetch" href={supabaseOrigin} />
            </>
          )}

          {/* ── Structured Data (JSON-LD) ───────────────────────────────── */}
          {/* Organization */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(buildOrganizationSchema()) }}
          />
          {/* LocalBusiness */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(buildLocalBusinessSchema()) }}
          />
          {/* WebSite with SearchAction */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(buildWebSiteSchema()) }}
          />
        </head>
        <body className="font-sans bg-cream text-ink antialiased overflow-x-hidden">
          <ScrollToTop />
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#FBF8F3",
                border: "1px solid rgba(36,50,74,0.1)",
                color: "#24324A",
                fontFamily: "var(--font-sans), sans-serif",
                borderRadius: "1rem",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
