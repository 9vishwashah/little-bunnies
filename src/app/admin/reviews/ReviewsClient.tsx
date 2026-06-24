"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Trash2, Star, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface Props {
  initialReviews: any[];
}

export default function ReviewsClient({ initialReviews }: Props) {
  const router = useRouter();
  const [reviews, setReviews] = useState(initialReviews);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleUpdateStatus = async (id: string, status: "approved" | "rejected") => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_approved: status === "approved" }),
      });

      if (!res.ok) throw new Error("Failed to update review status");
      
      toast.success(`Review ${status}`);
      setReviews(reviews.map((r) => r.id === id ? { ...r, is_approved: status === "approved" } : r));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update review");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review entirely?")) return;

    setLoadingId(id);
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete review");
      
      toast.success("Review deleted");
      setReviews(reviews.filter((r) => r.id !== id));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete review");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-brand shadow-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-cream-dark/50 border-b border-ink/8">
              <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-5 py-3.5">Review</th>
              <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Product</th>
              <th className="text-left text-xs font-bold text-ink-muted uppercase tracking-wide px-4 py-3.5">Status</th>
              <th className="text-right text-xs font-bold text-ink-muted uppercase tracking-wide px-5 py-3.5">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/5">
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-16 text-ink-muted">No reviews found</td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id} className="hover:bg-cream-dark/30 transition-colors">
                  <td className="px-5 py-4 max-w-md">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex text-peach-dark">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} fill={s <= review.rating ? "currentColor" : "none"} />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-ink">{review.title}</span>
                    </div>
                    <p className="text-sm text-ink-muted line-clamp-2">{review.comment}</p>
                    <p className="text-xs text-ink/50 mt-1">
                      By {review.user_name || review.users?.full_name || "Guest"} • {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/product/${review.products?.slug}`} target="_blank" className="flex items-center gap-1 text-sm font-medium text-ink hover:text-lavender-brand-dark transition-colors">
                      {review.products?.name} <ExternalLink size={12} />
                    </Link>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-pill ${
                      review.is_approved ? "bg-sage/20 text-sage-dark" : "bg-peach/20 text-peach-dark"
                    }`}>
                      {review.is_approved ? "Approved" : "Pending / Rejected"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!review.is_approved && (
                        <button
                          onClick={() => handleUpdateStatus(review.id, "approved")}
                          disabled={loadingId === review.id}
                          className="p-2 text-sage-dark hover:bg-sage/10 rounded-lg transition-colors"
                          title="Approve Review"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {review.is_approved && (
                        <button
                          onClick={() => handleUpdateStatus(review.id, "rejected")}
                          disabled={loadingId === review.id}
                          className="p-2 text-peach-dark hover:bg-peach/10 rounded-lg transition-colors"
                          title="Reject Review"
                        >
                          <X size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={loadingId === review.id}
                        className="p-2 text-ink-muted hover:text-blush hover:bg-blush/10 rounded-lg transition-colors ml-2"
                        title="Delete Review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
