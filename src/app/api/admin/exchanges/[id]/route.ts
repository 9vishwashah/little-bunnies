import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminClient } from "@/lib/supabase/server";

/** Phase 1: approve or reject a request. Later phases add more transitions. */
const ALLOWED_STATUSES = ["approved", "rejected"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();

    if (!ALLOWED_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("exchange_requests")
      .update({
        status: body.status,
        admin_notes: body.adminNotes ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "requested"); // only a still-pending request can be approved/rejected

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Admin exchange update error:", err);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}
