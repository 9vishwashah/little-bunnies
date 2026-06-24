import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "10");
    const category = searchParams.get("category");

    const supabase = await createClient();
    let query = supabase
      .from("products")
      .select("id, name, slug, price, compare_price, product_images(url, is_primary)")
      .eq("is_active", true);

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (category) {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", category).single();
      if (cat) query = query.eq("category_id", cat.id);
    }

    const { data, error } = await query.limit(limit);

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
