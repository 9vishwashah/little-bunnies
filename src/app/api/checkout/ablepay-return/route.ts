import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { verifyAblepayHash } from "@/lib/ablepay/hash";
import { sendOrderConfirmation, sendAdminOrderNotification } from "@/lib/email/sendOrderConfirmation";
import { generateInvoicePdf } from "@/lib/invoice/generateInvoicePdf";
import { formatInvoiceNumber } from "@/lib/utils";
import { getPaymentMethodLabel } from "@/lib/orders/paymentMethodLabel";

const PAYMENT_METHOD_LABEL = getPaymentMethodLabel("ablepay");

/**
 * AblePay POSTs the transaction result here (return_url from
 * create-ablepay-order) after the customer completes — or cancels — payment
 * on their hosted page. We verify the hash, finalize the order, then
 * redirect the browser onward to the success/failure page. This is the
 * AblePay equivalent of /api/checkout/verify-payment.
 */
export async function POST(req: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  try {
    const form = await req.formData();
    const params: Record<string, string> = {};
    for (const [key, value] of form.entries()) {
      params[key] = String(value);
    }

    const orderNumber = params.order_id;
    if (!orderNumber) {
      return NextResponse.redirect(`${siteUrl}/checkout?error=missing_order`);
    }

    const salt = process.env.ABLEPAY_SALT;
    const hashOk = salt ? verifyAblepayHash(salt, params, params.hash) : true;
    if (!hashOk) {
      console.error("AblePay return: hash mismatch for order", orderNumber, params);
      return NextResponse.redirect(`${siteUrl}/checkout?error=payment_verification_failed`);
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
      console.error("AblePay return: order not found", orderNumber, fetchError);
      return NextResponse.redirect(`${siteUrl}/checkout?error=order_not_found`);
    }

    // response_code 0 = success (per AblePay's docs); anything else is a
    // failure/cancellation. Already-finalized orders (e.g. a duplicate
    // callback) are left alone rather than re-processed.
    const succeeded = params.response_code === "0";

    if (order.payment_status === "paid") {
      return NextResponse.redirect(
        `${siteUrl}/checkout/success?order=${order.order_number}&id=${order.id}`
      );
    }

    if (!succeeded) {
      await supabase
        .from("orders")
        .update({ payment_status: "failed", ablepay_transaction_id: params.transaction_id || null })
        .eq("id", order.id);
      return NextResponse.redirect(
        `${siteUrl}/checkout?error=payment_failed&reason=${encodeURIComponent(params.response_message || "")}`
      );
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "confirmed",
        payment_status: "paid",
        ablepay_transaction_id: params.transaction_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateError) {
      console.error("AblePay return: order update error", updateError);
      return NextResponse.redirect(`${siteUrl}/checkout?error=finalize_failed`);
    }

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

    return NextResponse.redirect(
      `${siteUrl}/checkout/success?order=${order.order_number}&id=${order.id}`
    );
  } catch (err) {
    console.error("AblePay return handler error:", err);
    return NextResponse.redirect(`${siteUrl}/checkout?error=internal_error`);
  }
}
