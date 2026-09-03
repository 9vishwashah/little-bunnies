import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { computeOrderPricing, PricingError } from "@/lib/orders/pricing";
import { validateCoupon } from "@/lib/orders/validateCoupon";
import { generateOrderNumber } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getPaymentRequestUrl } from "@/lib/ablepay/client";

const cartItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  image: z.string().optional().default(""),
  quantity: z.number().int().positive(),
  variant: z
    .object({
      id: z.string().min(1),
      name: z.string().min(1),
      value: z.string().min(1),
    })
    .optional(),
});

const addressSchema = z.object({
  fullName: z.string().min(2),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  addressLine1: z.string().min(5),
  addressLine2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/),
});

const bodySchema = z.object({
  items: z.array(cartItemSchema).min(1),
  address: addressSchema,
  customName: z.string().trim().min(1).nullable().optional(),
  couponCode: z.string().trim().min(1).nullable().optional(),
});

/**
 * AblePay checkout: creates a pending order (mirrors create-bank-transfer-order
 * / the old create-order), then asks AblePay for a hosted-checkout URL via
 * the "Get Payment Request URL" API and hands that URL back to the client to
 * redirect to. AblePay POSTs the result to /api/checkout/ablepay-return,
 * which finalizes the order.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { items, address, customName, couponCode } = parsed.data;

    let pricing;
    try {
      pricing = await computeOrderPricing(items, Boolean(customName));
    } catch (err) {
      if (err instanceof PricingError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    let discountAmount = 0;
    let couponId: string | null = null;
    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, pricing.subtotal);
      if (!couponResult.valid) {
        return NextResponse.json({ error: couponResult.error || "Invalid coupon code" }, { status: 400 });
      }
      discountAmount = couponResult.discountAmount || 0;
      couponId = couponResult.couponId || null;
    }

    const total = Math.max(
      0,
      pricing.subtotal + pricing.shipping + pricing.customNameCharge - discountAmount
    );

    const supabase = createAdminClient();

    if (userId) {
      try {
        const clerkUser = await currentUser();
        if (clerkUser) {
          const email = clerkUser.emailAddresses?.[0]?.emailAddress || address.email;
          const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ");

          await supabase.from("users").upsert(
            {
              id: userId,
              email,
              full_name: fullName || address.fullName,
              avatar_url: clerkUser.imageUrl || null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          );
        }
      } catch (syncErr) {
        console.warn("User sync warning:", syncErr);
      }
    }

    const shippingAddress = {
      full_name: address.fullName,
      phone: address.phone,
      address_line1: address.addressLine1,
      address_line2: address.addressLine2 || null,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: "India",
    };

    let order: { id: string; order_number: string } | null = null;
    let lastError: unknown = null;

    for (let attempt = 0; attempt < 3 && !order; attempt++) {
      const orderNumber = generateOrderNumber();
      const { data, error } = await supabase
        .from("orders")
        .insert({
          order_number: orderNumber,
          user_id: userId || null,
          guest_email: userId ? null : address.email || null,
          status: "pending",
          payment_method: "ablepay",
          payment_status: "pending",
          subtotal: pricing.subtotal,
          discount_amount: discountAmount,
          custom_name_charge: pricing.customNameCharge,
          coupon_id: couponId,
          shipping_amount: pricing.shipping,
          total,
          notes: customName ? `Custom Name Added: ${customName}` : null,
          shipping_address: shippingAddress,
        })
        .select("id, order_number")
        .single();

      if (data) {
        order = data;
      } else {
        lastError = error;
        if (error?.code !== "23505") break;
      }
    }

    if (!order) {
      console.error("Create AblePay order error:", lastError);
      return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
    }

    const orderItems = pricing.resolvedItems.map((item) => ({
      order_id: order!.id,
      ...item,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) {
      console.error("Order items error:", itemsError);
    }

    // ── AblePay payment request URL ──────────────────────────────────────
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const returnUrl = `${siteUrl}/api/checkout/ablepay-return`;

    let paymentUrl: string;
    try {
      const result = await getPaymentRequestUrl({
        orderId: order.order_number,
        amount: total,
        description: `Order ${order.order_number} — Little Bunnies`,
        name: address.fullName,
        // AblePay's API requires a well-formed email, but our checkout form
        // makes it optional — fall back to a synthetic, non-deliverable
        // address rather than failing the payment. This is only used to
        // satisfy AblePay's validation; the order's stored guest_email stays
        // whatever the customer actually entered (or null), so confirmation
        // emails still correctly skip sending when there's no real address.
        email: address.email || `${address.phone}@guest.littlebunnies.co.in`,
        phone: address.phone,
        addressLine1: address.addressLine1,
        city: address.city,
        state: address.state,
        zipCode: address.pincode,
        returnUrl,
      });
      paymentUrl = result.url;
    } catch (err) {
      console.error("AblePay getpaymentrequesturl error:", err);
      await supabase.from("orders").update({ payment_status: "failed" }).eq("id", order.id);
      return NextResponse.json({ error: "Failed to initialize payment" }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      paymentUrl,
    });
  } catch (err) {
    console.error("Create AblePay order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
