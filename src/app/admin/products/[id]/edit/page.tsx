import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import ProductForm from "../../ProductForm";

async function getCategories() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("categories").select("id, name").eq("is_active", true).order("name");
  return data || [];
}

async function getProduct(id: string) {
  const supabase = createAdminClient();
  
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_variants (*),
      product_images (*),
      product_videos (*),
      inventory (id, variant_id, quantity)
    `)
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }
  return data;
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  // Await the params object for Next.js App Router dynamic route params
  const { id } = await params;
  const categories = await getCategories();
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const inventoryRows: { id: string; variant_id: string | null; quantity: number }[] =
    (product as any).inventory || [];

  const variants = product.product_variants?.map((v: any) => {
    // Find the inventory row for this specific variant
    const inv = inventoryRows.find((row) => row.variant_id === v.id);
    return {
      name: v.name,
      value: v.value,
      priceModifier: v.price_modifier || 0,
      stockQuantity: inv?.quantity ?? 0,
      imageUrl: v.image_url || "",
    };
  }) || [];

  // Product-level stock (when no variants): find inventory row with variant_id = null
  const productInv = inventoryRows.find((row) => row.variant_id === null);
  const stockQuantity = productInv?.quantity ?? 0;

  // Format images
  const initialImages = product.product_images
    ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
    .map((img: any) => ({
      url: img.url,
      isNew: false,
    })) || [];

  // Format videos (assembly / features)
  const initialVideos: Record<string, { url: string; thumbnailUrl?: string }> = {};
  for (const v of (product.product_videos || []) as { type: string; url: string; thumbnail_url?: string }[]) {
    initialVideos[v.type] = { url: v.url, thumbnailUrl: v.thumbnail_url || undefined };
  }

  const initialData = {
    name: product.name,
    slug: product.slug,
    shortDescription: product.short_description || "",
    description: product.description || "",
    price: product.price,
    comparePrice: product.compare_price || undefined,
    categoryId: product.category_id || undefined,
    brand: product.brand || "",
    sku: product.sku || "",
    ageGroup: product.age_group || "0-6 months",
    isFeatured: product.is_featured,
    isNewArrival: product.is_new_arrival,
    isBestSeller: product.is_best_seller,
    isActive: product.is_active,
    inStock: product.in_stock,
    showVideoPlaceholders: product.show_video_placeholders ?? true,
    metaTitle: product.meta_title || "",
    metaDescription: product.meta_description || "",
    tags: product.tags?.join(", ") || "",
    stockQuantity,
    variants,
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Edit Product</h1>
        <p className="text-ink-muted text-sm mt-1">Update your product listing</p>
      </div>
      <ProductForm
        categories={categories}
        initialData={initialData}
        initialImages={initialImages}
        initialVideos={initialVideos}
        productId={product.id}
      />
    </div>
  );
}
