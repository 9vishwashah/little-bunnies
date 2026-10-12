import type { Metadata } from "next";
import Link from "next/link";
import { Droplets, Baby, Link2, ScanLine, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ui/ProductCard";
import FaqSection from "@/components/seo/FaqSection";
import { Product } from "@/types";
import {
  SITE_URL,
  jsonLd,
  buildFAQSchema,
  buildBreadcrumbSchema,
  productKind,
  productDisplayName,
} from "@/lib/seo";
import { BAGS_FAQS } from "@/lib/seoContent";

// The intro hero above the bag grid is switched off (hidden, not deleted).
const SHOW_HERO = false;

const PAGE_TITLE = "Baby Diaper Bags & Backpacks Online India | Little Bunnies";
const PAGE_DESCRIPTION =
  "Little Bunnies diaper bags & backpacks — water-resistant, insulated bottle pockets, wet & dry pocket, stroller straps. Ships across India.";

export const metadata: Metadata = {
  // `absolute` bypasses the root layout's title template (brand is in the string).
  title: { absolute: PAGE_TITLE },
  description: PAGE_DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/diaper-bags` },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: `${SITE_URL}/diaper-bags`,
    siteName: "Little Bunnies",
    images: [
      {
        url: `${SITE_URL}/images/bags.png`,
        width: 1200,
        height: 630,
        alt: "Little Bunnies diaper bags & backpacks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    images: [`${SITE_URL}/images/bags.png`],
  },
};

const FEATURES = [
  {
    icon: Baby,
    title: "Insulated bottle pockets",
    text: "Keep milk, formula or water at the right temperature on long outings.",
  },
  {
    icon: Droplets,
    title: "Wet & dry separation",
    text: "A waterproof-lined pocket keeps damp clothes and bibs away from clean items.",
  },
  {
    icon: Link2,
    title: "Stroller straps",
    text: "Hang the bag from your stroller handle and keep both hands free.",
  },
  {
    icon: ScanLine,
    title: "Easy access & safety",
    text: "Wide doctor-style openings and anti-theft back pockets on selected styles.",
  },
];

async function getBagProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select(
        `*, product_images(id, url, alt, is_primary, sort_order), categories(id, name, slug), product_variants(id, name, value, price_modifier, sku_suffix, image_url)`
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    // Category-first (see productKind): matching "bag" anywhere in a title wrongly
    // pulled the Cabin Stroller ("... Dust Proof Bag ...") onto this page.
    return ((data as unknown as Product[]) || []).filter(
      (p) =>
        productKind({
          name: p.name,
          slug: p.slug,
          brand: p.brand,
          categorySlug: p.categories?.slug,
        }) === "bag"
    );
  } catch {
    return [];
  }
}

export default async function DiaperBagsPage() {
  const products = await getBagProducts();

  const breadcrumbSchema = jsonLd(
    buildBreadcrumbSchema([
      { name: "Home", url: SITE_URL },
      { name: "Diaper Bags", url: `${SITE_URL}/diaper-bags` },
    ])
  );
  const faqSchema = jsonLd(buildFAQSchema(BAGS_FAQS));
  const collectionSchema = jsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Little Bunnies Diaper Bags & Backpacks",
    url: `${SITE_URL}/diaper-bags`,
    description:
      "Little Bunnies diaper bags, diaper backpacks, duffle and utility bags with insulated bottle pockets, wet & dry compartments and stroller straps.",
  });
  const itemListSchema = jsonLd({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Little Bunnies Diaper Bags & Backpacks",
    url: `${SITE_URL}/diaper-bags`,
    numberOfItems: products.length,
    itemListElement: products.map((product, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      url: `${SITE_URL}/product/${product.slug}`,
      name: productDisplayName({
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        categorySlug: product.categories?.slug,
      }),
      image:
        product.product_images?.find((i) => i.is_primary)?.url ||
        product.product_images?.[0]?.url ||
        `${SITE_URL}/images/bags.png`,
    })),
  });

  return (
    <div className="min-h-screen bg-cream">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: collectionSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />

      {/* Hero — hidden, not deleted: set SHOW_HERO to true to bring it back.
          While hidden, a visually hidden <h1> keeps the page's main heading. */}
      {SHOW_HERO ? (
        <section className="relative overflow-hidden pt-10 pb-12 md:py-20 bg-gradient-to-b from-cream to-white border-b border-ink/5">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-peach-light/40 blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-sage-light/40 blur-3xl" />
          </div>
          <div className="section-container relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-ink leading-tight mb-6">
                Baby Diaper Bags &amp; Backpacks
                <span className="block text-peach-dark text-2xl sm:text-3xl md:text-4xl font-normal mt-2">
                  Water-Resistant, Organised &amp; Stroller-Ready
                </span>
              </h1>
              <p className="text-ink-light text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
                Little Bunnies diaper bags are built for real days out with a baby — large
                compartments for diapers, wipes and spare clothes, insulated pockets for bottles, a
                separate wet &amp; dry pocket, and straps to hang them from your stroller. Choose from
                diaper backpacks, a travel duffle and a compact everyday utility bag.
              </p>
              <a
                href="#all-bags"
                className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold shadow-soft-lg hover:shadow-soft-xl transition-all"
              >
                <span>Shop All Diaper Bags</span>
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </section>
      ) : (
        <h1 className="sr-only">Baby Diaper Bags &amp; Backpacks</h1>
      )}

      {/* Grid */}
      <section id="all-bags" className={SHOW_HERO ? "py-12 md:py-20 bg-cream" : "pt-8 pb-12 md:pt-12 md:pb-20 bg-cream"}>
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-3">
              Our Diaper Bags &amp; Utility Bags
            </h2>
            <p className="text-ink-light text-sm md:text-base">
              Free shipping across India on orders above ₹5,999.
            </p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-ink/5">
              <p className="text-ink-light font-medium">
                No bags are currently available online. Please contact us via WhatsApp at +91 89760 77070.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* What to look for */}
      <section className="py-12 md:py-20 bg-white">
        <div className="section-container">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-ink mb-3">
              What Makes a Good Diaper Bag
            </h2>
            <p className="text-ink-light text-sm md:text-base">
              The details we designed our bags around.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="bg-cream p-6 md:p-8 rounded-[2rem] border border-ink/5 hover:shadow-soft transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-peach-light/70 text-peach-dark flex items-center justify-center mb-5">
                    <Icon size={24} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-ink mb-2">{f.title}</h3>
                  <p className="text-sm text-ink-light leading-relaxed">{f.text}</p>
                </div>
              );
            })}
          </div>

          <p className="text-center text-ink-light text-sm md:text-base mt-10">
            Pairing a bag with a new ride?{" "}
            <Link href="/prams-strollers" className="font-bold text-ink underline underline-offset-4 hover:text-peach-dark">
              Explore Little Bunnies baby prams &amp; strollers
            </Link>
            .
          </p>
        </div>
      </section>

      <FaqSection
        title="Diaper Bag FAQs"
        subtitle="Materials, features, stroller compatibility and delivery."
        faqs={BAGS_FAQS}
      />
    </div>
  );
}
