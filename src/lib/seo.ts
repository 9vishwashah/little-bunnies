export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://littlebunnies.co.in";
export const SITE_NAME = "Little Bunnies";
export const SITE_TAGLINE = "Premium Baby Products for 0–6 Months";
export const SITE_PHONE = "+91 89760 77070";
export const SITE_EMAIL = "support@littlebunnies.co.in";
export const SITE_WHATSAPP = "918976077070";
export const SITE_INSTAGRAM = "https://www.instagram.com/littlebunniesofficial";
export const SITE_FACEBOOK = "https://www.facebook.com/share/1D5pdMpchM/";

/**
 * Serializes a JSON-LD object for a <script type="application/ld+json"> tag.
 * Escapes "<" so a value containing "</script>" can't break out of the tag.
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Strips HTML tags for use in plain-text contexts (JSON-LD description, etc). */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Truncate a string to a max number of characters, appending "…" if cut. */
export function truncateSeo(text: string, max: number): string {
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

/**
 * LocalBusiness JSON-LD schema for Little Bunnies.
 * Used in root layout and contact page.
 */
export function buildLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "Store"],
    name: SITE_NAME,
    description:
      "Little Bunnies is India's premium baby essentials brand. Shop prams, strollers, diapers, feeding bottles, baby care, clothing, and nursery products crafted for newborns aged 0–6 months.",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo-full.png`,
    image: `${SITE_URL}/images/LittleBunnies-Banner.png`,
    telephone: SITE_PHONE,
    email: SITE_EMAIL,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, Credit Card, UPI, Net Banking",
    address: {
      "@type": "PostalAddress",
      addressCountry: "IN",
      addressRegion: "Maharashtra",
      addressLocality: "Mumbai",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "19.0760",
      longitude: "72.8777",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "18:00",
      },
    ],
    sameAs: [SITE_INSTAGRAM, SITE_FACEBOOK, `https://wa.me/${SITE_WHATSAPP}`],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Baby Products & Essentials",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Baby Prams & Strollers",
            url: `${SITE_URL}/prams-strollers`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Diaper Bags",
            url: `${SITE_URL}/products?category=bags`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Baby Clothing",
            url: `${SITE_URL}/products?category=clothing`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Feeding Bottles & Accessories",
            url: `${SITE_URL}/products?category=feeding`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Baby Skincare",
            url: `${SITE_URL}/products?category=skincare`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Nursery Essentials",
            url: `${SITE_URL}/products?category=nursery`,
          },
        },
      ],
    },
  };
}

/**
 * Organization JSON-LD schema.
 */
export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/logo-full.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/images/LittleBunnies-Banner.png`,
    description:
      "India's premium baby essentials brand — prams, diapers, feeding bottles, baby clothing & nursery products for newborns 0–6 months.",
    telephone: SITE_PHONE,
    email: SITE_EMAIL,
    foundingDate: "2024",
    areaServed: "IN",
    sameAs: [SITE_INSTAGRAM, SITE_FACEBOOK, `https://wa.me/${SITE_WHATSAPP}`],
  };
}

/**
 * WebSite JSON-LD with sitelinks searchbox.
 */
export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: `${SITE_NAME} — ${SITE_TAGLINE}`,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * FAQPage JSON-LD schema.
 */
export function buildFAQSchema(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ question, answer }) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
  };
}

/**
 * BreadcrumbList JSON-LD schema.
 */
export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * ItemList JSON-LD schema for product listing pages.
 */
export function buildItemListSchema(
  items: Array<{ name: string; url: string; image?: string; price?: number }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Baby Products — Little Bunnies",
    url: `${SITE_URL}/products`,
    itemListElement: items.slice(0, 20).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: item.url,
      name: item.name,
      image: item.image,
    })),
  };
}
