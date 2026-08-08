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
  const { images, variants, videos, stockQuantity, ...productData } = body;

  const supabase = createAdminClient();

  // Auto-derive in_stock from provided quantities when stock info is present
  if (stockQuantity !== undefined || (variants !== undefined)) {
    let totalStock = 0;
    if (variants && variants.length > 0) {
      totalStock = variants.reduce((sum: number, v: { stockQuantity?: number }) => sum + (v.stockQuantity ?? 0), 0);
    } else if (stockQuantity !== undefined) {
      totalStock = stockQuantity;
    }
    productData.in_stock = totalStock > 0;
  }

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

  // Replace videos if provided
  if (videos !== undefined) {
    await supabase.from("product_videos").delete().eq("product_id", id);
    if (Array.isArray(videos)) {
      const videoRows = videos
        .filter((v: { type: string; url?: string }) => v.url)
        .map((v: { type: string; url: string; thumbnailUrl?: string }) => ({
          product_id: id,
          type: v.type,
          url: v.url,
          thumbnail_url: v.thumbnailUrl || null,
        }));
      if (videoRows.length > 0) {
        await supabase.from("product_videos").insert(videoRows);
      }
    }
  }

  // Replace variants if provided
  let insertedVariants: { id: string }[] = [];
  if (variants !== undefined) {
    await supabase.from("product_variants").delete().eq("product_id", id);
    if (variants.length > 0) {
      const variantRows = variants
        .filter((v: { name: string; value: string }) => v.name && v.value)
        .map((v: { name: string; value: string; priceModifier: number; imageUrl?: string }) => ({
          product_id: id,
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
  }

  // Replace inventory rows to match new variant structure
  if (variants !== undefined || stockQuantity !== undefined) {
    await supabase.from("inventory").delete().eq("product_id", id);

    if (insertedVariants.length > 0) {
      // Per-variant inventory
      const filteredVariants = variants.filter((v: { name: string; value: string }) => v.name && v.value);
      const inventoryRows = insertedVariants.map((sv, idx) => ({
        product_id: id,
        variant_id: sv.id,
        quantity: filteredVariants[idx]?.stockQuantity ?? 0,
        reserved: 0,
        low_stock_threshold: 5,
      }));
      await supabase.from("inventory").insert(inventoryRows);
    } else {
      // Product-level inventory (no variants)
      await supabase.from("inventory").insert({
        product_id: id,
        variant_id: null,
        quantity: stockQuantity ?? 0,
        reserved: 0,
        low_stock_threshold: 5,
      });
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

  // 1. Check if this product exists in any order_items (ON DELETE RESTRICT)
  const { count: orderCount } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);

  if (orderCount && orderCount > 0) {
    // Soft-delete: deactivate and hide the product instead of hard delete.
    // This preserves order history (order_items still reference it).
    const { error: softErr } = await supabase
      .from("products")
      .update({ is_active: false, in_stock: false })
      .eq("id", id);

    if (softErr) {
      return NextResponse.json({ error: softErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      soft: true,
      message: `Product has ${orderCount} order(s) — it has been deactivated and hidden from the store instead of permanently deleted.`,
    });
  }

  // 2. No orders — safe to hard delete.
  // Delete child records first (images, variants, inventory, reviews, wishlists)
  await supabase.from("product_images").delete().eq("product_id", id);
  await supabase.from("product_variants").delete().eq("product_id", id);
  await supabase.from("inventory").delete().eq("product_id", id);
  await supabase.from("reviews").delete().eq("product_id", id);
  await supabase.from("wishlists").delete().eq("product_id", id);

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, soft: false });
}
