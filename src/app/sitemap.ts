import { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/seo";
import { canonicalProductSlug } from "@/lib/productSlugs";

// Last meaningful edit to the informational pages (about, policies, FAQ…).
// Google only trusts <lastmod> when it's accurate, so this is a fixed date to
// bump when those pages change — NOT `new Date()`, which would claim every
// page changed on every crawl and teach Google to ignore the field entirely.
const STATIC_PAGES_LASTMOD = new Date("2026-10-12");

// Categories that have their own landing page (and 308-redirect from the
// ?category= URL) — listing them here too would advertise redirects.
const LANDING_PAGE_CATEGORIES = new Set(["prams", "strollers", "bags"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all active products
  const { data: products } = await supabase
    .from("products")
    .select("slug, updated_at, category_id, product_images(url)")
    .eq("is_active", true);

  // Top-level categories only — avoid noisy subcategory combos — plus each
  // one's children (a top-level category counts as non-empty if either has
  // products).
  const { data: categories } = await supabase
    .from("categories")
    .select("id, slug, updated_at, children:categories!parent_id(id)")
    .eq("is_active", true)
    .is("parent_id", null);

  // A category with no active products renders "No products found" — Google
  // crawls it, finds nothing useful, and declines to index it.
  const categoryIdsWithProducts = new Set(
    (products || []).map((p: { category_id: string | null }) => p.category_id).filter(Boolean)
  );

  // The catalog changed whenever any product did — a truthful lastmod for the
  // pages that list products.
  const catalogUpdatedAt = (products || []).reduce((latest: Date, p: { updated_at?: string }) => {
    const d = p.updated_at ? new Date(p.updated_at) : null;
    return d && d > latest ? d : latest;
  }, STATIC_PAGES_LASTMOD);

  // ── Core pages ────────────────────────────────────────────────────────────
  const staticUrls: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: catalogUpdatedAt, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/prams-strollers`, lastModified: catalogUpdatedAt, changeFrequency: "weekly", priority: 0.95 },
    { url: `${SITE_URL}/diaper-bags`, lastModified: catalogUpdatedAt, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/products`, lastModified: catalogUpdatedAt, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: STATIC_PAGES_LASTMOD, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: STATIC_PAGES_LASTMOD, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/faq`, lastModified: STATIC_PAGES_LASTMOD, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/wholesale`, lastModified: STATIC_PAGES_LASTMOD, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/work-for-us`, lastModified: STATIC_PAGES_LASTMOD, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/shipping-policy`, lastModified: STATIC_PAGES_LASTMOD, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/returns`, lastModified: STATIC_PAGES_LASTMOD, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/exchange-policy`, lastModified: STATIC_PAGES_LASTMOD, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacy-policy`, lastModified: STATIC_PAGES_LASTMOD, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms`, lastModified: STATIC_PAGES_LASTMOD, changeFrequency: "yearly", priority: 0.2 },
    // /cart, /checkout, /account, /wishlist, /admin, /exchange-request are
    // intentionally excluded — private or utility pages.
  ];

  // ── Other category pages (e.g. utility bags) ─────────────────────────────
  const categoryUrls: MetadataRoute.Sitemap = (categories || [])
    .filter(
      (cat: { id: string; slug: string; children?: { id: string }[] }) =>
        !LANDING_PAGE_CATEGORIES.has(cat.slug) &&
        [cat.id, ...(cat.children || []).map((c) => c.id)].some((id) => categoryIdsWithProducts.has(id))
    )
    .map((cat) => ({
      url: `${SITE_URL}/products?category=${cat.slug}`,
      lastModified: cat.updated_at ? new Date(cat.updated_at) : STATIC_PAGES_LASTMOD,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  // ── Product pages ─────────────────────────────────────────────────────────
  // Always the canonical (possibly renamed) slug, so the sitemap never lists
  // a URL that redirects.
  const productUrls: MetadataRoute.Sitemap = (products || []).map(
    (product: { slug: string; updated_at?: string; product_images?: { url: string }[] }) => ({
      url: `${SITE_URL}/product/${canonicalProductSlug(product.slug)}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : STATIC_PAGES_LASTMOD,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      images: product.product_images?.length
        ? product.product_images.map((img) => img.url)
        : [`${SITE_URL}/images/banner2.png`],
    })
  );

  return [...staticUrls, ...categoryUrls, ...productUrls];
}
