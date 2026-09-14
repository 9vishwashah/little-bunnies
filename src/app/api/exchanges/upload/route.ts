import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Public (no auth) — same reasoning as the old checkout upload-proof route:
 * the exchange-request flow is guest-accessible (order number + phone/email
 * lookup, no login), so this can't be gated behind a Clerk session. Narrower
 * than /api/upload: fixed bucket/folder, only the unboxing-video/photo
 * evidence this flow needs, random unguessable filenames.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);
    if (!isVideo && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Please upload a JPG, PNG, WebP photo or an MP4/WebM video." },
        { status: 400 }
      );
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: isVideo ? "Video too large. Max 100MB." : "Photo too large. Max 5MB." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const fileExt = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
    const fileName = `exchange-evidence/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from("products")
      .upload(fileName, file, { contentType: file.type, upsert: false });

    if (error) {
      console.error("Exchange evidence upload error:", error);
      return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from("products").getPublicUrl(data.path);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
