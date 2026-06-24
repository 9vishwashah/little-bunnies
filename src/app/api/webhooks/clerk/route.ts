import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const event = await req.json();
    const supabase = createAdminClient();

    if (event.type === "user.created" || event.type === "user.updated") {
      const { id, email_addresses, first_name, last_name, image_url } = event.data;
      const email = email_addresses?.[0]?.email_address;
      const fullName = [first_name, last_name].filter(Boolean).join(" ");

      const { error } = await supabase.from("users").upsert(
        {
          id,
          email,
          full_name: fullName || null,
          avatar_url: image_url || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      );

      if (error) {
        console.error("User sync error:", error);
      }
    }

    if (event.type === "user.deleted") {
      const { id } = event.data;
      // Soft approach: don't delete, just clear PII
      await supabase
        .from("users")
        .update({ email: `deleted-${id}@deleted.local`, full_name: null, avatar_url: null })
        .eq("id", id);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
