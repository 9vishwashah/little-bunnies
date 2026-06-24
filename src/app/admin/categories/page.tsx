import { createAdminClient } from "@/lib/supabase/server";
import CategoriesClient from "./CategoriesClient";

export default async function AdminCategoriesPage() {
  const supabase = createAdminClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Categories</h1>
        <p className="text-ink-muted text-sm mt-1">Manage product categories</p>
      </div>
      <CategoriesClient initialCategories={categories || []} />
    </div>
  );
}
