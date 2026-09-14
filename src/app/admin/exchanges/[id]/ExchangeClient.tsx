"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Package, MessageCircle, Check, X, Film, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, formatInvoiceNumber } from "@/lib/utils";

interface Props {
  request: any;
}

const STATUS_LABELS: Record<string, string> = {
  requested: "Requested",
  approved: "Approved",
  rejected: "Rejected",
  pickup_fee_pending: "Awaiting Pickup Fee",
  pickup_scheduled: "Pickup Scheduled",
  picked_up: "Picked Up",
  received: "Received at Warehouse",
  qc_passed: "QC Passed",
  qc_failed: "QC Failed",
  resolved: "Resolved",
  cancelled: "Cancelled",
};

export default function ExchangeClient({ request }: Props) {
  const router = useRouter();
  const [adminNotes, setAdminNotes] = useState(request.admin_notes || "");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const order = request.orders;
  const item = request.order_items;
  const address = order?.shipping_address;
  const displayOrderNumber =
    typeof order?.invoice_number === "number" ? formatInvoiceNumber(order.invoice_number) : order?.order_number;

  const decide = async (status: "approved" | "rejected") => {
    setLoading(status === "approved" ? "approve" : "reject");
    try {
      const res = await fetch(`/api/admin/exchanges/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update request");
      toast.success(status === "approved" ? "Exchange approved" : "Exchange rejected");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  const whatsappUrl = request.contact_phone
    ? `https://wa.me/91${request.contact_phone}?text=${encodeURIComponent(
        `Hi, regarding your exchange request for order ${displayOrderNumber}...`
      )}`
    : null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/exchanges" className="p-2 bg-white rounded-xl shadow-soft hover:shadow-card transition-shadow">
          <ArrowLeft size={20} className="text-ink" />
        </Link>
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Exchange Request</h1>
          <p className="text-ink-muted text-sm mt-0.5 flex items-center gap-2">
            <Clock size={14} />
            {new Date(request.created_at).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-brand shadow-card p-5 md:p-6">
            <h2 className="font-display font-semibold text-ink text-lg mb-4 flex items-center gap-2">
              <Package size={20} className="text-ink-muted" /> Item
            </h2>
            <div className="flex justify-between items-start p-4 border border-ink/8 rounded-xl bg-cream-dark/20">
              <div>
                <p className="font-semibold text-ink text-sm">{item?.product_name}</p>
                {item?.variant_name && <p className="text-xs text-ink-muted">{item.variant_name}</p>}
                <p className="text-sm font-medium text-ink-muted mt-1">
                  Qty: {item?.quantity} × {formatPrice(item?.unit_price || 0)}
                </p>
              </div>
              <p className="font-bold text-ink text-sm">{formatPrice(item?.total_price || 0)}</p>
            </div>
            <div className="mt-4 text-sm">
              <p className="font-semibold text-ink mb-1">Reason given</p>
              <p className="text-ink-light">{request.reason}</p>
            </div>
          </div>

          <div className="bg-white rounded-brand shadow-card p-5 md:p-6">
            <h2 className="font-display font-semibold text-ink text-lg mb-4 flex items-center gap-2">
              <Film size={20} className="text-ink-muted" /> Unboxing Evidence
            </h2>
            <div className="mb-4">
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wide mb-2">Unboxing Video</p>
              <video
                src={request.unboxing_video_url}
                controls
                className="w-full rounded-xl border border-ink/10 bg-black max-h-96"
              />
            </div>
            {request.photo_urls?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-ink-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <ImageIcon size={13} /> Additional Photos
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {request.photo_urls.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`Evidence ${i + 1}`} className="w-full aspect-square object-cover rounded-lg border border-ink/10" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-brand shadow-card p-5 md:p-6">
            <h2 className="font-display font-semibold text-ink text-lg mb-1">
              Order #{displayOrderNumber}
            </h2>
            <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-pill bg-cream-dark text-ink-muted capitalize mt-1 mb-4">
              {STATUS_LABELS[request.status] || request.status}
            </span>

            {request.status === "requested" ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Admin Notes (optional)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="input-brand text-sm min-h-[80px]"
                    placeholder="Internal note, or a reason shown if rejecting..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => decide("approved")}
                    disabled={loading !== null}
                    className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-60"
                  >
                    {loading === "approve" ? "..." : <><Check size={16} /> Approve</>}
                  </button>
                  <button
                    onClick={() => decide("rejected")}
                    disabled={loading !== null}
                    className="btn-secondary flex-1 text-sm py-2.5 disabled:opacity-60"
                  >
                    {loading === "reject" ? "..." : <><X size={16} /> Reject</>}
                  </button>
                </div>
              </div>
            ) : (
              request.admin_notes && (
                <div className="text-sm">
                  <p className="font-semibold text-ink mb-1">Admin Notes</p>
                  <p className="text-ink-light">{request.admin_notes}</p>
                </div>
              )
            )}
          </div>

          <div className="bg-white rounded-brand shadow-card p-5 md:p-6">
            <h2 className="font-display font-semibold text-ink text-lg mb-4">Customer Contact</h2>
            <div className="space-y-2 text-sm text-ink-light">
              {address?.full_name && <p className="font-semibold text-ink">{address.full_name}</p>}
              <p>{request.contact_phone}</p>
              {request.contact_email && <p>{request.contact_email}</p>}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-[#25D366] font-semibold flex items-center gap-1 mt-1 text-xs">
                  <MessageCircle size={14} /> Message on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
