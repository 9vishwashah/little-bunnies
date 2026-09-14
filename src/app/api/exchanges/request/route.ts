import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/server";
import { checkExchangeEligibility, findOrderByContact } from "@/lib/exchanges/eligibility";

const bodySchema = z.object({
  orderNumber: z.string().trim().min(1),
  contact: z.string().trim().min(3),
  orderItemId: z.string().uuid(),
  reason: z.string().trim().min(5, "Please describe the issue in a bit more detail"),
  unboxingVideoUrl: z.string().url("An unboxing video is required"),
  photoUrls: z.array(z.string().url()).max(6).optional().default([]),
});

/**
 * Submits an exchange request. Re-verifies order ownership (order number +
 * contact) and re-runs full eligibility server-side — the lookup endpoint's
 * response is never trusted as proof of eligibility, since a client could
 * submit directly to this route.
 */
export async function POST(req: NextRequest) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }
    const { orderNumber, contact, orderItemId, reason, unboxingVideoUrl, photoUrls } = parsed.data;

    const supabase = createAdminClient();
    const order = await findOrderByContact(supabase, orderNumber, contact);
    if (!order) {
      return NextResponse.json({ error: "We couldn't find that order" }, { status: 404 });
    }

    const eligibility = await checkExchangeEligibility(supabase, order.id, orderItemId);
    if (!eligibility.eligible) {
      return NextResponse.json({ error: eligibility.reason || "This item isn't eligible for exchange" }, { status: 400 });
    }

    // Re-fetch contact details for the row itself (findOrderByContact only
    // confirms a match, doesn't hand back which one matched).
    const { data: orderRow } = await supabase
      .from("orders")
      .select("shipping_address, guest_email, user_id")
      .eq("id", order.id)
      .single();
    let email: string | null = orderRow?.guest_email || null;
    if (orderRow?.user_id) {
      const { data: user } = await supabase.from("users").select("email").eq("id", orderRow.user_id).single();
      email = user?.email || email;
    }
    const phone: string | null = orderRow?.shipping_address?.phone || null;

    const { data: created, error: insertError } = await supabase
      .from("exchange_requests")
      .insert({
        order_id: order.id,
        order_item_id: orderItemId,
        contact_phone: phone || contact,
        contact_email: email,
        reason,
        unboxing_video_url: unboxingVideoUrl,
        photo_urls: photoUrls,
      })
      .select("id")
      .single();

    if (insertError || !created) {
      console.error("Exchange request insert error:", insertError);
      return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
    }

    return NextResponse.json({ success: true, requestId: created.id });
  } catch (err) {
    console.error("Exchange request error:", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
