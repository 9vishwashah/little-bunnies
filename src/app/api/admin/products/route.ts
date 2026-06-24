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
    const { images, variants, ...productData } = body;

    const supabase = createAdminClient();

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
    if (variants && variants.length > 0) {
      const variantRows = variants
        .filter((v: { name: string; value: string }) => v.name && v.value)
        .map((v: { name: string; value: string; priceModifier: number }) => ({
          product_id: product.id,
          name: v.name,
          value: v.value,
          price_modifier: v.priceModifier || 0,
        }));
      if (variantRows.length > 0) {
        await supabase.from("product_variants").insert(variantRows);
      }
    }

    // Create inventory record
    await supabase.from("inventory").insert({
      product_id: product.id,
      quantity: 100, // default stock
    });

    return NextResponse.json({ id: product.id, success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
