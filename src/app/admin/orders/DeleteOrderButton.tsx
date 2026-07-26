"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  orderId: string;
  orderNumber: string;
}

export default function DeleteOrderButton({ orderId, orderNumber }: Props) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete order");
      }
      toast.success(`Order #${orderNumber} deleted`);
      setShowConfirm(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="btn-ghost text-xs p-2 text-blush-dark hover:bg-blush/10"
        title="Delete order"
      >
        <Trash2 size={16} />
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => !loading && setShowConfirm(false)}
          />

          {/* Dialog */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full animate-fade-in">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-cream-dark text-ink-muted transition-colors"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-blush/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle size={20} className="text-blush-dark" />
              </div>
              <div>
                <h3 className="font-display font-bold text-ink text-base">Delete Order?</h3>
                <p className="text-xs text-ink-muted">#{orderNumber}</p>
              </div>
            </div>

            <p className="text-sm text-ink-muted mb-6 leading-relaxed">
              This action is <strong className="text-ink">permanent</strong> and cannot be undone. All order items and data associated with this order will be removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="btn-secondary flex-1 text-sm py-2.5"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 text-sm py-2.5 rounded-brand font-semibold bg-blush-dark text-white hover:bg-blush-dark/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white/40 border-t-white rounded-full" />
                ) : (
                  <Trash2 size={14} />
                )}
                {loading ? "Deleting…" : "Delete Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
