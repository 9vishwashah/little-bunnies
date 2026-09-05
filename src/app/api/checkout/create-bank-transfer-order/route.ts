import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { computeOrderPricing, PricingError } from "@/lib/orders/pricing";
import { validateCoupon } from "@/lib/orders/validateCoupon";
import { generateOrderNumber, formatInvoiceNumber } from "@/lib/utils";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/email/sendOrderConfirmation";
import { generateInvoicePdf } from "@/lib/invoice/generateInvoicePdf";
import { getPaymentMethodLabel } from "@/lib/orders/paymentMethodLabel";

const PAYMENT_METHOD_LABEL = getPaymentMethodLabel("bank_transfer");

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
  email: z.string().min(1).email(),
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
  paymentProofUrl: z.string().url(),
  declarationAccepted: z.literal(true),
});

/**
 * Bank-QR checkout: there is no external gateway to verify a screenshot
 * against, so — unlike /api/checkout/create-order + verify-payment — this
 * single route both creates AND finalizes the order in one step (stock,
 * coupon usage, invoice + confirmation emails, all committed immediately —
 * the customer has already paid and submitted proof). The admin can still
 * review the screenshot on the order detail page and flip payment_status to
 * "failed"/"refunded" later if it turns out to be fraudulent.
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
    const { items, address, customName, couponCode, paymentProofUrl } = parsed.data;

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
          status: "confirmed",
          payment_method: "bank_transfer",
          payment_status: "paid",
          subtotal: pricing.subtotal,
          discount_amount: discountAmount,
          custom_name_charge: pricing.customNameCharge,
          coupon_id: couponId,
          shipping_amount: pricing.shipping,
          total,
          notes: customName ? `Custom Name Added: ${customName}` : null,
          shipping_address: shippingAddress,
          payment_proof_url: paymentProofUrl,
          payment_proof_declared: true,
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
      console.error("Create bank-transfer order error:", lastError);
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

    // Committed immediately — there's no later verification step for this
    // payment method, the customer has already submitted their proof.
    if (couponId) {
      try {
        await supabase.rpc("increment_coupon_uses", { coupon_id: couponId });
      } catch (couponErr) {
        console.error("Coupon usage increment error:", couponErr);
      }
    }

    try {
      await supabase.rpc("decrement_stock", { p_order_id: order.id });
    } catch (stockErr) {
      console.error("Stock decrement error:", stockErr);
    }

    // ── Confirmation email + invoice PDF — best-effort, never blocks the response ──
    // Uses the email typed into the checkout form directly (collected regardless
    // of login state), rather than looking up the Clerk-synced users table.
    try {
      const invoiceOrder = {
        order_number: order.order_number,
        created_at: new Date().toISOString(),
        total,
        subtotal: pricing.subtotal,
        discount_amount: discountAmount,
        custom_name_charge: pricing.customNameCharge,
        coupon_code: null,
        shipping_amount: pricing.shipping,
        shipping_address: shippingAddress,
        payment_method_label: PAYMENT_METHOD_LABEL,
        payment_proof_url: paymentProofUrl,
      };

      let invoicePdf: Buffer | null = null;
      try {
        const { data: invoiceNumberRaw } = await supabase.rpc("get_or_create_invoice_number", {
          p_order_id: order.id,
        });
        const invoiceNumber = typeof invoiceNumberRaw === "number" ? formatInvoiceNumber(invoiceNumberRaw) : null;
        invoicePdf = await generateInvoicePdf(invoiceOrder, orderItems, address.email, invoiceNumber);
      } catch (pdfErr) {
        console.error("Invoice PDF generation error:", pdfErr);
      }

      await Promise.all([
        sendOrderConfirmation(invoiceOrder, orderItems, address.email, invoicePdf),
        sendAdminOrderNotification(invoiceOrder, orderItems, address.email, invoicePdf),
      ]);
    } catch (emailErr) {
      console.error("Confirmation email error:", emailErr);
    }

    return NextResponse.json({ success: true, orderId: order.id, orderNumber: order.order_number });
  } catch (err) {
    console.error("Create bank-transfer order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
