import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";
import { computeOrderPricing, PricingError } from "@/lib/orders/pricing";
import { validateCoupon } from "@/lib/orders/validateCoupon";
import { generateOrderNumber, formatInvoiceNumber } from "@/lib/utils";
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/email/sendOrderConfirmation";
import { generateInvoicePdf } from "@/lib/invoice/generateInvoicePdf";
import { getPaymentMethodLabel } from "@/lib/orders/paymentMethodLabel";

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

const bodySchema = z.object({
  items: z.array(cartItemSchema).min(1),
  customerName: z.string().trim().min(2),
  phone: z.string().trim().min(6),
  email: z.string().trim().email().optional().or(z.literal("")),
  addressLine1: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  pincode: z.string().trim().optional(),
  note: z.string().trim().optional(),
  paymentMethod: z.enum(["cash", "upi"]),
  couponCode: z.string().trim().min(1).optional(),
});

/**
 * Records an in-person sale placed by the store owner from the admin panel
 * (a customer visiting to buy directly) — always paid + free shipping, since
 * there's no delivery involved. Mirrors create-bank-transfer-order's
 * create-and-finalize-in-one-step pattern: the owner has already collected
 * payment by the time this is submitted.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid order data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const { items, customerName, phone, email, addressLine1, city, state, pincode, note, paymentMethod, couponCode } = parsed.data;

    let pricing;
    try {
      pricing = await computeOrderPricing(items, false);
    } catch (err) {
      if (err instanceof PricingError) {
        return NextResponse.json({ error: err.message }, { status: 400 });
      }
      throw err;
    }

    let discountAmount = 0;
    let couponId: string | null = null;
    let appliedCouponCode: string | null = null;
    if (couponCode) {
      const couponResult = await validateCoupon(couponCode, pricing.subtotal);
      if (!couponResult.valid) {
        return NextResponse.json({ error: couponResult.error || "Invalid coupon code" }, { status: 400 });
      }
      discountAmount = couponResult.discountAmount || 0;
      couponId = couponResult.couponId || null;
      appliedCouponCode = couponResult.code || couponCode;
    }

    // Walk-in sales never carry a delivery charge, regardless of subtotal.
    const shipping = 0;
    const total = Math.max(0, Math.round((pricing.subtotal + shipping - discountAmount) * 100) / 100);

    const supabase = createAdminClient();

    const shippingAddress = {
      full_name: customerName,
      phone,
      address_line1: addressLine1 || "-",
      address_line2: null,
      city: city || "-",
      state: state || "-",
      pincode: pincode || "-",
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
          user_id: null,
          guest_email: email || null,
          status: "confirmed",
          payment_method: paymentMethod,
          payment_status: "paid",
          subtotal: pricing.subtotal,
          discount_amount: discountAmount,
          custom_name_charge: 0,
          coupon_id: couponId,
          shipping_amount: shipping,
          total,
          notes: note || null,
          shipping_address: shippingAddress,
          is_walk_in: true,
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
      console.error("Create walk-in order error:", lastError);
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

    const invoiceOrder = {
      order_number: order.order_number,
      created_at: new Date().toISOString(),
      total,
      subtotal: pricing.subtotal,
      discount_amount: discountAmount,
      custom_name_charge: 0,
      coupon_code: appliedCouponCode,
      shipping_amount: shipping,
      shipping_address: shippingAddress,
      payment_method_label: getPaymentMethodLabel(paymentMethod),
    };

    // Isolated from the email sends below — a PDF/invoice-numbering failure
    // should degrade to "email without an attachment", never silently skip
    // the emails entirely.
    let invoiceNumber: string | null = null;
    let invoicePdf: Buffer | null = null;
    try {
      const { data: invoiceNumberRaw } = await supabase.rpc("get_or_create_invoice_number", {
        p_order_id: order.id,
      });
      invoiceNumber = typeof invoiceNumberRaw === "number" ? formatInvoiceNumber(invoiceNumberRaw) : null;
      invoicePdf = await generateInvoicePdf(invoiceOrder, orderItems, email || null, invoiceNumber);
    } catch (pdfErr) {
      console.error("Invoice PDF generation error:", pdfErr);
    }

    // Admin notification doesn't depend on the customer having an email —
    // it always goes to the fixed business inbox. Only the customer
    // receipt needs one, and sendOrderConfirmation already no-ops safely
    // when there isn't one.
    try {
      await Promise.all([
        sendOrderConfirmation(invoiceOrder, orderItems, email || null, invoicePdf),
        sendAdminOrderNotification(invoiceOrder, orderItems, email || null, invoicePdf),
      ]);
    } catch (emailErr) {
      console.error("Walk-in confirmation email error:", emailErr);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      invoiceNumber,
    });
  } catch (err) {
    console.error("Create walk-in order error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
