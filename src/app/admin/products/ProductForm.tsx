"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Save,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { cn, slugify } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  slug: z.string().min(2, "Slug is required"),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().min(1, "Price is required"),
  comparePrice: z.coerce.number().optional(),
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  sku: z.string().optional(),
  ageGroup: z.string().optional(),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isActive: z.boolean().default(true),
  inStock: z.boolean().default(true),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  tags: z.string().optional(),
  variants: z.array(z.object({
    name: z.string().min(1, "Type is required"),
    value: z.string().min(1, "Value is required"),
    priceModifier: z.coerce.number().default(0),
    imageUrl: z.string().optional(),
  })).default([]),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  categories: { id: string; name: string }[];
  initialData?: Partial<ProductFormData>;
  initialImages?: { url: string; file?: File; isNew?: boolean }[];
  productId?: string;
}

export default function ProductForm({ categories, initialData, initialImages, productId }: ProductFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<{ url: string; file?: File; isNew?: boolean }[]>(initialImages || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      isActive: true,
      inStock: true,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      ageGroup: "0-6 months",
      ...initialData,
    },
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } =
    useFieldArray({ control, name: "variants" });

  const name = watch("name");

  const handleNameBlur = () => {
    if (name && !watch("slug")) {
      setValue("slug", slugify(name));
    }
  };

  const handleImageUpload = async (files: FileList) => {
    setUploading(true);
    const newImages: { url: string; file: File; isNew: boolean }[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "products");
      formData.append("folder", "product-images");

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          newImages.push({ url: data.url, file, isNew: true });
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setImages((prev) => [...prev, ...newImages]);
    setUploading(false);
  };

  const handleVariantImageUpload = async (index: number, type: "swatch" | "gallery", files: FileList) => {
    toast.loading(`Uploading variant ${type}...`, { id: "variantUpload" });
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "products");
      formData.append("folder", "variant-images");
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) newUrls.push(data.url);
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    
    const currentImageUrlStr = watch(`variants.${index}.imageUrl`) || "{}";
    let currentData: { swatch?: string; gallery?: string[] } = {};
    try {
      currentData = JSON.parse(currentImageUrlStr);
    } catch {}

    if (type === "swatch" && newUrls.length > 0) {
      currentData.swatch = newUrls[0];
    } else if (type === "gallery" && newUrls.length > 0) {
      currentData.gallery = [...(currentData.gallery || []), ...newUrls];
    }

    setValue(`variants.${index}.imageUrl`, JSON.stringify(currentData));
    toast.success(`Variant ${type} uploaded!`, { id: "variantUpload" });
  };

  const removeVariantImage = (index: number, type: "swatch" | "gallery", imgIndex?: number) => {
    const currentImageUrlStr = watch(`variants.${index}.imageUrl`) || "{}";
    let currentData: { swatch?: string; gallery?: string[] } = {};
    try {
      currentData = JSON.parse(currentImageUrlStr);
    } catch {}

    if (type === "swatch") {
      delete currentData.swatch;
    } else if (type === "gallery" && imgIndex !== undefined) {
      currentData.gallery = currentData.gallery?.filter((_, i) => i !== imgIndex);
    }
    setValue(`variants.${index}.imageUrl`, JSON.stringify(currentData));
  };


  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const payload = {
        name: data.name,
        slug: data.slug,
        short_description: data.shortDescription,
        description: data.description,
        price: data.price,
        compare_price: data.comparePrice || null,
        category_id: data.categoryId || null,
        brand: data.brand || null,
        sku: data.sku || null,
        age_group: data.ageGroup,
        is_featured: data.isFeatured,
        is_new_arrival: data.isNewArrival,
        is_best_seller: data.isBestSeller,
        is_active: data.isActive,
        in_stock: data.inStock,
        meta_title: data.metaTitle || null,
        meta_description: data.metaDescription || null,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
      };

      const url = productId
        ? `/api/admin/products/${productId}`
        : "/api/admin/products";
      const method = productId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, images, variants: data.variants }),
      });
      const result = await res.json();

      if (result.id || result.success) {
        toast.success(productId ? "Product updated!" : "Product created!");
        router.push("/admin/products");
      } else {
        throw new Error(result.error || "Failed to save product");
      }
    } catch (err) {
      toast.error("Failed to save product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="xl:col-span-2 space-y-5">
          {/* Basic Info */}
          <div className="bg-white rounded-brand shadow-card p-5 md:p-6">
            <h2 className="font-display font-semibold text-ink text-lg mb-5">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Product Name *</label>
                <input
                  {...register("name")}
                  onBlur={handleNameBlur}
                  className="input-brand"
                  placeholder="e.g. LuvLap Galaxy Stroller"
                />
                {errors.name && <p className="text-xs text-blush mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">URL Slug *</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink-muted font-medium">/product/</span>
                  <input {...register("slug")} className="input-brand flex-1" placeholder="product-url-slug" />
                </div>
                {errors.slug && <p className="text-xs text-blush mt-1">{errors.slug.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Short Description</label>
                <textarea
                  {...register("shortDescription")}
                  className="input-brand resize-none"
                  rows={4}
                  placeholder="Brief product summary (HTML allowed)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Full Description</label>
                <textarea
                  {...register("description")}
                  className="input-brand resize-none"
                  rows={5}
                  placeholder="Detailed product description (HTML allowed)"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white rounded-brand shadow-card p-5 md:p-6">
            <h2 className="font-display font-semibold text-ink text-lg mb-5">Product Images</h2>
            <div
              className={cn(
                "border-2 border-dashed rounded-brand p-6 text-center cursor-pointer transition-colors",
                "hover:border-ink/30 hover:bg-cream-dark/50",
                "border-ink/15"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
                  <p className="text-sm text-ink-muted font-medium">Uploading...</p>
                </div>
              ) : (
                <>
                  <Upload size={24} className="mx-auto text-ink-muted mb-2" />
                  <p className="text-sm font-semibold text-ink">Click to upload images</p>
                  <p className="text-xs text-ink-muted mt-1">JPG, PNG, WebP up to 5MB each</p>
                </>
              )}
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 md:grid-cols-6 gap-3 mt-4">
                {images.map((img, i) => (
                  <div key={i} className="relative group aspect-square">
                    <img
                      src={img.url}
                      alt={`Product image ${i + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-ink text-cream px-1.5 py-0.5 rounded">
                        Primary
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 p-1 rounded-lg bg-blush/80 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Variants */}
          <div className="bg-white rounded-brand shadow-card p-5 md:p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-semibold text-ink text-lg">Variants</h2>
              <button
                type="button"
                onClick={() => appendVariant({ name: "Color", value: "", priceModifier: 0 })}
                className="btn-ghost text-sm"
              >
                <Plus size={14} />
                Add Variant
              </button>
            </div>
            <div className="space-y-3">
              {variantFields.map((field, i) => {
                const imgStr = watch(`variants.${i}.imageUrl`) || "{}";
                let imgData: { swatch?: string; gallery?: string[] } = {};
                try { imgData = JSON.parse(imgStr); } catch {}

                return (
                <div key={field.id} className="flex flex-col gap-3 p-4 border border-ink/10 rounded-xl bg-cream-dark/20">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="grid gap-2 items-center w-full" style={{ gridTemplateColumns: "1fr 2fr 1fr auto" }}>
                      <input
                        {...register(`variants.${i}.name`)}
                        placeholder="Type"
                        className={cn(
                          "input-brand min-w-0 px-2 sm:px-3 text-sm py-2.5",
                          errors.variants?.[i]?.name && "border-blush focus:border-blush"
                        )}
                      />
                      <input
                        {...register(`variants.${i}.value`)}
                        placeholder="Value (e.g. Blue)"
                        className={cn(
                          "input-brand min-w-0 px-2 sm:px-3 text-sm py-2.5",
                          errors.variants?.[i]?.value && "border-blush focus:border-blush"
                        )}
                      />
                      <input
                        {...register(`variants.${i}.priceModifier`)}
                        type="number"
                        placeholder="±Price"
                        className="input-brand min-w-0 px-2 sm:px-3 text-sm py-2.5"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariant(i)}
                        className="p-1.5 sm:p-2.5 rounded-xl text-blush hover:bg-blush/10 transition-colors flex-shrink-0"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {(errors.variants?.[i]?.name || errors.variants?.[i]?.value) && (
                      <p className="text-xs text-blush font-medium px-2">
                        {errors.variants?.[i]?.name?.message || errors.variants?.[i]?.value?.message}
                      </p>
                    )}
                  </div>
                  
                  {/* Variant Images Section */}
                  <div className="flex flex-wrap gap-6 mt-2 pt-3 border-t border-ink/5">
                    {/* Swatch */}
                    <div className="flex flex-col gap-2">
                      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Swatch Image</span>
                      {imgData.swatch ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-ink/10 group shadow-sm">
                          <img src={imgData.swatch} alt="Swatch" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeVariantImage(i, "swatch")}
                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={14} className="text-white" />
                          </button>
                        </div>
                      ) : (
                        <label className="w-12 h-12 rounded-full border-2 border-dashed border-ink/20 flex items-center justify-center cursor-pointer hover:bg-cream hover:border-ink/40 transition-colors">
                          <ImageIcon size={16} className="text-ink/40" />
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleVariantImageUpload(i, "swatch", e.target.files)} />
                        </label>
                      )}
                    </div>
                    
                    {/* Gallery */}
                    <div className="flex flex-col gap-2 flex-1">
                      <span className="text-[11px] font-semibold text-ink-muted uppercase tracking-wider">Specific Photos for this variant</span>
                      <div className="flex flex-wrap gap-2">
                        {imgData.gallery?.map((url, imgIndex) => (
                          <div key={imgIndex} className="relative w-12 h-12 rounded-lg overflow-hidden border border-ink/10 group shadow-sm">
                            <img src={url} alt={`Gallery ${imgIndex}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeVariantImage(i, "gallery", imgIndex)}
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X size={14} className="text-white" />
                            </button>
                          </div>
                        ))}
                        <label className="w-12 h-12 rounded-lg border-2 border-dashed border-ink/20 flex flex-col items-center justify-center cursor-pointer hover:bg-cream hover:border-ink/40 transition-colors shrink-0">
                          <Plus size={14} className="text-ink/40" />
                          <input type="file" multiple className="hidden" accept="image/*" onChange={(e) => e.target.files && handleVariantImageUpload(i, "gallery", e.target.files)} />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                );
              })}
              {variantFields.length === 0 && (
                <p className="text-sm text-ink-muted text-center py-4">
                  No variants yet. Click &apos;Add Variant&apos; to add colors, sizes, etc.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Side column */}
        <div className="space-y-5">
          {/* Pricing */}
          <div className="bg-white rounded-brand shadow-card p-5">
            <h2 className="font-display font-semibold text-ink text-lg mb-4">Pricing</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Price (₹) *</label>
                <input
                  {...register("price")}
                  type="number"
                  step="0.01"
                  className="input-brand"
                  placeholder="999"
                />
                {errors.price && <p className="text-xs text-blush mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Compare Price (₹)</label>
                <input
                  {...register("comparePrice")}
                  type="number"
                  step="0.01"
                  className="input-brand"
                  placeholder="1299 (original price)"
                />
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="bg-white rounded-brand shadow-card p-5">
            <h2 className="font-display font-semibold text-ink text-lg mb-4">Organization</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Category</label>
                <select {...register("categoryId")} className="input-brand">
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Brand</label>
                <input {...register("brand")} className="input-brand" placeholder="e.g. Pampers" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">SKU</label>
                <input {...register("sku")} className="input-brand" placeholder="LB-001" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Age Group</label>
                <select {...register("ageGroup")} className="input-brand">
                  <option>0-6 months</option>
                  <option>6-12 months</option>
                  <option>1-2 years</option>
                  <option>All ages</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Tags</label>
                <input
                  {...register("tags")}
                  className="input-brand"
                  placeholder="diaper, newborn, soft (comma-separated)"
                />
              </div>
            </div>
          </div>

          {/* Flags */}
          <div className="bg-white rounded-brand shadow-card p-5">
            <h2 className="font-display font-semibold text-ink text-lg mb-4">Status & Flags</h2>
            <div className="space-y-3">
              {[
                { key: "isActive", label: "Active (visible on site)" },
                { key: "inStock", label: "In Stock" },
                { key: "isFeatured", label: "Featured on Homepage" },
                { key: "isNewArrival", label: "Mark as New Arrival" },
                { key: "isBestSeller", label: "Mark as Best Seller" },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register(key as keyof ProductFormData)}
                    className="accent-ink w-4 h-4"
                  />
                  <span className="text-sm font-medium text-ink">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-brand shadow-card p-5">
            <h2 className="font-display font-semibold text-ink text-lg mb-4">SEO</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Meta Title</label>
                <input {...register("metaTitle")} className="input-brand text-sm" placeholder="SEO page title" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Meta Description</label>
                <textarea {...register("metaDescription")} className="input-brand resize-none text-sm" rows={3} placeholder="SEO description (160 chars)" />
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="btn-primary w-full py-3.5 text-base"
          >
            {saving ? (
              <span className="inline-block w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
            ) : (
              <>
                <Save size={18} />
                {productId ? "Update Product" : "Create Product"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
