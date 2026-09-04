import { NextRequest, NextResponse } from "next/server";
import { finalizeAblepayCallback } from "@/lib/ablepay/finalizeOrder";

/**
 * AblePay POSTs the transaction result here (return_url from
 * create-ablepay-order) after the customer completes — or cancels — payment
 * on their hosted page. Finalization itself is shared with the
 * /api/webhooks/ablepay server-to-server callback (see finalizeAblepayCallback)
 * since AblePay can deliver either one first; this route's only job on top
 * of that is turning the result into a browser redirect.
 */
export async function POST(req: NextRequest) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  try {
    const form = await req.formData();
    const params: Record<string, string> = {};
    for (const [key, value] of form.entries()) {
      params[key] = String(value);
    }

    const result = await finalizeAblepayCallback(params);

    switch (result.status) {
      case "missing_order_id":
        return NextResponse.redirect(`${siteUrl}/checkout?error=missing_order`);
      case "hash_invalid":
        return NextResponse.redirect(`${siteUrl}/checkout?error=payment_verification_failed`);
      case "order_not_found":
        return NextResponse.redirect(`${siteUrl}/checkout?error=order_not_found`);
      case "failed":
        return NextResponse.redirect(
          `${siteUrl}/checkout?error=payment_failed&reason=${encodeURIComponent(result.reason || "")}`
        );
      case "already_finalized":
        return result.paymentStatus === "paid"
          ? NextResponse.redirect(`${siteUrl}/checkout/success?order=${result.orderNumber}&id=${result.orderId}`)
          : NextResponse.redirect(`${siteUrl}/checkout?error=payment_failed`);
      case "paid":
        return NextResponse.redirect(`${siteUrl}/checkout/success?order=${result.orderNumber}&id=${result.orderId}`);
    }
  } catch (err) {
    console.error("AblePay return handler error:", err);
    return NextResponse.redirect(`${siteUrl}/checkout?error=internal_error`);
  }
}
