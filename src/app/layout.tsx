import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Quicksand, Fredoka } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import ScrollToTop from "@/components/ScrollToTop";
import MetaPixelRouteTracker from "@/components/analytics/MetaPixelRouteTracker";
import { META_PIXEL_ID } from "@/lib/meta-pixel";
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
    "Little Bunnies makes baby strollers, prams, diaper bags & utility bags. Shop 360° reversible, travel and twin strollers online in India. Free shipping above ₹5,999.",
  applicationName: "Little Bunnies",
  authors: [{ name: "Little Bunnies", url: "https://littlebunnies.co.in" }],
  generator: "Next.js",
  creator: "Little Bunnies",
  publisher: "Little Bunnies",
  keywords: [
    "Little Bunnies",
    "littlebunnies",
    "little bunnies india",
    "littlebunnies.co.in",
    "baby stroller india",
    "baby prams india",
    "new born stroller",
    "comfy rider stroller",
    "travel stroller for baby",
    "twin stroller india",
    "diaper bag india",
    "baby diaper backpack",
  ],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
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

          {/* ── Meta Pixel Code ──────────────────────────────────────────
              Meta's official base code, inline in <head> per their setup
              docs. It fires the first PageView itself;
              MetaPixelRouteTracker handles later client-side navigations.
              All other events go through src/lib/meta-pixel.ts. */}
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`,
            }}
          />
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
          {/* ── End Meta Pixel Code ── */}
        </head>
        <body className="font-sans bg-cream text-ink antialiased overflow-x-hidden">
          <Suspense fallback={null}>
            <MetaPixelRouteTracker />
          </Suspense>
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
