import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PramsLandingClient from "./PramsLandingClient";
import { Product } from "@/types";
import { SITE_URL, jsonLd, buildFAQSchema, buildBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Little Bunnies Prams & Strollers — 360° Reversible & Ultra Lightweight | India",
  description:
    "Shop India's favourite baby prams and strollers including the Little Bunnies Comfy Rider Pro with 360° rotating reversible seat, ultra lightweight aluminium frame, UPF 50++ canopy, and one-touch fold. Free shipping above ₹5999.",
  keywords: [
    "Little Bunnies Pram",
    "Little Bunnies Prams",
    "Little Bunnies Comfy Rider Pro",
    "Comfy Rider Pro Stroller",
    "Comfy Rider Pro pram",
    "360 rotating reversible seat stroller",
    "ultra lightweight baby stroller",
    "baby stroller india",
    "newborn pram online",
    "travel friendly baby stroller india",
    "best baby stroller india",
  ],
  alternates: {
    canonical: `${SITE_URL}/prams-strollers`,
  },
  openGraph: {
    title: "Little Bunnies Prams & Strollers — 360° Reversible & Ultra Lightweight",
    description:
      "Shop India's favourite baby prams and strollers including the Comfy Rider Pro. Ultra lightweight aluminium frame, UPF 50++ canopy, and 360° rotating reversible seat.",
    url: `${SITE_URL}/prams-strollers`,
    siteName: "Little Bunnies",
    images: [
      {
        url: `${SITE_URL}/images/pram.png?v=2`,
        width: 1200,
        height: 630,
        alt: "Little Bunnies Prams & Strollers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Little Bunnies Prams & Strollers — 360° Reversible & Ultra Lightweight",
    description:
      "Shop India's favourite baby prams and strollers including the Comfy Rider Pro.",
    images: [`${SITE_URL}/images/pram.png?v=2`],
  },
};

const PRAM_FAQS = [
  {
    question: "Why is Little Bunnies Comfy Rider Pro the best baby stroller in India?",
    answer:
      "The Little Bunnies Comfy Rider Pro combines a 360° swivel seat, an ultra-lightweight aircraft-grade aluminium frame, all-terrain shock absorption, and a UPF 50++ canopy. It is designed to grow with your baby from 0–6 months and beyond while making travel effortless for parents.",
  },
  {
    question: "Can the seat rotate 360 degrees on Little Bunnies prams?",
    answer:
      "Yes! Our flagship Comfy Rider Pro features a 360-degree rotating reversible seat that lets your baby face you for bonding or face forward to explore the world, all with simple one-touch rotation.",
  },
  {
    question: "Are Little Bunnies prams and strollers travel-friendly?",
    answer:
      "Absolutely. Our prams are designed with a one-touch compact fold that collapses instantly. They are ultra-lightweight and compact enough to fit in car boots and are ideal for airport travel.",
  },
  {
    question: "What safety standards do Little Bunnies strollers meet?",
    answer:
      "Every Little Bunnies pram is equipped with a 5-point safety harness, reliable rear-wheel foot brakes, and anti-shock wheels tested for Indian road conditions to ensure complete newborn protection.",
  },
  {
    question: "Is there warranty and free shipping on Little Bunnies prams?",
    answer:
      "Yes! We provide free insured shipping across India on all orders above ₹5999, along with dedicated WhatsApp customer support (+91 89760 77070) and 15-day return eligibility.",
  },
  {
    question: "Which age group can use Little Bunnies prams?",
    answer:
      "Our prams and strollers are crafted with ergonomic full-recline support specifically tested for newborns aged 0–6 months, while offering durable construction suitable for toddlers.",
  },
];

async function getPramsProducts(): Promise<{ prams: Product[]; comfyRiderPro: Product | null }> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select(
        `*, product_images(id, url, alt, is_primary, sort_order), categories(id, name, slug), product_variants(id, name, value, price_modifier, sku_suffix, image_url)`
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    const allProducts = (data as unknown as Product[]) || [];
    const prams = allProducts.filter((p) => {
      const slug = p.categories?.slug?.toLowerCase() || "";
      const name = p.name.toLowerCase();
      const isBag =
        slug === "bags" ||
        slug === "utility-bags" ||
        name.includes("diaper") ||
        name.includes("bag") ||
        name.includes("backpack");
      if (isBag) return false;
      return (
        slug === "prams" ||
        slug === "strollers" ||
        name.includes("pram") ||
        name.includes("stroller") ||
        name.includes("comfy rider")
      );
    });

    const comfyRiderPro =
      prams.find((p) =>
        p.slug.includes("comfy-rider-pro") || p.name.toLowerCase().includes("comfy rider")
      ) ||
      allProducts.find((p) =>
        p.slug.includes("comfy-rider-pro") || p.name.toLowerCase().includes("comfy rider")
      ) ||
      null;

    return { prams, comfyRiderPro };
  } catch {
    return { prams: [], comfyRiderPro: null };
  }
}

export default async function PramsStrollersPage() {
  const { prams, comfyRiderPro } = await getPramsProducts();

  const faqSchema = jsonLd(buildFAQSchema(PRAM_FAQS));
  const breadcrumbSchema = jsonLd(
    buildBreadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Products", url: `${SITE_URL}/products` },
      { name: "Prams & Strollers", url: `${SITE_URL}/prams-strollers` },
    ])
  );

  const collectionSchema = jsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Little Bunnies Baby Prams & Strollers Collection",
    url: `${SITE_URL}/prams-strollers`,
    description:
      "Explore India's most trusted baby prams and strollers including the Little Bunnies Comfy Rider Pro with 360° rotating reversible seat, ultra-lightweight aluminium frame, UPF 50++ canopy, and one-touch fold.",
  });

  const itemListSchema = jsonLd({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Little Bunnies Baby Prams & Strollers",
    url: `${SITE_URL}/prams-strollers`,
    numberOfItems: prams.length,
    itemListElement: prams.map((product, idx) => {
      const img = product.product_images?.find((i) => i.is_primary)?.url || product.product_images?.[0]?.url || `${SITE_URL}/images/pram.png?v=2`;
      return {
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE_URL}/product/${product.slug}`,
        name: product.name,
        image: img,
      };
    }),
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: collectionSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListSchema }} />
      <PramsLandingClient products={prams} comfyRiderPro={comfyRiderPro} />
    </>
  );
}
