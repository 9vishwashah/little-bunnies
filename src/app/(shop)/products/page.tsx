import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductsClient from "./ProductsClient";
import { Product, Category } from "@/types";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://littlebunnies.co.in";

interface ProductsPageProps {
  searchParams: Promise<Record<string, string>>;
}

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = parseInt(params.page || "1");

  // Canonicalize to the clean paginated listing URL only — filter/sort
  // combinations (?category=, ?minPrice=, ?sort=, etc.) all consolidate to
  // this canonical rather than being indexed as distinct pages, per Google's
  // ecommerce guidance on avoiding indexing of filter/sort variations.
  const canonical = page > 1 ? `${baseUrl}/products?page=${page}` : `${baseUrl}/products`;
  const title = page > 1 ? `All Products — Page ${page} — Little Bunnies` : "All Products — Little Bunnies";
  const description =
    "Browse our full collection of premium baby products — prams, diapers, feeding, skincare, clothing, toys and more.";

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Little Bunnies",
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
      const { data: cat } = await supabase
        .from("categories")
        .select("id")
        .eq("slug", searchParams.category)
        .single();
      if (cat) {
        const { data: subCats } = await supabase
          .from("categories")
          .select("id")
          .eq("parent_id", cat.id);
        const catIds = [cat.id];
        if (subCats) {
          catIds.push(...subCats.map((c) => c.id));
        }
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
    if (searchParams.search) query = query.ilike("name", `%${searchParams.search}%`);
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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [{ products, count }, categories] = await Promise.all([
    getProducts(params),
    getCategories(),
  ]);

  return (
    <ProductsClient
      initialProducts={products}
      totalCount={count}
      categories={categories}
      searchParams={params}
    />
  );
}
