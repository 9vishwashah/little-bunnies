import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import HeroSection from "@/components/layout/home/HeroSection";
import CategorySection from "@/components/layout/home/CategorySection";
import TrustBadges from "@/components/layout/home/TrustBadges";
import ProductSection from "@/components/layout/home/ProductSection";
import PromoBanner from "@/components/layout/home/PromoBanner";
import Testimonials from "@/components/layout/home/Testimonials";
import WhyChooseUs from "@/components/layout/home/WhyChooseUs";
import ImageMaskText from "@/components/layout/home/ImageMaskText";
import { Product } from "@/types";

export const metadata: Metadata = {
  title: "Little Bunnies — Premium Baby Products for 0-6 Months",
  description:
    "Shop premium baby essentials — prams, diapers, feeding bottles, clothing, nursery & more. Free shipping above ₹5999. Trusted by 10,000+ parents.",
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

  return (
    <>
      <HeroSection />
      <CategorySection />
      <WhyChooseUs />

      {featured.length > 0 && (
        <ProductSection
          title="Featured Picks"
          subtitle="Handpicked products for your little one"
          badge="Editor's Choice"
          products={featured}
          viewAllHref="/products?featured=true"
          scrollable
        />
      )}

      <PromoBanner />

      <TrustBadges />
      <Testimonials />
      <ImageMaskText />
    </>
  );
}
