"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Check, X, GripVertical, ChevronRight } from "lucide-react";
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
    parentId: "",
  });

  const [loading, setLoading] = useState(false);

  // Separate parents and children for display
  const parentCategories = categories.filter((c) => !c.parent_id);
  const childCategories = categories.filter((c) => !!c.parent_id);

  const resetForm = () => {
    setFormData({ name: "", slug: "", description: "", isActive: true, parentId: "" });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      isActive: category.is_active,
      parentId: category.parent_id || "",
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
          parent_id: formData.parentId || null,
          sort_order: categories.length,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(editingId ? "Category updated" : "Category created");
      router.refresh();
      resetForm();

      if (editingId) {
        setCategories(categories.map(c =>
          c.id === editingId
            ? { ...c, name: formData.name, slug: formData.slug, description: formData.description, is_active: formData.isActive, parent_id: formData.parentId || undefined, updated_at: new Date().toISOString() }
            : c
        ));
      } else {
        setCategories([...categories, {
          id: data.id,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          is_active: formData.isActive,
          parent_id: formData.parentId || undefined,
          sort_order: categories.length,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const hasChildren = categories.some((c) => c.parent_id === id);
    if (hasChildren) {
      toast.error("Delete all sub-categories first before deleting this category.");
      return;
    }
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

  const getParentName = (parentId?: string) => {
    if (!parentId) return null;
    return categories.find((c) => c.id === parentId)?.name || null;
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
                  placeholder="e.g. Strollers"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Slug</label>
                <input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="input-brand text-sm py-2"
                  placeholder="strollers"
                />
              </div>

              {/* Appears under — full width row */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-ink mb-1">
                  Appears under{" "}
                  <span className="font-normal text-ink-muted">
                    (make this a sub-category of another category)
                  </span>
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  className="input-brand text-sm py-2"
                >
                  <option value="">— None (Top-level Category) —</option>
                  {parentCategories
                    .filter((c) => c.id !== editingId) // Prevent selecting itself as a parent
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                  ))}
                </select>
                <p className="text-[11px] text-ink-muted mt-1">
                  If you select a parent category, this category will appear as a dropdown item under it in the navigation menu.
                </p>
              </div>

              {/* Description — full width row */}
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

        {/* ── Parent categories with their children nested below ── */}
        <div className="space-y-4">
          {parentCategories.length === 0 && !isAdding && (
            <div className="text-center py-8 text-ink-muted text-sm">
              No categories found. Create one to get started.
            </div>
          )}

          {parentCategories.map((parent) => {
            const children = childCategories.filter((c) => c.parent_id === parent.id);
            return (
              <div key={parent.id} className="border border-ink/10 rounded-xl overflow-hidden">
                {/* Parent row */}
                <div className="flex items-center justify-between p-3 bg-cream-dark/30 border-b border-ink/8">
                  <div className="flex items-center gap-3">
                    <GripVertical size={16} className="text-ink/30 cursor-grab" />
                    <div>
                      <p className="font-semibold text-ink text-sm flex items-center gap-2">
                        {parent.name}
                        {!parent.is_active && <span className="badge-sale text-[10px] px-1.5 py-0">Draft</span>}
                      </p>
                      <p className="text-xs text-ink-muted">/{parent.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(parent)}
                      className="p-2 text-ink-muted hover:text-ink hover:bg-cream-dark rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(parent.id)}
                      className="p-2 text-ink-muted hover:text-blush hover:bg-blush/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Child rows */}
                {children.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between p-3 pl-8 border-b last:border-b-0 border-ink/5 bg-white hover:bg-cream/40 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ChevronRight size={14} className="text-ink-muted" />
                      <div>
                        <p className="font-medium text-ink text-sm flex items-center gap-2">
                          {child.name}
                          {!child.is_active && <span className="badge-sale text-[10px] px-1.5 py-0">Draft</span>}
                        </p>
                        <p className="text-xs text-ink-muted">/{child.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(child)}
                        className="p-2 text-ink-muted hover:text-ink hover:bg-cream-dark rounded-lg transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(child.id)}
                        className="p-2 text-ink-muted hover:text-blush hover:bg-blush/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Empty children hint */}
                {children.length === 0 && (
                  <div className="px-8 py-2 text-xs text-ink-muted italic border-t border-ink/5">
                    No sub-categories yet — add one and select &quot;{parent.name}&quot; as parent.
                  </div>
                )}
              </div>
            );
          })}

          {/* Orphan children (parent was deleted) */}
          {childCategories
            .filter((c) => !parentCategories.find((p) => p.id === c.parent_id))
            .map((orphan) => (
              <div
                key={orphan.id}
                className="flex items-center justify-between p-3 border border-ink/8 rounded-xl bg-white"
              >
                <div className="flex items-center gap-3">
                  <GripVertical size={16} className="text-ink/30 cursor-grab" />
                  <div>
                    <p className="font-semibold text-ink text-sm">{orphan.name}</p>
                    <p className="text-xs text-ink-muted">/{orphan.slug}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleEdit(orphan)} className="p-2 text-ink-muted hover:text-ink hover:bg-cream-dark rounded-lg transition-colors">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(orphan.id)} className="p-2 text-ink-muted hover:text-blush hover:bg-blush/10 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
