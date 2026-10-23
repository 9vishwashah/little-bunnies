import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import PramsLandingClient from "./PramsLandingClient";
import { Product } from "@/types";
import {
  SITE_URL,
  jsonLd,
  buildFAQSchema,
  buildBreadcrumbSchema,
  productKind,
  productDisplayName,
} from "@/lib/seo";
import { PRAMS_FAQS } from "@/lib/seoContent";
import FaqSection from "@/components/seo/FaqSection";

const PAGE_TITLE = "Baby Prams & Strollers for Newborns Online India | Little Bunnies";
const PAGE_DESCRIPTION =
  "Little Bunnies baby prams & strollers — 360° rotating reversible seats, newborn recline, travel & twin strollers. Free shipping above ₹5,999.";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's title template (see about/page.tsx).
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/prams-strollers`,
  },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/prams-strollers`,
    siteName: "Little Bunnies",
    images: [
      {
        url: `${SITE_URL}/images/og/og-prams.jpg`,
        width: 1200,
        height: 630,
        alt: "Little Bunnies baby prams & strollers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [`${SITE_URL}/images/og/og-prams.jpg`],
  },
};

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
    // Everything that isn't a bag. Classified by category first (see
    // productKind) — matching words in the long product titles dropped Thanos,
    // Comfy Rider Pro and the Cabin Stroller (its title mentions a "Dust Proof Bag").
    const prams = allProducts.filter(
      (p) =>
        productKind({
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          categorySlug: p.categories?.slug,
        }) !== "bag"
    );

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

  const faqSchema = jsonLd(buildFAQSchema(PRAMS_FAQS));
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
      "Little Bunnies baby prams and strollers: 360° rotating reversible-seat strollers, lightweight travel strollers, a twin stroller and a newborn stroller with reversible handle.",
  });

  const itemListSchema = jsonLd({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Little Bunnies Baby Prams & Strollers",
    url: `${SITE_URL}/prams-strollers`,
    numberOfItems: prams.length,
    itemListElement: prams.map((product, idx) => {
      const img = product.product_images?.find((i) => i.is_primary)?.url || product.product_images?.[0]?.url || `${SITE_URL}/images/og/og-prams.jpg`;
      return {
        "@type": "ListItem",
        position: idx + 1,
        url: `${SITE_URL}/product/${product.slug}`,
        name: productDisplayName({
          name: product.name,
          slug: product.slug,
          brand: product.brand,
          categorySlug: product.categories?.slug,
        }),
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
      <FaqSection
        title="Baby Pram & Stroller FAQs"
        subtitle="Choosing, travelling with and buying a Little Bunnies stroller."
        faqs={PRAMS_FAQS}
      />
    </>
  );
}
