import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { findOrderByContact, getOrderItemsWithEligibility } from "@/lib/exchanges/eligibility";
import { formatInvoiceNumber } from "@/lib/utils";

const bodySchema = z.object({
  orderNumber: z.string().trim().min(1),
  contact: z.string().trim().min(3),
});

/**
 * Public, no-login order lookup for the exchange flow — checkout never
 * requires an account, so instead of an account dashboard, the customer
 * proves ownership with order number + the phone or email they checked out
 * with. Also doubles as the "check status" endpoint: returns any existing
 * exchange_requests alongside each item's fresh eligibility, so the same
 * form can render either a "Request Exchange" button or a status card.
 */
export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Enter an order number and phone or email" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const order = await findOrderByContact(supabase, parsed.data.orderNumber, parsed.data.contact);
    if (!order) {
      return NextResponse.json({ error: "We couldn't find that order" }, { status: 404 });
    }

    const items = await getOrderItemsWithEligibility(supabase, order.id);

    const { data: existingRequests } = await supabase
      .from("exchange_requests")
      .select("id, order_item_id, status, reason, created_at, admin_notes")
      .eq("order_id", order.id);

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.order_number,
        displayNumber:
          typeof order.invoice_number === "number" ? formatInvoiceNumber(order.invoice_number) : order.order_number,
      },
      items: items.map((item) => ({
        id: item.id,
        productName: item.product_name,
        variantName: item.variant_name,
        quantity: item.quantity,
        totalPrice: item.total_price,
        eligible: item.eligible,
        ineligibleReason: item.reason,
        existingRequest: (existingRequests || []).find((r) => r.order_item_id === item.id) || null,
      })),
    });
  } catch (err) {
    console.error("Exchange lookup error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
