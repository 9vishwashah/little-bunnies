import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/email/sendOrderConfirmation";
import { generateInvoicePdf } from "@/lib/invoice/generateInvoicePdf";

const bodySchema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

function isValidSignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return false;

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(signature);
  if (expectedBuf.length !== actualBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid verification payload" }, { status: 400 });
    }
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    const supabase = createAdminClient();

    const { data: order, error: fetchError } = await supabase
      .from("orders")
      .select("id, order_number, created_at, razorpay_order_id, user_id, guest_email, subtotal, discount_amount, custom_name_charge, coupon_id, shipping_amount, total, shipping_address")
      .eq("id", orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.razorpay_order_id !== razorpay_order_id) {
      return NextResponse.json({ error: "Order mismatch" }, { status: 400 });
    }

    const verified = isValidSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (!verified) {
      await supabase.from("orders").update({ payment_status: "failed" }).eq("id", orderId);
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "confirmed",
        payment_status: "paid",
        razorpay_payment_id,
        razorpay_signature,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (updateError) {
      console.error("Order update error:", updateError);
      return NextResponse.json({ error: "Failed to finalize order" }, { status: 500 });
    }

    // Coupon usage is only counted once the order is actually paid, not at
    // creation time, so abandoned/pending orders don't eat into the limit.
    if (order.coupon_id) {
      try {
        await supabase.rpc("increment_coupon_uses", { coupon_id: order.coupon_id });
      } catch (couponErr) {
        console.error("Coupon usage increment error:", couponErr);
      }
    }

    // ── Decrement inventory stock — best-effort, never blocks the paid response ──
    try {
      await supabase.rpc("decrement_stock", { p_order_id: orderId });
    } catch (stockErr) {
      console.error("Stock decrement error:", stockErr);
    }

    // ── Confirmation email + invoice PDF — best-effort, never blocks the paid response ──
    try {
      const { data: orderItems } = await supabase
        .from("order_items")
        .select("product_name, variant_name, quantity, unit_price, total_price")
        .eq("order_id", orderId);

      const email = order.user_id
        ? (await supabase.from("users").select("email").eq("id", order.user_id).single()).data
            ?.email
        : order.guest_email;

      let couponCode: string | null = null;
      if (order.coupon_id) {
        const { data: coupon } = await supabase
          .from("coupons")
          .select("code")
          .eq("id", order.coupon_id)
          .single();
        couponCode = coupon?.code || null;
      }

      const invoiceOrder = {
        order_number: order.order_number,
        created_at: order.created_at,
        total: order.total,
        subtotal: order.subtotal,
        discount_amount: order.discount_amount,
        custom_name_charge: order.custom_name_charge,
        coupon_code: couponCode,
        shipping_amount: order.shipping_amount,
        shipping_address: order.shipping_address,
        razorpay_payment_id,
      };

      let invoicePdf: Buffer | null = null;
      try {
        invoicePdf = await generateInvoicePdf(invoiceOrder, orderItems || [], email);
      } catch (pdfErr) {
        console.error("Invoice PDF generation error:", pdfErr);
      }

      await Promise.all([
        sendOrderConfirmation(invoiceOrder, orderItems || [], email, invoicePdf),
        sendAdminOrderNotification(invoiceOrder, orderItems || [], email, invoicePdf),
      ]);
    } catch (emailErr) {
      console.error("Confirmation email error:", emailErr);
    }

    return NextResponse.json({ success: true, orderNumber: order.order_number });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
