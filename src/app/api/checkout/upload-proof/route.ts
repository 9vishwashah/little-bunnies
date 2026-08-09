import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Public (no auth) — checkout is guest-accessible, so the customer uploading
 * their bank-transaction screenshot can't be gated behind a Clerk session.
 * Deliberately narrower than /api/upload: fixed bucket/folder, images only,
 * and a random unguessable filename, since this is reachable by anyone.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Please upload a JPG, PNG, or WebP screenshot." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "Screenshot is too large. Max 5MB." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const fileExt = file.name.split(".").pop() || "jpg";
    const fileName = `payment-proofs/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("products")
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (error) {
      console.error("Payment proof upload error:", error);
      return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("products").getPublicUrl(data.path);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
