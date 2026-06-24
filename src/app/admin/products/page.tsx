import { createAdminClient } from "@/lib/supabase/server";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react";

async function getProducts(search?: string) {
  const supabase = createAdminClient();
  let query = supabase
    .from("products")
    .select(`*, product_images(url, is_primary), categories(name)`, { count: "exact" })
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, count } = await query.limit(50);
  return { products: data || [], count: count || 0 };
}

interface AdminProductsPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const params = await searchParams;
  const { products, count } = await getProducts(params.search);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Products</h1>
          <p className="text-ink-muted text-sm mt-0.5">{count} products total</p>
        </div>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus size={16} />
          Add Product
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="mb-6">
        <div className="flex gap-3">
          <div className="flex items-center gap-2 bg-white rounded-brand border border-ink/8 px-4 py-2.5 flex-1 max-w-md">
            <Search size={16} className="text-ink-muted" />
            <input
              type="text"
              name="search"
              defaultValue={params.search}
              placeholder="Search products..."
              className="flex-1 bg-transparent text-sm text-ink placeholder-ink-muted outline-none"
            />
          </div>
          <button type="submit" className="btn-secondary px-5">Search</button>
        </div>
      </form>

      {/* Table */}
      <div className="bg-white rounded-brand shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-cream-dark/50 border-b border-ink/8">
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-5 py-3.5">
                  Product
                </th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">
                  Category
                </th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">
                  Price
                </th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">
                  Stock
                </th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">
                  Status
                </th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-ink-muted">
                    <p className="font-medium">No products found</p>
                    <Link href="/admin/products/new" className="btn-primary mt-4 inline-flex text-sm">
                      <Plus size={14} /> Add First Product
                    </Link>
                  </td>
                </tr>
              ) : (
                products.map((product: {
                  id: string;
                  name: string;
                  slug: string;
                  price: number;
                  compare_price?: number;
                  is_active: boolean;
                  in_stock: boolean;
                  is_featured: boolean;
                  is_new_arrival: boolean;
                  is_best_seller: boolean;
                  product_images?: { url: string; is_primary: boolean }[];
                  categories?: { name: string };
                }) => {
                  const primaryImage = product.product_images?.find((img) => img.is_primary) || product.product_images?.[0];
                  return (
                    <tr key={product.id} className="hover:bg-cream-dark/30 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                            {primaryImage ? (
                              <img src={primaryImage.url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-ink-muted text-xs">No img</div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-ink text-sm line-clamp-1">{product.name}</p>
                            <p className="text-xs text-ink-muted">{product.slug}</p>
                            <div className="flex gap-1 mt-0.5">
                              {product.is_featured && <span className="text-[10px] badge-featured px-1.5 py-0.5">Featured</span>}
                              {product.is_new_arrival && <span className="text-[10px] badge-new px-1.5 py-0.5">New</span>}
                              {product.is_best_seller && <span className="text-[10px] badge-sale px-1.5 py-0.5">Bestseller</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-sm text-ink-muted">
                        {product.categories?.name || "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-ink text-sm">{formatPrice(product.price)}</p>
                        {product.compare_price && (
                          <p className="text-xs text-ink-muted line-through">{formatPrice(product.compare_price)}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-pill ${
                          product.in_stock ? "bg-sage/30 text-sage-dark" : "bg-blush/30 text-blush-dark"
                        }`}>
                          {product.in_stock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-pill ${
                          product.is_active ? "bg-sage/20 text-sage-dark" : "bg-cream-dark text-ink-muted"
                        }`}>
                          {product.is_active ? "Active" : "Draft"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/product/${product.slug}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-cream-dark transition-colors"
                          >
                            <Eye size={15} />
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="p-1.5 rounded-lg text-ink-muted hover:text-ink hover:bg-cream-dark transition-colors"
                          >
                            <Edit size={15} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
