import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

async function checkAdmin() {
  const { userId } = await auth();
  return !!userId;
}

// PATCH: Update product
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { images, variants, ...productData } = body;

  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update(productData)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Replace images if provided
  if (images !== undefined) {
    await supabase.from("product_images").delete().eq("product_id", id);
    if (images.length > 0) {
      const imageRows = images.map((img: { url: string }, i: number) => ({
        product_id: id,
        url: img.url,
        sort_order: i,
        is_primary: i === 0,
      }));
      await supabase.from("product_images").insert(imageRows);
    }
  }

  // Replace variants if provided
  if (variants !== undefined) {
    await supabase.from("product_variants").delete().eq("product_id", id);
    if (variants.length > 0) {
      const variantRows = variants
        .filter((v: { name: string; value: string }) => v.name && v.value)
        .map((v: { name: string; value: string; priceModifier: number }) => ({
          product_id: id,
          name: v.name,
          value: v.value,
          price_modifier: v.priceModifier || 0,
        }));
      if (variantRows.length > 0) {
        await supabase.from("product_variants").insert(variantRows);
      }
    }
  }

  return NextResponse.json({ success: true });
}

// DELETE: Delete product
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
