"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ShoppingBag, Banknote, Smartphone, CheckCircle2, Download } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, PROMO_COUPON_CODE, PROMO_COUPON_LABEL } from "@/lib/utils";
import type { WalkInProduct } from "./page";

interface LineItem {
  key: string;
  productId: string;
  name: string;
  image: string | null;
  unitPrice: number;
  quantity: number;
  variant?: { id: string; name: string; value: string };
}

export default function WalkInOrderForm({ products }: { products: WalkInProduct[] }) {
  const router = useRouter();
  const [items, setItems] = useState<LineItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [addQty, setAddQty] = useState(1);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "upi">("cash");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ orderId: string; orderNumber: string } | null>(null);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  const handleAddItem = () => {
    if (!selectedProduct) return;
    const variant = selectedProduct.variants.find((v) => v.id === selectedVariantId);
    const unitPrice = selectedProduct.price + (variant?.price_modifier || 0);

    setItems((prev) => [
      ...prev,
      {
        key: `${selectedProduct.id}-${variant?.id || "base"}-${Date.now()}`,
        productId: selectedProduct.id,
        name: selectedProduct.brand || selectedProduct.name,
        image: variant?.image_url || selectedProduct.image,
        unitPrice,
        quantity: Math.max(1, addQty),
        variant: variant ? { id: variant.id, name: variant.name, value: variant.value } : undefined,
      },
    ]);
    setAddQty(1);
  };

  const handleRemoveItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleApplyCoupon = async (codeOverride?: string) => {
    const code = (codeOverride || couponCode).trim();
    if (!code) return;
    if (items.length === 0) {
      setCouponError("Add items before applying a coupon");
      return;
    }

    setValidatingCoupon(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!data.valid) {
        setAppliedCoupon(null);
        setCouponError(data.error || "Invalid coupon code");
        return;
      }
      setAppliedCoupon({ code: data.code || code, discountAmount: data.discountAmount || 0 });
      setCouponCode(data.code || code);
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Add at least one product");
      return;
    }
    if (customerName.trim().length < 2 || phone.trim().length < 6) {
      toast.error("Customer name and phone are required");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/orders/walk-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.productId,
            name: item.name,
            image: item.image || "",
            quantity: item.quantity,
            variant: item.variant,
          })),
          customerName,
          phone,
          email: email || undefined,
          addressLine1: addressLine1 || undefined,
          city: city || undefined,
          state: state || undefined,
          pincode: pincode || undefined,
          note: note || undefined,
          paymentMethod,
          couponCode: appliedCoupon?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create order");

      const displayNumber = data.invoiceNumber || data.orderNumber;
      setResult({ orderId: data.orderId, orderNumber: displayNumber });
      toast.success(`Order ${displayNumber} created`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setItems([]);
    setCustomerName("");
    setPhone("");
    setEmail("");
    setAddressLine1("");
    setCity("");
    setState("");
    setPincode("");
    setNote("");
    setPaymentMethod("cash");
    setCouponCode("");
    setAppliedCoupon(null);
    setCouponError(null);
    setResult(null);
    router.refresh();
  };

  if (result) {
    return (
      <div className="bg-white rounded-brand shadow-card p-8 max-w-lg text-center">
        <div className="w-14 h-14 rounded-full bg-sage/20 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-sage-dark" />
        </div>
        <h2 className="font-display text-xl font-bold text-ink mb-1">Sale recorded</h2>
        <p className="text-ink-muted text-sm mb-6">
          Order <span className="font-semibold text-ink">{result.orderNumber}</span> has been created and marked as paid.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={`/api/admin/orders/${result.orderId}/invoice`}
            target="_blank"
            rel="noreferrer"
            className="btn-primary inline-flex items-center justify-center gap-2"
          >
            <Download size={16} />
            View / Print Receipt
          </a>
          <button type="button" onClick={handleCreateAnother} className="btn-secondary">
            New Sale
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6 items-start">
      {/* Product picker + cart */}
      <div className="lg:col-span-2 bg-white rounded-brand shadow-card p-5 sm:p-6">
        <h2 className="font-display font-semibold text-ink text-lg mb-4">Items</h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-5 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-ink mb-1.5">Product</label>
            <select
              className="input-brand"
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setSelectedVariantId("");
              }}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {(p.brand || p.name)} — {formatPrice(p.price)}
                </option>
              ))}
            </select>
          </div>

          {selectedProduct && selectedProduct.variants.length > 0 && (
            <div className="w-full sm:w-48">
              <label className="block text-sm font-semibold text-ink mb-1.5">Option</label>
              <select
                className="input-brand"
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
              >
                <option value="">Standard</option>
                {selectedProduct.variants.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}: {v.value}
                    {v.price_modifier ? ` (+${formatPrice(v.price_modifier)})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="w-full sm:w-24">
            <label className="block text-sm font-semibold text-ink mb-1.5">Qty</label>
            <input
              type="number"
              min={1}
              className="input-brand"
              value={addQty}
              onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            disabled={!selectedProduct}
            className="btn-primary flex items-center gap-1.5 px-4 h-[42px] shrink-0 disabled:opacity-50"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-10 text-ink-muted text-sm border border-dashed border-ink/15 rounded-xl">
            <ShoppingBag size={22} className="mx-auto mb-2 text-ink/30" />
            No items added yet
          </div>
        ) : (
          <div className="divide-y divide-ink/8 border border-ink/8 rounded-xl overflow-hidden">
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-3 px-4 py-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-dark flex-shrink-0">
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-ink text-sm truncate">{item.name}</p>
                  {item.variant && (
                    <p className="text-xs text-ink-muted">
                      {item.variant.name}: {item.variant.value}
                    </p>
                  )}
                  <p className="text-xs text-ink-muted">
                    {item.quantity} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <p className="font-bold text-ink text-sm whitespace-nowrap">
                  {formatPrice(item.unitPrice * item.quantity)}
                </p>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.key)}
                  className="p-2 text-ink-muted hover:text-blush-dark transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer + payment + summary */}
      <div className="bg-white rounded-brand shadow-card p-5 sm:p-6">
        <h2 className="font-display font-semibold text-ink text-lg mb-4">Customer & Payment</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Customer Name *</label>
            <input
              className="input-brand"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Phone *</label>
            <input
              className="input-brand"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Email (optional)</label>
            <input
              className="input-brand"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="For emailing the receipt"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Address (optional)</label>
            <input
              className="input-brand"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="House no., street, area"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">City</label>
              <input className="input-brand" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">State</label>
              <input className="input-brand" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Pincode</label>
              <input className="input-brand" value={pincode} onChange={(e) => setPincode(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Note (optional)</label>
            <input
              className="input-brand"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Internal note"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("cash")}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  paymentMethod === "cash"
                    ? "bg-ink text-white border-ink"
                    : "border-ink/15 text-ink-muted hover:bg-cream-dark/40"
                }`}
              >
                <Banknote size={16} />
                Cash
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold border transition-colors ${
                  paymentMethod === "upi"
                    ? "bg-ink text-white border-ink"
                    : "border-ink/15 text-ink-muted hover:bg-cream-dark/40"
                }`}
              >
                <Smartphone size={16} />
                Online
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Coupon Code (optional)</label>
            <div className="flex gap-2">
              <input
                className="input-brand flex-1"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder={`e.g. ${PROMO_COUPON_CODE}`}
              />
              <button
                type="button"
                onClick={() => handleApplyCoupon()}
                disabled={validatingCoupon || !couponCode.trim()}
                className="btn-secondary px-4 shrink-0 disabled:opacity-50"
              >
                {validatingCoupon ? "..." : "Apply"}
              </button>
            </div>
            {appliedCoupon ? (
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-xs text-sage-dark font-semibold">✓ {appliedCoupon.code} applied</span>
                <button type="button" onClick={handleRemoveCoupon} className="text-xs text-ink-muted hover:text-blush-dark">
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setCouponCode(PROMO_COUPON_CODE);
                  handleApplyCoupon(PROMO_COUPON_CODE);
                }}
                className="text-xs text-sage-dark font-semibold mt-1.5 hover:underline"
              >
                Apply site offer — {PROMO_COUPON_CODE} ({PROMO_COUPON_LABEL})
              </button>
            )}
            {couponError && <p className="text-xs text-blush-dark mt-1.5">{couponError}</p>}
          </div>

          <div className="pt-3 border-t border-ink/8 space-y-1.5">
            <div className="flex justify-between text-sm text-ink-muted">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-sm text-sage-dark font-semibold">
                <span>Discount ({appliedCoupon.code})</span>
                <span>- {formatPrice(appliedCoupon.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-ink-muted">
              <span>Delivery</span>
              <span className="text-sage-dark font-semibold">FREE</span>
            </div>
            <div className="flex justify-between text-base font-bold text-ink pt-1">
              <span>Total</span>
              <span>{formatPrice(Math.max(0, subtotal - (appliedCoupon?.discountAmount || 0)))}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-60"
          >
            {submitting ? "Recording sale..." : "Record Sale & Generate Receipt"}
          </button>
        </div>
      </div>
    </div>
  );
}
