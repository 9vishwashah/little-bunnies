// Hardcoded on purpose. This was `process.env.NEXT_PUBLIC_APP_URL`, and the value
// configured on the host had an `http://` scheme — so every canonical, og:url and
// JSON-LD URL on the live site said http://, contradicting the https site Google
// actually crawls. SEO URLs must never depend on a deploy-time env var.
export const SITE_URL = "https://littlebunnies.co.in";
export const SITE_NAME = "Little Bunnies";
export const SITE_LEGAL_NAME = "Little Bunnies Creations LLP";
export const SITE_TAGLINE = "Premium Baby Strollers, Diaper Bags & Baby Essentials";
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
      "Little Bunnies is India's premium baby essentials brand. Shop prams, strollers, diaper bags, and utility bags crafted for newborns and growing babies.",
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo-full.png`,
    image: `${SITE_URL}/images/og/og-default.jpg`,
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
            url: `${SITE_URL}/diaper-bags`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Utility Bags",
            url: `${SITE_URL}/products?category=utility-bags`,
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
    legalName: SITE_LEGAL_NAME,
    alternateName: ["LittleBunnies", "Little Bunnies India", "littlebunnies.co.in"],
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/logo-full.png`,
      width: 512,
      height: 512,
    },
    image: `${SITE_URL}/images/og/og-default.jpg`,
    description:
      "India's premium baby essentials brand — prams, strollers, diaper bags & utility bags for newborns and growing babies.",
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

const KEEP_UPPER = new Set(["USB", "LED", "UV", "UPF"]);

/** "COCOON PLUS " → "Cocoon Plus", "Two WAY HANDLE" → "Two Way Handle" (acronyms like USB kept). */
function tidyCase(text: string): string {
  return text
    .trim()
    .split(/\s+/)
    .map((w) =>
      w.length >= 3 && w === w.toUpperCase() && !KEEP_UPPER.has(w)
        ? w.charAt(0) + w.slice(1).toLowerCase()
        : w
    )
    .join(" ");
}

export type ProductKind = "stroller" | "bag" | "other";

/** Every bag lives in one of these two categories; every other category here is a stroller range. */
const BAG_CATEGORIES = new Set(["bags", "utility-bags"]);

/**
 * Classifies a product as a stroller/pram or a bag. The category is
 * authoritative. Only when it doesn't settle the question do we fall back to
 * wording — and then the slug and brand outrank the long marketing title,
 * because a stroller's title can mention a feature like a "Dust Proof Bag"
 * (the Cabin Stroller does) without the product being a bag.
 */
export function productKind(p: { name: string; slug: string; brand?: string | null; categorySlug?: string | null }): ProductKind {
  const cat = (p.categorySlug || "").toLowerCase();
  if (BAG_CATEGORIES.has(cat)) return "bag";
  if (/stroller|pram|travel-pro|premium|magic|egg|reversible/.test(cat)) return "stroller";

  const head = `${p.slug} ${p.brand || ""}`.toLowerCase();
  const title = p.name.toLowerCase();
  if (/stroller|pram/.test(head)) return "stroller";
  if (/diaper|backpack|duffle|\bbags?\b/.test(head)) return "bag";
  if (/stroller|pram/.test(title)) return "stroller";
  if (/diaper|backpack|duffle|\bbags?\b/.test(title)) return "bag";
  return "other";
}

/**
 * Clean, searchable product name for titles, structured data and image alt text.
 * `name` in this catalog is a pipe-separated feature list and `brand` is a short
 * model name ("Eco Pro"), so neither works as-is: this yields e.g.
 * "Little Bunnies Eco Pro Baby Stroller" / "Little Bunnies Duffle Bag".
 */
export function productDisplayName(p: { name: string; slug: string; brand?: string | null; categorySlug?: string | null }): string {
  if (!p.brand || !p.brand.trim()) return p.name;
  const model = tidyCase(p.brand);
  const base = `Little Bunnies ${model}`;
  if (/stroller|pram|bag|backpack/i.test(model)) return base;
  const kind = productKind(p);
  if (kind === "stroller") return `${base} Baby Stroller`;
  if (kind === "bag") return `${base} Diaper Bag`;
  return base;
}
