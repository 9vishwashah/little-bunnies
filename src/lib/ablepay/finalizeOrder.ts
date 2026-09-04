import { createAdminClient } from "@/lib/supabase/server";
import { verifyAblepayHash } from "./hash";
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/email/sendOrderConfirmation";
import { generateInvoicePdf } from "@/lib/invoice/generateInvoicePdf";
import { formatInvoiceNumber } from "@/lib/utils";
import { getPaymentMethodLabel } from "@/lib/orders/paymentMethodLabel";

const PAYMENT_METHOD_LABEL = getPaymentMethodLabel("ablepay");

export type FinalizeResult =
  | { status: "paid"; orderId: string; orderNumber: string }
  | { status: "already_finalized"; orderId: string; orderNumber: string; paymentStatus: string }
  | { status: "failed"; orderId: string; orderNumber: string; reason?: string }
  | { status: "hash_invalid" }
  | { status: "order_not_found" }
  | { status: "missing_order_id" };

/**
 * Shared finalize logic for AblePay's two ways of telling us a payment
 * happened: the customer's browser landing on /api/checkout/ablepay-return,
 * and the server-to-server "Payment Callback URL" webhook. AblePay can fire
 * either one first (or both, or the webhook without a browser return ever
 * completing) — the DB update below only succeeds for whichever call
 * reaches an order still in "pending", so a duplicate/late second call for
 * the same order is a safe no-op rather than double-processing stock,
 * coupons, or emails.
 */
export async function finalizeAblepayCallback(params: Record<string, string>): Promise<FinalizeResult> {
  const orderNumber = params.order_id;
  if (!orderNumber) return { status: "missing_order_id" };

  const salt = process.env.ABLEPAY_SALT;
  const hashOk = salt ? verifyAblepayHash(salt, params, params.hash) : true;
  if (!hashOk) {
    console.error("AblePay callback: hash mismatch for order", orderNumber);
    return { status: "hash_invalid" };
  }

  const supabase = createAdminClient();

  const { data: order, error: fetchError } = await supabase
    .from("orders")
    .select(
      "id, order_number, created_at, user_id, guest_email, subtotal, discount_amount, custom_name_charge, coupon_id, shipping_amount, total, shipping_address, payment_status"
    )
    .eq("order_number", orderNumber)
    .eq("payment_method", "ablepay")
    .single();

  if (fetchError || !order) {
    console.error("AblePay callback: order not found", orderNumber, fetchError);
    return { status: "order_not_found" };
  }

  if (order.payment_status !== "pending") {
    return {
      status: "already_finalized",
      orderId: order.id,
      orderNumber: order.order_number,
      paymentStatus: order.payment_status,
    };
  }

  // response_code 0 = success (per AblePay's docs); anything else is a
  // failure/cancellation.
  const succeeded = params.response_code === "0";

  if (!succeeded) {
    await supabase
      .from("orders")
      .update({ payment_status: "failed", ablepay_transaction_id: params.transaction_id || null })
      .eq("id", order.id)
      .eq("payment_status", "pending");
    return {
      status: "failed",
      orderId: order.id,
      orderNumber: order.order_number,
      reason: params.response_message,
    };
  }

  // Atomic pending → paid transition, guarded by the current status so a
  // concurrent duplicate call can't win twice.
  const { data: updated, error: updateError } = await supabase
    .from("orders")
    .update({
      status: "confirmed",
      payment_status: "paid",
      ablepay_transaction_id: params.transaction_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .eq("payment_status", "pending")
    .select("id")
    .maybeSingle();

  if (updateError) {
    console.error("AblePay callback: order update error", updateError);
    return { status: "already_finalized", orderId: order.id, orderNumber: order.order_number, paymentStatus: order.payment_status };
  }

  if (!updated) {
    // The other callback path won the race and already finalized this order
    // — treat it as a successful outcome, just skip the side effects below.
    return { status: "already_finalized", orderId: order.id, orderNumber: order.order_number, paymentStatus: "paid" };
  }

  // ── Side effects — only reached once, by whichever call won the race ──
  if (order.coupon_id) {
    try {
      await supabase.rpc("increment_coupon_uses", { coupon_id: order.coupon_id });
    } catch (couponErr) {
      console.error("Coupon usage increment error:", couponErr);
    }
  }

  try {
    await supabase.rpc("decrement_stock", { p_order_id: order.id });
  } catch (stockErr) {
    console.error("Stock decrement error:", stockErr);
  }

  try {
    const { data: orderItems } = await supabase
      .from("order_items")
      .select("product_name, variant_name, quantity, unit_price, total_price")
      .eq("order_id", order.id);

    const email = order.user_id
      ? (await supabase.from("users").select("email").eq("id", order.user_id).single()).data?.email
      : order.guest_email;

    let couponCode: string | null = null;
    if (order.coupon_id) {
      const { data: coupon } = await supabase.from("coupons").select("code").eq("id", order.coupon_id).single();
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
      ablepay_transaction_id: params.transaction_id || null,
      payment_method_label: PAYMENT_METHOD_LABEL,
    };

    let invoicePdf: Buffer | null = null;
    try {
      const { data: invoiceNumberRaw } = await supabase.rpc("get_or_create_invoice_number", {
        p_order_id: order.id,
      });
      const invoiceNumber = typeof invoiceNumberRaw === "number" ? formatInvoiceNumber(invoiceNumberRaw) : null;
      invoicePdf = await generateInvoicePdf(invoiceOrder, orderItems || [], email, invoiceNumber);
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

  return { status: "paid", orderId: order.id, orderNumber: order.order_number };
}
