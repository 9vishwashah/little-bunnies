"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import confetti from "canvas-confetti";
import { useCartStore } from "@/store/cartStore";
import { formatPrice, calculateShipping, PROMO_COUPON_CODE } from "@/lib/utils";
import { Check, MapPin, Package, CreditCard, Tag, X, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const addressSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter valid 10-digit Indian mobile number"),
  addressLine1: z.string().min(5, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Enter valid 6-digit pincode"),
});

type AddressFormData = z.infer<typeof addressSchema>;

const STEPS = [
  { id: 1, label: "Address", icon: MapPin },
  { id: 2, label: "Review", icon: Package },
  { id: 3, label: "Payment", icon: CreditCard },
];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState<AddressFormData | null>(null);
  // useRef is synchronous — immune to React batching — so the guard
  // useEffect always sees the correct value even when Zustand fires
  // its subscription synchronously on clearCart().
  const orderPlacedRef = useRef(false);
  const { items, getTotalPrice, clearCart } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const [ablepayLoading, setAblepayLoading] = useState(false);

  const subtotal = getTotalPrice();
  const shipping = calculateShipping(subtotal);
  const total = Math.max(0, subtotal + shipping - couponDiscount);

  const applyCoupon = async (codeOverride?: string) => {
    const code = (codeOverride || couponInput).trim();
    if (!code) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (!data.valid) {
        setCouponError(data.error || "Invalid coupon code");
        return;
      }
      setCouponCode(code.toUpperCase());
      setCouponDiscount(data.discountAmount || 0);
      toast.success(`🎉 Coupon applied! You saved ${formatPrice(data.discountAmount || 0)}`);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#8FAD78", "#B9C9A8", "#24324A", "#F0EBE0"],
      });
    } catch {
      setCouponError("Couldn't validate coupon. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setCouponDiscount(0);
    setCouponInput("");
    setCouponError("");
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
  });


  const onAddressSubmit = (data: AddressFormData) => {
    setAddress(data);
    setStep(2);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // AblePay: creates a pending order, then does a full-page redirect to the
  // hosted checkout URL AblePay returns. The customer comes back via
  // /api/checkout/ablepay-return, which finalizes the order and redirects
  // on to /checkout/success (or back here with an ?error= on failure).
  const handleAblePayOrder = async () => {
    if (!address) return;
    setAblepayLoading(true);
    try {
      const res = await fetch("/api/checkout/create-ablepay-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          address,
          customName: null,
          couponCode,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success || !data.paymentUrl) {
        throw new Error(data.error || "Could not start payment");
      }

      orderPlacedRef.current = true;
      window.location.href = data.paymentUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start payment. Please try again.");
      setAblepayLoading(false);
    }
  };

  // Surface a payment failure/cancellation the customer bounced back to
  // this page with (from ablepay-return's ?error= redirect).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (!error) return;
    const messages: Record<string, string> = {
      payment_failed: params.get("reason")
        ? `Payment failed: ${params.get("reason")}`
        : "Payment failed. Please try again.",
      payment_verification_failed: "We couldn't verify that payment. Please try again or contact us.",
      order_not_found: "We couldn't find that order. Please try again.",
      internal_error: "Something went wrong. Please try again.",
    };
    toast.error(messages[error] || "Payment was not completed. Please try again.");
    window.history.replaceState(null, "", window.location.pathname);
  }, []);

  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Show nothing until hydration completes.
  if (!isHydrated) {
    return null;
  }

  // If cart is empty and order wasn't just placed, show empty state
  if (items.length === 0 && !orderPlacedRef.current) {
    return (
      <div className="section-container py-20 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="w-24 h-24 rounded-full bg-cream-dark flex items-center justify-center mb-6">
          <Package size={40} className="text-ink-muted" />
        </div>
        <h1 className="font-display text-2xl font-bold text-ink mb-2">
          Your cart is empty
        </h1>
        <p className="text-ink-muted font-medium mb-8 max-w-sm">
          Please add some items to your cart before proceeding to checkout.
        </p>
        <button onClick={() => router.push("/products")} className="btn-primary">
          Explore Products
        </button>
      </div>
    );
  }

  return (
    <div className="section-container py-8 md:py-12 max-w-4xl">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10 max-w-sm mx-auto">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  if (step > s.id) setStep(s.id);
                }}
                disabled={step <= s.id}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step > s.id
                    ? "bg-sage text-white cursor-pointer"
                    : step === s.id
                    ? "bg-ink text-cream"
                    : "bg-cream-dark text-ink-muted"
                }`}
              >
                {step > s.id ? <Check size={16} /> : s.id}
              </button>
              <span className={`text-xs font-semibold ${step === s.id ? "text-ink" : "text-ink-muted"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${
                  step > s.id ? "bg-sage" : "bg-cream-dark"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2">
          {/* Step 1: Address */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="bg-white rounded-brand shadow-card p-6">
                <h2 className="font-display font-semibold text-ink text-xl mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-ink-muted" />
                  Delivery Address
                </h2>
              <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Full Name *</label>
                    <input {...register("fullName")} className="input-brand" placeholder="John Doe" />
                    {errors.fullName && <p className="text-xs text-blush mt-1">{errors.fullName.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Mobile Number *</label>
                    <input
                      {...register("phone")}
                      className="input-brand"
                      placeholder="9876543210"
                      maxLength={10}
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      onInput={(e) => {
                        // Strip non-digits on input for safety
                        const el = e.currentTarget;
                        el.value = el.value.replace(/\D/g, "");
                      }}
                    />
                    {errors.phone && <p className="text-xs text-blush mt-1">{errors.phone.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Email *</label>
                  <input
                    {...register("email")}
                    className="input-brand"
                    placeholder="you@example.com"
                    type="email"
                  />
                  {errors.email && <p className="text-xs text-blush mt-1">{errors.email.message}</p>}
                  <p className="text-xs text-ink-muted mt-1">We&apos;ll send your payment receipt and order updates here.</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Address Line 1 *</label>
                  <input {...register("addressLine1")} className="input-brand" placeholder="House No., Street, Area" />
                  {errors.addressLine1 && <p className="text-xs text-blush mt-1">{errors.addressLine1.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Address Line 2</label>
                  <input {...register("addressLine2")} className="input-brand" placeholder="Landmark, Apartment (optional)" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">City *</label>
                    <input {...register("city")} className="input-brand" placeholder="Mumbai" />
                    {errors.city && <p className="text-xs text-blush mt-1">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">State *</label>
                    <select {...register("state")} className="input-brand">
                      <option value="">Select state</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-xs text-blush mt-1">{errors.state.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink mb-1.5">Pincode *</label>
                    <input {...register("pincode")} className="input-brand" placeholder="400001" maxLength={6} />
                    {errors.pincode && <p className="text-xs text-blush mt-1">{errors.pincode.message}</p>}
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-3.5 mt-2">
                  Continue to Review →
                </button>
              </form>
              </div>
            </motion.div>
          )}

          {/* Step 2: Review */}
          {step === 2 && address && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <button
                onClick={() => setStep(1)}
                className="flex items-center gap-2 text-sm font-semibold text-ink-muted hover:text-ink transition-colors mb-2"
              >
                ← Go Back to Address
              </button>

              {/* Address summary */}
              <div className="bg-white rounded-brand shadow-card p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-semibold text-ink flex items-center gap-2">
                    <MapPin size={16} className="text-ink-muted" />
                    Delivery to
                  </h3>
                  <button onClick={() => setStep(1)} className="text-sm font-semibold text-sage-dark hover:text-ink">
                    Edit
                  </button>
                </div>
                <p className="font-semibold text-ink">{address.fullName}</p>
                <p className="text-sm text-ink-muted mt-0.5">
                  {address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ""}
                </p>
                <p className="text-sm text-ink-muted">
                  {address.city}, {address.state} — {address.pincode}
                </p>
                <p className="text-sm text-ink-muted">📞 {address.phone}</p>
              </div>



              {/* Items */}
              <div className="bg-white rounded-brand shadow-card p-5">
                <h3 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
                  <Package size={16} className="text-ink-muted" />
                  Order Items
                </h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variant?.id}`} className="flex items-center gap-3">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-cream-dark flex-shrink-0">
                        <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-ink line-clamp-1">{item.name}</p>
                        {item.variant && <p className="text-xs text-ink-muted">{item.variant.value}</p>}
                        <p className="text-xs text-ink-muted">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-ink text-sm">
                        {formatPrice((item.price + (item.variant?.price_modifier || 0)) * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Coupon */}
              <div className="bg-white rounded-brand shadow-card p-5">
                <h3 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
                  <Tag size={16} className="text-ink-muted" />
                  Have a coupon?
                </h3>
                {couponCode ? (
                  <div className="flex items-center justify-between bg-sage-light/30 border border-sage-dark/20 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sage-dark text-lg">🎉</span>
                      <div>
                        <p className="text-xs font-bold text-sage-dark uppercase tracking-wide">
                          {couponCode} Applied
                        </p>
                        <p className="text-xs text-ink-muted font-medium">
                          You saved {formatPrice(couponDiscount)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="p-1.5 rounded-lg text-ink-muted hover:text-blush transition-colors"
                      aria-label="Remove coupon"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => applyCoupon(PROMO_COUPON_CODE)}
                      disabled={couponLoading}
                      className="w-full flex items-center justify-between gap-3 rounded-xl border-2 border-dashed border-[#E8871E]/60 px-4 py-3 mb-3 transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, rgba(232,135,30,0.08), rgba(142,36,57,0.08))" }}
                    >
                      <span className="text-left">
                        <span className="block text-xs font-bold uppercase tracking-wide" style={{ color: "#8E2439" }}>
                          🪔 Ganpati Special — {PROMO_COUPON_CODE}
                        </span>
                        <span className="block text-xs text-ink-muted font-medium mt-0.5">
                          Get 10% off your order
                        </span>
                      </span>
                      <span className="btn-secondary text-xs px-3 py-1.5 shrink-0">
                        {couponLoading ? "..." : "Apply"}
                      </span>
                    </button>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value.toUpperCase());
                          setCouponError("");
                        }}
                        placeholder="Enter coupon code"
                        className="flex-1 input-brand uppercase"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            applyCoupon();
                          }
                        }}
                      />
                      <button
                        onClick={() => applyCoupon()}
                        disabled={couponLoading || !couponInput.trim()}
                        className="btn-secondary px-5 disabled:opacity-50"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-blush mt-1.5 ml-1">{couponError}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-brand shadow-card p-5">
                <h3 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
                  <CreditCard size={16} className="text-ink-muted" />
                  Payment
                </h3>

                <div className="rounded-xl border-2 border-ink p-5 bg-cream-light/30 text-center">
                  <ShieldCheck size={28} className="text-sage-dark mx-auto mb-2" />
                  <p className="text-sm font-semibold text-ink">
                    You&apos;ll be redirected to a secure payment page
                  </p>
                  <p className="text-xs text-ink-muted mt-1">
                    Complete your payment of {formatPrice(total)} via card, UPI or netbanking,
                    then you&apos;ll be brought straight back here.
                  </p>
                </div>
              </div>

              <button
                onClick={handleAblePayOrder}
                disabled={ablepayLoading}
                className="btn-primary w-full py-4 text-base disabled:opacity-50"
              >
                {ablepayLoading ? (
                  <span className="inline-block w-5 h-5 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
                ) : (
                  `Pay ${formatPrice(total)} Securely`
                )}
              </button>
            </motion.div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div>
          <div className="bg-white rounded-brand shadow-card p-5 sticky top-28">
            <h3 className="font-display font-semibold text-ink text-lg mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-ink-light font-medium">
                <span>Subtotal ({items.length} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-ink-light font-medium">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-sage-dark font-semibold" : ""}>
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              {couponCode && (
                <div className="flex justify-between text-sage-dark font-semibold">
                  <span>Discount ({couponCode})</span>
                  <span>-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-ink text-base pt-3 border-t border-ink/8 mt-3">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <p className="text-xs text-ink-muted mt-3 text-center">GST included • Secure checkout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
