import type { Metadata, Viewport } from "next";
import { Quicksand, Fredoka } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import ScrollToTop from "@/components/ScrollToTop";
import { SITE_URL, jsonLd } from "@/lib/seo";
import "./globals.css";

const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : null;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Little Bunnies",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo-full.png`,
  sameAs: [
    "https://www.instagram.com/littlebunniesofficial",
    "https://www.facebook.com/share/1D5pdMpchM/",
    "https://wa.me/918976077070",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Little Bunnies",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/products?search={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://littlebunnies.co.in"),
  title: {
    default: "Little Bunnies — Premium Baby Products for 0-6 Months",
    template: "%s | Little Bunnies",
  },
  description:
    "Little Bunnies is India's premium baby essentials brand. Shop prams, strollers, diapers, feeding bottles, baby care, clothing, and nursery products crafted for newborns aged 0-6 months.",
  applicationName: "Little Bunnies",
  authors: [{ name: "Little Bunnies" }],
  generator: "Next.js",
  creator: "Little Bunnies",
  publisher: "Little Bunnies",
  keywords: [
    "Little Bunnies",
    "little bunnies",
    "little bunnies india",
    "baby products india",
    "newborn essentials",
    "baby prams",
    "baby strollers",
    "infant care",
    "baby clothing",
    "0-6 months baby",
  ],
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/images/logo-full.png",
    shortcut: "/images/logo-full.png",
    apple: "/images/logo-full.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName: "Little Bunnies",
    title: "Little Bunnies — Premium Baby Products for 0-6 Months",
    description:
      "India's premium baby essentials brand. Shop prams, strollers, diapers, feeding bottles & more — handpicked with love for your little one.",
    images: [
      {
        url: "/images/LittleBunnies-Banner.png",
        width: 1200,
        height: 630,
        alt: "Little Bunnies — Premium Baby Products",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Little Bunnies — Premium Baby Products for 0-6 Months",
    description:
      "India's premium baby essentials brand. Shop prams, strollers, diapers, feeding bottles & more — handpicked with love for your little one.",
    images: [
      {
        url: "/images/LittleBunnies-Banner.png",
        width: 1200,
        height: 630,
        alt: "Little Bunnies — Premium Baby Products",
      },
    ],
  },
  // Set NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION in .env.local with the code
  // from Google Search Console — omitted entirely until then, since an
  // unset placeholder here would just render a meaningless meta tag.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  }),
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1, "max-snippet": -1 },
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
      <html lang="en" className={`${quicksand.variable} ${fredoka.variable}`}>
        <head>
          {supabaseOrigin && (
            <>
              <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />
              <link rel="dns-prefetch" href={supabaseOrigin} />
            </>
          )}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: jsonLd(websiteJsonLd) }}
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
