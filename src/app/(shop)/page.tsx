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

export const metadata: Metadata = {
  // No "| Little Bunnies" suffix here — the root layout's title.template
  // ("%s | Little Bunnies") appends it automatically; adding it here too
  // would render a duplicated "| Little Bunnies | Little Bunnies" title.
  title: "Premium Baby Strollers, Diaper Bags & Baby Essentials",
  description:
    "Shop premium baby strollers, diaper bags & everyday baby essentials online in India. Designed for effortless, everyday parenting. Free shipping above ₹5999.",
  alternates: {
    canonical: "https://littlebunnies.co.in",
  },
  openGraph: {
    title: "Premium Baby Strollers, Diaper Bags & Baby Essentials | Little Bunnies",
    description:
      "India's favourite baby essentials brand. Shop premium strollers, diaper bags & more — designed for effortless everyday parenting. Free shipping above ₹5999.",
    url: "https://littlebunnies.co.in",
    images: [
      {
        url: "https://littlebunnies.co.in/images/banner2.png",
        width: 1200,
        height: 630,
        alt: "Little Bunnies — Premium Baby Strollers & Essentials India",
      },
    ],
  },
};

const homeFAQs = [
  {
    question: "What age group are Little Bunnies products designed for?",
    answer:
      "Little Bunnies products are specially curated for newborns and babies aged 0–6 months, ensuring maximum safety and comfort.",
  },
  {
    question: "Does Little Bunnies offer free shipping?",
    answer:
      "Yes! We offer free shipping on all orders above ₹5999 across India. Orders below ₹5999 attract a flat shipping fee of ₹79.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Standard delivery takes 7–15 business days. Most orders arrive within 7–10 business days after dispatch.",
  },
  {
    question: "What baby products does Little Bunnies sell?",
    answer:
      "We sell a wide range of baby essentials including prams, strollers, diaper bags, feeding bottles, baby skincare, clothing, nursery products, and more — all crafted for 0–6 month old babies.",
  },
  {
    question: "Are Little Bunnies products safe for newborns?",
    answer:
      "Absolutely. All our products comply with applicable Indian safety standards and are tested for newborn safety. We carefully curate every product with safety as the top priority.",
  },
  {
    question: "Can I return a product?",
    answer:
      "Yes! You have 15 days from the date of delivery to initiate a return for eligible products. Contact us via WhatsApp at +91 89760 77070.",
  },
];

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

  const faqSchema = jsonLd(buildFAQSchema(
    homeFAQs.map((f) => ({ question: f.question, answer: f.answer }))
  ));
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
          viewAllHref="/products?category=prams"
          scrollable
        />
      )}

      <TrustBadges />
      <Testimonials />
      <ImageMaskText />
    </>
  );
}
