"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Check, X, Image as ImageIcon, Upload, GripVertical } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialBanners: any[];
}

export default function BannersClient({ initialBanners }: Props) {
  const router = useRouter();
  const [banners, setBanners] = useState(initialBanners);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link_url: "",
    position: "hero", // hero | promo
    is_active: true,
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => {
    setFormData({
      title: "",
      subtitle: "",
      image_url: "",
      link_url: "",
      position: "hero",
      is_active: true,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (banner: any) => {
    setFormData({
      title: banner.title || "",
      subtitle: banner.subtitle || "",
      image_url: banner.image_url,
      link_url: banner.link_url || "",
      position: banner.position,
      is_active: banner.is_active,
    });
    setEditingId(banner.id);
    setIsAdding(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    
    setUploading(true);
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("bucket", "banners");

    try {
      const res = await fetch("/api/upload", { method: "POST", body: uploadData });
      const data = await res.json();
      if (data.url) {
        setFormData({ ...formData, image_url: data.url });
        toast.success("Image uploaded");
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!formData.image_url) {
      toast.error("Image is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        sort_order: banners.length,
      };

      const url = editingId ? `/api/admin/banners/${editingId}` : `/api/admin/banners`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(editingId ? "Banner updated" : "Banner created");
      router.refresh();
      resetForm();
      
      if (editingId) {
        setBanners(banners.map((b: any) => b.id === editingId ? { ...b, ...payload } : b));
      } else {
        setBanners([...banners, { id: data.id, ...payload }]);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save banner");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Banner deleted");
      setBanners(banners.filter((b: any) => b.id !== id));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="bg-white rounded-brand shadow-card overflow-hidden">
      <div className="p-5 border-b border-ink/8 flex justify-between items-center bg-cream-dark/20">
        <h2 className="font-semibold text-ink">All Banners</h2>
        {!isAdding && !editingId && (
          <button onClick={() => setIsAdding(true)} className="btn-primary text-xs py-2 px-4">
            <Plus size={14} /> Add Banner
          </button>
        )}
      </div>

      <div className="p-5">
        {(isAdding || editingId) && (
          <div className="bg-cream-dark/50 p-5 rounded-xl mb-6 border border-ink/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink text-sm">
                {editingId ? "Edit Banner" : "New Banner"}
              </h3>
              <button onClick={resetForm} className="text-ink-muted hover:text-ink"><X size={16} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Banner Image *</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${formData.image_url ? "border-sage bg-sage/5" : "border-ink/20 hover:border-ink/40"}`}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  {uploading ? (
                    <span className="text-xs font-medium text-ink-muted">Uploading...</span>
                  ) : formData.image_url ? (
                    <div className="relative h-24 w-full rounded overflow-hidden">
                      <img src={formData.image_url} alt="Banner preview" className="object-cover w-full h-full" />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload size={20} className="text-ink-muted mb-1" />
                      <span className="text-xs font-medium text-ink-muted">Click to upload image</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">Position</label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      className="input-brand text-sm py-2"
                    >
                      <option value="hero">Hero Slider</option>
                      <option value="promo">Promo Section</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-ink mb-1">Link URL</label>
                    <input
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      className="input-brand text-sm py-2"
                      placeholder="e.g. /products?featured=true"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Title (Optional)</label>
                  <input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input-brand text-sm py-2"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Subtitle (Optional)</label>
                  <input
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="input-brand text-sm py-2"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="accent-ink w-4 h-4"
                    id="isActiveBanner"
                  />
                  <label htmlFor="isActiveBanner" className="text-sm font-medium text-ink cursor-pointer">Active</label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-ink/8">
              <button onClick={handleSave} disabled={loading} className="btn-primary text-sm py-2.5 px-6">
                {loading ? "..." : <><Check size={16} /> Save Banner</>}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {banners.map((banner: any) => (
            <div key={banner.id} className="flex items-center gap-4 p-3 border border-ink/8 rounded-xl bg-white">
              <GripVertical size={16} className="text-ink/30 cursor-grab flex-shrink-0" />
              <div className="w-24 h-16 rounded overflow-hidden bg-cream-dark flex-shrink-0">
                <img src={banner.image_url} alt="Banner" className="object-cover w-full h-full" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-cream-dark px-1.5 py-0.5 rounded text-ink">
                    {banner.position}
                  </span>
                  {!banner.is_active && <span className="badge-sale text-[10px] px-1.5 py-0">Draft</span>}
                </div>
                <p className="font-semibold text-ink text-sm mt-1">{banner.title || "No title"}</p>
                {banner.link_url && <p className="text-xs text-ink-muted">Links to: {banner.link_url}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(banner)} className="p-2 text-ink-muted hover:text-ink hover:bg-cream-dark rounded-lg transition-colors">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(banner.id)} className="p-2 text-ink-muted hover:text-blush hover:bg-blush/10 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {banners.length === 0 && !isAdding && (
            <div className="text-center py-8 text-ink-muted text-sm flex flex-col items-center">
              <ImageIcon size={32} className="mb-2 opacity-30" />
              <p>No banners uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
