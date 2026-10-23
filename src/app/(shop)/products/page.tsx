import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductsClient from "./ProductsClient";
import { Product, Category } from "@/types";
import { SITE_URL, jsonLd, buildBreadcrumbSchema, buildItemListSchema } from "@/lib/seo";

const baseUrl = SITE_URL; // never env-derived — see lib/seo.ts

interface ProductsPageProps {
  searchParams: Promise<Record<string, string>>;
}

/**
 * True if `slug` is an active category (or has active children) with at
 * least one active product. Checked here — not just in the page body below
 * — because notFound() called only from the page component arrives too
 * late: Next.js has already committed a 200 status once generateMetadata
 * resolves successfully, so an empty/nonexistent category otherwise renders
 * a 200 page with error content (a "soft 404", which Google flags as such).
 */
async function categoryHasProducts(slug: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: cat } = await supabase
      .from("categories")
      .select("id, children:categories!parent_id(id)")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();
    if (!cat) return false;

    const catIds = [cat.id, ...(cat.children || []).map((c: { id: string }) => c.id)];
    const { count } = await supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .in("category_id", catIds);
    return (count || 0) > 0;
  } catch {
    return false;
  }
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const category = params.category;

  if (category && !(await categoryHasProducts(category))) {
    notFound();
  }

  let canonical = page > 1 ? `${baseUrl}/products?page=${page}` : `${baseUrl}/products`;
  let title = page > 1 ? `Baby Strollers, Prams & Diaper Bags — Page ${page} | Little Bunnies` : "All Baby Strollers, Prams & Diaper Bags | Little Bunnies";
  let description =
    "Browse the full Little Bunnies range — baby strollers, prams, diaper bags and utility bags. Free shipping above ₹5,999.";
  let keywords = [
    "baby products india",
    "little bunnies products",
    "newborn essentials",
    "buy baby products online",
  ];

  if (category) {
    if (category === "prams" || category === "strollers") {
      canonical = `${baseUrl}/prams-strollers`;
      title = "Baby Prams & Strollers Online India | Buy Comfy Rider Pro | Little Bunnies";
      description =
        "Shop India's best baby prams & strollers including the Little Bunnies Comfy Rider Pro 360° reversible seat stroller. Ultra lightweight aluminium frame, UPF 50++ canopy.";
      keywords = [
        "Little Bunnies Pram",
        "Little Bunnies Prams",
        "baby prams india",
        "strollers online india",
        "Comfy Rider Pro",
        "Comfy Rider Pro Stroller",
        "360 rotating baby stroller",
        "lightweight stroller newborn",
      ];
    } else if (category === "bags") {
      canonical =
        page > 1 ? `${baseUrl}/products?category=bags&page=${page}` : `${baseUrl}/products?category=bags`;
      title = "Diaper Bags Online India | Waterproof & Multipurpose Baby Bags | Little Bunnies";
      description =
        "Shop Little Bunnies diaper bags — waterproof, multipurpose baby bags with insulated bottle pockets, stroller straps & spacious storage. Free shipping above ₹5999.";
      keywords = [
        "Little Bunnies Diaper Bags",
        "diaper bags india",
        "diaper bag online india",
        "waterproof diaper bag",
        "multipurpose baby bag",
        "baby backpack diaper bag",
        "maternity bag india",
      ];
    } else if (category === "utility-bags") {
      canonical =
        page > 1
          ? `${baseUrl}/products?category=utility-bags&page=${page}`
          : `${baseUrl}/products?category=utility-bags`;
      title = "Utility Bags for Babies & Parents Online India | Little Bunnies";
      description =
        "Shop Little Bunnies utility bags — compact, functional everyday bags for parents on the go. Free shipping above ₹5999.";
      keywords = [
        "Little Bunnies Utility Bags",
        "baby utility bags india",
        "buy utility bags online",
      ];
    } else {
      const categoryName = category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, " ");
      canonical =
        page > 1
          ? `${baseUrl}/products?category=${category}&page=${page}`
          : `${baseUrl}/products?category=${category}`;
      title = `${categoryName} — Premium Baby Products | Little Bunnies`;
      description = `Shop premium ${categoryName} online from Little Bunnies. Crafted with safety and care for newborns and growing babies.`;
      keywords = [
        `Little Bunnies ${categoryName}`,
        `buy ${categoryName} india`,
        "baby essentials 0-6 months",
      ];
    }
  }

  return {
    // `absolute` bypasses the root layout's "%s | Little Bunnies" title
    // template — these `title` variants already end with the brand name,
    // so without it they'd render duplicated ("...| Little Bunnies | Little Bunnies").
    title: { absolute: title },
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Little Bunnies",
      images: [
        {
          url: `${baseUrl}/images/og/og-default.jpg`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

async function getProducts(searchParams: Record<string, string>): Promise<{ products: Product[]; count: number }> {
  try {
    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select(`*, product_images(id, url, alt, is_primary, sort_order), categories(name, slug), product_variants(id, name, value, price_modifier, sku_suffix, image_url)`, {
        count: "exact",
      })
      .eq("is_active", true);

    // Apply filters
    if (searchParams.category) {
      // Fetches the category and its children in a single round trip
      // (self-referencing embed) instead of two sequential queries — this
      // was adding a full extra network hop before the product query could
      // even start, on every category-filtered page load.
      const { data: cat } = await supabase
        .from("categories")
        .select("id, children:categories!parent_id(id)")
        .eq("slug", searchParams.category)
        .single();
      if (cat) {
        const catIds = [cat.id, ...(cat.children || []).map((c: { id: string }) => c.id)];
        query = query.in("category_id", catIds);
      } else {
        // Category not found, force empty result
        query = query.eq("id", "00000000-0000-0000-0000-000000000000");
      }
    }
    if (searchParams.minPrice) query = query.gte("price", parseFloat(searchParams.minPrice));
    if (searchParams.maxPrice) query = query.lte("price", parseFloat(searchParams.maxPrice));
    if (searchParams.inStock === "true") query = query.eq("in_stock", true);
    if (searchParams.brand) query = query.ilike("brand", `%${searchParams.brand}%`);
    if (searchParams.search) {
      query = query.or(`name.ilike.%${searchParams.search}%,brand.ilike.%${searchParams.search}%,slug.ilike.%${searchParams.search}%`);
    }
    if (searchParams.featured === "true") query = query.eq("is_featured", true);

    // Sorting
    switch (searchParams.sort) {
      case "price_asc": query = query.order("price", { ascending: true }); break;
      case "price_desc": query = query.order("price", { ascending: false }); break;
      case "newest": query = query.order("created_at", { ascending: false }); break;
      case "best_seller": query = query.eq("is_best_seller", true).order("created_at", { ascending: false }); break;
      default: query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
    }

    // Pagination
    const page = parseInt(searchParams.page || "1");
    const limit = 24;
    const from = (page - 1) * limit;
    query = query.range(from, from + limit - 1);

    const { data, count } = await query;
    return { products: (data as unknown as Product[]) || [], count: count || 0 };
  } catch {
    return { products: [], count: 0 };
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");
    return data || [];
  } catch {
    return [];
  }
}

/**
 * Categories with at least one active product, directly or via a
 * subcategory (matching the same category+children match used to filter
 * products above). A category with nothing in it is a dead end for anyone
 * who clicks it — this keeps the filter sidebar from offering one.
 */
async function getCategoriesWithProducts(categories: Category[]): Promise<Category[]> {
  try {
    const supabase = await createClient();
    const [{ data: products }, { data: withChildren }] = await Promise.all([
      supabase.from("products").select("category_id").eq("is_active", true),
      supabase.from("categories").select("id, children:categories!parent_id(id)"),
    ]);

    const categoryIdsWithProducts = new Set(
      (products || []).map((p) => p.category_id).filter(Boolean)
    );
    const childrenByParent = new Map(
      (withChildren || []).map((c: { id: string; children?: { id: string }[] }) => [
        c.id,
        (c.children || []).map((ch) => ch.id),
      ])
    );

    return categories.filter((cat) =>
      [cat.id, ...(childrenByParent.get(cat.id) || [])].some((id) => categoryIdsWithProducts.has(id))
    );
  } catch {
    return categories;
  }
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [{ products, count }, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);
  const sidebarCategories = await getCategoriesWithProducts(categories);

  // A category slug that's missing or has nothing in it (e.g. a leftover
  // category with zero products, or a stale/typo'd URL) rendered a normal
  // 200 page with an empty grid — Google flagged that as a soft 404. A
  // category filter combined with other filters (price, search, etc.)
  // legitimately yielding zero results is a different, non-error case and
  // is left alone.
  if (params.category && !sidebarCategories.some((c) => c.slug === params.category)) {
    notFound();
  }

  const activeCategory = categories.find((c) => c.slug === params.category);
  const breadcrumbSchema = jsonLd(
    buildBreadcrumbSchema([
      { name: "Home", url: SITE_URL },
      ...(activeCategory
        ? [{ name: activeCategory.name, url: `${SITE_URL}/products?category=${activeCategory.slug}` }]
        : [{ name: "All Products", url: `${SITE_URL}/products` }]),
    ])
  );
  const itemListSchema = jsonLd(
    buildItemListSchema(
      products.map((p) => ({
        name: p.name,
        url: `${SITE_URL}/product/${p.slug}`,
        image: p.product_images?.find((img) => img.is_primary)?.url || p.product_images?.[0]?.url,
        price: p.price,
      }))
    )
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbSchema }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: itemListSchema }} />
      <ProductsClient
        initialProducts={products}
        totalCount={count}
        categories={sidebarCategories}
        searchParams={params}
      />
    </>
  );
}
