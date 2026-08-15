import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = "https://littlebunnies.co.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all active products
  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at, product_images(url)")
    .eq("is_active", true);

  // Fetch all active categories (top-level only — avoid noisy subcategory combos)
  const { data: categories } = await supabase
    .from("categories")
    .select("slug, updated_at")
    .eq("is_active", true)
    .is("parent_id", null); // Only top-level categories

  const now = new Date();

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/prams-strollers`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/prams`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/wholesale`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/work-for-us`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/shipping-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/returns`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/exchange-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    // /cart, /checkout, /account, /wishlist, /admin intentionally excluded —
    // they are disallowed in robots.ts.
  ];

  // ── Category pages ────────────────────────────────────────────────────────
  // Use canonical ?category= query format (as used by the products page).
  // These are only top-level categories; filter combinations are disallowed
  // in robots.ts to avoid duplicate content.
  const categoryUrls: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${BASE_URL}/products?category=${cat.slug}`,
    lastModified: cat.updated_at ? new Date(cat.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // ── Product pages ─────────────────────────────────────────────────────────
  const productUrls: MetadataRoute.Sitemap = (products || []).map((product: any) => ({
    url: `${BASE_URL}/product/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
    images: product.product_images?.length
      ? product.product_images.map((img: { url: string }) => img.url)
      : [`${BASE_URL}/images/LittleBunnies-Banner.png`],
  }));

  return [...staticUrls, ...categoryUrls, ...productUrls];
}
