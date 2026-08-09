import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

// Public — the checkout page needs this without a signed-in session.
export async function GET() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "bank_qr_code_url")
    .single();

  const url = typeof data?.value === "string" ? data.value : null;
  return NextResponse.json({ url });
}
