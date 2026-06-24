"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Check, X, Tag } from "lucide-react";
import { toast } from "sonner";

interface Props {
  initialCoupons: any[];
}

export default function CouponsClient({ initialCoupons }: Props) {
  const router = useRouter();
  const [coupons, setCoupons] = useState(initialCoupons);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage", // percentage | fixed
    value: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    max_uses: 100,
    expires_at: "",
    is_active: true,
  });

  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      code: "",
      type: "percentage",
      value: 0,
      min_order_amount: 0,
      max_discount_amount: 0,
      max_uses: 100,
      expires_at: "",
      is_active: true,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEdit = (coupon: any) => {
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      min_order_amount: coupon.min_order_amount || 0,
      max_discount_amount: coupon.max_discount_amount || 0,
      max_uses: coupon.max_uses || 0,
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().slice(0, 16) : "",
      is_active: coupon.is_active,
    });
    setEditingId(coupon.id);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!formData.code || formData.value <= 0) {
      toast.error("Code and a valid discount value are required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase(),
        expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null,
        max_discount_amount: formData.max_discount_amount || null,
        max_uses: formData.max_uses || null,
      };

      const url = editingId ? `/api/admin/coupons/${editingId}` : `/api/admin/coupons`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success(editingId ? "Coupon updated" : "Coupon created");
      router.refresh();
      resetForm();
      
      if (editingId) {
        setCoupons(coupons.map((c: any) => c.id === editingId ? { ...c, ...payload } : c));
      } else {
        setCoupons([{ id: data.id, ...payload, uses_count: 0 }, ...coupons]);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save coupon");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error);
      }
      toast.success("Coupon deleted");
      setCoupons(coupons.filter((c: any) => c.id !== id));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  return (
    <div className="bg-white rounded-brand shadow-card overflow-hidden">
      <div className="p-5 border-b border-ink/8 flex justify-between items-center bg-cream-dark/20">
        <h2 className="font-semibold text-ink">All Coupons</h2>
        {!isAdding && !editingId && (
          <button onClick={() => setIsAdding(true)} className="btn-primary text-xs py-2 px-4">
            <Plus size={14} /> Add Coupon
          </button>
        )}
      </div>

      <div className="p-5">
        {(isAdding || editingId) && (
          <div className="bg-cream-dark/50 p-5 rounded-xl mb-6 border border-ink/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink text-sm">
                {editingId ? "Edit Coupon" : "New Coupon"}
              </h3>
              <button onClick={resetForm} className="text-ink-muted hover:text-ink"><X size={16} /></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Coupon Code</label>
                <input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="input-brand text-sm py-2"
                  placeholder="e.g. WELCOME10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Discount Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="input-brand text-sm py-2"
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Discount Value</label>
                <input
                  type="number"
                  value={formData.value || ""}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                  className="input-brand text-sm py-2"
                  placeholder="e.g. 10"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Min Order Amount (₹)</label>
                <input
                  type="number"
                  value={formData.min_order_amount || ""}
                  onChange={(e) => setFormData({ ...formData, min_order_amount: Number(e.target.value) })}
                  className="input-brand text-sm py-2"
                  placeholder="e.g. 999"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Max Discount Amount (₹)</label>
                <input
                  type="number"
                  value={formData.max_discount_amount || ""}
                  onChange={(e) => setFormData({ ...formData, max_discount_amount: Number(e.target.value) })}
                  className="input-brand text-sm py-2"
                  placeholder="e.g. 500 (optional)"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={formData.max_uses || ""}
                  onChange={(e) => setFormData({ ...formData, max_uses: Number(e.target.value) })}
                  className="input-brand text-sm py-2"
                  placeholder="e.g. 100 (optional)"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Expiry Date</label>
                <input
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  className="input-brand text-sm py-2"
                />
              </div>
              <div className="md:col-span-2 flex items-center gap-2 mt-6">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="accent-ink w-4 h-4"
                  id="isActiveCoupon"
                />
                <label htmlFor="isActiveCoupon" className="text-sm font-medium text-ink cursor-pointer">Active</label>
              </div>
            </div>
            
            <div className="flex gap-2 pt-2 border-t border-ink/8">
              <button onClick={handleSave} disabled={loading} className="btn-primary text-sm py-2.5 px-6">
                {loading ? "..." : <><Check size={16} /> Save Coupon</>}
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/8">
                <th className="text-left text-xs font-bold text-ink-muted uppercase pb-3">Code</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase pb-3">Discount</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase pb-3">Rules</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase pb-3">Usage</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase pb-3">Status</th>
                <th className="text-left text-xs font-bold text-ink-muted uppercase pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {coupons.map((coupon: any) => (
                <tr key={coupon.id} className="hover:bg-cream-dark/30 transition-colors">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <Tag size={14} className="text-ink-muted" />
                      <span className="font-bold text-ink bg-cream-dark px-2 py-0.5 rounded text-sm tracking-wide">
                        {coupon.code}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 font-semibold text-ink text-sm">
                    {coupon.type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}
                  </td>
                  <td className="py-3 text-xs text-ink-muted space-y-0.5">
                    {coupon.min_order_amount > 0 && <p>Min: ₹{coupon.min_order_amount}</p>}
                    {coupon.max_discount_amount > 0 && <p>Max cap: ₹{coupon.max_discount_amount}</p>}
                    {coupon.expires_at && <p>Exp: {new Date(coupon.expires_at).toLocaleDateString()}</p>}
                    {!coupon.min_order_amount && !coupon.max_discount_amount && !coupon.expires_at && "No restrictions"}
                  </td>
                  <td className="py-3 text-sm text-ink font-medium">
                    {coupon.uses_count} {coupon.max_uses ? `/ ${coupon.max_uses}` : "uses"}
                  </td>
                  <td className="py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-pill ${coupon.is_active ? "bg-sage/20 text-sage-dark" : "bg-ink/10 text-ink-muted"}`}>
                      {coupon.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(coupon)} className="p-2 text-ink-muted hover:text-ink hover:bg-cream-dark rounded-lg transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(coupon.id)} className="p-2 text-ink-muted hover:text-blush hover:bg-blush/10 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && !isAdding && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-ink-muted text-sm">
                    No coupons created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
