import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import HeroSection from "@/components/layout/home/HeroSection";
import CategorySection from "@/components/layout/home/CategorySection";
import TrustBadges from "@/components/layout/home/TrustBadges";
import ProductSection from "@/components/layout/home/ProductSection";
import Testimonials from "@/components/layout/home/Testimonials";
import WhyChooseUs from "@/components/layout/home/WhyChooseUs";
import ImageMaskText from "@/components/layout/home/ImageMaskText";
import { Product } from "@/types";
import { SITE_URL, jsonLd, buildFAQSchema, buildBreadcrumbSchema } from "@/lib/seo";
import { HOME_FAQS } from "@/lib/seoContent";
import FaqSection from "@/components/seo/FaqSection";
import HomeSeoContent from "@/components/seo/HomeSeoContent";

export const metadata: Metadata = {
  // Brand first, on purpose: this is the page people land on when they search
  // "little bunnies", and `absolute` bypasses the root layout's "%s | Little
  // Bunnies" template (the brand is already in the string).
  title: { absolute: "Little Bunnies | Baby Strollers, Prams & Diaper Bags Online India" },
  description:
    "Little Bunnies baby strollers, prams & diaper bags online in India — 360° reversible, travel & twin strollers. Free shipping above ₹5,999.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Little Bunnies | Baby Strollers, Prams & Diaper Bags Online India",
    description:
      "Shop Little Bunnies baby strollers, prams & diaper bags — 360° reversible, travel & twin strollers. Free shipping above ₹5,999.",
    url: SITE_URL,
    images: [
      {
        url: `${SITE_URL}/images/banner2.png`,
        width: 1200,
        height: 630,
        alt: "Little Bunnies — Baby Strollers, Prams & Diaper Bags India",
      },
    ],
  },
};

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select(
        `*, product_images(id, url, alt, is_primary, sort_order), categories(name, slug), product_variants(id, name, value, price_modifier, sku_suffix, image_url)`
      )
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("created_at", { ascending: false })
      .limit(10);

    return (data as unknown as Product[]) || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  const faqSchema = jsonLd(buildFAQSchema(HOME_FAQS));
  const breadcrumbSchema = jsonLd(buildBreadcrumbSchema([
    { name: "Home", url: SITE_URL },
  ]));

  return (
    <>
      {/* ── Structured Data for Rich Results ───────────────────────── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />

      <HeroSection />
      <CategorySection />
      <WhyChooseUs />

      {featured.length > 0 && (
        <ProductSection
          title="Featured Picks"
          subtitle="Handpicked products for your little one"
          badge="Editor's Choice"
          products={featured}
          viewAllHref="/prams-strollers"
          scrollable
        />
      )}

      <TrustBadges />
      <Testimonials />
      <HomeSeoContent />
      <FaqSection
        title="Frequently Asked Questions"
        subtitle="Shipping, payments, exchanges and what we make."
        faqs={HOME_FAQS}
      />
      <ImageMaskText />
    </>
  );
}
