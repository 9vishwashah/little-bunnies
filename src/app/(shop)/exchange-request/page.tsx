"use client";

import { useState } from "react";
import { Search, RefreshCcw, Upload, Film, X, CheckCircle2, Clock } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface ItemRow {
  id: string;
  productName: string;
  variantName: string | null;
  quantity: number;
  totalPrice: number;
  eligible: boolean;
  ineligibleReason?: string;
  existingRequest: { id: string; status: string; created_at: string } | null;
}

interface LookupResult {
  order: { id: string; orderNumber: string; displayNumber: string };
  items: ItemRow[];
}

const STATUS_LABELS: Record<string, string> = {
  requested: "Under review",
  approved: "Approved — we'll be in touch about pickup",
  rejected: "Not approved",
  pickup_fee_pending: "Awaiting pickup fee",
  pickup_scheduled: "Pickup scheduled",
  picked_up: "Picked up",
  received: "Received at warehouse",
  qc_passed: "Approved — processing",
  qc_failed: "Not approved after inspection",
  resolved: "Completed",
  cancelled: "Cancelled",
};

export default function ExchangeRequestPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [contact, setContact] = useState("");
  const [looking, setLooking] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);

  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleLookup = async () => {
    if (!orderNumber.trim() || !contact.trim()) {
      toast.error("Enter your order number and phone or email");
      return;
    }
    setLooking(true);
    setResult(null);
    try {
      const res = await fetch("/api/exchanges/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, contact }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      setResult(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLooking(false);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/exchanges/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!data.url) {
        toast.error(data.error || "Upload failed");
        return null;
      }
      return data.url;
    } catch {
      toast.error("Upload failed");
      return null;
    }
  };

  const handleVideoUpload = async (file: File) => {
    setVideoUploading(true);
    const url = await uploadFile(file);
    if (url) setVideoUrl(url);
    setVideoUploading(false);
  };

  const handlePhotoUpload = async (file: File) => {
    if (photoUrls.length >= 6) {
      toast.error("Maximum 6 photos");
      return;
    }
    setPhotoUploading(true);
    const url = await uploadFile(file);
    if (url) setPhotoUrls((prev) => [...prev, url]);
    setPhotoUploading(false);
  };

  const openRequestForm = (itemId: string) => {
    setActiveItemId(itemId);
    setReason("");
    setVideoUrl(null);
    setPhotoUrls([]);
  };

  const handleSubmit = async () => {
    if (!result || !activeItemId) return;
    if (reason.trim().length < 5) {
      toast.error("Please describe the issue in a bit more detail");
      return;
    }
    if (!videoUrl) {
      toast.error("An unboxing video is required");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/exchanges/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          contact,
          orderItemId: activeItemId,
          reason,
          unboxingVideoUrl: videoUrl,
          photoUrls,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request");
      toast.success("Exchange request submitted");
      setActiveItemId(null);
      handleLookup(); // refresh statuses
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream">
      <section className="bg-gradient-to-br from-cream-dark via-cream to-sky-brand py-16 md:py-20">
        <div className="section-container text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-white shadow-soft-sm mb-6">
            <RefreshCcw size={14} className="text-ink-muted" />
            <span className="text-xs font-bold text-ink-light tracking-wide uppercase">Exchange Request</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-sans font-semibold text-ink mb-4">
            Request an Exchange
          </h1>
          <p className="text-ink-muted text-base md:text-lg max-w-xl mx-auto font-medium">
            Enter your order number and the phone or email you used at checkout — no account needed.
          </p>
        </div>
      </section>

      <section className="section-container py-10 pb-20">
        <div className="max-w-2xl mx-auto bg-white rounded-brand shadow-card p-6 md:p-8">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Order Number</label>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="input-brand"
                placeholder="LB001 or LB202609..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Phone or Email</label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="input-brand"
                placeholder="Used at checkout"
              />
            </div>
          </div>
          <button
            onClick={handleLookup}
            disabled={looking}
            className="btn-primary w-full py-3 disabled:opacity-60"
          >
            {looking ? "Looking up..." : <><Search size={16} /> Find My Order</>}
          </button>

          {result && (
            <div className="mt-8 pt-6 border-t border-ink/8">
              <p className="text-sm font-semibold text-ink mb-4">Order {result.order.displayNumber}</p>
              <div className="space-y-3">
                {result.items.map((item) => (
                  <div key={item.id} className="border border-ink/8 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-ink text-sm">{item.productName}</p>
                        {item.variantName && <p className="text-xs text-ink-muted">{item.variantName}</p>}
                        <p className="text-xs text-ink-muted mt-0.5">
                          Qty: {item.quantity} · {formatPrice(item.totalPrice)}
                        </p>
                      </div>

                      {item.existingRequest ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-sage-dark bg-sage/15 px-2.5 py-1.5 rounded-pill whitespace-nowrap">
                          <Clock size={12} />
                          {STATUS_LABELS[item.existingRequest.status] || item.existingRequest.status}
                        </span>
                      ) : item.eligible ? (
                        <button
                          onClick={() => openRequestForm(item.id)}
                          className="btn-secondary text-xs px-3 py-2 whitespace-nowrap shrink-0"
                        >
                          Request Exchange
                        </button>
                      ) : (
                        <span className="text-xs text-ink-muted text-right max-w-[160px]">
                          {item.ineligibleReason}
                        </span>
                      )}
                    </div>

                    {activeItemId === item.id && (
                      <div className="mt-4 pt-4 border-t border-ink/8 space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-ink mb-1.5">Reason for exchange</label>
                          <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="input-brand text-sm min-h-[80px]"
                            placeholder="What's wrong with the item?"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-ink mb-1.5">
                            Unboxing Video *
                          </label>
                          <input
                            type="file"
                            id={`video-${item.id}`}
                            accept="video/mp4,video/webm,video/quicktime"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
                          />
                          {videoUrl ? (
                            <div className="flex items-center justify-between bg-sage-light/20 border border-sage-dark/30 rounded-xl px-4 py-2.5">
                              <span className="flex items-center gap-2 text-sm text-ink font-medium">
                                <Film size={16} className="text-sage-dark" /> Video attached
                              </span>
                              <button onClick={() => setVideoUrl(null)} className="text-ink-muted hover:text-blush-dark">
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <label
                              htmlFor={`video-${item.id}`}
                              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl border-2 border-dashed border-ink/20 cursor-pointer hover:border-ink/40 hover:bg-cream transition-colors text-ink-muted text-sm font-semibold"
                            >
                              {videoUploading ? (
                                <div className="w-5 h-5 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
                              ) : (
                                <><Upload size={16} /> Upload unboxing video</>
                              )}
                            </label>
                          )}
                          <p className="text-xs text-ink-muted mt-1">
                            Required — especially important if there's a packaging defect.
                          </p>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-ink mb-1.5">
                            Additional Photos (optional)
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {photoUrls.map((url, i) => (
                              <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-ink/10">
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <button
                                  onClick={() => setPhotoUrls((p) => p.filter((_, idx) => idx !== i))}
                                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-blush text-white flex items-center justify-center"
                                >
                                  <X size={10} />
                                </button>
                              </div>
                            ))}
                            {photoUrls.length < 6 && (
                              <>
                                <input
                                  type="file"
                                  id={`photo-${item.id}`}
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
                                />
                                <label
                                  htmlFor={`photo-${item.id}`}
                                  className="w-16 h-16 rounded-lg border-2 border-dashed border-ink/20 cursor-pointer hover:border-ink/40 flex items-center justify-center text-ink-muted"
                                >
                                  {photoUploading ? (
                                    <div className="w-4 h-4 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
                                  ) : (
                                    <Upload size={16} />
                                  )}
                                </label>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="btn-primary flex-1 text-sm py-2.5 disabled:opacity-60"
                          >
                            {submitting ? "Submitting..." : <><CheckCircle2 size={16} /> Submit Request</>}
                          </button>
                          <button
                            onClick={() => setActiveItemId(null)}
                            className="btn-secondary text-sm py-2.5 px-4"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
