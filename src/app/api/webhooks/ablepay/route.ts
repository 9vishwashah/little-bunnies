import { NextRequest, NextResponse } from "next/server";
import { finalizeAblepayCallback } from "@/lib/ablepay/finalizeOrder";

/**
 * AblePay's server-to-server "Payment Callback URL" (their docs, §12.1) —
 * set this route's full URL as the "Payment Callback URL" in the AblePay
 * merchant portal (pgmrm.ablepay.co.in). AblePay posts here independently
 * of the customer's browser, so an order still gets finalized (stock,
 * coupon usage, confirmation email) even if the browser never makes it back
 * to /api/checkout/ablepay-return — closed tab, lost connection, app
 * switch mid-payment, etc. This is the safety net for real money: without
 * it, order finalization depends entirely on that one browser redirect.
 *
 * Shares finalizeAblepayCallback with ablepay-return, which is written to
 * be idempotent — whichever of the two arrives first for a given order
 * does the work, the other is a no-op.
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const params: Record<string, string> = {};

    if (contentType.includes("application/json")) {
      const json = await req.json();
      for (const [key, value] of Object.entries(json)) {
        if (value !== null && value !== undefined) params[key] = String(value);
      }
    } else {
      const form = await req.formData();
      for (const [key, value] of form.entries()) {
        params[key] = String(value);
      }
    }

    const result = await finalizeAblepayCallback(params);

    if (result.status === "hash_invalid" || result.status === "missing_order_id" || result.status === "order_not_found") {
      // Acknowledge with 200 anyway — these won't be fixed by AblePay
      // retrying the same payload, so there's nothing to gain by inviting
      // one. Logged server-side via finalizeAblepayCallback for follow-up.
      return NextResponse.json({ received: true, status: result.status });
    }

    return NextResponse.json({ received: true, status: result.status });
  } catch (err) {
    console.error("AblePay webhook handler error:", err);
    // A genuine 500 here (vs. the 200s above) — this path is a bug or a
    // transient failure (DB blip, etc.), not a payload we can't use, so a
    // retry from AblePay's side might actually succeed next time.
    return NextResponse.json({ received: false, error: "internal_error" }, { status: 500 });
  }
}
