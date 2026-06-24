import type { Metadata, Viewport } from "next";
import { Nunito, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-nunito",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://littlebunnies.in"),
  title: {
    default: "Little Bunnies — Premium Baby Products for 0-6 Months",
    template: "%s | Little Bunnies",
  },
  description:
    "Little Bunnies is India's premium baby essentials brand. Shop prams, strollers, diapers, feeding bottles, baby care, clothing, and nursery products crafted for newborns aged 0-6 months.",
  icons: {
    icon: "/images/logo-full.png",
    shortcut: "/images/logo-full.png",
    apple: "/images/logo-full.png",
  },
  keywords: [
    "baby products india",
    "newborn essentials",
    "baby prams",
    "baby strollers",
    "infant care",
    "baby clothing",
    "little bunnies",
    "0-6 months baby",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "Little Bunnies",
    title: "Little Bunnies — Premium Baby Products",
    description: "Premium baby essentials handpicked with love for your little one.",
    images: [{ url: "/images/logo-full.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Little Bunnies — Premium Baby Products",
    description: "Premium baby essentials handpicked with love for your little one.",
    images: ["/images/logo-full.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
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
      <html lang="en" className={`${nunito.variable} ${playfair.variable}`}>
        <body className="font-sans bg-cream text-ink antialiased">
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#FBF8F3",
                border: "1px solid rgba(36,50,74,0.1)",
                color: "#24324A",
                fontFamily: "Nunito, sans-serif",
                borderRadius: "1rem",
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
