"use client";

import { useState, useEffect, useRef } from "react";
import { QrCode, Upload, X, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsClient() {
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/settings/bank-qr")
      .then((r) => r.json())
      .then((data) => {
        setQrUrl(data.url || null);
        setSavedUrl(data.url || null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bucket", "products");
    formData.append("folder", "settings");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setQrUrl(data.url);
      } else {
        toast.error(data.error || "Failed to upload QR code");
      }
    } catch {
      toast.error("Failed to upload QR code");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings/bank-qr", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: qrUrl }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to save");
      setSavedUrl(qrUrl);
      toast.success("Bank QR code saved!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-brand shadow-card p-6 flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-brand shadow-card p-5 md:p-6">
        <div className="flex items-center gap-2 mb-1">
          <QrCode size={18} className="text-ink-muted" />
          <h2 className="font-display font-semibold text-ink text-lg">Bank QR Code</h2>
        </div>
        <p className="text-xs text-ink-muted mb-5">
          Shown to every customer at checkout instead of the payment gateway. Customers scan
          this to pay, then upload a screenshot of the transaction as proof.
        </p>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        />

        {qrUrl ? (
          <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-ink/10 bg-cream-dark/20 mb-4">
            <img src={qrUrl} alt="Bank QR code" className="w-full h-full object-contain" />
            {uploading && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setQrUrl(null)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-blush text-white flex items-center justify-center shadow"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-48 h-48 rounded-2xl border-2 border-dashed border-ink/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-ink/40 hover:bg-cream-dark/50 transition-colors mb-4"
          >
            {uploading ? (
              <div className="w-6 h-6 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
            ) : (
              <>
                <Upload size={24} className="text-ink-muted" />
                <span className="text-xs font-semibold text-ink-muted">Upload QR code</span>
              </>
            )}
          </div>
        )}

        {qrUrl && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-ghost text-sm mb-5"
          >
            <Upload size={14} /> Replace QR code
          </button>
        )}

        <button
          onClick={handleSave}
          disabled={saving || qrUrl === savedUrl}
          className="btn-primary w-full py-3 text-sm disabled:opacity-50"
        >
          {saving ? (
            <span className="inline-block w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
          ) : (
            <>
              <Save size={16} /> Save
            </>
          )}
        </button>
      </div>
    </div>
  );
}
