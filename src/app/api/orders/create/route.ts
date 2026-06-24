import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateOrderNumber } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { items, address, paymentMethod, subtotal, shippingAmount, total, discountAmount, couponId } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const orderNumber = generateOrderNumber();

    // ── Sync Clerk user into Supabase users table ──────────────────────────
    // This satisfies the orders.user_id FK constraint.
    // Required because the Clerk webhook may not have fired for this user yet.
    if (userId) {
      try {
        const clerkUser = await currentUser();
        if (clerkUser) {
          const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
          const fullName = [clerkUser.firstName, clerkUser.lastName]
            .filter(Boolean)
            .join(" ");

          await supabase.from("users").upsert(
            {
              id: userId,
              email,
              full_name: fullName || null,
              avatar_url: clerkUser.imageUrl || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        }
      } catch (syncErr) {
        // Non-fatal — log and continue. Order still goes through as guest if sync fails.
        console.warn("User sync warning:", syncErr);
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId || null,
        status: "confirmed",
        payment_method: paymentMethod || "cod",
        payment_status: paymentMethod === "cod" ? "pending" : "pending",
        subtotal,
        discount_amount: discountAmount || 0,
        shipping_amount: shippingAmount || 0,
        total,
        coupon_id: couponId || null,
        shipping_address: {
          full_name: address.fullName,
          phone: address.phone,
          address_line1: address.addressLine1,
          address_line2: address.addressLine2 || null,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          country: "India",
        },
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error("Order error:", orderError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    // Create order items
    const orderItems = items.map((item: {
      id: string;
      name: string;
      image: string;
      variant?: { id: string; name: string; value: string; price_modifier: number };
      price: number;
      quantity: number;
    }) => ({
      order_id: order.id,
      product_id: item.id,
      variant_id: item.variant?.id || null,
      product_name: item.name,
      product_image: item.image,
      variant_name: item.variant ? `${item.variant.name}: ${item.variant.value}` : null,
      quantity: item.quantity,
      unit_price: item.price + (item.variant?.price_modifier || 0),
      total_price: (item.price + (item.variant?.price_modifier || 0)) * item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      console.error("Order items error:", itemsError);
      // Don't fail the whole order — items can be recovered
    }

    // Increment coupon uses
    if (couponId) {
      await supabase.rpc("increment_coupon_uses", { coupon_id: couponId });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
    });
  } catch (err) {
    console.error("Create order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
