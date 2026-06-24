"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Check, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { Category } from "@/types";
import { slugify } from "@/lib/utils";

interface Props {
  initialCategories: Category[];
}

export default function CategoriesClient({ initialCategories }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "", isActive: true });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      isActive: category.is_active,
    });
    setEditingId(category.id);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.slug) {
      toast.error("Name and slug are required");
      return;
    }

    setLoading(true);
    try {
      const url = editingId ? `/api/admin/categories/${editingId}` : `/api/admin/categories`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          is_active: formData.isActive,
          sort_order: categories.length, // simple sort order
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(editingId ? "Category updated" : "Category created");
      router.refresh(); // In a real app we might just update local state, but refreshing ensures server sync
      resetForm();
      
      // Update local state to avoid waiting for full refresh
      if (editingId) {
        setCategories(categories.map(c => c.id === editingId ? { ...c, ...formData, is_active: formData.isActive, updated_at: new Date().toISOString() } : c));
      } else {
        setCategories([...categories, { id: data.id, ...formData, is_active: formData.isActive, sort_order: categories.length, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete the category but not the products.")) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Category deleted");
      setCategories(categories.filter(c => c.id !== id));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="bg-white rounded-brand shadow-card overflow-hidden">
      <div className="p-5 border-b border-ink/8 flex justify-between items-center bg-cream-dark/20">
        <h2 className="font-semibold text-ink">All Categories</h2>
        {!isAdding && !editingId && (
          <button onClick={() => setIsAdding(true)} className="btn-primary text-xs py-2 px-4">
            <Plus size={14} /> Add Category
          </button>
        )}
      </div>

      <div className="p-5">
        {(isAdding || editingId) && (
          <div className="bg-cream-dark/50 p-4 rounded-xl mb-6 border border-ink/10">
            <h3 className="font-semibold text-ink text-sm mb-3">
              {editingId ? "Edit Category" : "New Category"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, name: val, slug: !editingId ? slugify(val) : formData.slug });
                  }}
                  className="input-brand text-sm py-2"
                  placeholder="e.g. Diapers"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Slug</label>
                <input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="input-brand text-sm py-2"
                  placeholder="diapers"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-ink mb-1">Description (Optional)</label>
                <input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-brand text-sm py-2"
                  placeholder="Category description"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="accent-ink w-4 h-4"
                  id="isActive"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-ink cursor-pointer">Active (Visible to customers)</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={loading} className="btn-primary text-xs py-2">
                {loading ? "..." : <><Check size={14} /> Save</>}
              </button>
              <button onClick={resetForm} className="btn-ghost text-xs py-2">
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 border border-ink/8 rounded-xl hover:border-ink/20 transition-colors bg-white"
            >
              <div className="flex items-center gap-3">
                <GripVertical size={16} className="text-ink/30 cursor-grab" />
                <div>
                  <p className="font-semibold text-ink text-sm flex items-center gap-2">
                    {category.name}
                    {!category.is_active && <span className="badge-sale text-[10px] px-1.5 py-0">Draft</span>}
                  </p>
                  <p className="text-xs text-ink-muted">/{category.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-2 text-ink-muted hover:text-ink hover:bg-cream-dark rounded-lg transition-colors"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 text-ink-muted hover:text-blush hover:bg-blush/10 rounded-lg transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {categories.length === 0 && !isAdding && (
            <div className="text-center py-8 text-ink-muted text-sm">
              No categories found. Create one to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
