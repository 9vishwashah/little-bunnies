import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { auth } from "@clerk/nextjs/server";

// Upload image to Supabase Storage
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const bucket = (formData.get("bucket") as string) || "products";
    const folder = formData.get("folder") as string || "general";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, or WebP." }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 5MB." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return NextResponse.json({ url: urlData.publicUrl, path: data.path });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
