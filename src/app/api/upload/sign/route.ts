import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

/**
 * Issues a short-lived Supabase Storage signed upload URL so the browser can
 * upload the file bytes directly to Supabase, bypassing our own serverless
 * function entirely. Netlify (and most serverless hosts) cap function
 * request bodies at a few MB, which large video files blow straight past —
 * this route only ever handles a tiny JSON payload.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bucket = "products", folder = "general", fileName, fileType } = await req.json();

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }
    if (fileType && !ALLOWED_TYPES.includes(fileType)) {
      return NextResponse.json({ error: "Invalid file type." }, { status: 400 });
    }

    const fileExt = fileName.split(".").pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const supabase = createAdminClient();
    const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);

    if (error || !data) {
      return NextResponse.json({ error: error?.message || "Failed to prepare upload" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return NextResponse.json({ token: data.token, path: data.path, url: urlData.publicUrl });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
