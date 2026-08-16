import { createAdminClient } from "@/lib/supabase/server";
import WalkInOrderForm from "./WalkInOrderForm";

export interface WalkInProduct {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  image: string | null;
  variants: { id: string; name: string; value: string; price_modifier: number; image_url: string | null }[];
}

interface ProductRow {
  id: string;
  name: string;
  brand: string | null;
  price: number;
  product_images?: { url: string; is_primary: boolean }[];
  product_variants?: { id: string; name: string; value: string; price_modifier: number; image_url: string | null }[];
}

async function getProducts(): Promise<WalkInProduct[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("products")
    .select(`id, name, brand, price, product_images(url, is_primary), product_variants(id, name, value, price_modifier, image_url)`)
    .eq("is_active", true)
    .eq("in_stock", true)
    .order("brand", { ascending: true });

  return ((data || []) as ProductRow[]).map((p) => {
    const primaryImage = p.product_images?.find((img) => img.is_primary) || p.product_images?.[0];
    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      price: Number(p.price),
      image: primaryImage?.url || null,
      variants: p.product_variants || [],
    };
  });
}

export default async function NewWalkInOrderPage() {
  const products = await getProducts();

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">New Walk-in Sale</h1>
        <p className="text-ink-muted text-sm mt-0.5">
          For a customer purchasing in person — always free delivery, paid on the spot.
        </p>
      </div>

      <WalkInOrderForm products={products} />
    </div>
  );
}
