import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const supabase = createAdminClient();

    const update: Record<string, unknown> = {
      status: body.status,
      payment_status: body.payment_status,
      updated_at: new Date().toISOString(),
    };

    // Stamp delivered_at the first time status becomes "delivered" — this is
    // the actual clock the exchange window (15 days) runs from, so it must
    // only ever be set once, never bumped by a later unrelated save.
    if (body.status === "delivered") {
      const { data: existing } = await supabase
        .from("orders")
        .select("delivered_at")
        .eq("id", id)
        .single();
      if (!existing?.delivered_at) {
        update.delivered_at = new Date().toISOString();
      }
    }

    const { error } = await supabase
      .from("orders")
      .update(update)
      .eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const supabase = createAdminClient();

    const { error } = await supabase.from("orders").delete().eq("id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
