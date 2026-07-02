"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${productName}"?\n\nIf this product has existing orders it will be deactivated (hidden from store) instead of permanently removed.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        // Show the actual DB error from the API
        throw new Error(data.error || "Failed to delete product");
      }

      if (data.soft) {
        // Product had orders — soft deleted
        toast.warning(data.message, { duration: 6000 });
      } else {
        toast.success(`"${productName}" permanently deleted.`);
      }

      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 rounded-lg text-ink-muted hover:text-blush-dark hover:bg-blush/10 transition-colors disabled:opacity-50"
      aria-label="Delete Product"
      title="Delete Product"
    >
      {isDeleting ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Trash2 size={15} />
      )}
    </button>
  );
}
