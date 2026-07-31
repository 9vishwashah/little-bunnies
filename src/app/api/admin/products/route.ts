import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

async function checkAdmin() {
  const { userId } = await auth();
  if (!userId) return false;
  return true;
}

// GET: List all products (admin)
export async function GET(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select(`*, product_images(*), product_variants(*), categories(name, slug)`)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST: Create product
export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { images, variants, stockQuantity, ...productData } = body;

    const supabase = createAdminClient();

    // Auto-derive in_stock from provided quantities
    let totalStock = 0;
    if (variants && variants.length > 0) {
      totalStock = variants.reduce((sum: number, v: { stockQuantity?: number }) => sum + (v.stockQuantity ?? 0), 0);
    } else {
      totalStock = stockQuantity ?? 0;
    }
    productData.in_stock = totalStock > 0;

    // Create product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: productError?.message || "Failed to create product" }, { status: 500 });
    }

    // Insert images
    if (images && images.length > 0) {
      const imageRows = images.map((img: { url: string }, i: number) => ({
        product_id: product.id,
        url: img.url,
        sort_order: i,
        is_primary: i === 0,
      }));
      await supabase.from("product_images").insert(imageRows);
    }

    // Insert variants
    let insertedVariants: { id: string }[] = [];
    if (variants && variants.length > 0) {
      const variantRows = variants
        .filter((v: { name: string; value: string }) => v.name && v.value)
        .map((v: { name: string; value: string; priceModifier: number; imageUrl?: string }) => ({
          product_id: product.id,
          name: v.name,
          value: v.value,
          price_modifier: v.priceModifier || 0,
          image_url: v.imageUrl || null,
        }));
      if (variantRows.length > 0) {
        const { data: savedVariants } = await supabase
          .from("product_variants")
          .insert(variantRows)
          .select("id");
        insertedVariants = savedVariants || [];
      }
    }

    // Insert inventory rows
    if (insertedVariants.length > 0) {
      // One inventory row per variant
      const filteredVariants = variants.filter((v: { name: string; value: string }) => v.name && v.value);
      const inventoryRows = insertedVariants.map((sv, idx) => ({
        product_id: product.id,
        variant_id: sv.id,
        quantity: filteredVariants[idx]?.stockQuantity ?? 0,
        reserved: 0,
        low_stock_threshold: 5,
      }));
      await supabase.from("inventory").insert(inventoryRows);
    } else {
      // One product-level inventory row (no variants)
      await supabase.from("inventory").insert({
        product_id: product.id,
        variant_id: null,
        quantity: stockQuantity ?? 0,
        reserved: 0,
        low_stock_threshold: 5,
      });
    }

    return NextResponse.json({ id: product.id, success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
