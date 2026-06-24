import { createAdminClient } from "@/lib/supabase/server";
import ProductForm from "../ProductForm";

async function getCategories() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("categories").select("id, name").eq("is_active", true).order("name");
  return data || [];
}

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink">Add New Product</h1>
        <p className="text-ink-muted text-sm mt-1">Create a new product listing</p>
      </div>
      <ProductForm categories={categories} />
    </div>
  );
}
